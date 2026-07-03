# Accessibility Audit: ProgressQuest UI Shell

## Issues Found

### 1. Missing Landmarks & Roles
- **Issue**: The iframe content does not have a main landmark that assistive technology can jump to easily, although the shell wrapper has `<main class="cgpt-content">`.
- **Fix**: Ensure the shell structure uses proper semantic HTML (already done: `header`, `aside`, `main`, `footer`).

### 2. Focus Management
- **Issue**: The pause button (`#shell-pause-btn`) has an SVG icon but no text label.
- **Fix**: Add `aria-label="Pause Game"` to the button.
- **Issue**: Navigation links (`.cgpt-nav-item`) are anchors pointing to IDs. They should have `role="tab"` or clear labels if they act as tabs, but since they are anchor links to sections, this is acceptable provided focus rings are visible.

### 3. Contrast (Dark Mode)
- **Issue**: Muted text (`--cgpt-muted`) might be too low contrast against dark backgrounds.
- **Fix**: Verify `--cgpt-muted` is at least `#9ca3af` (Tailwind slate-400) in dark mode, which passes AA for large text but might be marginal for small text.
- **Action**: Bump muted text lightness in dark mode slightly if needed.

### 4. Hit Targets
- **Issue**: Compact mode sidebar links might be too small (icon-only logic?).
- **Fix**: Ensure minimum 24x24px target size even in compact mode. The current padding `8px 4px` + text size likely yields ~30px height, which is acceptable.

### 5. Interactive Elements
- **Issue**: The `tr` elements in logs are not interactive but might be read as data tables.
- **Fix**: Ensure `th` headers have `scope="col"`. The legacy HTML has `th` but scoping is implicit.

## Implemented Fixes

1.  **ARIA Labels**: Added `aria-label` to the pause button and `role="navigation"` to the sidebar nav.
2.  **Focus Visibility**: Confirmed `outline` styles in `pq-theme.css`.
3.  **Semantic Structure**: The shell uses `<header>`, `<aside>`, `<main>`, `<footer>` correctly.
