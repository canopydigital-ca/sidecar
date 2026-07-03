export interface SelectorDef {
  selector: string;
  intent?: string;
  scopes?: string[];
  matchText?: string;
  state?: {
    openWhen?: string; // e.g. 'aria-expanded="true"'
    closedWhen?: string;
  };
  fallbacks?: string[];
}

export const REGISTRY = {
  // 1) ROOT
  "root.app": {
    selector: "div.flex.h-svh.w-screen.flex-col",
    intent: "App viewport container",
  },

  // 2) SIDEBAR
  "sidebar.host": {
    selector: "#stage-slideover-sidebar",
    intent: "Sidebar outer shell",
  },
  "sidebar.rail": {
    selector: "#stage-sidebar-tiny-bar",
    intent: "Collapsed sidebar rail",
  },
  "sidebar.openButtons": {
    selector: 'button[aria-label="Open sidebar"]',
    intent: "All potential open sidebar buttons",
    fallbacks: [
      'button[data-testid="sidebar-toggle-button"]',
      'button[aria-label="Open sidebar"][aria-controls="stage-slideover-sidebar"]',
      'span[data-state="closed"] > button[aria-label="Open sidebar"][aria-expanded="false"]',
      'span[data-state="closed"] button[aria-label="Open sidebar"]',
      'span[data-state="instant-open"] button[aria-label="Open sidebar"]',
      'button[aria-controls="stage-slideover-sidebar"][aria-expanded="false"]',
      'div.h-header-height button[aria-label="Open sidebar"]',
      'div[class*="h-header-height"] button[aria-label="Open sidebar"]',
      'a[aria-label="Home"][data-sidebar-item="true"]',
      'a[href="/"][data-sidebar-item="true"]'
    ]
  },
  "sidebar.closeButtons": {
    selector: 'button[data-testid="close-sidebar-button"][aria-label="Close sidebar"]',
    intent: "All potential close sidebar buttons",
    fallbacks: [
      'button[data-testid="sidebar-toggle-button"]',
      'button[aria-label="Close sidebar"]',
      'div.flex > button[aria-label="Close sidebar"]'
    ]
  },
  "sidebar.open": {
    selector: 'button[aria-label="Open sidebar"]',
    intent: "Open sidebar",
    state: {
      openWhen: 'aria-expanded="true"',
      closedWhen: 'aria-expanded="false"',
    },
    fallbacks: [
      'button[data-testid="sidebar-toggle-button"]',
      'button[aria-label="Open sidebar"][aria-controls="stage-slideover-sidebar"]',
      'span[data-state="closed"] > button[aria-label="Open sidebar"][aria-expanded="false"]',
      'span[data-state="closed"] button[aria-label="Open sidebar"]',
      'span[data-state="instant-open"] button[aria-label="Open sidebar"]',
      'button[aria-controls="stage-slideover-sidebar"][aria-expanded="false"]',
      'div.h-header-height button[aria-label="Open sidebar"]',
      'div[class*="h-header-height"] button[aria-label="Open sidebar"]',
      // Fallback for "Home" style rail button if standard toggle is missing
      'a[aria-label="Home"][data-sidebar-item="true"]',
      'a[href="/"][data-sidebar-item="true"]'
    ]
  },
  "sidebar.newChatIcon": {
    selector: 'a[data-testid="create-new-chat-button"]',
    intent: "New chat (icon)",
    scopes: ["sidebar.host"],
  },
  "sidebar.imagesIcon": {
    selector: 'a[data-testid="sidebar-item-library"]',
    intent: "Images (icon)",
    scopes: ["sidebar.host"],
  },
  "sidebar.profileIcon": {
    selector: 'div[data-testid="accounts-profile-button"]',
    intent: "Profile menu",
    scopes: ["sidebar.host"],
  },
  "sidebar.scrollport": {
    selector: 'nav[aria-label="Chat history"]',
    intent: "Expanded sidebar content",
    scopes: ["sidebar.host"],
    fallbacks: ["nav"],
  },
  "sidebar.close": {
    selector: 'button[data-testid="close-sidebar-button"][aria-label="Close sidebar"]',
    intent: "Close sidebar",
    // Scopes removed to ensure we find it even if DOM structure varies
    fallbacks: [
      'button[data-testid="sidebar-toggle-button"]',
      'button[aria-label="Close sidebar"]',
      'div.flex > button[aria-label="Close sidebar"]'
    ]
  },
  "sidebar.apps": {
    selector: 'a[data-testid="apps-button"]',
    intent: "Apps",
    scopes: ["sidebar.scrollport"],
  },
  "sidebar.codex": {
    selector: 'a[href="/codex"][target="_blank"]',
    intent: "Codex",
    scopes: ["sidebar.scrollport"],
  },
  "sidebar.projects.section": {
    selector: ".group\\/sidebar-expando-section button[aria-expanded] .__menu-label",
    intent: "Projects section header",
    matchText: "Projects",
    scopes: ["sidebar.scrollport"],
  },
  "sidebar.projects.item": {
    selector: 'a[href^="/g/"][href$="/project"]',
    intent: "Project link in sidebar",
    scopes: ["sidebar.scrollport"],
  },
  "sidebar.history.list": {
    selector: "#history",
    intent: "Chat history container",
    scopes: ["sidebar.scrollport"],
  },
  "sidebar.history.item": {
    selector: 'a[href^="/c/"][draggable="true"]',
    intent: "Chat history item",
    scopes: ["sidebar.history.list"],
  },
  "sidebar.history.itemOptions": {
    selector: 'button[data-testid^="history-item-"][data-testid$="-options"]',
    intent: "Chat item options",
    scopes: ["sidebar.history.list"],
  },

  // 3) HEADER
  "header.page": {
    selector: "#page-header",
    intent: "Sticky page header",
  },
  "header.modelSelector": {
    selector: 'button[data-testid="model-switcher-dropdown-button"]',
    intent: "Model selector",
    scopes: ["header.page"],
  },
  "header.share": {
    selector: 'button[data-testid="share-chat-button"]',
    intent: "Share chat",
    scopes: ["header.page"],
  },
  "header.options": {
    selector: 'button[data-testid="conversation-options-button"]',
    intent: "Conversation options",
    scopes: ["header.page"],
  },
  "menu.modelSelector": {
    selector: '[role="menu"], [role="listbox"], [data-radix-popper-content-wrapper]',
    intent: "Model selector menu",
  },
  "header.groupChat": {
    selector: 'button[aria-label="Start a group chat"]',
    intent: "Start group chat",
  },
  "header.tempChat": {
    selector: 'button[aria-label="Turn on temporary chat"]',
    intent: "Temporary chat toggle",
  },

  // 4) THREAD
  "thread.root": {
    selector: "#thread",
    intent: "Main thread container",
  },
  "thread.bottomContainer": {
    selector: "#thread-bottom-container",
    intent: "Bottom container wrapping composer",
    fallbacks: [".composer", "main > .absolute.bottom-0"],
  },
  "turn.copy": {
    selector: 'button[data-testid="copy-turn-action-button"]',
    intent: "Copy turn",
  },
  "turn.voteGood": {
    selector: 'button[data-testid="good-response-turn-action-button"]',
    intent: "Vote good",
  },
  "turn.voteBad": {
    selector: 'button[data-testid="bad-response-turn-action-button"]',
    intent: "Vote bad",
  },

  // 5) COMPOSER
  "composer.form": {
    selector: "form.group\\/composer",
    intent: "Composer form",
    fallbacks: [".wcDTda_prosemirror-parent"], // Fallback to wrapper if form missing
  },
  "composer.editor": {
    selector: '#prompt-textarea.ProseMirror[contenteditable="true"]',
    intent: "ProseMirror editor",
    fallbacks: ['#prompt-textarea', '.wcDTda_fallbackTextarea'],
  },
  "composer.add": {
    selector: 'button[data-testid="composer-plus-btn"]',
    intent: "Add attachments",
  },
  "composer.fileInput": {
    selector: 'input[type="file"]',
    intent: "File input",
  },
  "composer.extendedThinking.pill": {
    selector: ".__composer-pill",
    intent: "Extended thinking pill",
    matchText: "Extended thinking",
  },
  "composer.voice": {
    selector: 'button[aria-label="Start Voice"]',
    intent: "Voice input",
    fallbacks: ['button[aria-label="Dictate button"]'],
  },
  "composer.send": {
    selector: 'button[data-testid="send-button"]',
    intent: "Send message",
    fallbacks: ['button[aria-label="Send prompt"]'],
  },

  // 6) EXTENSION (Injected)
  "ext.dock": {
    selector: "#cgpt-dock",
    intent: "Extension Dock",
  },
  "ext.dock.sidebar": {
    selector: '.cgpt-btn[data-action="sidebar"]',
    intent: "Dock sidebar toggle",
  },
  "ext.dock.wide": {
    selector: '.cgpt-btn[data-action="wide"]',
    intent: "Dock wide mode toggle",
  },
  "ext.dock.inputToggle": {
    selector: '.cgpt-btn[data-action="inputToggle"]',
    intent: "Dock input size toggle",
  },
  "ext.dock.collapseCode": {
    selector: '.cgpt-btn[data-action="collapseCode"]',
    intent: "Dock code collapse toggle",
  },
  "ext.dock.modelSlot": {
    selector: "#cgpt-model-slot",
    intent: "Dock model selector slot",
  },
} as const;

export type RegistryKey = keyof typeof REGISTRY;
