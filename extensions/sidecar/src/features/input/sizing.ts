import { INPUT_MIN, INPUT_MAX } from "../../core/constants";
import { clamp } from "../../core/dom";
import { UIState } from "../../core/types";
import { PerfTracker } from "../composer/find";

export function applyTextareaSizing(uiState: UIState, findComposerResizeTarget: (track?: PerfTracker) => Element | null, track?: PerfTracker) {
  const el = findComposerResizeTarget(track) as HTMLElement;
  if (!el) return;

  if (uiState.inputCollapsed) {
    el.style.setProperty("height", `${INPUT_MIN}px`, "important");
    el.style.setProperty("min-height", `${INPUT_MIN}px`, "important");
    el.style.setProperty("max-height", `${INPUT_MIN}px`, "important");
    el.style.resize = "none";
    return;
  }

  const h = typeof uiState.inputHeight === "number" ? clamp(uiState.inputHeight, INPUT_MIN, INPUT_MAX) : null;
  if (h) {
    el.style.setProperty("height", `${h}px`, "important");
    el.style.setProperty("min-height", `${INPUT_MIN}px`, "important");
    el.style.setProperty("max-height", "none", "important");
    el.style.resize = "none";
  } else {
    // Reset
    if (el.style.height && el.style.getPropertyPriority("height") === "important") {
      el.style.removeProperty("height");
    }
    if (el.style.minHeight && el.style.getPropertyPriority("min-height") === "important") {
      el.style.removeProperty("min-height");
    }
    if (el.style.maxHeight === "none") {
      el.style.removeProperty("max-height");
    }
  }
}
