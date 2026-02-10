import { STATUS_ID, VERSION } from "../../core/constants";
import { DockContext } from "../../core/context";
import { log } from "../../core/log";
import { findSidebarContainer } from "../sidebar/find";

// Global error handler for extension context errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Extension context invalidated')) {
      event.preventDefault();
      return false;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
      event.preventDefault();
      return false;
    }
  });
}

let statusActionTimer: number | null = null;
let sidebarRO: ResizeObserver | null = null;
let sidebarMO: MutationObserver | null = null;
let currentSidebar: Element | null = null;

let layoutRafId: number | null = null;
let lastLayoutSig: string = "";

// Safe console logging
function safeConsoleLog(...args: any[]) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && !chrome.runtime.lastError) {
      console.log(...args);
    }
  } catch (e) { }
}

export function showStatusAction(msg: string) {
  const el = document.getElementById("cgpt-status-action");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  if (statusActionTimer) clearTimeout(statusActionTimer);
  statusActionTimer = window.setTimeout(() => {
    el.style.opacity = "0";
  }, 2000);
}

export function resetStatusState(ctx: DockContext) {
  ctx.statusState.processed = new WeakSet();
  ctx.statusState.pending = [];
  ctx.statusState.user = 0;
  ctx.statusState.ai = 0;
  ctx.statusState.words = 0;
  ctx.statusState.chars = 0;
  ctx.statusState.userChars = 0;
  ctx.statusState.aiChars = 0;
  ctx.statusState.initDone = false;

  const textEl = document.getElementById("cgpt-status-text");
  if (textEl) textEl.innerHTML = "…";
}

function getSidebarRightEdge(): number {
  const sidebar = findSidebarContainer();
  if (!sidebar) return 0;

  try {
    const rect = sidebar.getBoundingClientRect();
    // Check computed style for visibility
    const style = window.getComputedStyle(sidebar);

    if (rect.width < 16 || rect.right < 0) return 0;
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return 0;

    return rect.right;
  } catch (e) {
    return 0;
  }
}

function applyStatusbarLayout() {
  try {
    const sb = document.getElementById(STATUS_ID);
    if (!sb) return;

    // Mobile check (<= 768px)
    const isMobile = window.innerWidth <= 768;

    let leftVal = 0;
    if (!isMobile) {
      // Find sidebar and measure
      const sidebar = findSidebarContainer();

      // Update observers if sidebar element changed
      if (sidebar !== currentSidebar) {
        if (currentSidebar) {
          sidebarRO?.disconnect();
          sidebarMO?.disconnect();
          sidebarRO = null;
          sidebarMO = null;
        }

        currentSidebar = sidebar;

        if (sidebar) {
          // Setup ResizeObserver
          sidebarRO = new ResizeObserver(() => forceStatusbarLayout());
          sidebarRO.observe(sidebar);

          // Setup MutationObserver for inline styles/classes
          sidebarMO = new MutationObserver(() => forceStatusbarLayout());
          sidebarMO.observe(sidebar, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
        }
      }

      leftVal = getSidebarRightEdge();
    }

    // Ensure values are safe
    if (isNaN(leftVal) || leftVal < 0) leftVal = 0;

    // Signature check to avoid layout thrashing
    const sig = `${leftVal.toFixed(1)}-${window.innerWidth}`;
    if (lastLayoutSig === sig && sb.dataset.layoutApplied === "true") return;
    lastLayoutSig = sig;
    sb.dataset.layoutApplied = "true";

    const leftPx = `${leftVal}px`;

    sb.style.removeProperty('inset'); // Reset shorthand first
    sb.style.setProperty('position', 'fixed', 'important');
    sb.style.setProperty('bottom', '0px', 'important');
    sb.style.setProperty('left', leftPx, 'important');
    sb.style.setProperty('right', 'auto', 'important');
    sb.style.setProperty('top', 'auto', 'important');
    sb.style.setProperty('width', `calc(100vw - ${leftPx})`, 'important');
    sb.style.setProperty('max-width', 'none', 'important');
    sb.style.setProperty('box-sizing', 'border-box', 'important');
    sb.style.setProperty('z-index', '2147483647', 'important');

  } catch (e) {
    if (e instanceof Error && e.message.includes('Extension context invalidated')) return;
    // Suppress other layout errors
  }
}

function forceStatusbarLayout() {
  if (layoutRafId) return;
  layoutRafId = requestAnimationFrame(() => {
    layoutRafId = null;
    applyStatusbarLayout();
  });
}

export function installStatusbarLayout() {
  const bar = document.getElementById(STATUS_ID) as HTMLElement | null;
  if (!bar) return;

  if (bar.dataset.layoutInstalled) return;
  bar.dataset.layoutInstalled = "true";

  if (bar.parentElement !== document.documentElement) {
    document.documentElement.appendChild(bar);
  }

  // Initial layout
  forceStatusbarLayout();

  // Watch for window resize
  window.addEventListener('resize', () => forceStatusbarLayout(), { passive: true });
  // @ts-ignore
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => forceStatusbarLayout(), { passive: true });

  // Fallback poller to catch sidebar appearance if it wasn't there initially
  // or if observers failed to attach.
  setInterval(() => {
    // Only if we haven't found sidebar yet or to be safe
    if (!currentSidebar) forceStatusbarLayout();
  }, 2000);
}

export function ensureStatusBar(ctx: DockContext) {
  let bar = document.getElementById(STATUS_ID) as HTMLElement | null;
  if (!bar) {
    bar = document.createElement("div");
    bar.id = STATUS_ID;

    // Add critical styles inline in case CSS is missing in Light DOM
    Object.assign(bar.style, {
      position: 'fixed',
      bottom: '0',
      zIndex: '2147483647',
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      borderTop: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: 'blur(10px)',
      webkitBackdropFilter: 'blur(10px)',
      color: 'rgba(255,255,255,0.80)',
      fontSize: '12px',
      minHeight: '24px',
      display: 'none'
    });

    // New Markup Structure
    bar.innerHTML = `
      <div class="cgpt-status-content-box" style="
        display: flex;
        align-items: center;
        width: 100%;
        max-width: var(--cgpt-composer-w, 768px); /* Match composer width convention */
        margin: 0 auto;
        padding: 0 12px;
        box-sizing: border-box;
        height: 100%;
      ">
        <div class="cgpt-status-stats-container" style="
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          overflow: hidden;
          white-space: nowrap;
          /* Justify content will be set by render */
        ">
          <div id="cgpt-status-text">…</div>
          <div id="cgpt-pq-mini" style="display:none; margin-left:10px; padding:2px 8px; border:1px solid rgba(255,255,255,0.10); border-radius:999px; background:rgba(255,255,255,0.06); cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 52vw;"></div>
        </div>

        <div class="cgpt-status-right-cluster" style="
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
        ">
          <div id="cgpt-status-action" style="opacity:0; transition:opacity 500ms; color:#4ade80; font-weight:600; font-size: 12px;"></div>
          <button class="cgpt-mini-btn" id="cgpt-demo-toggle-btn" type="button" title="Toggle Demo Mode" style="padding:4px; display:flex; align-items:center; border-radius: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </button>
          <span id="cgpt-version-label" style="opacity:.7; white-space:nowrap; font-size: 11px;">v${VERSION}</span>
          <button class="cgpt-mini-btn" id="cgpt-refresh-btn" type="button" title="Refresh stats & UI" style="padding:4px; display:flex; align-items:center; border-radius: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          <button class="cgpt-mini-btn" id="cgpt-changelog-btn" type="button" title="View Changelog" style="padding:4px; display:flex; align-items:center; border-radius: 4px;">
            <!-- Simple Gear/List Hybrid or Just Gear as requested -->
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      </div>
    `;

    bar.querySelector("#cgpt-refresh-btn")!.addEventListener("click", () => {
      resetStatusState(ctx);
      ctx.scheduleWork("status-refresh");
      showStatusAction("Refreshed");
    });

    bar.querySelector("#cgpt-changelog-btn")!.addEventListener("click", () => {
      // @ts-ignore
      const { openWelcomePopover } = window.ChatGPTDockUI || {};
      if (openWelcomePopover) {
        openWelcomePopover('changelog-slim', VERSION);
      } else {
        showStatusAction("UI not ready");
      }
    });

    bar.querySelector("#cgpt-demo-toggle-btn")!.addEventListener("click", () => {
      // Toggle demo mode by dispatching a custom event
      const event = new CustomEvent('toggle-demo-mode', {
        bubbles: true,
        composed: true
      });
      bar.dispatchEvent(event);
      showStatusAction("Demo toggled");
    });
  }

  if (bar.parentElement !== document.body) {
    document.body.appendChild(bar);
  }

  installStatusbarLayout();
}

export function renderStatusBar(ctx: DockContext) {
  const bar = document.getElementById(STATUS_ID);
  if (!bar) return;

  // Safe check for statusbar setting with fallback to default (true)
  const statusbarEnabled = ctx.settings.statusbarOn ?? true;
  
  if (!statusbarEnabled) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'block'; // Block because internal content-box handles flex

  // Update Stats Alignment
  const statsContainer = bar.querySelector(".cgpt-status-stats-container") as HTMLElement;
  if (statsContainer) {
    const align = ctx.settings.statusbarStatsAlign || 'left';
    statsContainer.style.justifyContent = align === 'center' ? 'center' : 'flex-start';
  }

  // Ensure CSS variables (like --cgpt-composer-w) are available.
  // They are usually on :root or set dynamically.

  const parts = [];
  if (ctx.settings.statMessages) parts.push(`Messages: <b>${ctx.statusState.user}</b> user / <b>${ctx.statusState.ai}</b> AI`);
  if (ctx.settings.statWords) parts.push(`Words: <b>${ctx.statusState.words}</b>`);
  if (ctx.settings.statTokens) parts.push(`Tokens: <b>≈${Math.round(ctx.statusState.chars / 4)}</b>`);
  if (ctx.settings.statCost) {
    // Naive cost est.
    const inputCost = (ctx.statusState.userChars / 4 / 1000) * 0.005; // $5/1m tokens
    const outputCost = (ctx.statusState.aiChars / 4 / 1000) * 0.015; // $15/1m tokens
    const total = inputCost + outputCost;
    if (total > 0.0001) {
      parts.push(`Cost: <b>$${total.toFixed(4)}</b>`);
    }
  }

  const textEl = document.getElementById("cgpt-status-text");
  if (textEl) {
    textEl.innerHTML = parts.join(" &nbsp;|&nbsp; ");
  }
}
