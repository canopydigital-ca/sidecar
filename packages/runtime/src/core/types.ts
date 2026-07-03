export interface Settings {
  statusbarOn: boolean;
  statusbarStatsAlign: 'left' | 'center';
  statMessages: boolean;
  statWords: boolean;
  statTokens: boolean;
  statCost: boolean;
  hideThinking: boolean;
  hideTopPicker: boolean;
  collapseCode: boolean;
  enableProjects?: boolean;
}

export interface UIState {
  inputCollapsed: boolean;
  inputHeight: number | null;
  inputHeightExpanded: number | null;
  fontName: string;
  fontCss: string | null;
  // Dynamic flags
  localFontsLoaded?: boolean;
}

export interface StatusState {
  processed: WeakSet<Element>;
  pending: Element[];
  user: number;
  ai: number;
  words: number;
  chars: number;
  userChars: number;
  aiChars: number;
  initDone: boolean;
}

export interface PromptItem {
  id: string;
  text: string;
  title?: string;
  ts?: number;
  url?: string;
}
