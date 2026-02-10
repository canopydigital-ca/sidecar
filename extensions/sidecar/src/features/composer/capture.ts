import { log } from "../../core/log";
import { idle } from "../../core/idle";
import { findComposerTextarea, PerfTracker } from "./find";
import { recordRecentPrompt } from "../prompts/storage";

let lastComposerValue = "";

export function trackComposerValue(tracker: PerfTracker) {
  document.addEventListener("input", (e) => {
    const el = e.target as any;
    if (el && (el.nodeName === "TEXTAREA" || el.getAttribute("contenteditable") === "true")) {
      // Is it the composer?
      const ta = findComposerTextarea(tracker);
      if (ta && (el === ta || ta.contains(el))) {
        lastComposerValue = el.value || el.innerText || "";
      }
    }
  }, true);
}

export function startRecentPromptCapture(tracker: PerfTracker) {
  trackComposerValue(tracker);

  const capture = (text: string) => {
    let val = (text || "").trim();
    // Fallback to tracked value if empty (likely cleared by app already)
    if (!val && lastComposerValue) {
      val = lastComposerValue.trim();
    }

    if (val) {
      idle(() => recordRecentPrompt(val), 400);
    }
  };

  function isSendButton(btn: any) {
    if (!btn) return false;
    // Check against robust finder - imported dynamically to avoid cycles if needed, 
    // but here we can import findSendButton if we wanted.
    // For now we use heuristic checks which are fast.
    
    const id = btn.id || "";
    const testId = (btn.getAttribute("data-testid") || "").toLowerCase();
    const label = (btn.getAttribute("aria-label") || "").toLowerCase();

    return id === "composer-submit-button" ||
      testId === "send-button" ||
      testId === "submit-button" ||
      testId === "composer-send-button" ||
      (btn.type === "submit" && btn.closest("form")) ||
      label.includes("send") ||
      label.includes("submit");
  }

  document.addEventListener("submit", (ev) => {
    const form = ev.target as any;
    if (!form || form.nodeName !== "FORM") return;
    const ta = form.querySelector("textarea") || findComposerTextarea(tracker);
    if (!ta) return;
    capture(ta.value);
  }, true);

  const checkClick = (ev: any) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    if (isSendButton(btn)) {
      const ta = findComposerTextarea(tracker);
      if (ta) capture((ta as any).value || (ta as HTMLElement).innerText); 
    }
  };

  document.addEventListener("click", checkClick, true);
  document.addEventListener("mousedown", checkClick, true);
  document.addEventListener("pointerdown", checkClick, true);

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) {
      const el = ev.target as any;
      if (el && (el.nodeName === "TEXTAREA" || el.getAttribute("contenteditable") === "true")) {
        // Check if it's the composer
        const ta = findComposerTextarea(tracker);
        if (ta && (el === ta || ta.contains(el) || el.contains(ta) || el.id === "prompt-textarea")) {
          // If it is contenteditable, we might need to get textContent
          let val = el.value;
          if (typeof val !== "string") val = el.innerText; // Fallback for contenteditable
          // If we found the textarea but the event was on contenteditable div, prefer textarea value if synced
          if ((ta as any).value && (ta as any).value.trim()) val = (ta as any).value;
          capture(val);
        }
      }
    }
  }, true);
}
