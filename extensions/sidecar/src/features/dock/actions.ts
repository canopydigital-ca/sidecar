import { FLAGS, POPOVER_ID } from "../../core/constants";
import { toggleRootClass, setPressed, queryFirst, queryAll } from "../../core/dom";
import { DockContext } from "../../core/context";
import { toggleInputCollapsed } from "../input/collapse";
import { findComposerResizeTarget } from "../composer/find";
import { enhanceAllCodeBlocksNow } from "../code/enhance";
import { handleProjectAction } from "../projects/action";
import { toggleSidebar as sidebarToggle } from "../sidebar/toggle";
import { applyWideMode } from "./wide";
import { popoverManager } from "../../ui/manager";

export function removeExtendedThinking() {
  // Try to find the remove button directly first (most reliable)
  const removeBtns = Array.from(document.querySelectorAll('button[aria-label^="Remove Extended thinking"], button.__composer-pill-remove'));
  for (const btn of removeBtns) {
    if ((btn as HTMLElement).offsetParent) { // visible
      (btn as HTMLElement).click();
      return true;
    }
  }

  // Fallback: find pill and look for remove button near it
  const pill = queryFirst("composer.extendedThinking.pill");
  if (pill) {
    // The remove button might be a sibling in the composite
    const composite = pill.closest(".__composer-pill-composite");
    if (composite) {
      const btn = composite.querySelector("button.__composer-pill-remove");
      if (btn) {
        (btn as HTMLElement).click();
        return true;
      }
    }
  }
  return false;
}

export function runAction(action: string, btn: HTMLElement, ctx: DockContext) {
  switch (action) {
    case "sidebar":
      sidebarToggle(ctx);
      break;
    case "wide": {
      const on = toggleRootClass(FLAGS.wide);
      setPressed(btn, on);
      ctx.updateSettings({ ui: { wideMode: on } });
      applyWideMode(on);
      break;
    }
    case "inputToggle": {
      toggleInputCollapsed(findComposerResizeTarget, ctx.trackSelectorPerformance);
      setPressed(btn, ctx.uiState.inputCollapsed);
      break;
    }
    case "collapseCode": {
      const on = toggleRootClass(FLAGS.collapseCode);
      setPressed(btn, on);
      ctx.updateSettings({ ui: { collapseCode: on } });

      // Fast pass to enhance visible blocks so they can be collapsed
      enhanceAllCodeBlocksNow(80);

      // Apply state to all enhanced blocks
      ctx.setAllCodeCollapsed(on);

      ctx.scheduleWork("action-collapse-code");
      break;
    }
    case "emoji":
    case "prompts":
    case "gameIcons":
    case "pets":
    case "progressquest":
    case "fonts":
    case "settings":
    case "help": {
      if (typeof ctx.openPopover === "function") {
        ctx.openPopover(action, btn);
        break;
      }
      popoverManager.toggle(action, btn, ctx);
      break;
    }
    case "project":
      handleProjectAction(ctx);
      break;
    default:
      break;
  }
}
