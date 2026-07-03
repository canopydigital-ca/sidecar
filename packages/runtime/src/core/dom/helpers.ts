const STR_TRUE = "true";
const STR_FALSE = "false";
const ROOT_EL = typeof document !== 'undefined' ? document.documentElement : null;

const ESC_RE = /[&<>"']/g;
const ESC_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

/**
 * Escapes HTML characters in a string.
 */
export function escapeHtml(s: any): string {
  const str = String(s);
  if (!ESC_RE.test(str)) return str;
  ESC_RE.lastIndex = 0;
  return str.replace(ESC_RE, (ch) => ESC_MAP[ch] ?? ch);
}

/**
 * Clamps a number between a min and max.
 */
export function clamp(n: number, a: number, b: number): number {
  return n < a ? a : n > b ? b : n;
}

/**
 * Sets the aria-pressed attribute on an element.
 */
export function setPressed(btn: Element | null, pressed: boolean): void {
  if (!btn) return;
  btn.setAttribute("aria-pressed", pressed ? STR_TRUE : STR_FALSE);
}

export function isRootClassOn(cls: string): boolean {
  return ROOT_EL?.classList.contains(cls) ?? false;
}

export function toggleRootClass(cls: string): boolean {
  return ROOT_EL?.classList.toggle(cls) ?? false;
}

export function getAriaExpanded(el: Element): boolean {
  return el.getAttribute("aria-expanded") === STR_TRUE;
}

export function getDataState(el: Element): string | null {
  return el.getAttribute("data-state");
}
