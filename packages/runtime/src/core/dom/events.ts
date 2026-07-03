import { REGISTRY, RegistryKey } from "../registry";
import { getDef } from "./query";

/**
 * Checks if an event's composed path matches a registry key's selector.
 * @param event - The DOM event
 * @param key - The registry key to match against
 */
export function matchesPath(event: Event, key: RegistryKey): Element | null {
  const def = getDef(key);
  const { selector, fallbacks, matchText } = def;

  const path = event.composedPath();
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    if (!(node instanceof Element)) continue;

    // Primary selector (honors matchText)
    if (node.matches(selector)) {
      if (!textIncludes(node, matchText)) continue;
      return node;
    }

    // Fallbacks (preserve original behavior: no matchText enforcement here)
    if (fallbacks && fallbacks.length && node.matches) {
      for (let j = 0; j < fallbacks.length; j++) {
        if (node.matches(fallbacks[j])) return node;
      }
    }
  }
  return null;
}

function textIncludes(el: Element, matchText?: string | null): boolean {
  if (!matchText) return true;
  const t = el.textContent;
  return !!t && t.includes(matchText);
}
