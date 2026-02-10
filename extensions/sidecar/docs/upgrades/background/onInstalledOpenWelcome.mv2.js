/**
 * MV2 background page snippet: open the welcome page on first install.
 *
 * Integration:
 * - Include this in your MV2 background script bundle.
 * - Ensure welcome.html exists in the MV2 build output.
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('extension_pages/welcome.html') });
  }
});
