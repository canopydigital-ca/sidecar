/**
 * MV3 service worker snippet: open the welcome page on first install (and optionally on major updates).
 *
 * Integration:
 * - Import this file from your existing background/service worker entry.
 * - Ensure the referenced path exists in your final extension output.
 */
const OPEN_ON_INSTALL = true;
// If you want: open on updates when major/minor bump
const OPEN_ON_MAJOR_UPDATE_ONLY = false;

function getMajor(v) {
  const m = String(v || '').match(/^(\d+)\./);
  return m ? Number(m[1]) : 0;
}

chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (!OPEN_ON_INSTALL) return;

    const url = chrome.runtime.getURL('extension_pages/welcome.html');

    if (details.reason === 'install') {
      chrome.tabs.create({ url });
      return;
    }

    if (details.reason === 'update') {
      if (!OPEN_ON_MAJOR_UPDATE_ONLY) return;
      const prevMajor = getMajor(details.previousVersion);
      const curMajor = getMajor(chrome.runtime.getManifest().version);
      if (curMajor > prevMajor) chrome.tabs.create({ url });
    }
  } catch (e) {
    // Backgrounds should never crash for something this trivial.
    console.warn('[Sidecar] onInstalled handler failed', e);
  }
});
