import { get, set } from "../storage";
import { log } from "../log";
import type { StorageSlice } from "./types";

export class PersistedStore<T> {
  value = $state<T>(undefined as T);
  loaded = $state(false);

  slice: StorageSlice<T>;
  _saveTimer: ReturnType<typeof setTimeout> | null = null;
  _saveDelay = 500;

  constructor(slice: StorageSlice<T>) {
    this.slice = slice;
    this.value = slice.defaultValue;
  }

  async init(): Promise<void> {
    if (this.loaded) return;

    try {
      const primaryData = await get<Record<string, unknown>>(this.slice.area, [
        this.slice.key,
      ]);
      let data = primaryData[this.slice.key];

      let shouldSave = false;
      if (this.slice.migrate) {
        let legacyData: Record<string, unknown> = {};
        if (this.slice.legacyKeys && this.slice.legacyKeys.length > 0) {
          legacyData = await get<Record<string, unknown>>(
            "local",
            this.slice.legacyKeys,
          );
        }

        const migrated = this.slice.migrate(data, legacyData);
        if (migrated) {
          data = migrated;
          shouldSave = true;
        }
      }

      if (data !== undefined && data !== null) {
        if (this.slice.decode) {
          data = await this.slice.decode(data);
        }
        this.value = data as T;
      }

      if (shouldSave) {
        await this.saveNow();
      }
    } catch (error) {
      log.error(`[Store] Init failed for ${this.slice.key}`, error);
    } finally {
      this.loaded = true;
    }
  }

  update(fn: (value: T) => T): void {
    this.value = fn(this.value);
    this.scheduleSave();
  }

  set(value: T): void {
    this.value = value;
    this.scheduleSave();
  }

  scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      void this.saveNow();
    }, this._saveDelay);
  }

  async saveNow(): Promise<void> {
    this._saveTimer = null;
    try {
      let valueToSave: unknown = this.value;
      if (this.slice.encode) {
        valueToSave = await this.slice.encode(this.value);
      }
      await set(this.slice.area, { [this.slice.key]: valueToSave });
    } catch (error) {
      log.error(`[Store] Save failed for ${this.slice.key}`, error);
    }
  }
}
