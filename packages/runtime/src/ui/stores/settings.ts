import type { GlobalSettings } from '../../features/settings/schema';
import { getSettings, updateSettings, subscribeSettings } from '../../features/settings/storage';

type Subscriber = (value: GlobalSettings) => void;

export class SettingsStore {
  private current: GlobalSettings | null = null;
  private subs = new Set<Subscriber>();
  private writeTimer: number | null = null;

  async init() {
    if (this.current) return this.current;
    this.current = await getSettings();
    this.notify();
    subscribeSettings((next) => {
      this.current = next;
      this.notify();
    });
    return this.current;
  }

  subscribe(cb: Subscriber): () => void {
    this.subs.add(cb);
    if (this.current) cb(this.current);
    return () => this.subs.delete(cb);
  }

  get(): GlobalSettings | null {
    return this.current;
  }

  async set(patch: Partial<GlobalSettings>) {
    if (this.writeTimer) window.clearTimeout(this.writeTimer);
    this.writeTimer = window.setTimeout(async () => {
      await updateSettings(patch as any);
      this.writeTimer = null;
    }, 200);
  }

  private notify() {
    if (!this.current) return;
    for (const cb of this.subs) cb(this.current);
  }
}

export const settingsStore = new SettingsStore();

export async function getSetting<K extends keyof GlobalSettings>(key: K): Promise<GlobalSettings[K]> {
  const s = await settingsStore.init();
  return s[key];
}

export async function setSetting(patch: Partial<GlobalSettings>) {
  await settingsStore.set(patch);
}

export function subscribeSetting(cb: Subscriber): () => void {
  return settingsStore.subscribe(cb);
}
