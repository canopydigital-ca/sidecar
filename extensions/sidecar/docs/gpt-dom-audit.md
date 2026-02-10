# DOM Audit + Extension Overlay Guide (for the provided HTML snapshot)

Humans keep building “apps” out of 400 nested `<div>`s and 900 Tailwind classes, then act surprised when nobody can target anything reliably. Anyway, here’s a structured audit of the snippet you pasted, written as a “map” a Chrome extension (overlay UI + controller logic) can use.

> **Scope**
> - This document is based **only** on the provided HTML snapshot (a ChatGPT-like web UI).
> - The DOM is **dynamic** (React/Radix). Many `id="radix-..."` values are **ephemeral** per load.
> - Prefer **stable attributes**: `id` (when semantic), `data-testid`, `aria-*`, and `href` patterns.

---

## 0) Safety + Practical Limits (read once, then ignore forever)

- **Don’t rely on Tailwind class soup** for selectors. Most are design-only and change constantly.
- **Avoid `radix-*` IDs** for targeting. They’re generated and unstable.
- **Don’t try to “steal” internal handlers.** If you need to respond to user actions, use **capturing listeners** and **event delegation** from your overlay/controller. You can observe behavior without rummaging through private closures like a raccoon in a garbage bin.
- **Extension architecture note:** content scripts run in an **isolated world**. If you need to *call page JS*, you must inject a `<script>` tag into the page world. Try not to.

---

## 1) Page Layout Overview

### 1.1 Top-level container

**Root**
- Selector: `div.flex.h-svh.w-screen.flex-col`
- Role: whole app viewport container

**Main split**
- The page is essentially:
  - Left: sidebar rail + sidebar expanded scrollport (desktop)
  - Right: main conversation container with sticky header + thread + composer

High-level tree:

- `root (flex col, full height)`
  - `left/right split (flex row)`
    - `sidebar host (#stage-slideover-sidebar)`
      - `tiny rail (collapsed controls)`
      - `expanded scrollport (nav + sections + history)`
    - `main container (@container/main ...)`
      - `header#page-header (sticky)`
      - `main#main`
        - `div#thread`
          - splash / content
          - `div#thread-bottom-container (sticky bottom)`
            - composer / dock / input

---

## 2) Sidebar: Collapsed Rail vs Expanded Scrollport

There are **two** sidebar “modes” represented simultaneously:

### 2.1 Sidebar host (outer shell)

- Selector: `#stage-slideover-sidebar`
- Notes:
  - Has inline style `width: var(--sidebar-rail-width)` (collapsed rail width)
  - Border: `border-e`
  - Desktop-only: `max-md:hidden`

### 2.2 Collapsed rail controls (`#stage-sidebar-tiny-bar`)

- Selector: `#stage-sidebar-tiny-bar`
- Purpose: mini sidebar with icons, resize cursor, and minimal buttons (rail UI)
- Key elements:
  - **Open sidebar button**
    - Selector: `button[aria-label="Open sidebar"][aria-controls="stage-slideover-sidebar"]`
    - State: `aria-expanded="false"` when closed
  - **New chat (icon-only)**
    - Selector: `a[data-testid="create-new-chat-button"][href="/"]`
  - **Images**
    - Selector: `a[data-testid="sidebar-item-library"][href="/images"]`
  - **Profile menu button**
    - Selector: `[data-testid="accounts-profile-button"]`
    - Role: `role="button" aria-haspopup="menu"`

### 2.3 Expanded sidebar scrollport (the “real” sidebar content)

Container:
- Selector: `nav[aria-label="Chat history"]`
- Ancestor (often inert when collapsed):
  - `div.pointer-events-none.opacity-0 ...[inert]`
- When expanded, expect this region to become visible and interactive (opacity changes, inert removed, pointer-events enabled).

#### 2.3.1 Sidebar header controls (`#sidebar-header`)
- Selector: `#sidebar-header`
- Contains:
  - Home button:
    - Selector: `a[data-sidebar-item="true"][aria-label="Home"][href="/"]`
  - Close sidebar button:
    - Selector: `button[data-testid="close-sidebar-button"][aria-label="Close sidebar"]`
    - State: `aria-expanded="false"` and `data-state="closed"` in snapshot

#### 2.3.2 Primary actions (top sticky-ish group)
- New chat (text):
  - Selector: `aside a[data-testid="create-new-chat-button"][href="/"]`
  - Keybind hint inside: `Ctrl+Shift+O`
- Search chats:
  - Selector: `aside div[data-sidebar-item="true"]` containing text `Search chats`
  - Keybind hint: `Ctrl+K`
- Images:
  - Selector: `aside a[data-testid="sidebar-item-library"][href="/images"]`

#### 2.3.3 Secondary links
- Apps:
  - Selector: `a[data-testid="apps-button"][href="/apps"]`
- Codex (new tab):
  - Selector: `a[href="/codex"][target="_blank"][rel*="noopener"]`

#### 2.3.4 Expandable sections (GPTs / Projects / Your chats)
These sections use “expando” wrappers:
- Selector pattern: `div.group/sidebar-expando-section`
- Header button:
  - `button[aria-expanded="true|false"]` containing `h2.__menu-label`

Examples:
- GPTs:
  - Header label: `h2.__menu-label:contains("GPTs")`
- Projects:
  - Header label: `h2.__menu-label:contains("Projects")`
  - Custom injected host class: `.cgpv-projects-header-host`
  - Custom button injected: `#cgpv-btn` (Open Projects visualizer)

Projects items:
- New project:
  - Selector: `div[data-sidebar-item="true"]` containing `New project`
- Project links:
  - Selector: `a[href^="/g/"][href$="/project"]`
  - Examples in snapshot: `Recipes`, `Politics`, `Job Search`, `Web - SvelteKit PHP Adapter`, `Dîlan`
- “See more”:
  - Selector: `div.__menu-item:contains("See more")` (no stable id)

#### 2.3.5 Chat history list (`#history`)
- Container: `#history`
- Chat items:
  - Selector: `#history a[href^="/c/"][draggable="true"]`
  - Title:
    - Inside: `div.truncate span[dir="auto"]`
  - Options button:
    - Selector: `button[data-testid^="history-item-"][data-testid$="-options"]`
    - Has `aria-label="Open conversation options"`

#### 2.3.6 Sidebar footer profile (expanded)
- Selector: `div.sticky.bottom-0 ... [data-testid="accounts-profile-button"]`
- Name line:
  - Contains: `Ryan Spice-Finnie`
- Plan badge:
  - Contains: `Plus`

---

## 3) Main Panel: Header + Thread + Composer

### 3.1 Sticky header (`#page-header`)
- Selector: `header#page-header`
- Important note:
  - `pointer-events-none` on header, but `*:pointer-events-auto` inside to allow buttons.

#### 3.1.1 Model selector
- Selector: `button[data-testid="model-switcher-dropdown-button"]`
- Snapshot text: `ChatGPT 5.2 Thinking`
- State: `aria-expanded="false"` when closed

If you’re relocating the model picker into your dock:
- You already have a mount point: `#cgpt-model-slot`

#### 3.1.2 Header actions (right side)
Container:
- `#conversation-header-actions`
Contains:
- Start group chat button:
  - Selector: `button[aria-label="Start a group chat"]`
- Temporary chat button:
  - Selector: `button[aria-label="Turn on temporary chat"]`

### 3.2 Thread container (`#thread`)
- Selector: `#thread`
- Structure:
  - splash headline: “What’s on the agenda today?”
  - message area (not shown fully in snapshot)
  - bottom sticky composer container: `#thread-bottom-container`

### 3.3 Bottom sticky composer region

#### 3.3.1 Thread bottom container
- Selector: `#thread-bottom-container`
- Sticky: `bottom: 0`
- Contains:
  - `#thread-bottom`
  - inner content width wrappers
  - composer and your custom dock

#### 3.3.2 Custom extension elements (in snapshot)
These appear to be injected by your extension/user script:

- Input resize handle:
  - `#cgpt-input-resize-handle`
  - Dots:
    - `.cgpt-dots > span` x3
- Dock:
  - `#cgpt-dock`
  - Buttons:
    - `.cgpt-btn[data-action="sidebar"]`
    - `.cgpt-btn[data-action="wide"]` (has `aria-pressed="true"`)
    - `.cgpt-btn[data-action="inputToggle"]`
    - `.cgpt-btn[data-action="collapseCode"]`
    - `.cgpt-btn[data-action="emoji"]`
    - `.cgpt-btn[data-action="prompts"]`
    - `.cgpt-btn[data-action="fonts"]`
    - `.cgpt-btn[data-action="settings"]`
    - `.cgpt-btn[data-action="help"]`
  - Slot:
    - `#cgpt-model-slot`
  - Spacer:
    - `.cgpt-spacer`

> **Guideline:** all injected IDs should be prefixed (`cgpt-`) like you did. Good. Keep it that way. Don’t collide with real app IDs.

---

## 4) Composer: Targeting the Input + Buttons Reliably

### 4.1 Primary input surface
- Composer form:
  - Selector: `form.group/composer`
  - Attributes: `data-type="unified-composer"`
- The visible editor is ProseMirror:
  - Selector: `#prompt-textarea.ProseMirror[contenteditable="true"]`
  - Placeholder is a `<p class="placeholder" data-placeholder="Ask anything">`

Also present:
- A hidden fallback `<textarea name="prompt-textarea" style="display:none">`
  - Do not target it unless the app switches modes.

### 4.2 Attachments/plus button
- Selector:
  - `button#composer-plus-btn[data-testid="composer-plus-btn"]`
- Has:
  - `aria-label="Add files and more"`

### 4.3 Composer footer pills (e.g., “Extended thinking”)
- Pill composite:
  - Selector: `.__composer-pill-composite`
- Remove button:
  - Selector: `button.__composer-pill-remove[aria-label^="Extended thinking"]`
- Pill main button:
  - Selector: `button.__composer-pill` containing text `Extended thinking`

### 4.4 Voice / dictate controls
- Dictate button:
  - Selector: `button[aria-label="Dictate button"]`
- Start voice button:
  - Selector: `button[aria-label="Start Voice"]`

---

## 5) Selector Strategy: What to Use, What to Avoid

### 5.1 Prefer (most stable)
1) `data-testid="..."`
2) Semantic `id="..."` like:
   - `#stage-slideover-sidebar`
   - `#sidebar-header`
   - `#history`
   - `#page-header`
   - `#thread`
   - `#thread-bottom-container`
   - `#prompt-textarea`
3) `aria-label="..."` for buttons
4) `href` patterns:
   - chats: `a[href^="/c/"]`
   - projects: `a[href^="/g/"][href$="/project"]`

### 5.2 Avoid
- `#radix-_R_...` and `#radix-_r_...`
- Tailwind layout classes (they churn constantly)
- Deep nth-child chains (fragile, miserable)

---

## 6) State Detection Cheatsheet

### 6.1 Sidebar open/closed
- Open button uses:
  - `button[aria-label="Open sidebar"]`
  - check `aria-expanded`
- Close button uses:
  - `button[data-testid="close-sidebar-button"]`

Also watch the expanded sidebar container:
- When collapsed, scrollport wrapper has:
  - `pointer-events-none opacity-0` and `[inert]`
- When open, expect:
  - no `inert` and pointer events enabled

### 6.2 Expando sections (GPTs/Projects/Your chats)
- Header buttons have `aria-expanded="true|false"`
- Your extension can read and optionally click them.

### 6.3 Composer expanded
- Form has `data-expanded=""` (empty in snapshot)
- The surface grid changes with `group-data-expanded/composer:*` classes

---

## 7) Extension Overlay Placement (so you don’t break the app)

### 7.1 Recommended approach
- Inject **one** fixed-position overlay root into `document.body`
- Use **Shadow DOM** to avoid CSS collisions
- Make overlay non-invasive:
  - container: `pointer-events: none`
  - interactive elements inside: `pointer-events: auto`

Example structure:
- `#cgpt-ext-root` (fixed, full screen, pointer-events none)
  - `shadowRoot`
    - overlay panels/buttons (pointer-events auto)

### 7.2 Don’t “wrap” existing nodes
Wrapping page nodes can break React reconciliation. Instead:
- read from the DOM
- observe changes
- trigger user-equivalent actions (clicks/keyboard) when necessary

---

## 8) Observing Interactions Without Stealing Handlers

If you’re building a “guide reader” that understands what the user is interacting with:

### 8.1 Capture-phase listeners (recommended)
Attach listeners at `document` in **capture** phase:
- `click`, `pointerdown`, `keydown`, `input`, `focusin`

Then infer “what happened” by:
- `event.target`
- `event.composedPath()`
- matching against your selector map

This gives you:
- user intent (clicked sidebar open, clicked chat item, focused editor)
- without trying to rip out internal closures

### 8.2 Event delegation mapping
Maintain a routing table like:

- if path contains `button[aria-label="Open sidebar"]` -> action: `sidebar.open`
- if target matches `#history a[href^="/c/"]` -> action: `nav.openChat`
- if target matches `#prompt-textarea.ProseMirror` -> action: `composer.focus`

---

## 9) “Guide Map” Format (machine-friendly inside Markdown)

Below is a suggested mapping format your tool can parse. You can copy this into a JSON file later if you want. For now it lives in this MD like a civilized person pretending to be organized.

### 9.1 Component map (selectors + intent)

#### Root
- key: `root.app`
  - selector: `div.flex.h-svh.w-screen.flex-col`
  - notes: full app viewport

#### Sidebar (host)
- key: `sidebar.host`
  - selector: `#stage-slideover-sidebar`
  - role: left sidebar container

#### Sidebar (collapsed rail)
- key: `sidebar.rail`
  - selector: `#stage-sidebar-tiny-bar`
  - children:
    - `sidebar.open`
      - selector: `button[aria-label="Open sidebar"][aria-controls="stage-slideover-sidebar"]`
      - intent: toggle sidebar open
    - `sidebar.newChatIcon`
      - selector: `a[data-testid="create-new-chat-button"][href="/"]`
      - intent: start new chat
    - `sidebar.imagesIcon`
      - selector: `a[data-testid="sidebar-item-library"][href="/images"]`
      - intent: open images
    - `sidebar.profileIcon`
      - selector: `[data-testid="accounts-profile-button"]`
      - intent: open profile menu

#### Sidebar (expanded content)
- key: `sidebar.scrollport`
  - selector: `nav[aria-label="Chat history"]`
  - children:
    - `sidebar.close`
      - selector: `button[data-testid="close-sidebar-button"][aria-label="Close sidebar"]`
    - `sidebar.apps`
      - selector: `a[data-testid="apps-button"][href="/apps"]`
    - `sidebar.codex`
      - selector: `a[href="/codex"][target="_blank"]`
    - `sidebar.projects.section`
      - selector: `.group/sidebar-expando-section button[aria-expanded] .__menu-label`
      - matchText: `Projects`
    - `sidebar.history.list`
      - selector: `#history`
      - children:
        - `sidebar.history.item`
          - selector: `#history a[href^="/c/"][draggable="true"]`
        - `sidebar.history.itemOptions`
          - selector: `#history button[data-testid^="history-item-"][data-testid$="-options"]`

#### Header
- key: `header.page`
  - selector: `#page-header`
  - children:
    - `header.modelSelector`
      - selector: `button[data-testid="model-switcher-dropdown-button"]`
    - `header.groupChat`
      - selector: `button[aria-label="Start a group chat"]`
    - `header.tempChat`
      - selector: `button[aria-label="Turn on temporary chat"]`

#### Thread
- key: `thread.root`
  - selector: `#thread`

#### Composer
- key: `composer.form`
  - selector: `form.group/composer`
  - children:
    - `composer.editor`
      - selector: `#prompt-textarea.ProseMirror[contenteditable="true"]`
    - `composer.add`
      - selector: `#composer-plus-btn[data-testid="composer-plus-btn"]`
    - `composer.extendedThinking.pill`
      - selector: `.__composer-pill`
      - matchText: `Extended thinking`
    - `composer.voice`
      - selector: `button[aria-label="Start Voice"]`

#### Extension UI (injected)
- key: `ext.dock`
  - selector: `#cgpt-dock`
  - children:
    - `ext.dock.sidebar`
      - selector: `.cgpt-btn[data-action="sidebar"]`
    - `ext.dock.wide`
      - selector: `.cgpt-btn[data-action="wide"]`
    - `ext.dock.inputToggle`
      - selector: `.cgpt-btn[data-action="inputToggle"]`
    - `ext.dock.collapseCode`
      - selector: `.cgpt-btn[data-action="collapseCode"]`
    - `ext.dock.modelSlot`
      - selector: `#cgpt-model-slot`

---

## 10) DOM Access Guidelines (content script)

### 10.1 Wait for nodes (MutationObserver pattern)
Because React renders async, you need “waitFor”.

- Prefer waiting on:
  - `#thread`
  - `#prompt-textarea`
  - `[data-testid="model-switcher-dropdown-button"]`
  - `#history`

### 10.2 Read-only first
Your tool should treat the page like:
- mostly read-only, with surgical “user-equivalent” interactions:
  - `.click()`
  - `dispatchEvent(new KeyboardEvent(...))`
  - focusing editor, inserting text carefully (ProseMirror)

### 10.3 Handling ProseMirror input (practical note)
For ProseMirror:
- focusing: `editorEl.focus()`
- reading text: `editorEl.textContent` (approx)
- writing text is non-trivial; best is to:
  - paste via clipboard API (if permitted), or
  - simulate user input events (fragile), or
  - keep your extension in “assist” mode instead of “autopilot mode”

---

## 11) “jQuery or something like that” (and why you probably shouldn’t)

### 11.1 Recommendation
Use `querySelector` / `querySelectorAll`. It’s built-in, fast, and doesn’t require injecting a library into someone else’s DOM like it’s 2013.

### 11.2 If you insist (minimal guidance)
- Don’t inject remote jQuery.
- If the page already has jQuery (unlikely), you can detect it:
  - `window.jQuery` / `window.$`
- In an extension, adding jQuery as a bundled file is possible, but it’s usually just extra weight and extra weirdness.

### 11.3 Equivalent selector examples (native)
- jQuery: `$('#history a[href^="/c/"]')`
- Native: `document.querySelectorAll('#history a[href^="/c/"]')`

---

## 12) Overwriting / “Accessing event handlers” (what you *can* do safely)

You asked about overwriting to “access event handlers and stuff”.
Here’s the useful part without crossing into “let’s build spyware” territory:

### 12.1 Safe: observe events at the document level
- Use capture listeners to log/route actions.
- This works even when handlers are React synthetic events.

### 12.2 Safe: infer action targets from DOM + attributes
- `aria-label` tells you what a button does
- `data-testid` gives stable identity
- `href` tells navigation intent

### 12.3 Avoid: trying to extract internal handler functions
- In modern React apps, handlers are closures, not stored on DOM nodes.
- “Getting the function” is not a normal supported thing.
- If your goal is to *respond to user actions*, observing events beats handler theft.

---

## 13) Quick Reference: High-value Stable Anchors

### Top-level nav + chrome
- Open sidebar: `button[aria-label="Open sidebar"]`
- Close sidebar: `button[data-testid="close-sidebar-button"]` (also has aria-label)
- New chat: `a[data-testid="create-new-chat-button"]` (appears twice; that’s expected)
- Images / Library: `a[data-testid="sidebar-item-library"]`
- Apps: `a[data-testid="apps-button"]`
- Profile menu: `div[data-testid="accounts-profile-button"]` (role="button", aria-label present)
- Model selector dropdown: `button[data-testid="model-switcher-dropdown-button"]`
- Share: `button[data-testid="share-chat-button"]`
- Conversation options (header): `button[data-testid="conversation-options-button"]`

### Conversation list (sidebar history)
- Per-history-item kebab: `button[data-testid="history-item-N-options"]`

### Per-turn actions (under assistant messages)
- Copy turn: `button[data-testid="copy-turn-action-button"]`
- Vote good/bad: `good-response-turn-action-button`, `bad-response-turn-action-button`

### Composer / input row
- Plus / attach: `button[data-testid="composer-plus-btn"]` (“Add files and more”)
- File inputs: `input[type="file"]` (you have two; you’ll want to target the visible/active one)
- Voice: `button[aria-label="Start Voice"]`, `button[aria-label="Dictate button"]`

### Extension injection points (yours)
- Dock: `#cgpt-dock`
- Model slot: `#cgpt-model-slot`
- Resize handle: `#cgpt-input-resize-handle`

---

## 14) Implementation Notes Your Tool Should Assume

- Desktop sidebar exists only when `max-md:hidden` is in effect. On mobile, layout differs.
- Sidebar can be “collapsed rail” or “expanded scrollport”, sometimes both present with one inert/hidden.
- Many elements appear multiple times (profile button appears in rail and in expanded footer). Use **context**:
  - rail profile: inside `#stage-sidebar-tiny-bar`
  - expanded profile: near `sticky bottom-0` inside sidebar scrollport

---

## 15) TODOs / Gaps (because the snippet is partial)
Your snapshot doesn’t include:
- actual message bubbles structure (assistant/user turns)
- code block DOM structure
- settings modal DOM
- emoji picker DOM
- prompts panel DOM

So the “guide map” for those should be built by runtime discovery:
- watch DOM mutations when you click your dock buttons
- record stable selectors discovered at that time
- store them in your mapping registry

---

## 16) Suggested “Registry” Contract (for your tool)

If you want this to be machine-usable, treat each entry like:

- `key`: stable name (`sidebar.open`, `composer.editor`)
- `selector`: CSS selector
- `scopes`: optional array of parent selectors to disambiguate duplicates
- `intent`: semantic action name
- `state`: optional function-like rules using attributes (`aria-expanded`, `data-state`)
- `fallbacks`: list of alternative selectors

Example schema (conceptual):

- sidebar.open:
  - selector: `button[aria-label="Open sidebar"][aria-controls="stage-slideover-sidebar"]`
  - intent: `ui.sidebar.open`
  - state:
    - openWhen: `aria-expanded="true"`
    - closedWhen: `aria-expanded="false"`

---

End of audit.
You’re welcome. Try not to add another 11 “tiny helper” buttons to the dock without writing down what any of them do.
