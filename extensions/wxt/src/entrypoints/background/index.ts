import { defineBackground } from '#imports';

const OPEN_ON_INSTALL = true;
const OPEN_ON_MAJOR_UPDATE_ONLY = false;

function getMajor(version: string | undefined): number {
  const match = String(version ?? '').match(/^(\d+)\./);
  return match ? Number(match[1]) : 0;
}

export default defineBackground({
  type: 'module',
  main() {
    browser.runtime.onInstalled.addListener((details) => {
      if (!OPEN_ON_INSTALL) return;

      const url = browser.runtime.getURL('/extension_pages/welcome.html');
      if (details.reason === 'install') {
        void browser.tabs.create({ url });
        return;
      }

      if (details.reason === 'update' && OPEN_ON_MAJOR_UPDATE_ONLY) {
        const previousMajor = getMajor(details.previousVersion);
        const currentMajor = getMajor(browser.runtime.getManifest().version);
        if (currentMajor > previousMajor) {
          void browser.tabs.create({ url });
        }
      }
    });

    browser.runtime.onMessage.addListener(async (message) => {
      if (!message || typeof message !== 'object') return;

      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      const tabId = tab?.id;

      switch ((message as { type?: string }).type) {
        case 'DEV_RELOAD_TAB':
          if (tabId) await browser.tabs.reload(tabId);
          break;
        case 'DEV_HARD_RELOAD_TAB':
          if (tabId) await browser.tabs.reload(tabId, { bypassCache: true });
          break;
        case 'DEV_RELOAD_EXTENSION':
          browser.runtime.reload();
          break;
        default:
          break;
      }
    });
  },
});
