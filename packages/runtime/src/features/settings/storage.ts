import { Settings, UIState } from "../../core/types";
import { FLAGS } from "../../core/constants";
import { applyFontChoice } from "../fonts/fonts";
import { applyWideMode } from "../dock/wide";
import { GlobalSettings, DEFAULT_SETTINGS } from "./schema";
import { storageService } from "../../core/storage/index";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function resetSettingsCache(): void {
  // No-op: Cache is managed by core storage service now
}

export function peekSettings(): GlobalSettings {
  return storageService.settings.value ?? DEFAULT_SETTINGS;
}

/**
 * Gets the global settings, handling migration from legacy local storage if needed.
 */
export async function getSettings(): Promise<GlobalSettings> {
  // Ensure init
  if (!storageService.settings.loaded) {
    await storageService.settings.init();
  }
  return storageService.settings.value;
}

/**
 * Updates settings with a deep patch.
 * Debounces writes to sync storage.
 */
export async function updateSettings(patch: DeepPartial<GlobalSettings>): Promise<void> {
  // Ensure loaded before update to avoid overwriting with defaults if called too early
  if (!storageService.settings.loaded) {
    await storageService.settings.init();
  }
  
  storageService.settings.update((current: GlobalSettings) => {
    // Clone to avoid mutation issues if any
    const next = JSON.parse(JSON.stringify(current));
    mergeDeep(next, patch);
    return next;
  });
}

function mergeDeep(target: any, source: any) {
  if (!source) return target;
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

export function subscribeSettings(cb: (s: GlobalSettings) => void): () => void {
  // We can subscribe to the store's underlying value changes if exposed, 
  // or just use the global storage change listener that the core/storage might already have?
  // Actually, PersistedStore relies on manual updates or reload. 
  // But we need to listen to EXTERNAL changes (sync from other devices).
  // The core storage registry doesn't auto-subscribe to chrome.storage.onChanged for everything yet, 
  // but let's check if we can reuse the existing pattern or if we need to add it to core.
  
  // For now, we'll keep a local listener that updates the core store if external change happens,
  // OR we can rely on the fact that core/storage should probably handle this.
  // Given the constraints, let's keep the listener here but update the core store when it fires.
  
  const handler = (changes: any, area: string) => {
    if (area === "sync" && changes["cgpt:settings"]) {
      const newVal = changes["cgpt:settings"].newValue;
      if (newVal) {
        // Update core store without triggering save (since it came from storage)
        // We don't have a public "setWithoutSave" yet, but setting it will trigger save 
        // which is redundant but safe (debounced). 
        // Ideally we should just update the in-memory value.
        storageService.settings.set(newVal); 
        cb(newVal);
      }
    }
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}

// --- Compatibility Bridge for Legacy Code ---

export async function loadSettingsFromStorage(settings: Settings, uiState: UIState) {
  // Ensure init
  await getSettings();

  // Settings are now read directly from storage service via proxy in state.ts
  // so we don't need to manually assign them here.
  // uiState properties that are persisted (like inputCollapsed) are also proxied.
  
  // Apply immediate side effects
  const global = peekSettings();
  applyFontChoice({
    inputCollapsed: global.ui.inputCollapsed,
    inputHeight: global.ui.inputHeight,
    inputHeightExpanded: global.ui.inputHeightExpanded,
    fontName: global.ui.fontName,
    fontCss: global.ui.fontCss
  });
  applyWideMode(global.ui.wideMode);
}

// Deprecated: prefer updateSettings
export async function persistSettingsToStorage(settings: Settings) {
  await updateSettings({
    statusbar: {
      enabled: settings.statusbarOn,
      statsAlign: settings.statusbarStatsAlign,
      showMessages: settings.statMessages,
      showWords: settings.statWords,
      showTokens: settings.statTokens,
      showCost: settings.statCost
    },
    ui: {
      hideThinking: settings.hideThinking,
      hideTopPicker: settings.hideTopPicker,
      collapseCode: settings.collapseCode,
      enableProjects: settings.enableProjects
    }
  });
}
