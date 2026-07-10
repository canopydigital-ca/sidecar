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

// AMO requires a stable add-on id in browser_specific_settings.gecko for MV2.
const FIREFOX_GECKO_ID = 'sidecar@canopydigital.ca';
// Baseline: MV2 browser_specific_settings + fetch(runtime.getURL) manual CSS +
// Shadow DOM constructable stylesheets. 109 is a safe modern floor.
const FIREFOX_MIN_VERSION = '109.0';

// The chatgpt-dock content script injects its CSS manually (fetch + Shadow DOM),
// so the stylesheet must never appear in content_scripts[].css — otherwise the
// browser also injects it into the ChatGPT page document (Tailwind preflight leak).
const MANUAL_DOCK_CSS = 'content-scripts/chatgpt-dock.css';

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
    const isFirefox = env.browser === 'firefox';
    return {
      name: 'ChatGPT Dock (UI + Perf)',
      ...(isFirefox
        ? {
            browser_specific_settings: {
              gecko: {
                id: FIREFOX_GECKO_ID,
                strict_min_version: FIREFOX_MIN_VERSION,
              },
            },
          }
        : {}),
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

  hooks: {
    // Guarantee the manual CSS path is the ONLY one on every browser/manifest
    // version. WXT is *supposed* to honour cssInjectionMode:'manual' (and does
    // for MV3), but MV2 code paths have regressed before: the stylesheet can
    // leak back into content_scripts[].css, which double-injects it into the
    // ChatGPT page document (Tailwind preflight leak) and — because WXT drops
    // manifest-injected CSS from web_accessible_resources — simultaneously
    // breaks the runtime fetch(). Strip it here and re-assert it in the WAR so
    // the outcome is deterministic regardless of WXT's internal behaviour.
    'build:manifestGenerated'(wxt, manifest) {
      const anyManifest = manifest as {
        content_scripts?: Array<{ css?: string[] }>;
        web_accessible_resources?: Array<
          string | { resources?: string[]; matches?: string[] }
        >;
      };

      for (const script of anyManifest.content_scripts ?? []) {
        if (!script.css) continue;
        script.css = script.css.filter((file) => !file.includes('chatgpt-dock.css'));
        if (script.css.length === 0) delete script.css;
      }

      // Re-assert the manual CSS as a web-accessible resource (WXT can drop it
      // when it was manifest-injected). Shape depends on the manifest version.
      const war = (anyManifest.web_accessible_resources ??= []);
      if (wxt.config.manifestVersion === 2) {
        const flat = war as string[];
        if (!flat.includes(MANUAL_DOCK_CSS)) flat.push(MANUAL_DOCK_CSS);
      } else {
        const objects = war as Array<{ resources?: string[]; matches?: string[] }>;
        const present = objects.some((entry) =>
          typeof entry === 'object' && (entry.resources ?? []).includes(MANUAL_DOCK_CSS),
        );
        if (!present) {
          const first = objects.find((entry) => typeof entry === 'object');
          if (first) {
            (first.resources ??= []).push(MANUAL_DOCK_CSS);
          } else {
            objects.push({ resources: [MANUAL_DOCK_CSS], matches: [...CORE_WAR_MATCHES] });
          }
        }
      }
    },
  },
});
