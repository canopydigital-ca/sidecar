import { DOCK_ID } from "../../core/constants";
import type { DockContext } from "../../core/context";
import { findComposerAnchor } from "../composer/find";
import { peekSettings, subscribeSettings, updateSettings } from "../settings/storage";
import { GlobalSettings, DEFAULT_SETTINGS } from "../settings/schema";
import { log } from "../../core/log";
import { getDebugEnabled } from "../../core/debugFlag";
import { measureInteraction } from "../../dev/instrumentation";
import { getProgressQuestService } from "../../pq/service";
import { startPQProgressFeed } from "../../pq/progressQuestState";
import { startPQStateFeed, getPQProgress01, type PQState } from "../../pq/progressQuestState";
import { ensureDockMount, updateDockMount, destroyDockMount } from "../../ui/components/dock/mountDock";
import { DOCK_ITEM_DEFS } from "./icons";

const EXT_ROOT_ID = "cgpt-ext-root";
const EXT_STAGE_ID = "cgpt-ext-stage";
const DOCK_STAGE_Z_INDEX = 2147483000;
const EXT_ROOT_Z_INDEX = 2147483647;
const DOCK_GAP = 8;
const DOCK_INSET = 8;

let _dockHost: HTMLElement | null = null;
let _dockRoot: HTMLElement | null = null;
let _dockStage: HTMLElement | null = null;
let _dockCtx: DockContext | null = null;
let _pqProgressStop: (() => void) | null = null;
let _pqProgress = 0;
let _pqChipStop: (() => void) | null = null;
let _settingsUnsub: (() => void) | null = null;
let _debugEnabled = false;
let _debugResolved = false;
export function ensureDockHost(): HTMLElement | null {
  const stage = ensureDockStage();
  if (!stage) return null;
  if (_dockHost && _dockHost.isConnected && _dockHost.parentElement === stage) return _dockHost;
  if (_dockHost && !_dockHost.isConnected) _dockHost = null;
  const existing = document.getElementById(DOCK_ID) as HTMLElement | null;
  if (existing) {
    _dockHost = existing;
  } else {
    const dock = document.createElement("div");
    dock.id = DOCK_ID;
    _dockHost = dock;
  }
  if (_dockHost.parentElement !== stage) {
    stage.appendChild(_dockHost);
  }
  _dockHost.style.position = "fixed";
  _dockHost.style.pointerEvents = "auto";
  _dockHost.style.zIndex = String(DOCK_STAGE_Z_INDEX + 1);
  _dockHost.style.boxSizing = "border-box";
  _dockHost.style.margin = "0";
  _dockHost.style.padding = "0";
  _dockHost.style.border = "0";
  _dockHost.style.background = "transparent";
  _dockHost.style.backdropFilter = "none";
  _dockHost.style.overflow = "visible";
  _dockHost.style.maxWidth = "none";
  _dockHost.style.minWidth = "0";
  _dockHost.style.height = "auto";
  if (!_dockHost.style.display) {
    _dockHost.style.display = "none";
  }
  return _dockHost;
}

function ensureDockStage(): HTMLElement | null {
  const body = document.body;
  if (!body) return null;
  let root = _dockRoot && _dockRoot.isConnected ? _dockRoot : (document.getElementById(EXT_ROOT_ID) as HTMLElement | null);
  if (!root) {
    root = document.createElement("div");
    root.id = EXT_ROOT_ID;
    body.appendChild(root);
  }
  _dockRoot = root;
  root.style.position = "fixed";
  root.style.top = "0";
  root.style.left = "0";
  root.style.width = "100vw";
  root.style.height = "100vh";
  root.style.pointerEvents = "none";
  root.style.zIndex = String(EXT_ROOT_Z_INDEX);
  let stage = _dockStage && _dockStage.isConnected ? _dockStage : (root.querySelector(`#${EXT_STAGE_ID}`) as HTMLElement | null);
  if (!stage) {
    stage = document.createElement("div");
    stage.id = EXT_STAGE_ID;
    root.appendChild(stage);
  }
  _dockStage = stage;
  stage.style.position = "fixed";
  // Avoid relying on `inset` shorthand (can be flaky in some embedded/test runtimes).
  stage.style.top = "0";
  stage.style.right = "0";
  stage.style.bottom = "0";
  stage.style.left = "0";
  stage.style.pointerEvents = "none";
  stage.style.zIndex = String(DOCK_STAGE_Z_INDEX);
  return stage;
}

function positionDock(tracker?: DockContext["trackSelectorPerformance"]): boolean {
  return measureInteraction("dock:positionDock", () => positionDockInternal(tracker));
}

function positionDockInternal(tracker?: DockContext["trackSelectorPerformance"]): boolean {
  const dock = _dockHost ?? ensureDockHost();
  if (!dock) return false;
  const spot = findComposerAnchor(tracker);
  if (!spot || !spot.anchor) {
    dock.style.display = "none";
    return false;
  }
  const anchorEl = spot.anchor as Element;

  // --- Read phase: batch every layout read BEFORE any style write so the
  // steady-state path performs no forced synchronous reflow (the old
  // write -> scrollWidth read -> write sequence thrashed layout on every
  // call and re-set width/left in the same frame).
  const rect = anchorEl.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    dock.style.display = "none";
    return false;
  }
  const viewportW = Math.max(0, window.innerWidth || document.documentElement.clientWidth || 0);
  const viewportH = Math.max(0, window.innerHeight || document.documentElement.clientHeight || 0);
  const wasHidden = dock.style.display === "none" || !dock.style.display;
  const committedWidth = Number.parseFloat(dock.style.width);
  const measuredContentWidth = wasHidden ? 0 : getDockContentWidth(dock);

  const desiredWidth = Math.max(0, rect.width - DOCK_INSET * 2);
  const maxWidth = Math.max(0, viewportW - DOCK_INSET * 2);
  const baseWidth = Math.min(desiredWidth, maxWidth);
  let width = baseWidth;

  // Widen-to-fit (same contract as before): if the dock content overflows the
  // anchor-derived width, grow up to the viewport clamp and recenter over the
  // anchor. The pre-write measurement is exact whenever the target width
  // matches the currently committed width (the common case across frames).
  const preMeasureIsExact =
    !wasHidden && Number.isFinite(committedWidth) && Math.abs(committedWidth - baseWidth) < 0.5;
  if (preMeasureIsExact && measuredContentWidth > width && maxWidth > width) {
    width = Math.min(measuredContentWidth, maxWidth);
  }

  const desiredLeft =
    width > baseWidth ? rect.left + rect.width / 2 - width / 2 : rect.left + DOCK_INSET;
  const maxLeft = Math.max(DOCK_INSET, viewportW - DOCK_INSET - width);
  const left = Math.min(Math.max(DOCK_INSET, desiredLeft), maxLeft);

  const top = rect.top - DOCK_GAP;

  // --- Write phase: apply the fully computed position in one batch.
  // Positioning contract unchanged: top - DOCK_GAP with translateY(-100%),
  // flip below the anchor when the dock would leave the viewport, and
  // viewport clamps on width/left.
  if (viewportH > 0 && top < 0) {
    dock.style.top = `${Math.max(DOCK_GAP, rect.bottom + DOCK_GAP)}px`;
    dock.style.transform = "translateY(0)";
  } else {
    dock.style.top = `${top}px`;
    dock.style.transform = "translateY(-100%)";
  }
  dock.style.display = "block";
  dock.style.width = `${width}px`;
  dock.style.maxWidth = "none";
  dock.style.left = `${left}px`;
  dock.style.right = "auto";

  // --- Correction pass: only when the pre-write measurement could not be
  // trusted (dock was hidden, or the target width just changed). This forces
  // one reflow, but still commits before the browser paints, so no
  // intermediate position is ever visible; the hot path above skips it.
  if (!preMeasureIsExact) {
    const contentWidth = getDockContentWidth(dock);
    if (contentWidth > width && maxWidth > width) {
      width = Math.min(contentWidth, maxWidth);
      const centeredLeft = rect.left + rect.width / 2 - width / 2;
      const clampedMaxLeft = Math.max(DOCK_INSET, viewportW - DOCK_INSET - width);
      dock.style.width = `${width}px`;
      dock.style.left = `${Math.min(Math.max(DOCK_INSET, centeredLeft), clampedMaxLeft)}px`;
    }
  }

  return true;
}

function getDockContentWidth(dock: HTMLElement): number {
  const content = dock.shadowRoot?.querySelector(".cgpt-dock") as HTMLElement | null;
  if (!content) return 0;

  const width = Math.ceil(content.scrollWidth || 0);
  return Number.isFinite(width) ? width : 0;
}

export function ensureDockInstalled(ctx: DockContext) {
  if ((window as any).__CGPT_DOCK_CRASHED) return false;

  if (!_debugResolved) {
    _debugResolved = true;
    void getDebugEnabled().then((enabled) => {
      _debugEnabled = enabled;
      if (_debugEnabled) log.info("[Dock] ensureDockInstalled called");
    });
  }
  _dockCtx = ctx;

  const dock = ensureDockHost();
  if (!dock || !dock.isConnected) return false;

  const settings = peekSettings() ?? DEFAULT_SETTINGS;

  try {
    ensureDockMount(dock, {
      ctx,
      settings,
      defs: DOCK_ITEM_DEFS,
      defaultOrder: DEFAULT_SETTINGS.dock.order,
      debugEnabled: _debugEnabled
    });
  } catch (e) {
    log.error("[Dock] Failed to mount dock", e);
    (window as any).__CGPT_DOCK_CRASHED = true;
    return false;
  }

  positionDock(ctx.trackSelectorPerformance);
  ensurePqRuntime(ctx, settings);
  syncPqProgress(settings, true);
  syncPqChip(settings, true);
  ensureDockSubscription();

  return true;
}

function ensureDockSubscription() {
  if (_settingsUnsub) return;
  _settingsUnsub = subscribeSettings((next) => {
    if ((window as any).__CGPT_DOCK_CRASHED) return;
    const settings = next ?? DEFAULT_SETTINGS;
    updateDockMount({ settings, debugEnabled: _debugEnabled });
    if (_dockCtx) {
      ensurePqRuntime(_dockCtx, settings);
      syncPqProgress(settings, true);
      syncPqChip(settings, true);
    }
  });
}

function ensurePqRuntime(ctx: DockContext, settings: GlobalSettings) {
  const pq = settings?.pq ?? DEFAULT_SETTINGS.pq;
  if (!pq.enabled) {
    stopPqProgress();
    return;
  }
  const dock = _dockHost;
  if (!dock || dock.dataset.pqInit) return;
  dock.dataset.pqInit = "true";
  void getProgressQuestService().init(ctx);
}

function stopPqProgress() {
  if (_pqProgressStop) {
    _pqProgressStop();
    _pqProgressStop = null;
  }
  _pqProgress = 0;
}

function stopPqChip() {
  if (_pqChipStop) {
    _pqChipStop();
    _pqChipStop = null;
  }
}

function queryDockElement<T extends Element>(selector: string): T | null {
  const dock = _dockHost;
  if (!dock) return null;
  return (
    (dock.shadowRoot?.querySelector(selector) as T | null) ||
    (dock.querySelector(selector) as T | null)
  );
}

function renderPqChip(state: PQState) {
  const chip = queryDockElement<HTMLElement>("#cgpt-pq-chip-root");
  if (!chip) return;

  const level = Number.isFinite(state.level) ? Math.max(1, Math.round(state.level)) : 1;
  const className = (state.className || "Class").trim() || "Class";
  const progress = getPQProgress01(state);

  chip.replaceChildren();
  chip.title = state.quest ? `ProgressQuest: ${state.quest}` : "ProgressQuest status";

  const badge = document.createElement("span");
  badge.className = "cgpt-pq-chip-badge";
  badge.textContent = "PQ";
  badge.setAttribute("aria-hidden", "true");

  const meta = document.createElement("span");
  meta.className = "cgpt-pq-chip-meta";

  const primary = document.createElement("span");
  primary.className = "cgpt-pq-chip-primary";
  primary.textContent = `Lv ${level}`;

  const secondary = document.createElement("span");
  secondary.className = "cgpt-pq-chip-secondary";
  secondary.textContent = className;

  meta.append(primary, secondary);

  const bar = document.createElement("span");
  bar.className = "cgpt-pq-chip-progress";

  const fill = document.createElement("span");
  fill.style.width = `${Math.round(progress * 100)}%`;
  bar.append(fill);

  chip.append(badge, meta, bar);
}

function syncPqChip(settings: GlobalSettings, allowStart: boolean) {
  const chip = queryDockElement<HTMLElement>("#cgpt-pq-chip-root");
  const ctx = _dockCtx;
  const pq = settings?.pq ?? DEFAULT_SETTINGS.pq;
  const shouldShow = !!chip && !!ctx && pq.enabled;

  if (!shouldShow) {
    if (chip) chip.replaceChildren();
    stopPqChip();
    return;
  }

  if (!chip.hasChildNodes()) {
    renderPqChip({ name: "Hero", level: 1, className: "Class", xp: { current: 0, next: 100 } });
  }

  if (!_pqChipStop && allowStart) {
    _pqChipStop = startPQStateFeed(ctx, {
      onUpdate: renderPqChip,
    });
  }
}

function syncPqProgress(settings: GlobalSettings, allowStart: boolean) {
  const ctx = _dockCtx;
  const btn = queryDockElement<HTMLElement>('button[data-item-id="progressquest"]');

  const pq = settings?.pq ?? DEFAULT_SETTINGS.pq;
  const shouldShow =
    !!btn &&
    !!ctx &&
    pq.enabled &&
    pq.showDockButton &&
    pq.showProgressBar;

  if (!shouldShow) {
    if (btn) {
      btn.removeAttribute("data-progressbar");
      btn.style.removeProperty("--cgpt-pq-progress");
    }
    stopPqProgress();
    return;
  }

  btn.setAttribute("data-progressbar", "1");
  btn.style.setProperty("--cgpt-pq-progress", String(_pqProgress));

  if (!_pqProgressStop && allowStart) {
    _pqProgressStop = startPQProgressFeed(ctx, {
      onProgress: (p) => {
        _pqProgress = p;
        const liveBtn = queryDockElement<HTMLElement>('button[data-item-id="progressquest"][data-progressbar="1"]');
        if (liveBtn) liveBtn.style.setProperty("--cgpt-pq-progress", String(p));
      },
    });
  }
}
