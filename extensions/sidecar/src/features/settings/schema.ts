export interface GlobalSettings {
  version: 1;
  ui: {
    wideMode: boolean;
    inputCollapsed: boolean;
    inputHeight: number | null;
    inputHeightExpanded: number | null;
    fontName: string;
    fontCss: string | null;
    hideThinking: boolean;
    hideTopPicker: boolean;
    collapseCode: boolean;
    enableProjects: boolean;
  };
  statusbar: {
    enabled: boolean;
    statsAlign: 'left' | 'center';
    showMessages: boolean;
    showWords: boolean;
    showTokens: boolean;
    showCost: boolean;
  };
  dock: {
    order: string[];
    items: Array<{ id: string; visible: boolean }>;
  };
  pq: {
    enabled: boolean;
    muted: boolean;
    pauseWhenHidden: boolean;
    lastOpen: boolean;
    showDockButton: boolean;
    showProgressBar: boolean;
  };
}

export const DEFAULT_SETTINGS: GlobalSettings = {
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

export interface LegacySnapshot {
  cgptWide?: boolean;
  cgptInputCollapsed?: boolean;
  cgptInputHeight?: number;
  cgptInputHeightExpanded?: number;
  cgptFontName?: string;
  cgptFontCss?: string;
  cgptHideThinking?: boolean;
  cgptHideTopPicker?: boolean;
  cgptCollapseCode?: boolean;
  enableProjects?: boolean;

  cgptStatusbar?: boolean;
  cgptStatusbarStatsAlign?: string;
  cgptStatMessages?: boolean;
  cgptStatWords?: boolean;
  cgptStatTokens?: boolean;
  cgptStatCost?: boolean;

  cgpt_pq_muted?: boolean;
  cgpt_pq_pause_when_hidden?: boolean;
  cgpt_pq_last_open?: boolean;
}

export function migrateToV1(input: unknown, legacy: LegacySnapshot): GlobalSettings {
  // Start with defaults
  const settings: GlobalSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  // If input exists and looks like settings, merge it first (though this function is primarily for legacy migration)
  if (input && typeof input === 'object') {
    // We can do a deep merge or partial merge here if we had a v0 -> v1 path,
    // but here we are bootstrapping v1 from legacy flat keys.
    // If input has version 1, we just return it (or merge defaults).
    const existing = input as any;
    if (existing.version === 1) {
      // Basic merge to ensure new fields in v1 are present if we added any since last save
      // (Not strictly necessary if schema is frozen for v1, but good practice)
      return {
        ...settings,
        ...existing,
        ui: { ...settings.ui, ...existing.ui },
        statusbar: { ...settings.statusbar, ...existing.statusbar },
        dock: { ...settings.dock, ...existing.dock },
        pq: { ...settings.pq, ...existing.pq }
      };
    }
  }

  // Apply Legacy Snapshot overrides
  if (legacy.cgptWide !== undefined) settings.ui.wideMode = !!legacy.cgptWide;
  if (legacy.cgptInputCollapsed !== undefined) settings.ui.inputCollapsed = !!legacy.cgptInputCollapsed;
  if (legacy.cgptInputHeight !== undefined) settings.ui.inputHeight = legacy.cgptInputHeight;
  if (legacy.cgptInputHeightExpanded !== undefined) settings.ui.inputHeightExpanded = legacy.cgptInputHeightExpanded;
  if (legacy.cgptFontName !== undefined) settings.ui.fontName = legacy.cgptFontName;
  if (legacy.cgptFontCss !== undefined) settings.ui.fontCss = legacy.cgptFontCss;
  if (legacy.cgptHideThinking !== undefined) settings.ui.hideThinking = !!legacy.cgptHideThinking;
  if (legacy.cgptHideTopPicker !== undefined) settings.ui.hideTopPicker = !!legacy.cgptHideTopPicker;
  if (legacy.cgptCollapseCode !== undefined) settings.ui.collapseCode = !!legacy.cgptCollapseCode;
  if (legacy.enableProjects !== undefined) settings.ui.enableProjects = !!legacy.enableProjects;

  if (legacy.cgptStatusbar !== undefined) settings.statusbar.enabled = !!legacy.cgptStatusbar;
  if (legacy.cgptStatusbarStatsAlign !== undefined) settings.statusbar.statsAlign = legacy.cgptStatusbarStatsAlign === 'center' ? 'center' : 'left';
  if (legacy.cgptStatMessages !== undefined) settings.statusbar.showMessages = !!legacy.cgptStatMessages;
  if (legacy.cgptStatWords !== undefined) settings.statusbar.showWords = !!legacy.cgptStatWords;
  if (legacy.cgptStatTokens !== undefined) settings.statusbar.showTokens = !!legacy.cgptStatTokens;
  if (legacy.cgptStatCost !== undefined) settings.statusbar.showCost = legacy.cgptStatCost !== false; // Default true logic matches legacy?

  if (legacy.cgpt_pq_muted !== undefined) settings.pq.muted = !!legacy.cgpt_pq_muted;
  if (legacy.cgpt_pq_pause_when_hidden !== undefined) settings.pq.pauseWhenHidden = !!legacy.cgpt_pq_pause_when_hidden;
  if (legacy.cgpt_pq_last_open !== undefined) settings.pq.lastOpen = !!legacy.cgpt_pq_last_open;

  return settings;
}
