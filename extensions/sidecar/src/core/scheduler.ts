import { queryFirst } from "./dom";
import { waitFor } from "./observer";
import { STATUS_ID } from "./constants";
import { idle } from "./idle";
import { log } from "./log";
import { DockContext } from "./context";
import { limitConversations } from "../features/sidebar/limit";
import { ensureComposerPadding, ensureScrollPadding } from "./layout";
import { ensureDockInstalled } from "../features/dock/dock";
import { ensureInputResizeHandle } from "../features/input/handle";
import { applyTextareaSizing } from "../features/input/sizing";
import { moveModelPickerIntoDockWithRetry } from "../features/model/move";
import { hideTopModelPickerVisually } from "../features/model/hideTop";
import { enhanceSomeCodeBlocks } from "../features/code/enhance";
import { ensureStatusBar, renderStatusBar } from "../features/status/status";
import { initStatusCounts, processPendingMessages } from "../features/status/counters";
import { detectNetworkCondition, getRetryConfig } from "../features/model/network";
import { findComposerAnchor, findComposerResizeTarget } from "../features/composer/find";
import { isDeadContext } from "./storage";
import { formatError } from "./errors";

let lastUrl = window.location.href;
let composerWaiter: Promise<Element> | null = null;

/**
 * Main scheduler loop. Runs on idle to update UI state.
 * @param ctx - DockContext
 * @param taskName - Debug label for the task triggering this schedule
 */
export function scheduleWork(ctx: DockContext, taskName: string) {
  if (isDeadContext()) return;
  if (ctx.flags.workScheduled) return;
  ctx.flags.workScheduled = true;

  idle((deadline: IdleDeadline) => {
    try {
      if (isDeadContext()) return;
      performUpdate(ctx, deadline);
    } catch (err) {
      handleSchedulerError(err, taskName);
    } finally {
      ctx.flags.workScheduled = false;
    }
  }, 700);
}

function performUpdate(ctx: DockContext, deadline: IdleDeadline) {
  // 1. Throttle if popover is open
  if (ctx.flags.isPopoverOpen) {
    // Only allow critical updates if needed, but for now bail to prevent jank
    // We allow dock/status checks if needed, but mostly we skip.
    // If we return here, we might miss critical updates, so let's be careful.
    // For now, we'll proceed but skip expensive operations later.
  }

  // 2. URL Change Detection
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    ctx.resetStatusState();
  }

  // 3. Network Detection
  const networkCondition = detectNetworkCondition();
  const retryConfig = getRetryConfig(networkCondition);

  // 4. Conversation Detection & Layout
  const isConversation = detectConversation();
  updateComposerWidth();
  updateVisibility(isConversation);
  ensureComposerPadding();

  // 5. Core Feature Maintenance
  limitConversations();
  ensureScrollPadding();

  // Ensure dock is installed (mounted but maybe hidden) regardless of conversation state
  // This ensures settings subscriptions and DOM elements are ready.
  ensureDockInstalled(ctx);
  ctx.flags.needDock = false;

  if (!isConversation) {
    ensureComposerReady(ctx);
    return;
  }

  ensureInputResizeHandle(findComposerAnchor, findComposerResizeTarget, ctx.trackSelectorPerformance);
  applyTextareaSizing(ctx.uiState, findComposerResizeTarget, ctx.trackSelectorPerformance);

  // 6. Expensive Operations (throttled by popover)
  if (!ctx.flags.isPopoverOpen) {
    cleanupResizeArtifacts();

    if (ctx.flags.needModelMove) {
      moveModelPickerIntoDockWithRetry(retryConfig, ctx.trackSelectorPerformance)
        .catch(e => log.debug("Model picker retry error:", formatError(e)));
    }

    if (ctx.flags.needHideTopModel) hideTopModelPickerVisually(ctx);

    if (ctx.flags.needCodeEnhance) {
      const more = enhanceSomeCodeBlocks(deadline);
      ctx.flags.needCodeEnhance = more;
    }
  }

  // 7. Status Bar
  if (ctx.settings.statusbarOn && !ctx.flags.isPopoverOpen) {
    updateStatusBar(ctx, deadline);
  }

  // 8. Continuations
  if (ctx.flags.needCodeEnhance && !ctx.flags.isPopoverOpen) {
    scheduleWork(ctx, "code-enhance-continuation");
  }
}

function ensureComposerReady(ctx: DockContext) {
  if (composerWaiter) return;
  const waiter = waitFor("composer.form", 12000).catch(() => waitFor("thread.bottomContainer", 12000));
  composerWaiter = waiter;
  waiter
    .then(() => {
      composerWaiter = null;
      ctx.scheduleWork("composer-ready");
    })
    .catch(() => {
      composerWaiter = null;
    });
}

function detectConversation(): boolean {
  return !!findComposerAnchor();
}

function updateComposerWidth() {
  const resizeTarget = findComposerResizeTarget(undefined) as HTMLElement | null; // Pass undefined tracker if lazy
  const widthEl = resizeTarget || queryFirst("composer.editor") || queryFirst("composer.form") || queryFirst("thread.bottomContainer");

  if (widthEl) {
    const rect = widthEl.getBoundingClientRect();
    if (rect && rect.width > 0) {
      const newVal = `${Math.round(rect.width)}px`;
      const oldVal = document.documentElement.style.getPropertyValue('--cgpt-composer-w');
      if (newVal !== oldVal) {
        document.documentElement.style.setProperty('--cgpt-composer-w', newVal);
      }
    }
  } else {
    if (document.documentElement.style.getPropertyValue('--cgpt-composer-w')) {
      document.documentElement.style.removeProperty('--cgpt-composer-w');
    }
  }
}

function updateVisibility(isConversation: boolean) {
  const display = isConversation ? "" : "none";

  const dock = document.getElementById("cgpt-dock");
  if (dock) dock.style.display = display;

  const status = document.getElementById(STATUS_ID);
  if (status) status.style.display = display;

  const handle = document.getElementById("cgpt-input-resize-handle");
  if (handle) handle.style.display = display;
}

function cleanupResizeArtifacts() {
  const sidebarHandle = document.getElementById("cgpt-sidebar-handle");
  if (sidebarHandle) sidebarHandle.remove();
  document.documentElement.classList.remove("cgpt-resizing");
}

function updateStatusBar(ctx: DockContext, deadline: IdleDeadline) {
  ensureStatusBar(ctx);
  const moreInit = initStatusCounts(deadline, ctx);
  const morePending = processPendingMessages(deadline, ctx);
  renderStatusBar(ctx);
  if (moreInit || morePending) scheduleWork(ctx, "statusbar-continuation");
}

function handleSchedulerError(err: unknown, taskName: string) {
  if (String(err).includes("Extension context invalidated")) return;

  if (err instanceof DOMException) {
    log.error(`Scheduler DOMException in ${taskName}: ${err.name}: ${err.message}`);
  } else {
    log.error(`Scheduler Error in ${taskName}:`, formatError(err));
  }
}
