import { FLAGS } from "./constants";
import type { UIState } from "./types";
import type { GlobalSettings } from "../features/settings/schema";
import { getSettings } from "../features/settings/storage";
import { applyWideMode } from "../features/dock/wide";
import { findComposerResizeTarget } from "../features/composer/find";
import { applyTextareaSizing } from "../features/input/sizing";
import { getDebugEnabled } from "./debugFlag";

const RETRY_DELAYS_MS = [0, 250, 1000, 2000] as const;

let running: Promise<void> | null = null;
let queuedReason: string | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function isDebugEnabled(settings: GlobalSettings): Promise<boolean> {
  const fromSettings = (settings as any)?.debug === true || (settings as any)?.ui?.debug === true;
  if (fromSettings) return true;
  return await getDebugEnabled();
}

export function applyLayoutFixes(settings: GlobalSettings): { hasComposer: boolean } {
  const root = document.documentElement;

  root.classList.toggle(FLAGS.wide, !!settings.ui.wideMode);
  root.classList.toggle(FLAGS.inputCollapsed, !!settings.ui.inputCollapsed);
  root.classList.toggle(FLAGS.collapseCode, !!settings.ui.collapseCode);
  root.classList.toggle(FLAGS.hideThinking, !!settings.ui.hideThinking);

  applyWideMode(!!settings.ui.wideMode);

  const uiState: UIState = {
    inputCollapsed: settings.ui.inputCollapsed,
    inputHeight: settings.ui.inputHeight,
    inputHeightExpanded: settings.ui.inputHeightExpanded,
    fontName: settings.ui.fontName,
    fontCss: settings.ui.fontCss,
  };

  const hasComposer = !!findComposerResizeTarget();
  applyTextareaSizing(uiState, findComposerResizeTarget);

  return { hasComposer };
}

async function runEnsure(reason: string): Promise<void> {
  const settings = await getSettings();
  const debug = await isDebugEnabled(settings);
  const prefix = "[ChatGPT Dock ensureAll]";

  for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
    const delay = RETRY_DELAYS_MS[i];
    if (delay) await sleep(delay);

    if (debug) console.debug(prefix, "attempt", i + 1, "reason", reason, "delayMs", delay);

    try {
      const res = applyLayoutFixes(settings);
      if (res.hasComposer) return;
    } catch (err) {
      if (debug) console.warn(prefix, "attempt failed", i + 1, "reason", reason, err);
    }
  }
}

export async function ensureAll(reason: string): Promise<void> {
  if (running) {
    queuedReason = reason;
    return running;
  }

  running = (async () => {
    let nextReason: string | null = reason;
    while (nextReason) {
      queuedReason = null;
      await runEnsure(nextReason);
      nextReason = queuedReason;
    }
  })().finally(() => {
    running = null;
    queuedReason = null;
  });

  return running;
}

