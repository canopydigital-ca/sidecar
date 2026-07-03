import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitShadowRootCss } from 'wxt/utils/split-shadow-root-css';

type Manifest = {
  content_scripts?: Array<{
    js?: string[];
    css?: string[];
    matches?: string[];
  }>;
  web_accessible_resources?: Array<string | { resources?: string[]; matches?: string[] }>;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = getArgValue('--browser') ?? 'edge';
const outputDir = join(root, '.output', browser);
const manifestPath = join(outputDir, 'manifest.json');
const contentCssPath = join(outputDir, 'content-scripts', 'chatgpt-dock.css');
const legacyDocumentCssPath = resolve(root, '..', '..', 'packages', 'runtime', 'styles.css');
const runtimeDockMountPath = resolve(root, '..', '..', 'packages', 'runtime', 'src', 'ui', 'components', 'dock', 'mountDock.ts');

const FORBIDDEN_DOCUMENT_CSS = [
  { label: 'Tailwind universal reset', pattern: /(^|})\s*\*\s*,\s*:(before|after)/i },
  { label: 'Tailwind form reset', pattern: /(^|})\s*button\s*,\s*input\s*,\s*select/i },
  { label: 'Tailwind media reset', pattern: /(^|})\s*img\s*,\s*svg\s*,\s*video/i },
  { label: 'Tailwind container utility', pattern: /(^|})\s*\.container\s*\{/i },
  { label: 'Tailwind base layer', pattern: /@layer\s+base/i },
];

const FORBIDDEN_DOCK_LOCAL_CSS = [
  { label: 'transparent dock button background override', pattern: /\.cgpt-btn\s*\{[^}]*background\s*:\s*transparent/is },
  { label: 'borderless dock button override', pattern: /\.cgpt-btn\s*\{[^}]*border\s*:\s*none/is },
  { label: 'pressed dock button visual override', pattern: /\.cgpt-btn\.pressed/is },
];

run();

function run() {
  assert(existsSync(manifestPath), `Missing manifest: ${manifestPath}`);
  assert(existsSync(contentCssPath), `Missing generated content CSS: ${contentCssPath}`);
  assert(existsSync(legacyDocumentCssPath), `Missing legacy document CSS: ${legacyDocumentCssPath}`);
  assert(existsSync(runtimeDockMountPath), `Missing runtime dock mount source: ${runtimeDockMountPath}`);

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
  const contentScripts = manifest.content_scripts ?? [];
  const chatGptDockScript = contentScripts.find((script) => (script.js ?? []).some((file) => file.includes('chatgpt-dock.js')));
  assert(chatGptDockScript, 'Manifest is missing chatgpt-dock content script');
  assert(
    !chatGptDockScript?.css?.some((file) => file.includes('chatgpt-dock.css')),
    `chatgpt-dock.css must not be manifest-injected: ${JSON.stringify(chatGptDockScript?.css ?? [])}`,
  );

  const webAccessibleResources = flattenWebAccessibleResources(manifest);
  assert(
    webAccessibleResources.includes('content-scripts/chatgpt-dock.css'),
    'content-scripts/chatgpt-dock.css must be web-accessible for manual runtime fetch',
  );

  const contentCss = readFileSync(contentCssPath, 'utf8');
  const legacyDocumentCss = readFileSync(legacyDocumentCssPath, 'utf8');
  const runtimeDockMountSource = readFileSync(runtimeDockMountPath, 'utf8');
  const { documentCss, shadowCss } = splitShadowRootCss(contentCss);
  const runtimeDocumentCss = [legacyDocumentCss, documentCss].filter(Boolean).join('\n');
  const runtimeShadowCss = [shadowCss, legacyDocumentCss].filter(Boolean).join('\n');

  assert(shadowCss.includes('@layer') || shadowCss.includes('.svelte-'), 'Shadow CSS split appears empty or missing UI styles');
  assert(runtimeShadowCss.includes('#cgpt-dock'), 'Runtime shadow CSS is missing legacy dock styles');
  for (const forbidden of FORBIDDEN_DOCUMENT_CSS) {
    assert(!forbidden.pattern.test(runtimeDocumentCss), `Runtime document CSS contains ${forbidden.label}`);
  }
  for (const forbidden of FORBIDDEN_DOCK_LOCAL_CSS) {
    assert(!forbidden.pattern.test(runtimeDockMountSource), `Runtime dock fallback CSS contains ${forbidden.label}`);
  }

  console.log(`Style parity assertions passed for ${browser}`);
}

function flattenWebAccessibleResources(manifest: Manifest): string[] {
  const resources: string[] = [];
  for (const entry of manifest.web_accessible_resources ?? []) {
    if (typeof entry === 'string') {
      resources.push(entry);
    } else {
      resources.push(...(entry.resources ?? []));
    }
  }
  return resources;
}

function getArgValue(name: string) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
