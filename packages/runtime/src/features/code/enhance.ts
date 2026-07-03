import { $$ } from "../../core/dom";
import { escapeHtml, isRootClassOn } from "../../core/dom";
import { FLAGS } from "../../core/constants";
import { isFullHtml, openHtmlPreview } from "./preview";

function guessCodeLanguage(pre: Element) {
  const code = pre.querySelector("code");
  if (!code) return "code";
  const cls = code.className || "";
  const m = cls.match(/language-([a-z0-9_-]+)/i);
  if (m && m[1]) return m[1].toLowerCase();
  return "code";
}

function countLines(pre: HTMLElement) {
  const txt = (pre.innerText || "").replace(/\n+$/g, "");
  if (!txt) return 0;
  return txt.split("\n").length;
}

function findCopyCodeButtonAround(pre: Element) {
  const root = pre.closest("div") || pre.parentElement;
  if (!root) return null;
  const btns = $$("button", root);
  for (const b of btns) {
    const label = ((b.getAttribute("aria-label") || "") + " " + ((b as HTMLElement).innerText || "")).toLowerCase();
    if (label.includes("copy") && label.includes("code")) return b;
  }
  return null;
}

function setCodeCollapsed(wrap: HTMLElement, collapsed: boolean) {
  const pre = wrap.querySelector("pre");
  if (!pre) return;
  wrap.dataset.cgptCollapsed = collapsed ? "1" : "0";
  pre.style.display = collapsed ? "none" : "";
}

function ensureInlineCollapseButton(pre: HTMLElement, wrap: HTMLElement) {
  if (pre.dataset.cgptInlineBtn === "1") return;
  const copyBtn = findCopyCodeButtonAround(pre);
  if (!copyBtn) return;

  const collapseBtn = document.createElement("button");
  collapseBtn.type = "button";
  collapseBtn.className = copyBtn.className;
  collapseBtn.textContent = isRootClassOn(FLAGS.collapseCode) ? "Expand" : "Collapse";
  collapseBtn.setAttribute("data-cgpt-inline-collapse", "1");

  collapseBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const isCollapsed = wrap.dataset.cgptCollapsed === "1";
    setCodeCollapsed(wrap, !isCollapsed);
    collapseBtn.textContent = isCollapsed ? "Collapse" : "Expand";
  });

  copyBtn.insertAdjacentElement("afterend", collapseBtn);
  pre.dataset.cgptInlineBtn = "1";
}

export function enhanceCodeBlock(pre: HTMLElement) {
  try {
    if (!pre || pre.dataset.cgptEnhanced === "1") return;
    if (!pre.querySelector("code")) return;

    pre.dataset.cgptEnhanced = "1";

    const wrap = document.createElement("div");
    wrap.className = "cgpt-code-wrap";
    pre.parentNode!.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const lang = guessCodeLanguage(pre);
    const lines = countLines(pre);
    const codeText = pre.innerText || "";
    const isHtml = (lang === "html" || lang === "xml") && isFullHtml(codeText);

    // Escape language name to avoid minification shadowing issues
    const escapedLang = escapeHtml(lang.toUpperCase());

    let previewBtnHtml = "";
    if (isHtml) {
      previewBtnHtml = `<button class="cgpt-mini-btn" type="button" data-cgpt-preview="1" style="margin-right:8px">Preview</button>`;
    }

    const header = document.createElement("div");
    header.className = "cgpt-code-header";
    header.innerHTML = `
    <div class="cgpt-code-title">
      <b>${escapedLang}</b>
      <span>${lines} line${lines === 1 ? "" : "s"}</span>
    </div>
    <div>
      ${previewBtnHtml}
      <button class="cgpt-mini-btn" type="button" data-cgpt-code-toggle="1">Collapse</button>
    </div>
  `;
    wrap.insertBefore(header, pre);

    if (isHtml) {
      (header.querySelector('[data-cgpt-preview="1"]') as HTMLElement).addEventListener("click", (e) => {
        e.stopPropagation();
        openHtmlPreview(codeText);
      });
    }

    (header.querySelector('[data-cgpt-code-toggle="1"]') as HTMLElement).addEventListener("click", () => {
      const isCollapsed = wrap.dataset.cgptCollapsed === "1";
      setCodeCollapsed(wrap, !isCollapsed);
      const inline = pre.closest("div")?.querySelector("button[data-cgpt-inline-collapse='1']");
      if (inline) inline.textContent = isCollapsed ? "Collapse" : "Expand";
    });

    ensureInlineCollapseButton(pre, wrap);
    setCodeCollapsed(wrap, isRootClassOn(FLAGS.collapseCode));
  } catch (err) {
    console.warn("[ChatGPT Dock] enhanceCodeBlock failed", err);
  }
}

export function enhanceAllCodeBlocksNow(limit: number = 80) {
  const batch = document.querySelectorAll("pre:not([data-cgptEnhanced])");
  let i = 0;
  const max = Math.min(limit, batch.length);
  while (i < max) {
    enhanceCodeBlock(batch[i] as HTMLElement);
    i++;
  }
}

export function enhanceSomeCodeBlocks(deadline: IdleDeadline) {
  const batch = document.querySelectorAll("pre:not([data-cgptEnhanced])");
  if (!batch.length) return false;

  let i = 0;
  const max = Math.min(18, batch.length);
  while (i < max && (deadline.timeRemaining() > 6 || deadline.didTimeout)) {
    enhanceCodeBlock(batch[i] as HTMLElement);
    i += 1;
  }
  return batch.length > max;
}

export function setAllCodeCollapsed(collapsed: boolean) {
  $$(".cgpt-code-wrap").forEach((wrap) => setCodeCollapsed(wrap as HTMLElement, collapsed));
  $$("button[data-cgpt-inline-collapse='1']").forEach((b) => (b.textContent = collapsed ? "Expand" : "Collapse"));
}
