# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.53] - 2026-02-07

### Fixed
- **Dock UI**: Fixed regression where legacy storage keys were ignored, causing an empty dock for some users. Added diagnostics and auto-recovery.

## [0.5.52] - 2026-02-07

### Fixed
- **Dock UI**: Prevented blank dock when the stored dock order is missing or invalid.

## [0.5.50] - 2026-02-05

### Fixed
- **Dock UI**: Restored popover styling reliability by injecting CSS via adoptedStyleSheets (CSP-resistant).
- **ProgressQuest**: Fixed postMessage origin mismatch handling and removed unsupported CSP directive.

## [0.5.49] - 2026-02-05

### Fixed
- **ProgressQuest**: Hardened iframe sandboxing, tightened CSP, removed legacy json2 eval polyfill, paused PQ on background tabs when pause-when-hidden is enabled, and trimmed unused vendor assets.

## [0.5.48] - 2026-02-05

### Changed
- **ProgressQuest**: Dock-native theme sync into iframe, improved compact styling, keyboard shortcuts (P/M/O) when focused, and eliminated white seams/flash on load.

## [0.5.47] - 2026-02-05

### Added
- **ProgressQuest**: Added save import/export, rolling backups in chrome.storage.local, and auto-restore from latest snapshot on reload.

## [0.5.46] - 2026-02-05

### Added
- **ProgressQuest**: Added Dock button, panel controls (pause/mute/pop-out), mini “Grinding” widget, and persistence for last-open state.

## [0.5.45] - 2026-02-05

### Added
- **ProgressQuest**: Added iframe renderer + postMessage bridge (pause/resume/reset/export/import/summary) and a Dock popover panel to host the game.

## [0.5.44] - 2026-02-05

### Added
- **ProgressQuest**: Vendored offline ProgressQuest Remix payload and added an extension-hosted `pq-host.html` wrapper for iframe loading.

## [0.5.33] - 2026-02-04

### Fixed
- **Pets Dock Icon**: Updated the pets dock button to use the Ionicons paw SVG and added runtime reconciliation so existing dock markup refreshes correctly.

## [0.5.34] - 2026-02-04

### Changed
- **Pets Interaction Model**: Pets are click-through by default; hold Ctrl to interact. Removed hover activation behavior.
- **VSCode-Pets Asset Management**: Removed the vendored `vendor/vscode-pets` tree; build now downloads a pinned VSIX payload into `dist/vendor/vscode-pets` on demand.

### Fixed
- **Pets Placement Accuracy**: Clamped dock-overlay/composer placement to stay within the viewport across scale/zoom.
- **Pets Post-Load Positioning**: Added post-load position validation that clamps pets within the webview viewport after boot/spawn/resize.

## [0.5.35] - 2026-02-04

### Fixed
- **Dock-Overlay Repositioning**: Updated placement refresh triggers so pets stay above the dock during window resize/layout shifts.
- **Runtime Logger Crash**: Added missing `warn()` logger method to prevent `log.warn is not a function` errors.

## [0.5.36] - 2026-02-04

### Fixed
- **Dock-Overlay Anchor Drift**: Continuously re-anchors pets above the dock during resize/reflow, and adds a small gap above the dock.

## [0.5.37] - 2026-02-04

### Changed
- **Status Bar Default**: Status bar is enabled by default.
- **Pets Interactivity**: Above Dock clickability follows the Click-through setting; Background/Near Composer are always click-through.

### Fixed
- **Fixed Corner Alignment**: Fixed Corner now sits flush on the status bar.
- **Background Visibility**: Background mode avoids hiding pets behind the status bar area.

## [0.5.38] - 2026-02-04

### Fixed
- **Pets Reset On Popover Open**: Opening the Pets popover no longer resets/re-spawns pets.
- **Placement Widths**: Above Dock matches dock width; Near Composer matches composer width; Fixed Corner uses a full-width status-bar strip.

## [0.5.39] - 2026-02-04

### Fixed
- **Canvas Sizing With Sidebar**: Pets background/strip sizing now accounts for the ChatGPT sidebar and updates as it opens/closes and on resize.

## [0.5.43] - 2026-02-04

### Fixed
- **Pets Z-Index Stacking**: Adjusted Z-indices so pets are visually above the Dock and Status Bar when overlapping.
- **Pets Position Persistence**: Fixed an issue where opening the Pets popover would reset the pet position/state by preventing unnecessary host re-attachment.

## [0.5.42] - 2026-02-04

### Fixed
- **Pets Resize Handling**: Migrated window resize listeners to Svelte (`<svelte:window>`) for robust "stickiness" during browser resize.
- **UI Initialization**: `PopoverRoot` is now initialized immediately to ensure global event listeners are active.

## [0.5.41] - 2026-02-04

### Fixed
- **Pets Placement Constraint**: Pets view is strictly constrained to the content viewport (minus sidebar and status bar) to prevent bleeding.
- **Pets Interaction Override**: Holding Ctrl temporarily enables interaction (click-through by default).

## [0.5.40] - 2026-02-04

### Fixed
- **Resize Responsiveness**: Window resizing now triggers layout resync so dock/status widths update immediately.
- **Projects Width Matching**: Composer width measurement now uses the composer resize target for better dock width matching on Projects pages.

## [0.5.32] - 2026-02-04


## [0.5.31] - 2026-02-04

### Fixed
- **Pets White Background**: Injected robust stylesheet to enforce transparency via CSS `!important` rules on all layers, and updated iframe `color-scheme` to prevent User Agent background painting.

## [0.5.30] - 2026-02-04

### Fixed
- **Pets White Background**: Enhanced `MutationObserver` to watch subtree and child additions, and updated `applyTheme` to respect transparency mode, preventing opaque overrides.

## [0.5.29] - 2026-02-04

### Fixed
- **Pets Runtime Error**: Fixed `InvalidPetException` crash when spawning pets by validating pet types and colors against available assets.
- **Missing Defaults**: Changed default pet from `cat` (missing) to `dog` to prevent startup errors.
- **Demo Controls**: Updated demo controls to only list valid pets and dynamically update color options based on selected type.

## [0.5.28] - 2026-02-04

### Fixed
- **Browser Crash**: Fixed infinite recursion loop in Pets Host caused by MutationObserver triggering on its own style updates.
- **Pets Transparency**: Fixed background transparency issues by strictly enforcing overrides and preventing vendor scripts from reverting them.
- **Iframe Loading**: Fixed `extension://` iframe crash by removing restrictive `sandbox` attributes.
- **Svelte Warnings**: Fixed `state_referenced_locally` warnings in SettingsPopover.


### Added
- **Demo Mode**: Always-on welcome tour via `#demo` URL hash.
- **Svelte 5 Event Syntax**: Modernized event handling (onclick, onkeydown).

### Fixed
- **Popover Initialization**: Resolved "Portal not ready" warnings by lazy loading.
- **Deprecation Warnings**: Fixed Svelte 5 deprecation notices in build logs.

## [0.4.2] - 2026-01-29

### Added
- **Svelte 5 Architecture**: Migrated UI components to Svelte 5 runes for better performance and reactivity.
- **Project Support**: Experimental support for organizing chats into projects.
- **Enhanced Status Bar**: New metrics and layout options.

### Changed
- **Popover System**: Completely rewritten PopoverManager for better reliability and animation.
- **Sidebar Toggle**: Improved consistency and state synchronization.

### Fixed
- **Compilation Issues**: Resolved Svelte compilation errors in the main bundle.
- **Accessibility**: Improved keyboard navigation and ARIA labels.
