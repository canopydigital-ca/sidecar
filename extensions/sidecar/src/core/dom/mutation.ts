/**
 * Checks if a node is connected to the DOM.
 */
export function isConnected(el: Node | null | undefined): el is Node {
  return !!el && (el as any).isConnected === true;
}

const EXC_NOT_FOUND = "NotFoundError";

/**
 * Safely inserts a node before another node, handling edge cases like stale references.
 * @returns true if successful, false otherwise.
 */
export function safeInsertBefore(parent: Node, node: Node, before: Node | null): boolean {
  if (!parent || !node) return false;
  if (!isConnected(parent)) return false;

  // If "before" is stale/moved, null it to append.
  if (before && before.parentNode !== parent) before = null;

  // If node is elsewhere, detach it first (clean move).
  if (node.parentNode && node.parentNode !== parent) {
    node.parentNode.removeChild(node);
  }

  try {
    parent.insertBefore(node, before);
    return true;
  } catch (e) {
    // Fallback: append if it's a typical "child mismatch" type failure.
    if (
      e instanceof DOMException &&
      (e.name === EXC_NOT_FOUND || (typeof e.message === "string" && e.message.includes("child")))
    ) {
      try {
        parent.appendChild(node);
        return true;
      } catch (e2) {
        return false;
      }
    }
    return false;
  }
}

/**
 * Safely performs insertAdjacentElement.
 * @returns true if successful, false otherwise.
 */
export function safeInsertAdjacent(target: Element, position: InsertPosition, element: Element): boolean {
  if (!target || !element) return false;
  if (!isConnected(target)) return false;

  try {
    target.insertAdjacentElement(position, element);
    return true;
  } catch (e) {
    return false;
  }
}
