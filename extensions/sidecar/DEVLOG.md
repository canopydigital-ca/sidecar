# Devlog

## 0.5.49 (2026-02-05)

### What changed
- Sandboxed the ProgressQuest iframe (`allow-scripts allow-same-origin`) and added a strict CSP on `pq-host.html`.
- Removed the legacy `json2.js` polyfill (it contained an `eval` fallback) and ensured no inline handler dependency on the vendor “Home” page.
- Added document-visibility pausing so background ChatGPT tabs don’t keep ProgressQuest running when “Pause when hidden” is enabled.
- Trimmed unused vendor assets (unused screenshots + duplicate jQuery).

### How to test (manual smoke)
1. Fresh install
   - Load ChatGPT, open Dock → ProgressQuest.
   - Let it run for ~30 seconds (watch the “Grinding: …” status widget update).
   - Reload the tab. Confirm your character/level persists.
2. Disable/enable extension
   - Disable the extension and reload ChatGPT (should not crash; Dock should be absent).
   - Re-enable the extension and reload ChatGPT (Dock + ProgressQuest should function).
3. Multi-tab visibility
   - Open 3 ChatGPT tabs.
   - In one tab, open ProgressQuest and ensure “Pause when hidden” is enabled.
   - Switch away to another tab and wait ~10 seconds.
   - Return to the PQ tab and confirm it did not keep progressing while hidden (no large time jump).

## 0.5.50 (2026-02-05)

### What changed
- Fixed popover styling regressions by applying Dock CSS inside the ShadowRoot via adoptedStyleSheets (works even when the page CSP blocks `<link rel="stylesheet">` to extension URLs).
- Made ProgressQuest postMessage origin handling more robust and removed an unsupported CSP directive that was spamming console warnings.

## 0.5.51 (2026-02-05)

### UI Overhaul: ProgressQuest Native Integration
We replaced the legacy ProgressQuest presentation with a native “ChatGPT OS” shell while preserving PQ logic.

### Changes
- **Native Shell**: `pq-host.html` renders a `.cgpt-window` (titlebar, sidebar, content, statusbar).
- **Theme Tokens**: `pq-theme.css` uses `--cgpt-*` variables (light/dark + density).
- **Log Feed**: Plot/quest logs render as a modern activity feed + auto-scroll “Jump to latest”.
- **Skin Switch**: `cgpt-skin-os` vs `cgpt-skin-classic` toggles the presentation without touching PQ logic.
- **Debug Overlay**: `?debug=1` shows current tokens/density + quick skin toggle.

### Visual Regression Checklist
1. Dock mode (compact/cozy)
   - Open PQ in the dock (narrow width).
   - Verify sidebar collapse, readable fonts, and no horizontal overflow.
2. Pop-out mode
   - Open PQ in a larger container.
   - Verify layout fills height without double scrollbars.
3. Dark/light toggle
   - Switch Dock theme light/dark.
   - Verify colors update instantly with visible focus rings.
4. Log feed performance
   - Scroll up to pause autoscroll, then jump back to latest.
   - Confirm no stutter when log entries stream in.
