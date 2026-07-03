import { defineConfig } from 'wxt';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CORE_HOSTS = [
  'https://chatgpt.com/*',
  'https://chat.openai.com/*',
] as const;

const CORE_WAR_MATCHES = [
  ...CORE_HOSTS,
  'https://*.chatgpt.com/*',
] as const;

const DEMO_HOSTS = [
  'http://localhost/*',
  'http://127.0.0.1/*',
] as const;

const EXTENSION_PAGE_CSP = [
  "script-src 'self'",
  "object-src 'self'",
  "img-src 'self' data: https://game-icons.net",
].join('; ');

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  targetBrowsers: ['chrome', 'edge', 'firefox'],

  vite: (env) => {
    const isDev = env.mode !== 'production';
    return {
      plugins: [tailwindcss()],
      define: {
        __FEATURE_PQ__: JSON.stringify(true),
        __FEATURE_PETS__: JSON.stringify(true),
        __BUILD_MODE__: JSON.stringify(env.mode),
        __DEV__: JSON.stringify(isDev),
        'process.env.NODE_ENV': JSON.stringify(env.mode),
      },
      resolve: {
        alias: {
          '@sidecar/runtime': resolve(__dirname, '../../packages/runtime/src'),
          '@sidecar/runtime-root': resolve(__dirname, '../../packages/runtime'),
          '@sidecar/ui': resolve(__dirname, '../../packages/ui/src'),
          '@sidecar/host-chatgpt': resolve(__dirname, '../../packages/host-chatgpt/src'),
          '@sidecar/addons/pets': resolve(__dirname, '../../packages/addons/pets/src'),
          '@sidecar/addons/progressquest': resolve(__dirname, '../../packages/addons/progressquest/src'),
          '@icons': resolve(__dirname, '../../packages/icons'),
        },
      },
    };
  },

  outDirTemplate: '{{browser}}',
  zip: {
    artifactTemplate: 'sidecar-v{{packageVersion}}-{{browser}}.zip',
  },

  manifest: (env) => {
    const isDev = env.mode !== 'production';
    return {
      name: 'ChatGPT Dock (UI + Perf)',
      description:
        'Dock UI for ChatGPT: wide mode, resizable sidebar, moved model picker, per-block code collapse, input resize handle + collapse/restore, fonts picker, prompts saver + recent prompts, settings + status bar (idle/chunked).',
      permissions: ['storage'],
      // Legacy requested only game-icons.net host access. Keep parity here.
      host_permissions: ['https://game-icons.net/*'],
      icons: {
        16: '/icon/16.png',
        32: '/icon/32.png',
        48: '/icon/48.png',
        96: '/icon/96.png',
        128: '/icon/128.png',
      },
      action: {
        default_title: 'ChatGPT Dock (UI + Perf)',
      },
      web_accessible_resources: [
        {
          resources: [
            'extension_pages/*',
            'pets/*',
            'pq/*',
            'vendor/*',
            'icon/*',
            'content-scripts/chatgpt-dock.css',
          ],
          matches: isDev
            ? [...CORE_WAR_MATCHES, ...DEMO_HOSTS]
            : [...CORE_WAR_MATCHES],
        },
      ],
      content_security_policy: {
        extension_pages: EXTENSION_PAGE_CSP,
      },
    };
  },
});
