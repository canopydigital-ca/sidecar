import { vi } from 'vitest';

type ChromeStorageArea = {
  get: (keys?: string[] | string | Record<string, unknown> | null) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (keys: string[] | string) => Promise<void>;
  clear: () => Promise<void>;
};

function createStorageArea(): ChromeStorageArea {
  return {
    get: vi.fn(async () => ({})),
    set: vi.fn(async () => {}),
    remove: vi.fn(async () => {}),
    clear: vi.fn(async () => {}),
  };
}

if (!('chrome' in globalThis)) {
  // Minimal Chrome extension API surface for unit tests (jsdom).
  // Keeps storage helpers from throwing and reduces noisy console output.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).chrome = {
    runtime: {
      getURL: (path: string) => `chrome-extension://test/${path.replace(/^\/+/, '')}`,
    },
    storage: {
      local: createStorageArea(),
      sync: createStorageArea(),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  };
}

if (typeof Element !== 'undefined' && !(Element.prototype as any).animate) {
  // Svelte transitions call `element.animate(...)`. JSDOM doesn't implement it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).animate = () => ({
    cancel: () => {},
    finished: Promise.resolve(),
    onfinish: null,
  });
}
