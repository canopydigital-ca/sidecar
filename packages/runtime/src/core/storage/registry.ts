import { StorageSlice } from "./types";
import { DEFAULT_SETTINGS, GlobalSettings, migrateToV1 } from "../../features/settings/schema";
import { compress, decompress } from "../encoding";

// --- Settings Slice ---
export const settingsSlice: StorageSlice<GlobalSettings> = {
  key: "cgpt:settings",
  area: "sync",
  version: 1,
  defaultValue: DEFAULT_SETTINGS,
  legacyKeys: [
    "cgptWide", "cgptInputCollapsed", "cgptInputHeight", "cgptInputHeightExpanded",
    "cgptFontName", "cgptFontCss", "cgptHideThinking", "cgptHideTopPicker",
    "cgptCollapseCode", "enableProjects",
    "cgptStatusbar", "cgptStatusbarStatsAlign", "cgptStatMessages",
    "cgptStatWords", "cgptStatTokens", "cgptStatCost",
    "cgpt_pq_muted", "cgpt_pq_pause_when_hidden", "cgpt_pq_last_open"
  ],
  migrate: (current: any, legacy: any) => {
    // If we already have a versioned settings object, rely on it (or minor migrations)
    if (current && current.version >= 1) return current;
    
    // Otherwise full migration
    return migrateToV1(current, legacy);
  }
};

// --- Sidebar Slice ---
export interface SidebarState {
  width: number | null;
}

export const sidebarSlice: StorageSlice<SidebarState> = {
  key: "cgpt:sidebar",
  area: "local",
  version: 1,
  defaultValue: { width: null },
  legacyKeys: ["cgptSidebarWidth"],
  migrate: (current: any, legacy: any) => {
    if (current && typeof current.width !== 'undefined') return current;
    
    // Migration
    if (typeof legacy.cgptSidebarWidth === 'number') {
      return { width: legacy.cgptSidebarWidth };
    }
    return null;
  }
};

// --- Prompts Slice ---
export interface PromptItem {
  id: string;
  title?: string;
  text: string;
  tags?: string[];
}

export const promptsSlice: StorageSlice<PromptItem[]> = {
  key: "cgpt:prompts",
  area: "local",
  version: 1,
  defaultValue: [],
  legacyKeys: ["prompts"],
  migrate: (current: any, legacy: any) => {
    if (Array.isArray(current)) return current;
    
    if (Array.isArray(legacy.prompts)) {
      // Ensure IDs
      return legacy.prompts.map((p: any) => ({
        ...p,
        id: p.id || crypto.randomUUID()
      }));
    }
    return null;
  },
  encode: async (items) => {
    return Promise.all(items.map(async (p) => ({ ...p, text: await compress(p.text) })));
  },
  decode: async (items) => {
    if (!Array.isArray(items)) return [];
    return Promise.all(items.map(async (p) => ({ ...p, text: await decompress(p.text) })));
  }
};

// --- Recent Prompts Slice ---
export interface RecentPromptItem {
  id: string;
  text: string;
  ts: number;
  url?: string;
}

export const recentPromptsSlice: StorageSlice<RecentPromptItem[]> = {
  key: "cgpt:recentPrompts",
  area: "local",
  version: 1,
  defaultValue: [],
  legacyKeys: ["cgptRecentPrompts"],
  migrate: (current: any, legacy: any) => {
    if (Array.isArray(current)) return current;
    
    if (Array.isArray(legacy.cgptRecentPrompts)) {
      return legacy.cgptRecentPrompts.map((p: any) => ({
        ...p,
        id: p.id || crypto.randomUUID()
      }));
    }
    return null;
  },
  encode: async (items) => {
    return Promise.all(items.map(async (p) => ({ ...p, text: await compress(p.text) })));
  },
  decode: async (items) => {
    if (!Array.isArray(items)) return [];
    return Promise.all(items.map(async (p) => ({ ...p, text: await decompress(p.text) })));
  }
};
