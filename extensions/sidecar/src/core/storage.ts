import { stopObserver } from "./observer";
import { showToastOnce } from "./toast";
import { formatError } from "./errors";

let __cgptContextDead = false;

function isContextInvalidated(err: any) {
  const msg = String(err?.message || err || "");
  return msg.includes("Extension context invalidated");
}

export function onContextInvalidated(err: any) {
  if (__cgptContextDead) return;
  __cgptContextDead = true;

  stopObserver();
  showToastOnce("invalidation", "Extension reloaded. Refresh this tab.");

  try {
    const dock = document.getElementById("cgpt-dock");
    if (dock) dock.style.opacity = "0.5";
  } catch { }
}

export function isDeadContext() {
  return __cgptContextDead;
}

export type StorageArea = "local" | "sync";

// Simple in-memory cache
const _cache: Record<StorageArea, Record<string, any>> = {
  local: {},
  sync: {}
};

/**
 * Low-level safe wrapper around chrome.storage.
 * @param area - 'local' or 'sync'
 * @param key - key string, array of keys, or null for all
 */
export function get<T = any>(area: StorageArea, key: string | null | string[]): Promise<T> {
  return new Promise((resolve) => {
    if (__cgptContextDead) return resolve({} as T);

    if (typeof key === "string" && _cache[area][key] !== undefined) {
      // Note: We could return cached value, but chrome.storage.get always returns object
    }

    try {
      chrome.storage[area].get(key, (res) => {
        const le = chrome.runtime?.lastError;
        if (le) {
          if (isContextInvalidated(le)) {
            onContextInvalidated(le);
            return resolve({} as T);
          }
          console.warn(`[ChatGPT Dock] storage.${area}.get failed:`, formatError(le));
          return resolve({} as T);
        }

        if (res) {
          Object.assign(_cache[area], res);
        }

        resolve(res as T);
      });
    } catch (err) {
      if (isContextInvalidated(err)) onContextInvalidated(err);
      else console.warn(`[ChatGPT Dock] storage.${area}.get exception:`, formatError(err));
      resolve({} as T);
    }
  });
}

/**
 * Sets items in chrome.storage.
 * @param area - 'local' or 'sync'
 * @param items - Object to store
 */
export function set(area: StorageArea, items: Record<string, any>): Promise<void> {
  return new Promise((resolve) => {
    if (__cgptContextDead) return resolve();

    Object.assign(_cache[area], items);

    try {
      chrome.storage[area].set(items, () => {
        const le = chrome.runtime?.lastError;
        if (le) {
          if (isContextInvalidated(le)) onContextInvalidated(le);
          else console.warn(`[ChatGPT Dock] storage.${area}.set failed:`, formatError(le));
        }
        resolve();
      });
    } catch (err) {
      if (isContextInvalidated(err)) onContextInvalidated(err);
      else console.warn(`[ChatGPT Dock] storage.${area}.set exception:`, formatError(err));
      resolve();
    }
  });
}

/**
 * Removes items from chrome.storage.
 * @param area - 'local' or 'sync'
 * @param keys - Key or array of keys
 */
export function remove(area: StorageArea, keys: string | string[]): Promise<void> {
  return new Promise((resolve) => {
    if (__cgptContextDead) return resolve();

    const kList = Array.isArray(keys) ? keys : [keys];
    for (const k of kList) {
      delete _cache[area][k];
    }

    try {
      chrome.storage[area].remove(keys, () => {
        const le = chrome.runtime?.lastError;
        if (le) {
          if (isContextInvalidated(le)) onContextInvalidated(le);
          else console.warn(`[ChatGPT Dock] storage.${area}.remove failed:`, formatError(le));
        }
        resolve();
      });
    } catch (err) {
      if (isContextInvalidated(err)) onContextInvalidated(err);
      else console.warn(`[ChatGPT Dock] storage.${area}.remove exception:`, formatError(err));
      resolve();
    }
  });
}

/**
 * Legacy wrapper for backward compatibility.
 * Prefer `get` instead.
 * @deprecated
 */
export function storageGet<T = any>(keys: string | string[] | Object | null): Promise<T> {
  return new Promise((resolve) => {
    const fallback = (keys && typeof keys === "object" && !Array.isArray(keys) ? keys : {}) as T;
    if (__cgptContextDead) return resolve(fallback);

    try {
      chrome.storage.local.get(keys, (res) => {
        const le = chrome.runtime?.lastError;
        if (le) {
          if (isContextInvalidated(le)) {
            onContextInvalidated(le);
            return resolve(fallback);
          }
          return resolve(fallback);
        }
        resolve(res as T);
      });
    } catch (err) {
      if (isContextInvalidated(err)) onContextInvalidated(err);
      resolve(fallback);
    }
  });
}

/**
 * Legacy wrapper for backward compatibility.
 * Prefer `set` instead.
 * @deprecated
 */
export function storageSet(obj: Object): Promise<void> {
  return set('local', obj as Record<string, any>);
}
