import { Settings, UIState, StatusState } from "./types";
import { PerfTracker } from "../features/composer/find";
import { GlobalSettings } from "../features/settings/schema";
import { DeepPartial } from "../features/settings/storage";

export interface SchedulerFlags {
  workScheduled: boolean;
  needDock: boolean;
  needInputHandle: boolean;
  needSidebarHandle: boolean;
  needModelMove: boolean;
  needHideTopModel: boolean;
  needCodeEnhance: boolean;
  isPopoverOpen: boolean;
}

export interface DockContext {
  settings: Settings;
  uiState: UIState;
  statusState: StatusState;
  flags: SchedulerFlags;
  scheduleWork: (taskName: string) => void;
  storageGet: (keys: string | string[] | Object | null) => Promise<{ [key: string]: any }>;
  storageSet: (obj: Object) => Promise<void>;
  updateSettings: (patch: DeepPartial<GlobalSettings>) => Promise<void>;
  $: (sel: string, root?: Element | Document) => Element | null;
  $$: (sel: string, root?: Element | Document) => Element[];
  trackSelectorPerformance: PerfTracker;
  toggleSidebar: () => void;
  openPopover: (kind: string, triggerBtn: HTMLElement) => void;
  closePopover: () => void;
  showToast: (msg: string) => void;
  setAllCodeCollapsed: (collapsed: boolean) => void;
  ensureStatusBar: () => void;
  updateThinkingVisibility: () => void;
  setNeedHideTopModel: (val: boolean) => void;
  resetSidebar: () => Promise<void>;
  resetStatusState: () => void;
  persistSettings: () => Promise<void>;
}
