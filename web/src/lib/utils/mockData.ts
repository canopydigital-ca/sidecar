export type GlobalSettings = {
  version: 1;
  ui: Record<string, unknown>;
  statusbar: Record<string, unknown>;
  dock: {
    order: string[];
    items: Array<{ id: string; visible: boolean }>;
  };
  pq: Record<string, unknown>;
};

export type DockContext = {
  settings: GlobalSettings;
  uiState: Record<string, unknown>;
  statusState: Record<string, unknown>;
  flags: Record<string, boolean>;
  scheduleWork: (taskName: string) => void;
  storageGet: (keys: unknown) => Promise<Record<string, unknown>>;
  storageSet: (obj: unknown) => Promise<void>;
  updateSettings: (patch: Record<string, unknown>) => Promise<void>;
  $: (sel: string) => Element | null;
  $$: (sel: string) => Element[];
  trackSelectorPerformance: { track: () => void; report: () => void };
  toggleSidebar: () => void;
  openPopover: (kind: string, btn: HTMLElement) => void;
  closePopover: () => void;
  showToast: (msg: string) => void;
  setAllCodeCollapsed: (collapsed: boolean) => void;
  ensureStatusBar: () => void;
  updateThinkingVisibility: () => void;
  setNeedHideTopModel: (val: boolean) => void;
  resetSidebar: () => Promise<void>;
  resetStatusState: () => void;
  persistSettings: () => Promise<void>;
};

export const mockSettings: GlobalSettings = {
  version: 1,
  ui: {
    wideMode: false,
    inputCollapsed: false,
    inputHeight: null,
    inputHeightExpanded: null,
    fontName: "System UI",
    fontCss: null,
    hideThinking: false,
    hideTopPicker: true,
    collapseCode: false,
    enableProjects: false
  },
  statusbar: {
    enabled: true,
    statsAlign: 'left',
    showMessages: true,
    showWords: true,
    showTokens: true,
    showCost: true
  },
  dock: {
    order: [
      "sidebar",
      "wide",
      "inputToggle",
      "collapseCode",
      "emoji",
      "pets",
      "progressquest",
      "pqChip",
      "prompts",
      "gameIcons",
      "project",
      "modelSlot",
      "spacer",
      "fonts",
      "settings",
      "help"
    ],
    items: []
  },
  pq: {
    enabled: true,
    muted: false,
    pauseWhenHidden: true,
    lastOpen: false,
    showDockButton: true,
    showProgressBar: false
  }
};

export const mockDefaultOrder = mockSettings.dock.order;

export function createMockDockContext(updateSettingsCallback: (patch: any) => void): DockContext {
  return {
    settings: mockSettings,
    uiState: {
        isSidebarOpen: true,
        isWideMode: false,
        isInputCollapsed: false,
        inputHeight: 0,
        isThinkingHidden: false,
        isTopPickerHidden: true,
        isCodeCollapsed: false
    } as any,
    statusState: {} as any,
    flags: {
      workScheduled: false,
      needDock: false,
      needInputHandle: false,
      needSidebarHandle: false,
      needModelMove: false,
      needHideTopModel: false,
      needCodeEnhance: false,
      isPopoverOpen: false
    },
    scheduleWork: (taskName: string) => console.log('Work scheduled:', taskName),
    storageGet: () => Promise.resolve({}),
    storageSet: () => Promise.resolve(),
    updateSettings: async (patch) => {
      console.log('Update settings:', patch);
      updateSettingsCallback(patch);
    },
    $: (sel) => document.querySelector(sel),
    $$: (sel) => Array.from(document.querySelectorAll(sel)),
    trackSelectorPerformance: { track: () => {}, report: () => {} } as any,
    toggleSidebar: () => console.log('Toggle sidebar'),
    openPopover: (kind, btn) => console.log('Open popover:', kind),
    closePopover: () => console.log('Close popover'),
    showToast: (msg) => console.log('Toast:', msg),
    setAllCodeCollapsed: (collapsed) => console.log('Set all code collapsed:', collapsed),
    ensureStatusBar: () => {},
    updateThinkingVisibility: () => {},
    setNeedHideTopModel: () => {},
    resetSidebar: async () => {},
    resetStatusState: () => {},
    persistSettings: async () => {}
  };
}
