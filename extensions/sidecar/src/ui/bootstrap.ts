import { state } from "../core/state";
import { DockContext } from "../core/context";
import { storageGet, storageSet } from "../core/storage";
import { $ as $dom, $$ as $$dom } from "../core/dom";

import { loadSettingsFromStorage, persistSettingsToStorage, updateSettings, getSettings, resetSettingsCache } from "../features/settings/storage";
import { ensureStatusBar, resetStatusState } from "../features/status/status";
import { resetSidebar } from "../features/sidebar/resize";
import { toggleSidebar } from "../features/sidebar/toggle";
import { popoverManager } from "./manager";
import { showToast } from "../core/toast";
import { setAllCodeCollapsed } from "../features/code/enhance";
import { updateThinkingVisibility } from "../features/model/hideTop";
import { startRecentPromptCapture } from "../features/composer/capture";
import { startObserver } from "../core/observer";
import { scheduleWork } from "../core/scheduler";
import { createPerformanceTracker } from "../core/performance";
import { setupDevTools } from "../dev/debug";
import { registerHealth } from "../dev/health";
import { PetsLayer } from "../pets/layer/PetsLayer";
import { loadPetSettings, watchPetSettings } from "../pets/core/settings";

import { onContextInvalidated } from "../core/storage";
import { startTitleStripping } from "../features/title/strip";
import { storageService } from "../core/storage/index";

// New imports for full boot sequence
import { log } from "../core/log";
import { formatError } from "../core/errors";
import { ensureAll } from "../core/ensure";
import { clsMonitor } from "../core/cls";
import { findComposerResizeTarget } from "../features/composer/find";
import { ensureGlobalOverlay, getGlobalPortal, mountOverlayRoot } from "./manager";

// --- Bootstrapping Logic ---
let bootCtx: DockContext | null = null;

// 1. Hook Installers (moved from content.ts)
function installSpaNavigationHooks() {
  const w = window as any;
  if (w.__cgpt_spa_nav_hooks_installed) return;
  w.__cgpt_spa_nav_hooks_installed = true;

  const fire = () => {
    void ensureAll("nav");
    bootCtx?.scheduleWork("nav");
  };

  const patch = (method: "pushState" | "replaceState") => {
    const original = history[method];
    if (typeof original !== "function") return;
    history[method] = function (this: any, ...args: any[]) {
      const res = original.apply(this, args as any);
      fire();
      return res;
    } as any;
  };

  patch("pushState");
  patch("replaceState");
  window.addEventListener("popstate", fire, true);
}

function installHostMutationHook() {
  const w = window as any;
  if (w.__cgpt_host_mutation_hook_installed) return;
  w.__cgpt_host_mutation_hook_installed = true;

  let lastHasComposer = !!findComposerResizeTarget();
  let scheduled = false;

  const tick = () => {
    scheduled = false;
    const hasComposer = !!findComposerResizeTarget();
    if (hasComposer !== lastHasComposer) {
      lastHasComposer = hasComposer;
      void ensureAll("mutation");
      bootCtx?.scheduleWork("mutation");
    }
  };

  const mo = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(tick);
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("unload", () => mo.disconnect(), { once: true });
}

function installStorageChangeHook() {
  const w = window as any;
  if (w.__cgpt_storage_change_hook_installed) return;
  w.__cgpt_storage_change_hook_installed = true;

  if (!chrome?.storage?.onChanged?.addListener) return;

  const handler = (_changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName !== "sync" && areaName !== "local") return;
    resetSettingsCache(); // legacy cache clear
    void getSettings();   // legacy re-fetch (which now calls core/storage init)
    void ensureAll("storage_change");
  };

  chrome.storage.onChanged.addListener(handler);
  window.addEventListener("unload", () => chrome.storage.onChanged.removeListener(handler), { once: true });
}

async function safeStep(name: string, step: () => unknown | Promise<unknown>) {
  try {
    await step();
  } catch (err) {
    log.error(`Boot error in ${name}:`, formatError(err));
  }
}

// 2. Full Runtime Boot (Replacing content.ts logic)
export async function bootFullRuntime() {
  log.info("Booting full runtime...");

  // A. CLS Monitor
  clsMonitor.start();
  if (typeof window !== 'undefined') {
    (window as any).__cgpt_cls = clsMonitor;
  }

  // B. Initialize Storage
  await safeStep("storageInit", async () => {
    await storageService.init();
    // Legacy load (can be removed later if pure storageService is used everywhere)
    await loadSettingsFromStorage(state.settings, state.uiState);
  });

  // C. Overlay & UI
  await safeStep("uiMount", async () => {
    const { root } = ensureGlobalOverlay();
    mountOverlayRoot(root); // Ensure UI root component
    // Also init popovers
    getGlobalPortal(); // implicitly ensures portal + popover root
    popoverManager.init();
  });

  // D. Core Runtime (Pets, DevTools, Observers)
  await safeStep("coreRuntime", async () => {
    // Pets
    const petsLayer = PetsLayer.getInstance();
    const initialPetSettings = await loadPetSettings();
    await petsLayer.setSettings(initialPetSettings);
    watchPetSettings((next) => {
      void petsLayer.setSettings(next);
    });

    // DevTools
    // Construct context (reused from legacy bootRuntime below, simplified here?)
    // Actually we need the FULL context for observers.
    // Let's call the internal setup function.
    await setupCoreContext();
  });

  // E. Hooks & Initial Ensure
  await safeStep("hooks", () => {
    installSpaNavigationHooks();
    installHostMutationHook();
    installStorageChangeHook();
  });

  // F. Initial DOM Check
  await safeStep("ensureAll", () => ensureAll("startup"));
}


// Internal helper to setup the core context and observers (refactored from legacy bootRuntime)
async function setupCoreContext() {
  // 1. Last-ditch unhandled rejection handler
  window.addEventListener("unhandledrejection", (ev) => {
    const reason = String(ev.reason || "");
    if (reason.includes("Extension context invalidated")) {
      ev.preventDefault();
      onContextInvalidated(ev.reason);
    }
  });

  const { settings, uiState, statusState } = state;
  const trackSelectorPerformance = createPerformanceTracker();

  const ctx: DockContext = {
    settings,
    uiState,
    statusState,
    flags: {
      workScheduled: false,
      needDock: true,
      needInputHandle: true,
      needSidebarHandle: false,
      needModelMove: false,
      needHideTopModel: true,
      needCodeEnhance: true,
      isPopoverOpen: false
    },
    scheduleWork: (taskName) => scheduleWork(ctx, taskName),
    storageGet,
    storageSet,
    updateSettings,
    $: $dom,
    $$: $$dom,
    trackSelectorPerformance,
    toggleSidebar: () => toggleSidebar(ctx),
    openPopover: (k, b) => popoverManager.open(k, b, ctx),
    closePopover: () => popoverManager.close("manual"),
    showToast: (m) => showToast(m),
    setAllCodeCollapsed: (c) => setAllCodeCollapsed(c),
    ensureStatusBar: () => ensureStatusBar(ctx),
    updateThinkingVisibility: () => updateThinkingVisibility(ctx),
    setNeedHideTopModel: (val) => { ctx.flags.needHideTopModel = val; },
    resetSidebar: () => resetSidebar(),
    resetStatusState: () => resetStatusState(ctx),
    persistSettings: () => persistSettingsToStorage(settings)
  };

  bootCtx = ctx;
  setupDevTools(ctx);
  registerHealth(ctx);
  startObserver(ctx);
  startRecentPromptCapture(trackSelectorPerformance);
  startTitleStripping();

  scheduleWork(ctx, "boot");
}

// 3. Legacy Partial Boot (Deprecated, kept for reference or specific use cases)
export function bootRuntime() {
  // This was previously called AFTER content.ts did the heavy lifting.
  // In the new model, bootFullRuntime calls setupCoreContext directly.
  // We keep this exported just in case the legacy path needs it.
  void setupCoreContext();
}
