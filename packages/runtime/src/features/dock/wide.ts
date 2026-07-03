import { getHostAdapter } from "../../core/host";

/**
 * Detects if the current view is a Project conversation.
 * Heuristics:
 * 1. URL contains "/g/" and "/c/" (GPTs)
 * 2. URL contains "/project/" (Projects)
 * 3. Presence of project modal trigger
 */
export function isProjectConversationView(): boolean {
  return getHostAdapter().isProjectConversationView();
}

/**
 * Applies or removes wide mode fixes for Project conversation views.
 * Projects use specific CSS variables and containers that defy standard .cgpt-wide CSS.
 */
export function applyWideMode(isWide: boolean) {
  if (isProjectConversationView()) {
    applyProjectWideFix(isWide);
  }
}

function applyProjectWideFix(isWide: boolean) {
  // Strategy 1: User-identified specific selector path for Projects (Direct)
  // This is now largely handled by CSS in styles.css targeting #thread...
  // but we keep this as a JS fallback for attributes CSS might miss (though CSS has !important)
  // or if we need to do more complex things.
  // Actually, we can remove the JS manipulation of the #thread elements if CSS covers it.
  // The CSS rule covers: width, max-width, display.
  // We'll keep the JS for the Strategy 2 fallback (Composer anchor) just in case.

  // Strategy 2: Fallback to existing logic if direct selector fails (or for other view types)
  const composer = getHostAdapter().findComposerEditor();
  if (composer) {
    // Walk up to find inner shell (max-width constraint)
    // Selector hint: div[class*="--thread-content-max-width"]
    const innerShell = composer.closest('div[class*="--thread-content-max-width"]') as HTMLElement;
    if (innerShell) {
      // Walk up to find outer shell (margin/centering constraint)
      const outerShell = innerShell.parentElement?.closest('div[class*="--thread-content-margin"]') as HTMLElement;

      if (outerShell) {
        if (isWide) {
          // Manipulate OUTER wrapper
          outerShell.style.setProperty("margin-inline", "0", "important");
          outerShell.style.setProperty("width", "100%", "important");
          outerShell.style.setProperty("max-width", "none", "important");
          outerShell.style.setProperty("padding-inline", "16px", "important"); // Override padding

          // Manipulate INNER wrapper
          innerShell.style.setProperty("max-width", "none", "important");
          innerShell.style.setProperty("width", "100%", "important");
          innerShell.style.setProperty("--thread-content-max-width", "100%", "important");
        } else {
          // Revert
          outerShell.style.removeProperty("margin-inline");
          outerShell.style.removeProperty("width");
          outerShell.style.removeProperty("max-width");
          outerShell.style.removeProperty("padding-inline");

          innerShell.style.removeProperty("width");
          innerShell.style.removeProperty("max-width");
          innerShell.style.removeProperty("--thread-content-max-width");
        }
      }
    }
  }
}
