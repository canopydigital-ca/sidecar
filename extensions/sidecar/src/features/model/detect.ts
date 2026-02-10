import { queryFirst } from "../../core/dom";
import { PerfTracker } from "../composer/find";

export function findModelPickerElement(tracker?: PerfTracker): Element | null {
  // 1. Try Registry (Most stable)
  const fromRegistry = queryFirst("header.modelSelector");
  if (fromRegistry) return fromRegistry;

  // 2. Fallback: looser data-testid match
  const fallback = document.querySelector('button[data-testid*="model-switcher"]');
  if (fallback) return fallback;

  // 3. Fallback: aria-label (if language matches)
  const aria = document.querySelector('button[aria-label*="ChatGPT"]'); // e.g. "ChatGPT 4"
  if (aria && aria.getAttribute("aria-haspopup")) return aria;

  return null;
}
