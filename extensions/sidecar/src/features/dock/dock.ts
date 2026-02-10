import { DOCK_ID } from "../../core/constants";
import type { DockContext } from "../../core/context";
import { findComposerAnchor } from "../composer/find";
import { peekSettings, subscribeSettings, updateSettings } from "../settings/storage";
import { GlobalSettings, DEFAULT_SETTINGS } from "../settings/schema";
import { log } from "../../core/log";
import { getDebugEnabled } from "../../core/debugFlag";
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
  stage.style.inset = "0";
  stage.style.pointerEvents = "none";
  stage.style.zIndex = String(DOCK_STAGE_Z_INDEX);
  return stage;
}

function positionDock(tracker?: DockContext["trackSelectorPerformance"]): boolean {
  const dock = _dockHost ?? ensureDockHost();
  if (!dock) return false;
  const spot = findComposerAnchor(tracker);
  if (!spot || !spot.anchor) {
    dock.style.display = "none";
    return false;
  }
  const anchorEl = spot.anchor as Element;
  const rect = anchorEl.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    dock.style.display = "none";
    return false;
  }
  const width = Math.max(0, rect.width - DOCK_INSET * 2);
  const left = rect.left + DOCK_INSET;
  const top = rect.top - DOCK_GAP;
  dock.style.display = "block";
  dock.style.width = `${width}px`;
  dock.style.left = `${left}px`;
  dock.style.top = `${top}px`;
  dock.style.transform = "translateY(-100%)";
  return true;
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
  syncPqProgress(settings, false);
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
      syncPqProgress(settings, false);
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

function syncPqProgress(settings: GlobalSettings, allowStart: boolean) {
  const dock = _dockHost;
  const ctx = _dockCtx;
  const btn = dock?.querySelector('button[data-item-id="progressquest"]') as HTMLElement | null;

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
        const liveBtn = _dockHost?.querySelector('button[data-item-id="progressquest"][data-progressbar="1"]') as HTMLElement | null;
        if (liveBtn) liveBtn.style.setProperty("--cgpt-pq-progress", String(p));
      },
    });
  }
}
