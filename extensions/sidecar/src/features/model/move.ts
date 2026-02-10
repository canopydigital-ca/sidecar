import { MODEL_SLOT_ID } from "../../core/constants";
import { log } from "../../core/log";
import { $$ } from "../../core/dom";
import { PerfTracker } from "../composer/find";
import { findModelPickerElement } from "./detect";

function snapshotMenuCount() {
  return document.querySelectorAll("[role='menu'],[role='listbox'],[data-radix-popper-content-wrapper]").length;
}

export function tagDockMenusAfterClick() {
  window.setTimeout(() => {
    const menus = $$("[role='menu'],[role='listbox']");
    for (const m of menus) {
      const root = m.closest("[data-radix-popper-content-wrapper]") || m;
      if (root.classList.contains("cgpt-from-dock-menu")) continue;

      const cs = getComputedStyle(root);
      const zi = Number(cs.zIndex || "0");
      const visible = (root as HTMLElement).offsetParent !== null || cs.position === "fixed";
      if (visible && zi >= 20) root.classList.add("cgpt-from-dock-menu");
    }
  }, 50);
}

export function moveModelPickerIntoDock(tracker?: PerfTracker) {
  const slot = document.getElementById(MODEL_SLOT_ID);
  if (!slot) return false;

  const picker = findModelPickerElement(tracker);
  if (!picker) return false;

  if (slot.contains(picker)) {
    return true;
  }

  // Check if slot already contains a valid picker
  const existing = slot.firstElementChild;
  if (existing && existing.isConnected) {
    // If it's a valid picker (e.g. from previous move), don't re-run.
    // We can re-validate it using scoreModelCandidate if needed, but for now simple existence check.
    // Actually, let's verify it's not some random element.
    // But since we control what goes in, it should be fine.
    // The user suggested:
    // if (existing && existing.isConnected && !isDisallowedPickerCandidate(existing)) { ... }
    // but `isDisallowedPickerCandidate` is in detect.ts and not exported.
    // Let's assume if it's there and connected, it's good, or we can check class `cgpt-moved-model-picker`.
    if (existing.classList.contains("cgpt-moved-model-picker")) {
      return true;
    }
  }

  try { slot.replaceChildren(); } catch { while (slot.firstChild) slot.removeChild(slot.firstChild); }

  try {
    picker.classList.add("cgpt-moved-model-picker");
    
    // Style transformation logic
    if (picker.textContent?.includes("Thinking") || picker.querySelector('svg[viewBox*="thinking"]')) {
      // Create a wrapper for compact layout
      const wrapper = document.createElement("div");
      wrapper.className = "cgpt-model-wrapper";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "6px";
      
      // If the picker has "Extended Thinking" text, it might be in a different structure
      // We want to preserve functionality but style it as a pill in the dock
      
      // 1. Force the picker to look like a dock item
      picker.classList.add("cgpt-compact-model-btn");
      const p = picker as HTMLElement;
      p.style.width = "auto"; // Auto width for pill
      p.style.height = "28px";
      p.style.padding = "0 8px";
      p.style.display = "flex";
      p.style.alignItems = "center";
      p.style.gap = "6px";
      p.style.background = "rgba(255,255,255,0.08)";
      p.style.border = "1px solid rgba(255,255,255,0.15)";
      p.style.borderRadius = "8px";
      p.style.fontSize = "12px";
      p.style.color = "rgba(255,255,255,0.9)";
      p.style.cursor = "pointer";

      // 2. Adjust icon size
      const svg = picker.querySelector("svg");
      if (svg) {
        svg.style.width = "14px";
        svg.style.height = "14px";
        svg.style.opacity = "0.9";
      }
      
      // 3. Ensure text is visible and styled
      const textDiv = picker.querySelector("div");
      if (textDiv) {
         textDiv.style.display = "block"; // Ensure visible
         textDiv.style.fontSize = "12px";
      } else if (!(picker.textContent ?? "").trim()) {
         // Fallback if no text found but it's the thinking model
         const span = document.createElement("span");
         span.textContent = "Extended Thinking";
         picker.appendChild(span);
      }

      slot.appendChild(picker);
    } else {
      // Fallback for standard picker
      slot.appendChild(picker);
    }

    slot.addEventListener("click", () => {
      tagDockMenusAfterClick();
    }, true);

    slot.dataset.cgptFilled = "1";
    return true;
  } catch {
    return false;
  }
}

export async function moveModelPickerIntoDockWithRetry(retryConfig: any, tracker?: PerfTracker) {
  const startTime = performance.now();
  let i = 0;

  while (i < retryConfig.maxRetries) {
    try {
      const success = moveModelPickerIntoDock(tracker);
      if (success) {
        const duration = performance.now() - startTime;
        if (tracker) tracker('moveModelPickerIntoDock', duration, true);
        return true;
      }

      if (i < retryConfig.maxRetries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, retryConfig.baseDelay * Math.pow(2, i))
        );
      }
    } catch (error) {
      log.debug('Model picker move attempt failed:', error);

      if (i === retryConfig.maxRetries - 1) {
        const duration = performance.now() - startTime;
        if (tracker) tracker('moveModelPickerIntoDock', duration, false);
        return false;
      }
    }
    i++;
  }

  const duration = performance.now() - startTime;
  if (tracker) tracker('moveModelPickerIntoDock', duration, false);
  return false;
}
