import type { ChatGptHostAdapter, ComposerAnchor, SidebarAction } from "../../runtime/src/core/host";
import { CHATGPT_SELECTORS } from "./selectors";

function queryFirstBySelectors(
  selectors: readonly string[],
  root: ParentNode = document,
  predicate?: (el: Element) => boolean,
): Element | null {
  for (const selector of selectors) {
    const nodes = root.querySelectorAll(selector);
    for (const node of nodes) {
      if (!predicate || predicate(node)) {
        return node;
      }
    }
  }

  return null;
}

function queryAllBySelectors(selectors: readonly string[], root: ParentNode = document): Element[] {
  const seen = new Set<Element>();
  const out: Element[] = [];

  for (const selector of selectors) {
    const nodes = root.querySelectorAll(selector);
    for (const node of nodes) {
      if (!seen.has(node)) {
        seen.add(node);
        out.push(node);
      }
    }
  }

  return out;
}

function isVisible(el: Element): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isInteractive(el: Element): boolean {
  if (el.hasAttribute("inert") || el.closest("[inert]")) return false;

  const style = window.getComputedStyle(el);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0" ||
    style.pointerEvents === "none"
  ) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  return rect.width >= 8 && rect.height >= 8;
}

function toPathname(href: string | null): string | null {
  if (!href) return null;

  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

function normalizeText(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function getNumericZIndex(el: Element): number {
  const zIndex = window.getComputedStyle(el).zIndex;
  const parsed = Number(zIndex);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMenuSurface(el: Element): HTMLElement | null {
  const root = el.closest("[data-radix-popper-content-wrapper]") ?? el;
  return root instanceof HTMLElement ? root : null;
}

function queryNormalizedMenuSurfaces(): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const out: HTMLElement[] = [];

  for (const node of queryAllBySelectors(CHATGPT_SELECTORS.floatingMenuSurfaces)) {
    const normalized = normalizeMenuSurface(node);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }

  return out;
}

function findComposerEditor(): Element | null {
  return queryFirstBySelectors(CHATGPT_SELECTORS.composerEditor);
}

function isUsefulComposerSurface(candidate: Element, editorRect: DOMRect): boolean {
  const rect = candidate.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const minWidth = Math.max(280, editorRect.width * 0.9);
  if (rect.width < minWidth) return false;

  if (editorRect.width >= 240) {
    const maxInputShellWidth = Math.max(editorRect.width * 1.85, editorRect.width + 420);
    if (rect.width > maxInputShellWidth) return false;
  }

  if (rect.height < editorRect.height * 0.75) return false;
  if (rect.height > 260) return false;

  const topDelta = editorRect.top - rect.top;
  const bottomDelta = rect.bottom - editorRect.bottom;

  if (topDelta < -4 || bottomDelta < -4) return false;
  if (topDelta > 84) return false;

  return true;
}

function scoreComposerSurface(candidate: Element, editorRect: DOMRect): number {
  const rect = candidate.getBoundingClientRect();
  const topDelta = Math.max(0, editorRect.top - rect.top);
  const tooHighPenalty = Math.max(0, topDelta - 28) * 24;
  const tallSurfacePenalty = Math.max(0, rect.height - 120) * 2;

  return rect.width - tooHighPenalty - tallSurfacePenalty;
}

function findComposerInputShell(): Element | null {
  const editor = findComposerEditor();
  if (!editor) return null;

  const editorRect = editor.getBoundingClientRect();
  if (editorRect.width <= 0 || editorRect.height <= 0) {
    return editor.parentElement ?? editor;
  }

  const candidates: Element[] = [];
  let current = editor.parentElement;
  let depth = 0;

  while (current && depth < 12) {
    if (current === document.body || current === document.documentElement) break;
    if (isUsefulComposerSurface(current, editorRect)) {
      candidates.push(current);
    }
    current = current.parentElement;
    depth += 1;
  }

  if (candidates.length === 0) {
    return editor.parentElement ?? editor;
  }

  candidates.sort((a, b) => {
    const scoreDiff = scoreComposerSurface(b, editorRect) - scoreComposerSurface(a, editorRect);
    if (Math.abs(scoreDiff) > 0.5) return scoreDiff;

    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return Math.max(0, editorRect.top - ar.top) - Math.max(0, editorRect.top - br.top);
  });

  return candidates[0] ?? null;
}

function findComposerAnchor(): ComposerAnchor | null {
  let target = findComposerInputShell();

  if (!target) {
    target = queryFirstBySelectors(CHATGPT_SELECTORS.composerForm);
  }

  if (target?.parentElement) {
    return { anchor: target, parent: target.parentElement };
  }

  const bottom = queryFirstBySelectors(CHATGPT_SELECTORS.threadBottomContainer);
  if (bottom?.parentElement) {
    return { anchor: bottom, parent: bottom.parentElement };
  }

  return null;
}

function findComposerResizeTarget(): Element | null {
  return findComposerEditor()?.parentElement ?? null;
}

function getScrollContainer(): Element | null {
  return (
    document.querySelector("main .flex-1.overflow-hidden > div.h-full") ||
    document.querySelector("main [class*='react-scroll-to-bottom']") ||
    document.querySelector("main > div.overflow-y-auto")
  );
}

function isProjectConversationView(): boolean {
  const path = window.location.pathname;
  if (path.includes("/g/") && path.includes("/c/")) return true;
  if (path.includes("/project/")) return true;

  return !!document.querySelector('[data-testid="project-modal-trigger"]');
}

function findModelPicker(): Element | null {
  return queryFirstBySelectors(CHATGPT_SELECTORS.modelPicker);
}

function findSidebarContainer(): Element | null {
  const host = queryFirstBySelectors(CHATGPT_SELECTORS.sidebarHost);
  if (host) return host;

  const scrollport = findSidebarScrollport();
  return scrollport?.closest("nav") ?? scrollport ?? null;
}

function findSidebarScrollport(): Element | null {
  const host = queryFirstBySelectors(CHATGPT_SELECTORS.sidebarHost);
  if (host) {
    const nested = queryFirstBySelectors(CHATGPT_SELECTORS.sidebarScrollport, host);
    if (nested) return nested;
  }

  return queryFirstBySelectors(CHATGPT_SELECTORS.sidebarScrollport);
}

function findSidebarActionButton(action: SidebarAction): Element | null {
  const selectors =
    action === "open"
      ? CHATGPT_SELECTORS.sidebarOpenButton
      : CHATGPT_SELECTORS.sidebarCloseButton;

  return queryFirstBySelectors(selectors, document, isInteractive);
}

function findCurrentHistoryItem(pathname: string): HTMLElement | null {
  const root = findSidebarScrollport() ?? document;
  const items = queryAllBySelectors(CHATGPT_SELECTORS.sidebarHistoryItems, root).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );

  for (const item of items) {
    const itemPath = toPathname(item.getAttribute("href"));
    if (itemPath === pathname) {
      return item;
    }
  }

  for (const item of items) {
    const itemPath = toPathname(item.getAttribute("href"));
    if (!itemPath) continue;
    if (pathname.endsWith(itemPath) || itemPath.endsWith(pathname)) {
      return item;
    }
  }

  for (const item of items) {
    if (item.getAttribute("aria-current") === "page") {
      return item;
    }

    if (item.classList.contains("bg-token-sidebar-surface-secondary")) {
      return item;
    }
  }

  return null;
}

function findHistoryItemOptionsButton(item: Element): HTMLElement | null {
  const group =
    item.closest("li") ||
    item.closest("div.group") ||
    item.parentElement;

  if (!group) return null;

  const button = queryFirstBySelectors(CHATGPT_SELECTORS.sidebarHistoryItemOptionsButton, group, isInteractive);
  return button instanceof HTMLElement ? button : null;
}

function listFloatingMenuSurfaces(): HTMLElement[] {
  return queryNormalizedMenuSurfaces();
}

function findVisibleMenuSurface(): HTMLElement | null {
  const surfaces = listFloatingMenuSurfaces().filter((surface) => isVisible(surface));
  if (surfaces.length === 0) return null;

  surfaces.sort((a, b) => {
    const zDiff = getNumericZIndex(b) - getNumericZIndex(a);
    if (zDiff !== 0) return zDiff;
    return Number(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? 1 : -1;
  });

  return surfaces[0] ?? null;
}

function findMenuItemByText(text: string, root: ParentNode | null = document): HTMLElement | null {
  if (!root) return null;

  const needle = normalizeText(text);
  const items = queryAllBySelectors(CHATGPT_SELECTORS.menuItems, root).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );

  for (const item of items) {
    if (!isVisible(item)) continue;
    if (normalizeText(item.textContent).includes(needle)) {
      return item;
    }
  }

  return null;
}

function isSidebarOpen(): boolean {
  const scrollport = findSidebarScrollport();
  const host = findSidebarContainer();

  if (scrollport && isInteractive(scrollport)) {
    return true;
  }

  if (host) {
    const width = parseFloat(window.getComputedStyle(host).width);
    if (width >= 200) return true;
    if (width < 16) return false;
  }

  const openBtn = findSidebarActionButton("open");
  if (openBtn && openBtn.getAttribute("aria-expanded") === "true") {
    return true;
  }

  return false;
}

function getSidebarRightEdge(): number {
  const sidebar = findSidebarContainer();
  if (!sidebar) return 0;

  try {
    const rect = sidebar.getBoundingClientRect();
    if (rect.width < 16 || rect.right < 0) return 0;
    if (!isVisible(sidebar)) return 0;

    return rect.right;
  } catch {
    return 0;
  }
}

export function createChatGptHostAdapter(): ChatGptHostAdapter {
  return {
    id: "chatgpt",
    getScrollContainer,
    isProjectConversationView,
    findComposerEditor,
    findComposerResizeTarget,
    findComposerAnchor,
    findModelPicker,
    findSidebarContainer,
    findSidebarScrollport,
    findSidebarActionButton,
    findCurrentHistoryItem,
    findHistoryItemOptionsButton,
    listFloatingMenuSurfaces,
    findVisibleMenuSurface,
    findMenuItemByText,
    isSidebarOpen,
    getSidebarRightEdge,
  };
}
