import { escapeHtml } from "../../core/dom";

export function isFullHtml(text: string) {
  const t = text.toLowerCase();
  return t.includes("<!doctype html>") || t.includes("<html") || t.includes("<head") || t.includes("<body");
}

export function openHtmlPreview(code: string) {
  // Simple word count (whitespace separated)
  const wordCount = (code.trim().match(/\S+/g) || []).length;
  
  // Escape HTML to avoid template literal issues during minification
  const escapedCode = escapeHtml(code);

  const modal = document.createElement("div");
  modal.className = "cgpt-preview-modal";
  modal.innerHTML = `
    <div class="cgpt-preview-content">
      <div class="cgpt-preview-header">
        <b>HTML Preview</b>
        <span style="font-size:12px; opacity:0.7; margin-left:8px">Words: ${wordCount}</span>
        <button class="cgpt-btn" data-close>Close</button>
      </div>
      <div class="cgpt-preview-body">
         <iframe sandbox="allow-scripts" srcdoc="${escapedCode}"></iframe>
         <div class="cgpt-preview-source"><pre>${escapedCode}</pre></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
    window.removeEventListener("keydown", onEsc);
  };
  (modal.querySelector("[data-close]") as HTMLElement).addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
  window.addEventListener("keydown", onEsc);
}
