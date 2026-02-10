import { findComposerAnchor } from "../features/composer/find";

let lastComposerAnchor: HTMLElement | null = null;

export function ensureScrollPadding() {
  // Ensure we have enough bottom spacing so the last message isn't covered by dock/status bar.
  // We look for the main scroll container.
  const scrollContainer = document.querySelector("main .flex-1.overflow-hidden > div.h-full") ||
    document.querySelector("main [class*='react-scroll-to-bottom']") ||
    document.querySelector("main > div.overflow-y-auto");

  if (!scrollContainer) return;

  // Check for our spacer
  const spacerId = "cgpt-bottom-spacer";
  let spacer = document.getElementById(spacerId);

  if (!spacer) {
    spacer = document.createElement("div");
    spacer.id = spacerId;
    spacer.style.width = "100%";
    spacer.style.flexShrink = "0";
    // Dock (~40px) + Status bar (~30px) + Extra buffer
    spacer.style.height = "120px";
    // We append it. If React removes it, MutationObserver will trigger scheduleWork to re-add it.
    scrollContainer.appendChild(spacer);
  } else {
    // Ensure it is the last child
    if (scrollContainer.lastElementChild !== spacer) {
      scrollContainer.appendChild(spacer);
    }
  }
}

export function ensureComposerPadding() {
  const spot = findComposerAnchor();
  const anchor = (spot?.anchor || null) as HTMLElement | null;

  if (!anchor) {
    if (lastComposerAnchor) {
      lastComposerAnchor.style.removeProperty("padding-top");
      lastComposerAnchor = null;
    }
    return;
  }

  if (lastComposerAnchor && lastComposerAnchor !== anchor) {
    lastComposerAnchor.style.removeProperty("padding-top");
  }

  anchor.style.setProperty("padding-top", "48px", "important");
  lastComposerAnchor = anchor;
}
