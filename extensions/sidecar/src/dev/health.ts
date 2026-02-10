import { DockContext } from "../core/context";
import { queryFirst } from "../core/dom";
import { DOCK_ID, INPUT_HANDLE_ID, STATUS_ID } from "../core/constants";

declare global {
  interface Window {
    __cgptDockHealth?: () => any;
  }
}

declare const __DEV__: boolean;

export function registerHealth(ctx: DockContext) {
  if (typeof __DEV__ === "undefined" || !__DEV__) return;

  window.__cgptDockHealth = () => {
    // 1. Conversation check
    const bottom = queryFirst("thread.bottomContainer");
    const form = queryFirst("composer.form");
    const editor = queryFirst("composer.editor");
    const isConversation = !!(bottom || (form && editor));

    // 2. Anchor check
    let anchorDesc = "none";
    if (bottom) anchorDesc = "thread.bottomContainer";
    else if (form) anchorDesc = "composer.form";
    else if (editor) anchorDesc = "composer.editor (fallback)";

    // 3. Dock
    const dock = document.getElementById(DOCK_ID);
    const dockInfo = dock ? {
      connected: dock.isConnected,
      parentId: dock.parentElement?.id || dock.parentElement?.tagName,
      rect: dock.getBoundingClientRect(),
      nextSiblingId: dock.nextElementSibling?.id
    } : null;

    // 4. Handle
    const handle = document.getElementById(INPUT_HANDLE_ID);
    const handleInfo = handle ? {
      connected: handle.isConnected,
      nextIsDock: handle.nextElementSibling === dock
    } : null;

    // 5. Status
    const status = document.getElementById(STATUS_ID);
    const statusInfo = status ? {
      connected: status.isConnected,
      rect: status.getBoundingClientRect(),
      parentId: status.parentElement?.id
    } : null;

    // 6. Composer Width
    const composerW = getComputedStyle(document.documentElement).getPropertyValue('--cgpt-composer-w');

    return {
      conversation: isConversation,
      anchor: anchorDesc,
      dock: dockInfo,
      handle: handleInfo,
      status: statusInfo,
      composerW
    };
  };
}
