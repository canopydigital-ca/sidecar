import { PersistedStore } from "./store.svelte.js";
import { settingsSlice, sidebarSlice, promptsSlice, recentPromptsSlice } from "./registry";

class StorageService {
  settings = new PersistedStore(settingsSlice);
  sidebar = new PersistedStore(sidebarSlice);
  prompts = new PersistedStore(promptsSlice);
  recentPrompts = new PersistedStore(recentPromptsSlice);

  async init() {
    await Promise.all([
      this.settings.init(),
      this.sidebar.init(),
      this.prompts.init(),
      this.recentPrompts.init()
    ]);
  }
}

export const storageService = new StorageService();
