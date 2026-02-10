import { DockContext } from "../core/context";
import { popoverState } from "./state.svelte";
import PopoverRoot from "./components/popovers/PopoverRoot.svelte";
import OverlayRoot from "./OverlayRoot.svelte";
import { mount, unmount } from "svelte";
import { log } from "../core/log";

// Global IDs for the overlay system
export const ROOT_ID = "cgpt-ext-root";
export const PORTAL_ID = "cgpt-portal";
export const OVERLAY_APP_ID = "cgpt-overlay-app";

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

  // Inject Styles
  injectOverlayStyles(root);

  // Create App Container
  const app = createOverlayApp(root);

  // Dev assertion
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    const allRoots = document.querySelectorAll(`#${ROOT_ID}`);
    if (allRoots.length > 1) {
      log.warn("[UI] Duplicate overlay roots detected!", allRoots);
    }
  }

  return { host, root, app };
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
  // Link to compiled Tailwind CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
    link.href = chrome.runtime.getURL("dist/chatgpt-dock.css");
  } else {
    link.href = "dist/chatgpt-dock.css";
  }
  root.appendChild(link);

  // Link legacy styles
  const legacyLink = document.createElement("link");
  legacyLink.rel = "stylesheet";
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
    legacyLink.href = chrome.runtime.getURL("styles.css");
  } else {
    legacyLink.href = "styles.css";
  }
  root.appendChild(legacyLink);

  // AdoptedStyleSheets polyfill/optimization
  const urls = [link.href, legacyLink.href].filter(Boolean);
  if ("adoptedStyleSheets" in root && typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype) {
    Promise.all(
      urls.map(async (u) => {
        try {
          const res = await fetch(u);
          if (!res.ok) return "";
          return await res.text();
        } catch {
          return "";
        }
      })
    )
      .then((texts) => {
        const sheets: CSSStyleSheet[] = [];
        for (const cssText of texts) {
          if (!cssText) continue;
          try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(cssText);
            sheets.push(sheet);
          } catch { }
        }
        if (sheets.length > 0) {
          // @ts-ignore
          root.adoptedStyleSheets = [...(root.adoptedStyleSheets || []), ...sheets];
        }
      })
      .catch(() => { });

    // Error handling to remove failed links
    link.addEventListener("error", () => link.remove(), { once: true });
    legacyLink.addEventListener("error", () => legacyLink.remove(), { once: true });
  }
}

/**
 * Gets or creates the portal container within the overlay.
 * Also ensures the UI root component is mounted if needed.
 */
export function getGlobalPortal(): HTMLElement {
  const { root, app } = ensureGlobalOverlay();

  // Ensure UI Root is mounted (legacy hook)
  const ui = (window as any).ChatGPTDockUI;
  if (ui?.mountOverlayRoot) ui.mountOverlayRoot(root);

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
          if (document.contains(triggerEl)) {
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
