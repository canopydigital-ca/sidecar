import { DockContext } from "../core/context";
import { ProgressQuestRenderer, ProgressQuestSummary, type ProgressQuestThemeTokens } from "./renderers/ProgressQuestRenderer";
import { getSettings, updateSettings } from "../features/settings/storage";

type PqSettings = {
  pauseWhenHidden: boolean;
  muted: boolean;
  lastOpen: boolean;
};

export type PqSaveRecord = {
  ts: number;
  data: unknown;
};

function defaultSettings(): PqSettings {
  return {
    pauseWhenHidden: true,
    muted: false,
    lastOpen: false,
  };
}

const KEYS = {
  // Legacy keys (still used for reference/cleanup if needed, but primary is GlobalSettings)
  pauseWhenHidden: "cgpt_pq_pause_when_hidden",
  muted: "cgpt_pq_muted",
  lastOpen: "cgpt_pq_last_open",
  
  // Data keys (Local only - keep using storageGet/Set via ctx for these)
  saveLatest: "cgpt_pq_save_latest",
  saveBackups: "cgpt_pq_save_backups",
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

function rosterStamp(payload: unknown): number {
  if (!isRecord(payload)) return -1;
  const roster = (payload as any).roster;
  if (!isRecord(roster)) return -1;
  let best = -1;
  for (const sheet of Object.values(roster)) {
    const stampRaw = (sheet as any)?.stamp;
    const stamp = typeof stampRaw === "number" ? stampRaw : typeof stampRaw === "string" ? Number(stampRaw) : NaN;
    if (Number.isFinite(stamp) && stamp > best) best = stamp;
  }
  return best;
}

class ProgressQuestService {
  private renderer = new ProgressQuestRenderer();
  private hiddenHost: HTMLElement | null = null;
  private panelHost: HTMLElement | null = null;
  private pollInterval: number | null = null;
  private backupInterval: number | null = null;
  private lastPollAt = 0;
  private lastBackupAt = 0;
  private lastSummary: ProgressQuestSummary | null = null;
  private isOpen = false;
  private userPaused = false;
  private settings: PqSettings = defaultSettings();
  private didAutoOpen = false;
  private initialized = false;
  private restoreRetry = false;
  private themeTokens: ProgressQuestThemeTokens | null = null;
  private visibilityBound = false;

  onUiAction: ((action: string) => void) | null = null;

  async init(ctx: DockContext) {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Fetch Game Data from Local Storage (via legacy ctx methods or direct local)
    // Game saves are large, so they stay in local.
    const localRes = await ctx.storageGet({
      [KEYS.saveLatest]: null,
      [KEYS.saveBackups]: [],
    });

    // 2. Fetch Settings from Sync (GlobalSettings)
    const globalSettings = await getSettings();

    // 3. Apply settings
    this.settings.pauseWhenHidden = globalSettings.pq.pauseWhenHidden;
    this.settings.muted = globalSettings.pq.muted;
    this.settings.lastOpen = globalSettings.pq.lastOpen;

    this.renderer.onSummary = (s) => {
      this.lastSummary = s;
    };
    this.renderer.onError = (e) => {
      console.warn("PQ Service received error:", e);
      // Attempt to recover from load failures by re-injecting the latest save if available
      if (e.includes("Error loading") || e === "GameStateMissing") {
         // Debounce or limit retries could be added here
      }
    };
    this.renderer.onUiAction = (action) => {
        this.onUiAction?.(action);
    };

    this.ensureHiddenMounted();
    this.renderer.mount(this.hiddenHost!);
    if (this.settings.pauseWhenHidden) {
      this.renderer.pause();
    }
    this.applyMuted();
    this.startPolling(ctx);
    this.startBackups(ctx);
    this.bindVisibility();
    void this.restoreIfNeeded(ctx, localRes[KEYS.saveLatest]);

    if (this.settings.lastOpen && !this.didAutoOpen) {
      this.didAutoOpen = true;
      // We don't auto-open anymore, but we ensure state is loaded
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  async resetSettings(ctx: DockContext) {
    this.settings = defaultSettings();
    await updateSettings({
        pq: {
            pauseWhenHidden: this.settings.pauseWhenHidden,
            muted: this.settings.muted,
            lastOpen: this.settings.lastOpen
        }
    });
    this.applyMuted();
    this.applyVisibilityPolicy();
  }

  getLastSummary() {
    return this.lastSummary;
  }

  async refreshSummary(timeoutMs = 1500): Promise<ProgressQuestSummary | null> {
    if (!this.renderer.isRunning()) return this.lastSummary;
    try {
      const summary = await this.renderer.getSummary(timeoutMs);
      this.lastSummary = summary;
      return summary;
    } catch {
      return this.lastSummary;
    }
  }

  async exportSaveNow(ctx: DockContext, timeoutMs = 3000): Promise<unknown> {
    if (!this.renderer.isRunning()) throw new Error("ProgressQuest is not ready");
    const payload = await this.renderer.exportSave(timeoutMs);
    const rec: PqSaveRecord = { ts: Date.now(), data: payload };
    await ctx.storageSet({ [KEYS.saveLatest]: rec });
    return payload;
  }

  async setPauseWhenHidden(ctx: DockContext, value: boolean) {
    this.settings.pauseWhenHidden = value;
    await updateSettings({ pq: { pauseWhenHidden: value } });
    this.applyVisibilityPolicy();
  }

  async setMuted(ctx: DockContext, value: boolean) {
    this.settings.muted = value;
    await updateSettings({ pq: { muted: value } });
    this.applyMuted();
  }

  async setLastOpen(ctx: DockContext, value: boolean) {
    this.settings.lastOpen = value;
    await updateSettings({ pq: { lastOpen: value } });
  }

  attachToPanel(host: HTMLElement, ctx: DockContext) {
    if (this.panelHost === host) return;
    this.panelHost = host;
    
    this.renderer.mount(host);
    this.isOpen = true;
    this.setLastOpen(ctx, true);
    this.renderer.resume(); // Always resume when open
    this.applyTheme();
  }

  detachFromPanel(ctx: DockContext) {
    this.panelHost = null;
    this.isOpen = false;
    this.setLastOpen(ctx, false);
    
    this.ensureHiddenMounted();
    this.renderer.mount(this.hiddenHost!);
    
    this.applyVisibilityPolicy();
  }

  pause() {
    this.userPaused = true;
    this.renderer.pause();
  }

  resume() {
    this.userPaused = false;
    this.applyVisibilityPolicy();
  }

  popOut(mode: "light" | "dark") {
    try {
      const url = typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL(`pq/pq-host.html?mode=${mode}`) : `pq/pq-host.html?mode=${mode}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
    }
  }

  async listBackups(ctx: DockContext): Promise<PqSaveRecord[]> {
    const res = await ctx.storageGet({ [KEYS.saveBackups]: [] as PqSaveRecord[] });
    const list = res[KEYS.saveBackups];
    return Array.isArray(list) ? list : [];
  }

  async restoreBackup(ctx: DockContext, ts: number) {
    const list = await this.listBackups(ctx);
    const rec = list.find((r) => typeof r?.ts === "number" && r.ts === ts);
    if (!rec) return;
    await this.importSaveNow(ctx, rec.data);
  }

  async importSaveNow(ctx: DockContext, payload: unknown) {
    await this.renderer.importSave(payload);
    const rec: PqSaveRecord = { ts: Date.now(), data: payload };
    await ctx.storageSet({ [KEYS.saveLatest]: rec });
    this.lastSummary = null;
  }

  private ensureHiddenMounted() {
    if (this.hiddenHost) return;
    this.hiddenHost = document.createElement("div");
    this.hiddenHost.style.display = "none";
    this.hiddenHost.id = "cgpt-pq-hidden-host";
    document.body.appendChild(this.hiddenHost);
  }

  private applyVisibilityPolicy() {
    if (this.userPaused) {
      this.renderer.pause();
      return;
    }
    if (this.isOpen) {
        this.renderer.resume();
        return;
    }
    if (this.settings.pauseWhenHidden) {
        this.renderer.pause();
    } else {
        this.renderer.resume();
    }
  }

  private applyMuted() {
    this.renderer.setMuted(this.settings.muted);
  }

  private startPolling(ctx: DockContext) {
    if (this.pollInterval) return;
    this.pollInterval = window.setInterval(() => {
        const now = Date.now();
        if (now - this.lastPollAt < 1000) return;
        this.lastPollAt = now;
        
        // Only poll if running
        if (!this.renderer.isRunning()) return;

        // Force a save to string? No, just let it run.
        // We might want to periodically get state to update badge
    }, 2000);
  }

  private startBackups(ctx: DockContext) {
    if (this.backupInterval) return;
    // Backup every 5 minutes?
    this.backupInterval = window.setInterval(() => {
        void this.performBackup(ctx);
    }, 5 * 60 * 1000);
  }

  private async performBackup(ctx: DockContext) {
      if (!this.renderer.isRunning()) return;
      
      let payload: unknown;
      try {
        payload = await this.renderer.exportSave();
      } catch {
        return;
      }

      const now = Date.now();
      const rec: PqSaveRecord = { ts: now, data: payload };

      // Save latest
      await ctx.storageSet({ [KEYS.saveLatest]: rec });
      
      // Rotate backups?
      // For now just keep latest
  }

  private async restoreIfNeeded(ctx: DockContext, latest: PqSaveRecord | null | undefined) {
      if (!latest || !latest.data) {
          // New game?
          return;
      }
      // Check if renderer has state?
      // We just blindly load for now.
      try {
          await this.renderer.importSave(latest.data);
      } catch (e) {
          console.error("Failed to restore PQ save", e);
      }
  }
  
  private bindVisibility() {
      if (this.visibilityBound) return;
      this.visibilityBound = true;
      document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
              // Browser tab hidden
              // We might want to pause to save resources, but PQ is an idle game...
              // If user wants "pause when hidden" (meaning panel hidden), that's handled by applyVisibilityPolicy
              // But if the whole TAB is hidden, we might need to rely on workers or just let it throttle.
              // Chrome throttles RAF when hidden. PQ renderer relies on RAF.
              // So it effectively pauses.
          } else {
              // Resume
          }
      });
  }

  setTheme(tokens: ProgressQuestThemeTokens) {
      this.themeTokens = tokens;
      this.applyTheme();
  }

  private applyTheme() {
      if (this.themeTokens) {
          this.renderer.setTheme(this.themeTokens);
      }
  }
}

const service = new ProgressQuestService();
export function getProgressQuestService() {
  return service;
}
