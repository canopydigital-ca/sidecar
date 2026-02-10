import { get, set } from "../storage";
import { log } from "../log";

export class PersistedStore {
  value = $state();
  loaded = $state(false);

  slice;
  _saveTimer = null;
  _saveDelay = 500;

  constructor(slice) {
    this.slice = slice;
    this.value = slice.defaultValue; // Optimistic default
  }

  async init() {
    if (this.loaded) return;

    try {
      const keys = [this.slice.key];
      if (this.slice.legacyKeys) {
        keys.push(...this.slice.legacyKeys);
      }

      const primaryData = await get(this.slice.area, [this.slice.key]);
      let data = primaryData[this.slice.key];

      // Migration logic
      let shouldSave = false;
      if (this.slice.migrate) {
        // Fetch legacy data if needed (usually local)
        let legacyData = {};
        if (this.slice.legacyKeys && this.slice.legacyKeys.length > 0) {
          // Assume legacy is always local for now as per audit
          legacyData = await get("local", this.slice.legacyKeys);
        }

        const migrated = this.slice.migrate ? this.slice.migrate(data, legacyData) : null;

        if (migrated) {
          data = migrated;
          shouldSave = true;
        }
      }


      if (data !== undefined && data !== null) {
        if (this.slice.decode) {
          data = await this.slice.decode(data);
        }
        this.value = data;
      }

      if (shouldSave) {
        // Trigger immediate save for migration
        this.saveNow();
      }
    } catch (e) {
      log.error(`[Store] Init failed for ${this.slice.key}`, e);
    } finally {
      this.loaded = true;
    }
  }

  update(fn) {
    this.value = fn(this.value);
    this.scheduleSave();
  }

  set(val) {
    this.value = val;
    this.scheduleSave();
  }

  scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this.saveNow();
    }, this._saveDelay);
  }

  async saveNow() {
    this._saveTimer = null;
    try {
      let valToSave = this.value;
      if (this.slice.encode) {
        valToSave = await this.slice.encode(valToSave);
      }
      await set(this.slice.area, { [this.slice.key]: valToSave });
    } catch (e) {
      log.error(`[Store] Save failed for ${this.slice.key}`, e);
    }
  }
}
