# ProgressQuest UI Map & Safe Change Guide

## DOM Structure Analysis

### Main Game (`main.html`)
Root Container: `div#main.vbox.window`

| Selector | Semantic Role | Safe to Style? | Risks/Notes |
|----------|---------------|----------------|-------------|
| `#titlebar` | Window Title | **YES** | JS binds click for drag/close. Do not remove. |
| `#Izquierda` | Left Column | **YES** | Layout container. |
| `#Centro` | Center Column | **YES** | Layout container. |
| `#Derecha` | Right Column | **YES** | Layout container. |
| `#Trats` | Stats Table | **YES** | Content populated by JS. |
| `#ExpBar` | XP Bar | **PARTIAL** | JS updates width/text. Style container/colors only. |
| `#Spells` | Spell List | **YES** | `div.scroll.listbox` container. |
| `#Equips` | Equipment | **YES** | Table. |
| `#Inventory`| Inventory | **YES** | `div.scroll.listbox`. |
| `#EncumBar` | Encumbrance | **PARTIAL** | JS updates. |
| `#Plots` | Plot Log | **YES** | `div.scroll.listbox`. |
| `#PlotBar` | Plot Progress | **PARTIAL** | JS updates. |
| `#Quests` | Quest Log | **YES** | `div.scroll.listbox`. |
| `#QuestBar` | Quest Progress| **PARTIAL** | JS updates. |
| `#Kill` | Status Text | **YES** | JS updates text content. |
| `#TaskBar` | Task Progress | **PARTIAL** | JS updates. |
| `#bsodmom` | Error Overlay | **YES** | Hidden by default. |
| `#paused` | Pause Overlay | **YES** | Hidden by default. JS toggles display. |

### Roster (`roster.html`)
Root Container: `body` (no main wrapper)

| Selector | Semantic Role | Safe to Style? | Risks/Notes |
|----------|---------------|----------------|-------------|
| `#roster` | Save Slot List| **YES** | JS populates this. |
| `.brag` | Character Card| **YES** | Template-generated class. |
| `#newc` | New Char Area | **YES** | |
| `#roll` | New Game Btn | **YES** | JS binds click. |
| `#nabar` | Navigation | **YES** | Links to external sites. |

### New Guy (`newguy.html`)
Root Container: `div#newguy.vbox.window`

| Selector | Semantic Role | Safe to Style? | Risks/Notes |
|----------|---------------|----------------|-------------|
| `#titlebar` | Window Title | **YES** | Same as main. |
| `#Stats` | Stat Roll | **YES** | |
| `#Reroll` | Action Btn | **YES** | JS binds click. |
| `#Unroll` | Action Btn | **YES** | JS binds click. |
| `#Sold` | Action Btn | **YES** | JS binds click. |
| `input` | Form Inputs | **YES** | JS reads values. Do not change structure. |

## Risky Changes (Do Not Touch)

1.  **ID Removals/Renames**: All IDs listed above are referenced by jQuery in `main.js`, `roster.js`, or `newguy.js`.
2.  **Structure Flattening**: The `vbox` and `hbox` classes are likely used for flex/layout logic in CSS (or JS calculation). JS calculates window resize based on `#main` dimensions.
3.  **Canvas/Script Tags**: Do not touch `config.js` or `bridge.js` imports.

## Proposed Theme Plan

### 1. CSS Variable Layer (`theme.css`)
We will inject a new stylesheet (or prepend to `bridge.ts` style injection) that defines CSS variables matching the Dock theme.

```css
:root {
  --pq-bg: #1e1e1e;
  --pq-text: #ececec;
  --pq-accent: #10a37f;
  --pq-border: #444;
  --pq-surface: #2a2a2a;
  --pq-font: 'Söhne', sans-serif;
}
```

### 2. Override Strategy
We will use high-specificity selectors or `!important` utility classes to override `progros.css` and `main.css` without deleting them (to ensure fallback safety).

### 3. DOM Wrappers
We will add a `data-theme="chatgpt"` attribute to the `html` tag via `bridge.ts` to scope our overrides.

### 4. Component Mapping
- **Window**: Remove 3D borders, apply flat dark background and thin borders.
- **Titlebar**: Hide or redesign to match Dock headers.
- **Progress Bars**: Flatten, remove "candy" gloss, use solid accent colors.
- **Tables/Lists**: Remove "inset" borders, use flat rows with hover states.
- **Buttons**: Style as Dock buttons (rounded corners, flat background, hover transition).
