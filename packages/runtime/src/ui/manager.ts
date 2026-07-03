import { DockContext } from "../core/context";
import { popoverState } from "./state.svelte";
import PopoverRoot from "./components/popovers/PopoverRoot.svelte";
import OverlayRoot from "./OverlayRoot.svelte";
import { mount, unmount } from "svelte";
import { log } from "../core/log";
import { getConfiguredShadowCssText } from "./styles";
// @ts-ignore
import appCss from "./app.css?inline";
// @ts-ignore
import stylesCss from "../../styles.css?inline";

// Global IDs for the overlay system
export const ROOT_ID = "cgpt-ext-root";
export const PORTAL_ID = "cgpt-portal";
export const OVERLAY_APP_ID = "cgpt-overlay-app";
const LIGHT_DOM_SLOT_ID = "cgpt-light-slot";

const overlayLocalCss = `
  :host {
    color-scheme: dark;
  }

  #${PORTAL_ID} {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .cgpt-popover {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: rgba(18, 18, 18, 0.96);
    color: rgba(255, 255, 255, 0.92);
    box-shadow: 0 22px 70px rgba(0, 0, 0, 0.48);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    outline: none;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.35;
    opacity: 1 !important;
    transform: none !important;
  }

  .cgpt-popover,
  .cgpt-popover * {
    box-sizing: border-box;
    min-width: 0;
    font-family: inherit;
  }

  .cgpt-popover-body {
    flex: 1 1 auto;
    min-height: 0;
    padding: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    color: rgba(255, 255, 255, 0.92);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.28) transparent;
  }

  .cgpt-popover-body::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  .cgpt-popover-body::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.28);
    background-clip: padding-box;
  }

  .cgpt-popover h4,
  .cgpt-popover h5,
  .cgpt-popover p {
    margin-top: 0;
  }

  .cgpt-popover h4 {
    margin: 0;
    color: rgba(255, 255, 255, 0.94);
    font-size: 14px;
    font-weight: 650;
    line-height: 1.2;
  }

  .cgpt-popover h5 {
    margin: 0 0 8px 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .cgpt-popover label {
    color: rgba(255, 255, 255, 0.86);
  }

  .cgpt-popover button {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 0 0 auto;
    min-height: 26px;
    padding: 6px 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.92);
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.16s ease, border-color 0.16s ease, transform 0.1s ease;
  }

  .cgpt-popover button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
  }

  .cgpt-popover button:active:not(:disabled) {
    transform: translateY(1px);
  }

  .cgpt-popover button:disabled,
  .cgpt-popover select:disabled,
  .cgpt-popover input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .cgpt-popover > button[aria-label="Resize panel"] {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 50;
    width: 14px;
    height: 14px;
    min-height: 14px;
    padding: 0;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    cursor: nwse-resize;
  }

  .cgpt-popover input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin: 0;
    flex: 0 0 auto;
    accent-color: #10a37f;
  }

  .cgpt-popover select,
  .cgpt-popover input[type="text"],
  .cgpt-popover input[type="search"],
  .cgpt-popover textarea {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    background: #202020;
    color: #ececec;
    outline: none;
    font-size: 12px;
  }

  .cgpt-popover select {
    height: 28px;
    padding: 3px 28px 3px 8px;
    color-scheme: dark;
  }

  .cgpt-popover select:focus,
  .cgpt-popover input:focus,
  .cgpt-popover textarea:focus,
  .cgpt-popover button:focus-visible {
    border-color: #10a37f;
    box-shadow: 0 0 0 1px #10a37f;
  }

  .cgpt-popover input[type="range"] {
    width: 100%;
    height: 4px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.20);
    accent-color: #10a37f;
    cursor: pointer;
  }

  .cgpt-popover .flex,
  .cgpt-popover .inline-flex {
    display: flex;
  }

  .cgpt-popover .inline-flex {
    display: inline-flex;
  }

  .cgpt-popover .grid {
    display: grid;
  }

  .cgpt-popover .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cgpt-popover .flex-col {
    flex-direction: column;
  }

  .cgpt-popover .flex-wrap {
    flex-wrap: wrap;
  }

  .cgpt-popover .items-center {
    align-items: center;
  }

  .cgpt-popover .justify-between {
    justify-content: space-between;
  }

  .cgpt-popover .justify-center {
    justify-content: center;
  }

  .cgpt-popover .justify-items-start {
    justify-items: start;
  }

  .cgpt-popover .gap-1\\.5 {
    gap: 6px;
  }

  .cgpt-popover .gap-2 {
    gap: 8px;
  }

  .cgpt-popover .gap-2\\.5 {
    gap: 10px;
  }

  .cgpt-popover .gap-3 {
    gap: 12px;
  }

  .cgpt-popover .gap-x-4 {
    column-gap: 16px;
  }

  .cgpt-popover .gap-y-3 {
    row-gap: 12px;
  }

  .cgpt-popover .flex-1 {
    flex: 1 1 0%;
  }

  .cgpt-popover .flex-none {
    flex: none;
  }

  .cgpt-popover .shrink-0 {
    flex-shrink: 0;
  }

  .cgpt-popover .m-0 {
    margin: 0;
  }

  .cgpt-popover .mb-1 {
    margin-bottom: 4px;
  }

  .cgpt-popover .mb-2 {
    margin-bottom: 8px;
  }

  .cgpt-popover .mb-1\\.5 {
    margin-bottom: 6px;
  }

  .cgpt-popover .mt-2 {
    margin-top: 8px;
  }

  .cgpt-popover .mt-2\\.5 {
    margin-top: 10px;
  }

  .cgpt-popover .mt-3 {
    margin-top: 12px;
  }

  .cgpt-popover .ml-1\\.5 {
    margin-left: 6px;
  }

  .cgpt-popover .pt-3 {
    padding-top: 12px;
  }

  .cgpt-popover .pt-1 {
    padding-top: 4px;
  }

  .cgpt-popover .p-3 {
    padding: 12px;
  }

  .cgpt-popover .p-2 {
    padding: 8px;
  }

  .cgpt-popover .p-0 {
    padding: 0;
  }

  .cgpt-popover .px-2\\.5 {
    padding-left: 10px;
    padding-right: 10px;
  }

  .cgpt-popover .px-2 {
    padding-left: 8px;
    padding-right: 8px;
  }

  .cgpt-popover .px-\\[3px\\] {
    padding-left: 3px;
    padding-right: 3px;
  }

  .cgpt-popover .py-2 {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .cgpt-popover .py-1\\.5 {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .cgpt-popover .py-1 {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .cgpt-popover .w-full {
    width: 100%;
  }

  .cgpt-popover .h-1 {
    height: 4px;
  }

  .cgpt-popover .h-4 {
    height: 16px;
  }

  .cgpt-popover .w-4 {
    width: 16px;
  }

  .cgpt-popover .h-6 {
    height: 24px;
  }

  .cgpt-popover .min-h-0 {
    min-height: 0;
  }

  .cgpt-popover .min-w-0 {
    min-width: 0;
  }

  .cgpt-popover .max-w-full {
    max-width: 100%;
  }

  .cgpt-popover .overflow-hidden {
    overflow: hidden;
  }

  .cgpt-popover .overflow-y-auto {
    overflow-y: auto;
  }

  .cgpt-popover .overflow-x-hidden {
    overflow-x: hidden;
  }

  .cgpt-popover .border-t {
    border-top: 1px solid rgba(255, 255, 255, 0.10);
  }

  .cgpt-popover .border {
    border-style: solid;
    border-width: 1px;
    border-color: rgba(255, 255, 255, 0.12);
  }

  .cgpt-popover .border-2 {
    border-style: solid;
    border-width: 2px;
  }

  .cgpt-popover .border-dashed {
    border-style: dashed;
  }

  .cgpt-popover .border-white\\/10 {
    border-color: rgba(255, 255, 255, 0.10);
  }

  .cgpt-popover .border-white\\/12 {
    border-color: rgba(255, 255, 255, 0.12);
  }

  .cgpt-popover .border-white\\/14 {
    border-color: rgba(255, 255, 255, 0.14);
  }

  .cgpt-popover .border-white\\/20 {
    border-color: rgba(255, 255, 255, 0.20);
  }

  .cgpt-popover .border-white\\/30 {
    border-color: rgba(255, 255, 255, 0.30);
  }

  .cgpt-popover .border-t-white {
    border-top-color: rgba(255, 255, 255, 0.92);
  }

  .cgpt-popover .rounded {
    border-radius: 4px;
  }

  .cgpt-popover .rounded-md {
    border-radius: 6px;
  }

  .cgpt-popover .rounded-lg {
    border-radius: 8px;
  }

  .cgpt-popover .rounded-xl {
    border-radius: 12px;
  }

  .cgpt-popover .rounded-full {
    border-radius: 999px;
  }

  .cgpt-popover .bg-white\\/3 {
    background: rgba(255, 255, 255, 0.03);
  }

  .cgpt-popover .bg-white\\/5 {
    background: rgba(255, 255, 255, 0.05);
  }

  .cgpt-popover .bg-white\\/6 {
    background: rgba(255, 255, 255, 0.06);
  }

  .cgpt-popover .bg-white\\/8 {
    background: rgba(255, 255, 255, 0.08);
  }

  .cgpt-popover .bg-black\\/35 {
    background: rgba(0, 0, 0, 0.35);
  }

  .cgpt-popover .select-none {
    user-select: none;
  }

  .cgpt-popover .cursor-pointer {
    cursor: pointer;
  }

  .cgpt-popover .whitespace-nowrap {
    white-space: nowrap;
  }

  .cgpt-popover .text-right {
    text-align: right;
  }

  .cgpt-popover .tabular-nums {
    font-variant-numeric: tabular-nums;
  }

  .cgpt-popover .text-xs {
    font-size: 12px;
    line-height: 1.35;
  }

  .cgpt-popover .text-sm {
    font-size: 14px;
    line-height: 1.3;
  }

  .cgpt-popover .text-\\[10px\\] {
    font-size: 10px;
    line-height: 1.2;
  }

  .cgpt-popover .text-\\[11px\\] {
    font-size: 11px;
    line-height: 1.3;
  }

  .cgpt-popover .text-\\[13px\\] {
    font-size: 13px;
    line-height: 1.35;
  }

  .cgpt-popover .font-semibold {
    font-weight: 650;
  }

  .cgpt-popover .text-white {
    color: rgba(255, 255, 255, 0.94);
  }

  .cgpt-popover .text-white\\/92 {
    color: rgba(255, 255, 255, 0.92);
  }

  .cgpt-popover .text-white\\/86 {
    color: rgba(255, 255, 255, 0.86);
  }

  .cgpt-popover .text-white\\/80 {
    color: rgba(255, 255, 255, 0.80);
  }

  .cgpt-popover .text-white\\/70 {
    color: rgba(255, 255, 255, 0.70);
  }

  .cgpt-popover .text-white\\/55 {
    color: rgba(255, 255, 255, 0.55);
  }

  .cgpt-popover .text-white\\/50 {
    color: rgba(255, 255, 255, 0.50);
  }

  .cgpt-popover .opacity-50 {
    opacity: 0.5;
  }

  .cgpt-popover .uppercase {
    text-transform: uppercase;
  }

  .cgpt-popover .leading-\\[1\\.2\\] {
    line-height: 1.2;
  }

  .cgpt-popover .leading-\\[1\\.25\\] {
    line-height: 1.25;
  }

  .cgpt-popover .leading-\\[1\\.4\\] {
    line-height: 1.4;
  }

  .cgpt-popover .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cgpt-popover .break-words {
    overflow-wrap: break-word;
  }

  .cgpt-popover .whitespace-pre-wrap {
    white-space: pre-wrap;
  }

  .cgpt-popover .relative {
    position: relative;
  }

  .cgpt-popover .absolute {
    position: absolute;
  }

  .cgpt-popover .inset-0 {
    inset: 0;
  }

  .cgpt-popover .z-\\[10002\\] {
    z-index: 10002;
  }

  .cgpt-popover .h-8 {
    height: 32px;
  }

  .cgpt-popover .w-8 {
    width: 32px;
  }

  .cgpt-popover .animate-spin {
    animation: cgpt-spin 1s linear infinite;
  }

  @keyframes cgpt-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export type OverlayHost = {
  host: HTMLElement;
  root: ShadowRoot;
  app: HTMLElement;
};

// --- Overlay Creation Logic ---

/**
 * Ensures the global overlay host exists and is properly configured.
 * Handles shadow root creation and CSS injection.
 */
export function ensureGlobalOverlay(): OverlayHost {
  let host = document.getElementById(ROOT_ID) as HTMLElement | null;
  let root: ShadowRoot;

  if (host && host.shadowRoot) {
    // Existing host
    root = host.shadowRoot;
    // Ensure a default slot exists so light-DOM children (dock stage + dock host)
    // remain rendered even after a shadow root is attached.
    ensureLightDomSlot(root);
    // Ensure styles are present even if the host shadow root existed before we ran.
    injectOverlayStyles(root);
    let app = root.getElementById(OVERLAY_APP_ID) as HTMLElement | null;
    if (!app) {
      app = createOverlayApp(root);
    }
    return { host, root, app };
  }

  // Create new host
  if (host) {
    // Host exists but no shadow root? Should not happen if we created it.
    // If it exists but we can't access shadowRoot (closed mode?), we might be in trouble.
    // Assuming open mode or we created it.
    log.warn("[UI] Host element exists but shadowRoot missing or inaccessible. Re-attaching?");
  } else {
    host = document.createElement("div");
    host.id = ROOT_ID;
    Object.assign(host.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: "2147483647", // Max z-index
    });
    document.documentElement.appendChild(host);
  }

  root = host.shadowRoot || host.attachShadow({ mode: "open" });
  ensureLightDomSlot(root);

  // Inject Styles
  injectOverlayStyles(root);

  // Create App Container
  const app = createOverlayApp(root);

  // Dev assertion
  if (import.meta.env.DEV) {
    const allRoots = document.querySelectorAll(`#${ROOT_ID}`);
    if (allRoots.length > 1) {
      log.warn("[UI] Duplicate overlay roots detected!", allRoots);
    }
  }

  return { host, root, app };
}

function ensureLightDomSlot(root: ShadowRoot) {
  // The dock system mounts `#cgpt-ext-stage` and `#cgpt-dock` as light DOM children of `#cgpt-ext-root`.
  // If we attach a shadow root without a slot, those light children won't be rendered (0x0 rects in tests).
  if (root.getElementById(LIGHT_DOM_SLOT_ID)) return;
  const slot = document.createElement("slot");
  slot.id = LIGHT_DOM_SLOT_ID;
  // Keep it inert; the dock itself manages pointer-events.
  slot.style.pointerEvents = "none";
  // Ensure the slot itself does not affect layout; assigned nodes behave as if the slot isn't there.
  // (Browsers commonly treat <slot> as display: contents by default, but be explicit.)
  slot.style.display = "contents";
  root.appendChild(slot);
}

function createOverlayApp(root: ShadowRoot): HTMLElement {
  let app = root.getElementById(OVERLAY_APP_ID) as HTMLElement | null;
  if (!app) {
    app = document.createElement("div");
    app.id = OVERLAY_APP_ID;
    app.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    root.appendChild(app);
  }
  return app;
}

function injectOverlayStyles(root: ShadowRoot) {
  if ((root as any).__sidecarStylesInjected) return;
  (root as any).__sidecarStylesInjected = true;

  const fallbackCss = [appCss, stylesCss].filter(Boolean).join("\n");
  const combinedCss = [getConfiguredShadowCssText(fallbackCss), overlayLocalCss]
    .filter(Boolean)
    .join("\n");
  if (!combinedCss) return;

  if ("adoptedStyleSheets" in root && typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(combinedCss);
      // @ts-ignore
      root.adoptedStyleSheets = [...(root.adoptedStyleSheets || []), sheet];
      return;
    } catch {
      // Fall back to style tag below.
    }
  }

  const style = document.createElement("style");
  style.textContent = combinedCss;
  root.appendChild(style);
}

/**
 * Gets or creates the portal container within the overlay.
 * Also ensures the UI root component is mounted if needed.
 */
export function getGlobalPortal(): HTMLElement {
  const { root, app } = ensureGlobalOverlay();

  mountOverlayRoot(root);

  const portal = root.getElementById(PORTAL_ID) as HTMLElement | null;
  if (portal) return portal;

  const fallback = document.createElement("div");
  fallback.id = PORTAL_ID;
  app.appendChild(fallback);
  return fallback;
}

export function mountOverlayRoot(root: ShadowRoot) {
  const target = root.getElementById(OVERLAY_APP_ID) || (() => {
    const div = document.createElement('div');
    div.id = OVERLAY_APP_ID;
    root.appendChild(div);
    return div;
  })();
  if ((target as any).__cgptMounted) return;
  mount(OverlayRoot, { target });
  (target as any).__cgptMounted = true;
}

// --- Popover Manager ---

type PopoverKind = string;
type CloseReason = "reclick" | "switch" | "escape" | "outside" | "manual" | "detach" | "outside-pointerdown";

type OpenPopover = {
  id: string;
  popoverEl: HTMLElement;
  anchorEl?: HTMLElement | null;
};

export class PopoverManager {
  private app: any = null;
  private openPopovers = new Map<string, OpenPopover>();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", this.onGlobalPointerDown, { capture: true });
    }
  }

  init() {
    if (!this.app) {
      try {
        const portal = getGlobalPortal();
        this.app = mount(PopoverRoot, { target: portal });
      } catch (e) {
        console.error("Failed to mount PopoverRoot:", e);
      }
    }
  }

  private onGlobalPointerDown = (e: PointerEvent) => {
    // Only left click / primary pointer
    if (e.button !== 0) return;

    const path = (typeof e.composedPath === "function" ? e.composedPath() : []) as EventTarget[];
    const target = e.target as Node | null;

    // Helper: “did the click happen inside this element?”
    const hit = (el?: HTMLElement | null) => {
      if (!el) return false;
      if (path.length) return path.includes(el);
      return !!target && el.contains(target);
    };

    // If click is inside ANY open popover or ANY anchor, do not close.
    for (const { popoverEl, anchorEl } of this.openPopovers.values()) {
      if (hit(popoverEl) || hit(anchorEl)) return;
    }

    if (this.openPopovers.size > 0) {
      this.closeAll({ reason: "outside-pointerdown" });
    }
  };

  isOpen(kind?: PopoverKind): boolean {
    return popoverState.isOpen(kind);
  }

  register(id: string, popoverEl: HTMLElement, anchorEl?: HTMLElement | null) {
    this.openPopovers.set(id, { id, popoverEl, anchorEl });
  }

  unregister(id: string) {
    this.openPopovers.delete(id);
  }

  closeAll(meta?: { reason: string }) {
    this.close((meta?.reason as CloseReason) || "outside");
  }

  toggle(kind: PopoverKind, triggerEl: HTMLElement, ctx: DockContext) {
    try {
      if (this.isOpen(kind)) {
        this.close("reclick");
      } else {
        if (this.isOpen()) {
          this.close("switch");
        }
        this.open(kind, triggerEl, ctx);
      }
    } catch (error) {
      console.error("PopoverManager.toggle failed:", error);
      // Fallback: ensure popover is closed on error
      this.close("manual");
    }
  }

  open(kind: PopoverKind, triggerEl: HTMLElement, ctx: DockContext) {
    try {
      // Ensure we close any existing popover first to prevent stacking/state issues
      if (this.isOpen() && popoverState.activeKind !== kind) {
        this.close("switch");
      }

      // Ensure mounted (idempotent)
      this.init();

      ctx.flags.isPopoverOpen = true;

      // Define default metadata for resizable popovers
      let meta: Record<string, any> = {};

      // Most functional popovers should be resizable
      if (['settings', 'prompts', 'gameIcons', 'pets', 'pets-inspector', 'fonts', 'progressquest'].includes(kind)) {
        meta = {
          resizable: true,
          defaultW: 380,
          defaultH: 360,
          minW: 280,
          minH: 180,
        };

        // Specific overrides
        if (kind === 'prompts') {
          meta.defaultW = 420;
          meta.defaultH = 400;
          meta.maxW = 480;
        } else if (kind === 'gameIcons') {
          meta.defaultW = 560;
          meta.defaultH = 520;
          meta.minW = 420;
          meta.minH = 320;
        } else if (kind === 'fonts') {
          meta.defaultW = 300;
          meta.defaultH = 320;
        } else if (kind === 'pets-inspector') {
          meta.defaultW = 400;
          meta.defaultH = 400;
        } else if (kind === 'progressquest') {
          meta.defaultW = 560;
          meta.defaultH = 560;
          meta.minW = 420;
          meta.minH = 420;
        }
      }

      popoverState.setOpen(kind, triggerEl, ctx, meta);

      if (triggerEl) {
        triggerEl.setAttribute("aria-expanded", "true");
        triggerEl.setAttribute("aria-pressed", "true");
      }
    } catch (error) {
      console.error("PopoverManager.open failed:", error);
      // Ensure popover state is reset on error
      ctx.flags.isPopoverOpen = false;
      popoverState.setClosed();
      throw error; // Re-throw to maintain existing error behavior
    }
  }

  close(reason: CloseReason = "manual") {
    if (!popoverState.activeKind) return;

    const triggerEl = popoverState.triggerEl;
    const ctx = popoverState.context;

    if (ctx) {
      ctx.flags.isPopoverOpen = false;
    } else {
      console.warn("PopoverManager.close: Context is null, cannot reset flags.");
    }

    popoverState.setClosed();

    if (triggerEl) {
      triggerEl.setAttribute("aria-expanded", "false");
      triggerEl.setAttribute("aria-pressed", "false");

      if (reason !== "switch" && reason !== "outside" && reason !== "detach") {
        if (reason === "escape" || reason === "reclick") {
          if (triggerEl.isConnected) {
            triggerEl.focus();
          }
        }
      }
    }
  }

  destroy() {
    if (this.app) {
      unmount(this.app);
      this.app = null;
    }
  }
}

export const popoverManager = new PopoverManager();
