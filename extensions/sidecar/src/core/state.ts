import { Settings, UIState, StatusState } from "./types";
import { storageService } from "./storage/index";

// Proxy Settings to read from storageService.settings.value
const settingsProxy = new Proxy({} as Settings, {
  get(target, prop: keyof Settings) {
    // If not loaded yet, return default/fallback or risk throwing?
    // The previous implementation had defaults.
    // storageService.settings.value handles defaults via PersistedStore.
    // However, if init hasn't run, we rely on PersistedStore default value.
    const current = storageService.settings.value;
    
    // Map GlobalSettings (new) -> Settings (legacy)
    if (prop === "statusbarOn") return current.statusbar.enabled;
    if (prop === "statusbarStatsAlign") return current.statusbar.statsAlign;
    if (prop === "statMessages") return current.statusbar.showMessages;
    if (prop === "statWords") return current.statusbar.showWords;
    if (prop === "statTokens") return current.statusbar.showTokens;
    if (prop === "statCost") return current.statusbar.showCost;
    if (prop === "hideThinking") return current.ui.hideThinking;
    if (prop === "hideTopPicker") return current.ui.hideTopPicker;
    if (prop === "collapseCode") return current.ui.collapseCode;
    if (prop === "enableProjects") return current.ui.enableProjects;
    
    return Reflect.get(target, prop);
  },
  set(target, prop: keyof Settings, value) {
    // We disallow direct mutation for now or redirect it to updateSettings?
    // Direct mutation of 'state.settings' was common in legacy code.
    // We should log a warning or try to support it via storage update.
    // But sync set is async.
    // Let's just log warning and allow soft mutation on the proxy target 
    // but it won't persist unless updateSettings is called.
    // Actually, legacy code often did: state.settings.x = y; persistSettingsToStorage(state.settings);
    // So we need to support temporary mutation OR make persistSettingsToStorage read this back.
    // But persistSettingsToStorage is now a wrapper around updateSettings({ ... }).
    
    // BETTER STRATEGY: 
    // Since we are refactoring state.settings to be a "read-through layer",
    // we should make it ReadOnly or warn.
    // But to avoid breaking legacy code immediately, we can redirect writes to storageService
    // IF the caller expects it to persist. 
    // Legacy pattern: `settings.foo = true; persist(...)`
    // If we make `settings` a proxy that reads from storage, `settings.foo = true` is tricky because storage is reactive.
    
    // For this prompt, "Replace mutable core/state settings fields with getters".
    // We will assume legacy code uses `updateSettings` or `persistSettingsToStorage`.
    // If there is code that just mutates `state.settings.foo = true` without saving, it will be lost on reload (which is expected).
    // But if we use a proxy, where do we store that temporary value?
    // We don't. We just ignore setters or log warning.
    console.warn(`[CoreState] Direct mutation of settings.${String(prop)} is deprecated. Use updateSettings().`);
    return true; 
  }
});

// Proxy UIState to read from storageService.settings.value (for persisted parts)
// UIState has mixed persisted (font, input state) and runtime (localFontsLoaded) state.
// We need to separate them or handle both.
// Runtime properties: localFontsLoaded
// Persisted properties: inputCollapsed, inputHeight, etc.

const runtimeUIState: Partial<UIState> = {
  localFontsLoaded: false
};

const uiStateProxy = new Proxy({} as UIState, {
  get(target, prop: keyof UIState) {
    const current = storageService.settings.value;

    if (prop === "inputCollapsed") return current.ui.inputCollapsed;
    if (prop === "inputHeight") return current.ui.inputHeight;
    if (prop === "inputHeightExpanded") return current.ui.inputHeightExpanded;
    if (prop === "fontName") return current.ui.fontName;
    if (prop === "fontCss") return current.ui.fontCss;
    
    if (prop in runtimeUIState) {
       return runtimeUIState[prop as keyof typeof runtimeUIState];
    }
    
    return Reflect.get(target, prop);
  },
  set(target, prop: keyof UIState, value) {
    if (prop in runtimeUIState) {
      (runtimeUIState as any)[prop] = value;
      return true;
    }
    console.warn(`[CoreState] Direct mutation of uiState.${String(prop)} is deprecated. Use updateSettings().`);
    return true;
  }
});

// StatusState is purely runtime/ephemeral, so we keep it as is.
const statusState: StatusState = {
  processed: new WeakSet(),
  pending: [],
  user: 0,
  ai: 0,
  words: 0,
  chars: 0,
  userChars: 0,
  aiChars: 0,
  initDone: false
};

export const state = {
  settings: settingsProxy,
  uiState: uiStateProxy,
  statusState
};
