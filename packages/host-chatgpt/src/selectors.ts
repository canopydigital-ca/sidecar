export const CHATGPT_SELECTORS = {
  composerEditor: [
    '#prompt-textarea.ProseMirror[contenteditable="true"]',
    "#prompt-textarea",
    ".wcDTda_fallbackTextarea",
  ],
  composerForm: [
    "form.group\\/composer",
    ".wcDTda_prosemirror-parent",
  ],
  threadBottomContainer: [
    "#thread-bottom-container",
    ".composer",
    "main > .absolute.bottom-0",
  ],
  modelPicker: [
    'button[data-testid="model-switcher-dropdown-button"]',
    'button[data-testid*="model-switcher"]',
    'button[aria-label*="ChatGPT"][aria-haspopup]',
  ],
  sidebarHost: [
    "#stage-slideover-sidebar",
  ],
  sidebarScrollport: [
    'nav[aria-label="Chat history"]',
    "nav",
  ],
  sidebarOpenButton: [
    'button[aria-label="Open sidebar"]',
    'button[data-testid="sidebar-toggle-button"]',
    'button[aria-label="Open sidebar"][aria-controls="stage-slideover-sidebar"]',
    'span[data-state="closed"] > button[aria-label="Open sidebar"][aria-expanded="false"]',
    'span[data-state="closed"] button[aria-label="Open sidebar"]',
    'span[data-state="instant-open"] button[aria-label="Open sidebar"]',
    'button[aria-controls="stage-slideover-sidebar"][aria-expanded="false"]',
    'div.h-header-height button[aria-label="Open sidebar"]',
    'div[class*="h-header-height"] button[aria-label="Open sidebar"]',
    'a[aria-label="Home"][data-sidebar-item="true"]',
    'a[href="/"][data-sidebar-item="true"]',
  ],
  sidebarCloseButton: [
    'button[data-testid="close-sidebar-button"][aria-label="Close sidebar"]',
    'button[data-testid="sidebar-toggle-button"]',
    'button[aria-label="Close sidebar"]',
    'div.flex > button[aria-label="Close sidebar"]',
  ],
  sidebarHistoryItems: [
    'a[href^="/c/"][draggable="true"]',
    'a[href*="/c/"][draggable="true"]',
  ],
  sidebarHistoryItemOptionsButton: [
    'button[data-testid^="history-item-"][data-testid$="-options"]',
    'button[aria-label*="options"]',
    'button[aria-label*="actions"]',
  ],
  floatingMenuSurfaces: [
    "[data-radix-popper-content-wrapper]",
    '[role="menu"]',
    '[role="listbox"]',
  ],
  menuItems: [
    '[role="menuitem"]',
    '[role="option"]',
    "button",
  ],
} as const;

export type ChatGptSelectorGroup = keyof typeof CHATGPT_SELECTORS;
