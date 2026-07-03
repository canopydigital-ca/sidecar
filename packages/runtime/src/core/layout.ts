import { findComposerAnchor } from "../features/composer/find";
import { getHostAdapter } from "./host";

let lastComposerAnchor: HTMLElement | null = null;
let lastComposerPaddingTarget: HTMLElement | null = null;

const COMPOSER_DOCK_SPACE_PX = 56;
const COMPOSER_DOCK_SPACE_ATTR = "cgptDockSpace";
const COMPOSER_BASE_PADDING_ATTR = "cgptBasePaddingTop";

export function ensureScrollPadding() {
  // Ensure we have enough bottom spacing so the last message isn't covered by dock/status bar.
  // The active host adapter owns scroll-container discovery.
  const scrollContainer = getHostAdapter().getScrollContainer();

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
  const parent = (spot?.parent || null) as HTMLElement | null;

  if (!anchor) {
    if (lastComposerAnchor) {
      lastComposerAnchor.style.removeProperty("padding-top");
      lastComposerAnchor = null;
    }
    if (lastComposerPaddingTarget) {
      removeComposerDockSpace(lastComposerPaddingTarget);
      lastComposerPaddingTarget = null;
    }
    return;
  }

  if (lastComposerAnchor && lastComposerAnchor !== anchor) {
    lastComposerAnchor.style.removeProperty("padding-top");
  }

  // WXT positions the dock in a fixed overlay, so the input shell itself should
  // keep ChatGPT's native padding. Reserve space on the nearest composer wrapper
  // instead; otherwise the rounded input box grows and the dock collides with
  // the home-screen greeting.
  anchor.style.removeProperty("padding-top");

  const paddingTarget = findComposerPaddingTarget(anchor, parent);

  if (lastComposerPaddingTarget && lastComposerPaddingTarget !== paddingTarget) {
    removeComposerDockSpace(lastComposerPaddingTarget);
  }

  if (paddingTarget) {
    applyComposerDockSpace(paddingTarget);
  }

  lastComposerAnchor = anchor;
  lastComposerPaddingTarget = paddingTarget;
}

function findComposerPaddingTarget(anchor: HTMLElement, parent: HTMLElement | null): HTMLElement | null {
  if (!parent || parent === anchor || parent === document.body || parent === document.documentElement) {
    return null;
  }

  const anchorRect = anchor.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  if (!anchorRect.width || !anchorRect.height || !parentRect.width || !parentRect.height) {
    return null;
  }

  const leftDelta = Math.abs(anchorRect.left - parentRect.left);
  const rightDelta = Math.abs(anchorRect.right - parentRect.right);
  const topDelta = anchorRect.top - parentRect.top;
  const bottomDelta = parentRect.bottom - anchorRect.bottom;

  const sameComposerWidth = leftDelta <= 24 && rightDelta <= 24;
  const nearbyWrapper = topDelta >= -4 && topDelta <= 96 && bottomDelta >= -4 && bottomDelta <= 180;

  return sameComposerWidth && nearbyWrapper ? parent : null;
}

function applyComposerDockSpace(target: HTMLElement) {
  if (!target.dataset[COMPOSER_BASE_PADDING_ATTR]) {
    target.dataset[COMPOSER_BASE_PADDING_ATTR] = window.getComputedStyle(target).paddingTop || "0px";
  }

  const basePadding = target.dataset[COMPOSER_BASE_PADDING_ATTR] || "0px";
  target.dataset[COMPOSER_DOCK_SPACE_ATTR] = "true";
  target.style.setProperty("padding-top", `calc(${basePadding} + ${COMPOSER_DOCK_SPACE_PX}px)`, "important");
}

function removeComposerDockSpace(target: HTMLElement) {
  if (target.dataset[COMPOSER_DOCK_SPACE_ATTR]) {
    target.style.removeProperty("padding-top");
    delete target.dataset[COMPOSER_DOCK_SPACE_ATTR];
    delete target.dataset[COMPOSER_BASE_PADDING_ATTR];
  }
}
