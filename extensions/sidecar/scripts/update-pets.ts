import AdmZip from 'adm-zip';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_VERSION = '1.34.0';

function readFlag(args: string[], flag: string) {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const hasAnyFlag = args.some((a) => a.startsWith('--'));

  const positionalVersion = (!hasAnyFlag && args[0]) ? args[0] : null;
  const version = readFlag(args, '--version') ?? positionalVersion ?? DEFAULT_VERSION;
  const outDir = readFlag(args, '--out') ?? join(process.cwd(), 'dist/vendor/vscode-pets');
  const force = args.includes('--force');

  return { version, outDir, force };
}

const { version: VERSION, outDir: OUT_DIR, force: FORCE } = parseArgs(process.argv);

const URL = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/tonybaloney/vsextensions/vscode-pets/${VERSION}/vspackage`;
const TEMP_DIR = join(process.cwd(), 'temp_pets_vsix');

function safeRemove(dir: string) {
  try {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  } catch { }
}

async function main() {
  const mainBundlePath = join(OUT_DIR, 'media/main-bundle.js');
  if (!FORCE && existsSync(mainBundlePath)) {
    console.log(`vscode-pets already present: ${mainBundlePath}`);
    return;
  }

  console.log(`Downloading vscode-pets v${VERSION}...`);
  console.log(`URL: ${URL}`);

  const response = await fetch(URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText} (URL: ${URL})`);
  }

  const buffer = await response.arrayBuffer();

  // Clean temp
  safeRemove(TEMP_DIR);
  mkdirSync(TEMP_DIR);

  // Write zip
  const zipPath = join(TEMP_DIR, 'extension.vsix');
  writeFileSync(zipPath, Buffer.from(buffer));

  console.log("Extracting...");
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(TEMP_DIR, true);

  // The VSIX content is usually under 'extension/' folder inside the zip
  const extractedExtDir = join(TEMP_DIR, 'extension');
  if (!existsSync(extractedExtDir)) {
    throw new Error("Invalid VSIX: 'extension' folder not found in archive");
  }

  console.log(`Updating output dir: ${OUT_DIR}`);
  if (existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUT_DIR, { recursive: true });

  // Copy items
  const itemsToCopy = ['media', 'package.json', 'l10n', 'LICENSE.txt'];

  for (const item of itemsToCopy) {
    const src = join(extractedExtDir, item);
    const dest = join(OUT_DIR, item);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true, force: true });
      console.log(`  + ${item}`);
    } else {
      console.warn(`  ! Missing item: ${item}`);
    }
  }

  // Verify
  const bundlePath = join(OUT_DIR, 'media/main-bundle.js');
  if (!existsSync(bundlePath)) {
    throw new Error("CRITICAL: media/main-bundle.js not found in update!");
  }

  writeFileSync(join(OUT_DIR, 'VENDORED_FROM.json'), JSON.stringify({
    project: 'vscode-pets',
    version: VERSION,
    url: URL,
    extractedAt: new Date().toISOString(),
  }, null, 2));

  console.log(`Successfully updated vscode-pets to v${VERSION}`);

  // Cleanup
  safeRemove(TEMP_DIR);
}

main().catch(e => {
  console.error(e);
  safeRemove(TEMP_DIR);
  process.exit(1);
});
