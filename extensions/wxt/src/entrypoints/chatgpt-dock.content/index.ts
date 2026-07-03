import { bootChatGptHost } from '@sidecar/host-chatgpt';
import { configureRuntimeStyles } from '@sidecar/runtime/ui/styles';
import legacyDocumentCss from '@sidecar/runtime-root/styles.css?inline';
import { defineContentScript } from '#imports';
import { splitShadowRootCss } from 'wxt/utils/split-shadow-root-css';

import '@sidecar/runtime/ui/app.css';

const CONTENT_CSS_PATH = 'content-scripts/chatgpt-dock.css';

async function fetchContentCss(): Promise<string> {
  try {
    const url = chrome.runtime.getURL(CONTENT_CSS_PATH);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[Sidecar] Unable to load ${CONTENT_CSS_PATH}: ${response.status}`);
      return '';
    }
    return await response.text();
  } catch (error) {
    console.warn(`[Sidecar] Unable to load ${CONTENT_CSS_PATH}`, error);
    return '';
  }
}

async function configureWxtRuntimeStyles(): Promise<void> {
  const contentCss = await fetchContentCss();
  const { documentCss, shadowCss } = contentCss
    ? splitShadowRootCss(contentCss)
    : { documentCss: '', shadowCss: '' };

  configureRuntimeStyles({
    sourceLabel: 'wxt-chatgpt-dock',
    documentCssText: [legacyDocumentCss, documentCss].filter(Boolean).join('\n'),
    shadowCssText: [shadowCss, legacyDocumentCss].filter(Boolean).join('\n'),
  });
}

export default defineContentScript({
  matches: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
  runAt: 'document_idle',
  cssInjectionMode: 'manual',
  async main() {
    await configureWxtRuntimeStyles();
    await bootChatGptHost();
  },
});
