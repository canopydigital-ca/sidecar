import { storageService } from "../../core/storage/index";
import { SIDEBAR_MIN, SIDEBAR_MAX } from "../../core/constants";
import { findSidebarContainer } from "./find";

// Note: Debounce is now handled by PersistedStore

export async function applySidebarWidth() {
  const sidebar = findSidebarContainer();
  if (!sidebar) return;
  
  // Ensure store is initialized
  if (!storageService.sidebar.loaded) {
    await storageService.sidebar.init();
  }
  const width = storageService.sidebar.value.width;
  
  if (typeof width === "number") {
    const w = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, width));
    const s = sidebar as HTMLElement;
    s.style.width = `${w}px`;
    s.style.minWidth = `${w}px`;
    s.style.maxWidth = `${w}px`;
    s.style.flex = "0 0 auto";
  }
}

export async function resetSidebar() {
  // Ensure init before set if needed, though set() works optimistically if we trust defaults.
  // But to be safe on first load:
  if (!storageService.sidebar.loaded) await storageService.sidebar.init();
  
  storageService.sidebar.set({ width: null });
  const sidebar = findSidebarContainer();
  if (sidebar) {
    const s = sidebar as HTMLElement;
    s.style.width = "";
    s.style.minWidth = "";
    s.style.maxWidth = "";
    s.style.flex = "";
  }
}

export function ensureSidebarHandleInstalled() {
  const sidebar = findSidebarContainer();
  if (!sidebar) return;
  if (sidebar.querySelector("#cgpt-sidebar-handle")) return;

  const cs = getComputedStyle(sidebar);
  if (cs.position === "static") (sidebar as HTMLElement).style.position = "relative";

  const handle = document.createElement("div");
  handle.id = "cgpt-sidebar-handle";
  sidebar.appendChild(handle);

  let startX = 0;
  let startW = 0;

  const onMove = (ev: PointerEvent) => {
    const dx = ev.clientX - startX;
    const next = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startW + dx));
    const s = sidebar as HTMLElement;
    s.style.width = `${next}px`;
    s.style.minWidth = `${next}px`;
    s.style.maxWidth = `${next}px`;
    s.style.flex = "0 0 auto";
    
    // Update store (debounced automatically)
    // No need to await init here as UI interaction implies app is running
    storageService.sidebar.set({ width: next });
  };

  const onUp = () => {
    document.documentElement.classList.remove("cgpt-resizing");
    window.removeEventListener("pointermove", onMove as any, true);
    window.removeEventListener("pointerup", onUp, true);
  };

  handle.addEventListener("pointerdown", (ev) => {
    try { handle.setPointerCapture(ev.pointerId); } catch { }
    startX = ev.clientX;
    startW = sidebar.getBoundingClientRect().width;
    document.documentElement.classList.add("cgpt-resizing");
    window.addEventListener("pointermove", onMove as any, true);
    window.addEventListener("pointerup", onUp, true);
  });
}
