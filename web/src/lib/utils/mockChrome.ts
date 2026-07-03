export function setupMockChrome() {
    if (typeof window === 'undefined') return;
  
    if (!window.chrome) {
      window.chrome = {} as any;
    }
  
    if (!window.chrome.runtime) {
      window.chrome.runtime = {
        getURL: (path: string) => `/_extension_assets/${path}`,
        onMessage: {
          addListener: () => {},
          removeListener: () => {},
          hasListener: () => false
        },
        sendMessage: () => Promise.resolve(),
        getManifest: () => ({ version: '1.0.0' }),
        id: 'mock-extension-id'
      } as any;
    }
  
    const mockStorage = {
      get: (_keys: any) => Promise.resolve({}),
      set: (_items: any) => Promise.resolve(),
      remove: (_keys: any) => Promise.resolve(),
      clear: () => Promise.resolve(),
      onChanged: {
        addListener: () => {},
        removeListener: () => {},
        hasListener: () => false
      }
    };
  
    if (!window.chrome.storage) {
      window.chrome.storage = {
        local: mockStorage,
        sync: mockStorage,
        session: mockStorage,
        managed: mockStorage
      } as any;
    }
    
    if(!window.chrome.i18n) {
        window.chrome.i18n = {
            getMessage: (key: string) => key,
            getUILanguage: () => 'en-US',
            detectLanguage: (text: string, cb: any) => cb({languages: [{language: 'en', percentage: 100}]})
        } as any;
    }
  }
