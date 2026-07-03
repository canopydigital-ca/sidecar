import { DockContext } from "../../core/context";
import { getHostAdapter } from "../../core/host";
import { showToast } from "../../core/toast";
import { findInteractableCandidate, findSidebarContainer, isSidebarOpen } from "./find";

export async function toggleSidebar(ctx: DockContext) {
  console.log("[Sidebar] Toggling...");

  // 1. Layout check
  const host = findSidebarContainer();
  if (!host) {
    console.warn("[Sidebar] Host not found (mobile layout?)");
    showToast("Sidebar not available in this layout");
    return;
  }

  // 2. Determine initial state using robust helper
  const wasOpen = isSidebarOpen();
  console.log(`[Sidebar] Initial State: ${wasOpen ? "OPEN" : "CLOSED"}`);

  // 3. Select Action
  const action = wasOpen ? "close" : "open";
  
  // 4. Resolve Button
  // Prioritize finding an interactable button for the intended action
  let btn = action === "open" 
    ? findInteractableCandidate("sidebar.open") 
    : findInteractableCandidate("sidebar.close");

  // Fallback: Sometimes the "open" button is used to close too (toggle)
  if (!btn && action === "close") {
    btn = findInteractableCandidate("sidebar.open");
  }

  if (!btn) {
    console.warn(`[Sidebar] No button found to ${action} sidebar`);
    showToast(`Cannot ${action} sidebar: button not found`);
    return;
  }

  // 5. Execute Action with Retry
  const success = await attemptAction(btn as HTMLElement, action, host);
  
  if (!success) {
    // Retry once with a fresh query in case DOM changed
    console.log("[Sidebar] Action failed, retrying...");
    const retryBtn = action === "open" 
      ? findInteractableCandidate("sidebar.open") 
      : findInteractableCandidate("sidebar.close");
      
    if (retryBtn) {
      const retrySuccess = await attemptAction(retryBtn as HTMLElement, action, host);
      if (!retrySuccess) {
        logDiagnostics(host);
        showToast(`Failed to ${action} sidebar`);
      }
    } else {
      showToast(`Failed to ${action} sidebar (button lost)`);
    }
  }

  ctx.scheduleWork("action-sidebar-toggle");
}

async function attemptAction(btn: HTMLElement, action: "open" | "close", host: Element): Promise<boolean> {
  console.log(`[Sidebar] Attempting to ${action} via`, btn);
  
  // Click
  await clickLikeUser(btn);

  // Verify
  const targetState = action === "open";
  return await waitForState(targetState, host, 600);
}

async function clickLikeUser(el: HTMLElement) {
  try {
    el.scrollIntoView({ block: "center", inline: "center" });
    el.focus();
    
    // 1. Pointer Events (Modern React/Event delegation often relies on these)
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const pointerOpts = { 
      bubbles: true, cancelable: true, composed: true, 
      clientX: x, clientY: y, view: window, buttons: 1 
    };
    
    el.dispatchEvent(new PointerEvent("pointerdown", pointerOpts));
    el.dispatchEvent(new PointerEvent("pointerup", pointerOpts));
    
    // 2. Mouse Click
    el.dispatchEvent(new MouseEvent("click", pointerOpts));
    
    // 3. Native Click (Fallback)
    el.click();
    
  } catch (err) {
    console.error("[Sidebar] Click failed:", err);
  }
}

function waitForState(isOpen: boolean, host: Element, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    // Check immediately
    if (isSidebarOpen() === isOpen) { resolve(true); return; }

    const start = Date.now();
    const interval = setInterval(() => {
      if (isSidebarOpen() === isOpen) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });
}

function logDiagnostics(host: Element) {
  const scrollport = getHostAdapter().findSidebarScrollport();
  const openBtn = findInteractableCandidate("sidebar.open");
  const closeBtn = findInteractableCandidate("sidebar.close");
  
  console.group("[Sidebar] Diagnostics");
  console.log("Host Width:", window.getComputedStyle(host).width);
  console.log("Scrollport:", scrollport, scrollport ? {
    inert: scrollport.hasAttribute("inert"),
    pointerEvents: window.getComputedStyle(scrollport).pointerEvents,
    opacity: window.getComputedStyle(scrollport).opacity,
    rect: scrollport.getBoundingClientRect()
  } : "N/A");
  console.log("Open Btn:", openBtn);
  console.log("Close Btn:", closeBtn);
  console.groupEnd();
}
