import { REGISTRY, RegistryKey, SelectorDef } from "../registry";

const DOCUMENT = typeof document !== 'undefined' ? document : null as unknown as Document;

/**
 * Returns the first element matching the selector.
 * @param sel - CSS selector
 * @param root - Root element to search in (default: document)
 */
export function $(sel: string, root: Element | Document = DOCUMENT): Element | null {
  if (!root) return null;
  return root.querySelector(sel);
}

/**
 * Returns all elements matching the selector as an array.
 * @param sel - CSS selector
 * @param root - Root element to search in (default: document)
 */
export function $$(sel: string, root: Element | Document = DOCUMENT): Element[] {
  if (!root) return [];
  return toArray(root.querySelectorAll(sel));
}

export function getDef(key: RegistryKey): SelectorDef {
  return REGISTRY[key] as SelectorDef;
}

/**
 * Queries the first element matching a registry key, respecting scopes and fallbacks.
 * @param key - Registry key
 * @param root - Root element
 */
export function queryFirst(key: RegistryKey, root: Element | Document = DOCUMENT): Element | null {
  const def = getDef(key);
  const scopeRoot = resolveScopeRoot(def, root);
  if (!scopeRoot) return null;

  const { selector, fallbacks, matchText } = def;

  const el = queryWithFallbacks(scopeRoot, selector, fallbacks);
  if (!el) return null;

  if (matchText && !textIncludes(el, matchText)) return null;
  return el;
}

/**
 * Queries all elements matching a registry key.
 * @param key - Registry key
 * @param root - Root element
 */
export function queryAll(key: RegistryKey, root: Element | Document = DOCUMENT): Element[] {
  if (!root) return [];
  const def = getDef(key);
  // Note: Fallbacks logic for queryAll is ambiguous (union? priority?).
  // For now, just query primary selector.
  const nodes = root.querySelectorAll(def.selector);

  return def.matchText ? toArrayFilteredByText(nodes, def.matchText) : toArray(nodes);
}

// --- Internals ---

function toArray(nodes: NodeListOf<Element>): Element[] {
  const n = nodes.length;
  const out = new Array<Element>(n);
  for (let i = 0; i < n; i++) out[i] = nodes[i];
  return out;
}

function toArrayFilteredByText(nodes: NodeListOf<Element>, matchText: string): Element[] {
  const n = nodes.length;
  const out = new Array<Element>(n); // max size, then shrink
  let k = 0;

  for (let i = 0; i < n; i++) {
    const el = nodes[i];
    const t = el.textContent;
    if (t && t.includes(matchText)) out[k++] = el;
  }

  out.length = k;
  return out;
}

function textIncludes(el: Element, matchText?: string | null): boolean {
  if (!matchText) return true;
  const t = el.textContent;
  return !!t && t.includes(matchText);
}

function queryWithFallbacks(
  scopeRoot: Element | Document,
  selector: string,
  fallbacks?: readonly string[] | null
): Element | null {
  let el = scopeRoot.querySelector(selector);
  if (el || !fallbacks || fallbacks.length === 0) return el;

  for (let i = 0; i < fallbacks.length; i++) {
    el = scopeRoot.querySelector(fallbacks[i]);
    if (el) return el;
  }
  return null;
}

function resolveScopeRoot(def: SelectorDef, root: Element | Document): Element | Document | null {
  const scopes = def.scopes;
  if (!scopes || scopes.length === 0) return root;

  // Strict: if scopes exist but none found, fail.
  for (let i = 0; i < scopes.length; i++) {
    const scopeEl = queryFirst(scopes[i] as RegistryKey, root);
    if (scopeEl) return scopeEl;
  }
  return null;
}
