import { DockContext } from "./context";
import { queueMessageNodesFromMutations } from "../features/status/counters";
import { queryFirst } from "./dom";
import type { RegistryKey } from "./registry";
import { hideTopModelPickerVisually } from "../features/model/hideTop";
import { injectPillModelTrigger } from "../features/model/pill";

let observer: MutationObserver | null = null;
let debounceTimer: any = null;
let viewportInstalled = false;
let viewportRaf: number | null = null;
type Waiter = {
  key: RegistryKey;
  resolve: (el: Element) => void;
  reject: (reason: any) => void;
  timer: number;
};
const pendingWaiters: Set<Waiter> = new Set();

export function waitFor(key: RegistryKey, timeoutMs = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = queryFirst(key);
    if (el) {
      resolve(el);
      return;
    }

    const waiter: Waiter = {
      key,
      resolve,
      reject,
      timer: window.setTimeout(() => {
        pendingWaiters.delete(waiter);
        reject(new Error(`waitFor timed out for key: ${key}`));
      }, timeoutMs),
    };
    pendingWaiters.add(waiter);
  });
}

function checkWaiters() {
  if (pendingWaiters.size === 0) return;
  for (const waiter of pendingWaiters) {
    const el = queryFirst(waiter.key);
    if (el) {
      window.clearTimeout(waiter.timer);
      pendingWaiters.delete(waiter);
      waiter.resolve(el);
    }
  }
}

function clearWaiters() {
  for (const waiter of pendingWaiters) {
    window.clearTimeout(waiter.timer);
  }
  pendingWaiters.clear();
}

export function startObserver(ctx: DockContext) {
  if (observer) return;

  if (!viewportInstalled) {
    viewportInstalled = true;
    const schedule = () => {
      if (viewportRaf) return;
      viewportRaf = window.requestAnimationFrame(() => {
        viewportRaf = null;
        ctx.scheduleWork("viewport");
      });
    };

    window.addEventListener("resize", schedule, true);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", schedule, true);
      window.visualViewport.addEventListener("scroll", schedule, true);
    }
  }

  observer = new MutationObserver((mutations) => {
    // 1. Immediate checks (critical)
    queueMessageNodesFromMutations(mutations, ctx);

    checkWaiters();

    // 3. Debounced heavy checks (flags)
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runHeavyChecks(ctx);
    }, 200);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (viewportRaf) {
    window.cancelAnimationFrame(viewportRaf);
    viewportRaf = null;
  }
  clearWaiters();
}

function runHeavyChecks(ctx: DockContext) {
  // Use Registry where possible, but context flags logic is legacy/specific
  // We can modernize this partially or keep as is but safe.

  const dock = queryFirst("ext.dock");
  ctx.flags.needDock = !dock;

  ctx.flags.needInputHandle = !document.getElementById("cgpt-input-resize-handle"); // legacy ID
  ctx.flags.needSidebarHandle = true;
  ctx.flags.needCodeEnhance = true;

  // We no longer move the model picker into the dock.
  // Instead we hide it in place and inject a pill trigger.
  ctx.flags.needModelMove = false;

  // Visual hiding
  hideTopModelPickerVisually(ctx);

  // Pill injection
  injectPillModelTrigger(ctx);

  ctx.flags.needHideTopModel = true; // Legacy flag, maybe redundant now with direct call above
  ctx.scheduleWork("observer-heavy-checks");
}
