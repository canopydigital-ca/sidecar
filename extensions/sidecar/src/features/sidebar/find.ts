import { queryFirst, getDef } from "../../core/dom";
import { RegistryKey } from "../../core/registry";

export function findSidebarContainer() {
  // Use registry stable ID
  const fromRegistry = queryFirst("sidebar.host");
  if (fromRegistry) return fromRegistry;

  // Fallback to expanded scrollport if host not found (e.g. mobile?)
  const scrollport = queryFirst("sidebar.scrollport");
  if (scrollport) return scrollport.closest("nav") || scrollport; // scrollport IS nav

  return null;
}

/**
 * Checks if element is visible (has layout).
 */
export function isVisible(el: Element): boolean {
  // offsetParent is fast but fails for fixed position or some edge cases.
  // getComputedStyle is robust.
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Checks if the element is interactive (visible, not inert, receiving pointer events).
 */
export function isInteractive(el: Element): boolean {
  if (el.hasAttribute("inert")) return false;
  if (el.closest('[inert]')) return false;

  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0" || style.pointerEvents === "none") {
    return false;
  }

  const rect = el.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return false;

  return true;
}

/**
 * Picks the best interactive candidate from a list of elements.
 */
export function pickInteractable(candidates: NodeListOf<Element> | Element[]): Element | null {
  const list = Array.from(candidates);
  for (const el of list) {
    if (isInteractive(el)) return el;
  }
  return null;
}

/**
 * Finds the first INTERACTABLE element matching any of the registry selectors (primary or fallbacks).
 */
export function findInteractableCandidate(key: RegistryKey): Element | null {
  const def = getDef(key);
  if (!def) return null;

  // 1. Collect all selectors (primary + fallbacks)
  const selectors = [def.selector];
  if (def.fallbacks) {
    selectors.push(...def.fallbacks);
  }

  // 2. Query all and check interactivity
  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel);
    const best = pickInteractable(nodes);
    if (best) return best;
  }

  // Last resort: standard lookup
  return queryFirst(key);
}

/**
 * Finds the first VISIBLE element matching any of the registry selectors (primary or fallbacks).
 */
export function findVisibleCandidate(key: RegistryKey): Element | null {
  const def = getDef(key);
  if (!def) return null;

  const selectors = [def.selector];
  if (def.fallbacks) {
    selectors.push(...def.fallbacks);
  }

  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel);
    for (const node of nodes) {
      if (isVisible(node)) {
        return node;
      }
    }
  }

  return queryFirst(key);
}

export function isSidebarOpen() {
  // Robust state detection based on scrollport interactivity and host width
  const scrollport = queryFirst("sidebar.scrollport");
  const host = findSidebarContainer();

  // 1. Scrollport exists and is interactive
  if (scrollport && isInteractive(scrollport)) {
    return true;
  }

  // 2. Host width is "expanded-ish"
  if (host) {
    const width = parseFloat(window.getComputedStyle(host).width);
    if (width >= 200) return true;
    if (width < 16) return false; // Definitely closed
  }

  // 3. Fallback: Check open button state (weakest signal, but useful if DOM is weird)
  // Only trust aria-expanded if we are sure we have the right button
  const openBtn = findInteractableCandidate("sidebar.open");
  if (openBtn && openBtn.getAttribute("aria-expanded") === "true") {
    return true;
  }

  // Default to closed if no strong signal for open
  return false;
}

export function findSidebarButtons() {
  // Use registry
  return {
    openBtn: findInteractableCandidate("sidebar.open") as HTMLElement,
    closeBtn: findInteractableCandidate("sidebar.close") as HTMLElement,
    toggleBtn: null
  };
}
