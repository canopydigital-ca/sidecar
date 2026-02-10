
Maintain a resilient, fast, non-invasive extension that survives a dynamic React/Radix UI.
Prefer stable selectors and user-equivalent interactions. Avoid DOM “wrapping” or reparenting React-managed nodes.
- we must adhear to semantic versioning and for every prompt increase the lowest version number at least


## 0.1) Info on chatgpt.com and how its built
We do not want to do the exact same thing but lets adhear to the principals of the following tools that chatgpt.com is built with while keeping svelte as our new UI driver:
  React + Next.js (you can spot Next’s __NEXT_DATA__ in the page HTML that gets shipped to the browser).
  Tailwind-style utility CSS, including responsive/state variants (sm:..., hover:..., max-md:...) and lots of layout utilities (flex, gap-*, p-*, etc.).
  A custom OpenAI design-token system layered on top of that, visible in classnames like bg-token-*, text-token-*, border-token-* (so colors/spacing/etc. are controlled via tokens rather than a public “style guide”).
  Radix UI primitives (menus/dialogs/etc.), with Tailwind helpers for Radix state like group-radix-* / data-state="open" patterns.

## 1) Tooling & Build (Bun + TS)
- Use Bun and TypeScript everywhere.
- Output:
  - `dist/content.js` (IIFE, browser target) + sourcemap.
- Flags:
  - Use compile-time `__DEV__` boolean define (dev=true, prod=false).
  - Never rely on `process.env.NODE_ENV` at runtime.
  - All `__DEV__` reads must be guarded:
    - `if (typeof __DEV__ !== 'undefined' && __DEV__) { ... }`
- Production safety:
  - Prod bundle must not contain `__cgptDockSelfTest`, `registerSelfTest`, or `selftest` strings.
  - Enforce via `scripts/assert-prod-bundle.ts`.
- Scripts required in `package.json`:
  - `build`, `dev`, `typecheck`, `test:unit`, `test:e2e`, `test`, `verify:bundle`.

## 2) Selector Resilience (Registry-first)
- All DOM targeting must go through `src/core/registry.ts` keys.
- Prefer stable attributes:
  1) `data-testid`
  2) semantic ids (`#thread`, `#page-header`, `#prompt-textarea`, etc.)
  3) `aria-label`
  4) `href` patterns
- Never rely on:
  - `radix-*` IDs
  - Tailwind classes for identity
  - deep `nth-child()` chains
- Registry rules:
  - Provide fallbacks for each key.
  - Escape selectors correctly (e.g., `group\/composer`) or use `CSS.escape` where applicable.
- DOM helpers:
  - Use `queryFirst(key)`, `queryAll(key)`, `matchesPath(event, key)` from `src/core/dom.ts`.

## 3) Mutation + Waiting (Single Observer)
- Use a single debounced MutationObserver loop (`src/core/observer.ts`).
- Provide `waitFor(key)` with timeout handling.
- Cap/limit expensive work per tick and time-slice where appropriate.
- All background work must stop cleanly via `stopObserver()`.

## 4) Overlay UI (Shadow DOM)
- Inject exactly one overlay root into `document.body`:
  - `#cgpt-ext-root`, fixed position, `pointer-events: none`.
- All interactive overlay elements inside shadow root must be `pointer-events: auto`.
- All popovers must render into the overlay shadow root (not page body).
- Overlay positioning must use fixed coordinates and `getBoundingClientRect()`.

## 5) Extension DOM Injection Rules
- All injected element IDs must be prefixed with `cgpt-`.
- Do not wrap or reparent React nodes.
- Insert only siblings into stable anchors (e.g., `#thread-bottom-container`).
- Maintain DOM order invariants for handle/dock.

## 6) Dock UI (Canonical Order)
Dock must render and remain stable under re-renders.

Canonical order (left→right):
1) sidebar
2) wide
3) inputToggle
4) collapseCode (Collapse all code)
5) emoji
6) prompts
7) project (optional, guarded by setting)
8) MODEL_SLOT (`#cgpt-model-slot`)
9) spacer (`.cgpt-spacer`) — MUST be immediately after MODEL_SLOT
10) fonts
11) settings
12) help

Additional rules:
- Dock must not impersonate native code toolbars.
- Dock click handlers must ignore clicks originating inside overlay shadow root popovers.

## 7) Composer Resize Handle
- `#cgpt-input-resize-handle` must be inserted as a sibling immediately BEFORE `#cgpt-dock`
  - e.g., `dock.insertAdjacentElement("beforebegin", handle)`
- Handle must be above the dock visually and structurally.
- Anchor insertion under a stable container:
  - registry key: `thread.bottomContainer` (with fallbacks)

## 8) Model Selector / “Extended thinking”
### 8.1 Header model selector hiding
- Visually hide header model selector (registry key `header.modelSelector`) via injected CSS.
- Do NOT remove it from the DOM; it must remain click-able programmatically.

### 8.2 No physical move of header picker
- Do not reparent/move the header model selector element.
- Use proxy triggers (dock trigger, pill trigger) that click the hidden header selector.

### 8.3 Pill trigger
- Inject a compact icon button adjacent to the composer “Extended thinking” pill label.
- Clicking the icon must open the same model dropdown as the hidden header selector.
- Dropdown must appear positioned over the icon (fixed-position adjustment if needed).

### 8.4 Candidate selection bans (defense-in-depth)
If any heuristic scanning exists, it must:
- Never pick nodes inside:
  - `[data-message-author-role]`, `pre`, `code`, `.cgpt-code-wrap`
- Reject nodes whose text/label includes:
  - "copy", "copy code", "collapse", "expand"
- Never scan `document` globally as a fallback; restrict scope to header/composer proximity.

## 9) Popovers (Emoji, Prompts, Fonts, Settings)
- Must render in overlay shadow root.
- Position near trigger using rects.
- Width behavior:
  - Popover width must match composer editor width when constrained.
  - Use `composer.editor` rect as the sizing reference.
  - Clamp: `clamp(min=320, ideal=editorWidth, max=720)` and never exceed viewport.
- Responsive behavior:
  - On small viewports, popovers should align to the input area width.

## 10) Prompts Manager
- Track recent prompts and store them (chrome.storage).
- Provide “Clear all” button for recent prompts.
- Preview must display word count (`Words: N`).
- If storage fails or invalidates, fail gracefully without spam loops.

## 11) Fonts Popover
- Selecting a font must immediately update UI “Selected” state.
- Persist selection to storage and restore on reload.
- Reopening the popover must reflect current state accurately.

## 12) Code Blocks
### 12.1 Enhancement strategy
- Enhance `<pre><code>` blocks incrementally (time-sliced).
- Mark enhanced blocks (e.g., `data-cgptEnhanced`) and avoid rework.

### 12.2 Collapse-all behavior
- Collapse-all must work even if code blocks were not previously enhanced.
- In `runAction("collapseCode")`:
  1) DO NOT collapse before enhancement pass.
  2) Call `enhanceAllCodeBlocksNow(max=80)` first.
  3) Then apply `setAllCodeCollapsed(on/off)`.
  4) Then schedule incremental enhancement to finish remaining.
- Expand must restore all blocks similarly.

### 12.3 Native toolbar integrity
- Native “Copy code” buttons must remain in message toolbars.
- The extension must not move “Copy code” into dock or elsewhere.
- Any inline collapse button must be added as a sibling control without replacing native UI.

## 13) Reliability: Extension Context Invalidation
- Detect invalidation error string: "Extension context invalidated".
- On invalidation:
  - Set a global dead flag (e.g., `window.__cgptContextDead = true`)
  - Call `stopObserver()`
  - Prevent future scheduled work/actions (no-op when dead)
  - Dim dock to indicate inactive state (opacity 0.5)
  - Show a toast ONCE via overlay:
    - "Extension reloaded. Refresh this tab."
- Storage wrapper must catch errors and check `chrome.runtime.lastError`.

## 14) Performance Constraints
- Centralize and debounce DOM work.
- Cap iteration counts and prefer scoped queries.
- Avoid scanning entire document for pickers or targets.
- Use idle/time-sliced loops for heavy enhancement tasks.

## 15) Tests (Playwright + Harness)
The harness must include mock DOM for:
- Header model selector (`data-testid="model-switcher-dropdown-button"`)
- Composer editor (`#prompt-textarea.ProseMirror`) and “Extended thinking” pill
- Thread bottom container (`#thread-bottom-container` or registry fallback)
- Sidebar/history items for project move flows

Minimum E2E coverage:
- Dock renders and canonical button order
- Handle is immediately before dock in DOM
- Header model selector is visually hidden (but present)
- Pill trigger is injected and opens model menu positioned over trigger
- Popover width matches editor in small viewport
- Recent prompts clear-all works
- Preview shows word count
- Fonts selection updates and persists
- Invalidation triggers single toast + dims dock and stops work
- Move to project flow shows picker / proceeds through expected steps
- Assert no “Copy code” node ever appears inside `#cgpt-model-slot` or dock

## 16) CI
- CI must run:
  - typecheck
  - unit tests
  - e2e tests (install Playwright chromium)
  - build
  - verify:bundle
- CI must fail if bundle safety check fails.

## 17) UX Boundaries
- Do not impersonate native ChatGPT UI controls (especially code toolbars).
- Prefer additive UI (dock + overlay) rather than replacing page UI.
- All injected UI must remain stable across re-renders.

End.
