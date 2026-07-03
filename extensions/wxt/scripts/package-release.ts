import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

type BrowserTarget = 'chrome' | 'edge' | 'firefox';

type Manifest = {
  manifest_version: number;
  version: string;
  permissions?: string[];
  host_permissions?: string[];
  content_scripts?: Array<{ matches?: string[]; js?: string[]; css?: string[] }>;
  web_accessible_resources?: Array<string | { resources?: string[]; matches?: string[] }>;
  background?: { service_worker?: string; scripts?: string[]; type?: string };
  browser_specific_settings?: { gecko?: { id?: string; strict_min_version?: string } };
};

const MANUAL_DOCK_CSS = 'content-scripts/chatgpt-dock.css';

const BROWSERS: BrowserTarget[] = ['chrome', 'edge', 'firefox'];
const SELECTED_ENTRYPOINTS = ['background', 'chatgpt-dock'];
const RELEASE_VARIANT = 'full';
const FIXED_DOS_TIME = 0;
const FIXED_DOS_DATE = (1 << 5) | 1; // 1980-01-01

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = join(root, '.output');
const releaseRoot = join(root, 'release');
const artifactsRoot = join(releaseRoot, 'artifacts');

const args = new Set(process.argv.slice(2));
const requestedBrowser = getArgValue('--browser');
const skipBuild = args.has('--skip-build');
const buildOnly = args.has('--build-only');
const targets = requestedBrowser ? [parseBrowser(requestedBrowser)] : BROWSERS;

function run() {
  mkdirSync(artifactsRoot, { recursive: true });
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string };
  const artifacts: Array<Record<string, string | number>> = [];
  const checksumLines: string[] = [];

  for (const browser of targets) {
    if (!skipBuild) {
      runWxtBuild(browser);
    }

    const outDir = join(outputRoot, browser);
    const manifestPath = join(outDir, 'manifest.json');
    assert(existsSync(manifestPath), `Missing manifest for ${browser}: ${manifestPath}`);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
    validateManifest(browser, manifest, packageJson.version);
    validateOutputContents(browser, outDir);

    if (buildOnly) {
      continue;
    }

    const artifactName = `sidecar-v${manifest.version}-${browser}-mv${manifest.manifest_version}-${RELEASE_VARIANT}.zip`;
    const artifactPath = join(artifactsRoot, artifactName);
    if (existsSync(artifactPath)) {
      rmSync(artifactPath);
    }

    writeZipFromDirectory(outDir, artifactPath);
    const sha256 = sha256File(artifactPath);
    const size = statSync(artifactPath).size;
    checksumLines.push(`${sha256}  artifacts/${artifactName}`);
    artifacts.push({
      browser,
      manifestVersion: manifest.manifest_version,
      variant: RELEASE_VARIANT,
      version: manifest.version,
      file: `artifacts/${artifactName}`,
      sha256,
      size,
    });
  }

  if (!buildOnly) {
    writeFileSync(join(releaseRoot, 'SHA256SUMS.txt'), `${checksumLines.join('\n')}\n`);
    writeFileSync(
      join(releaseRoot, 'manifest.json'),
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          entrypoints: SELECTED_ENTRYPOINTS,
          variant: RELEASE_VARIANT,
          artifacts,
        },
        null,
        2,
      )}\n`,
    );
  }
}

function getArgValue(name: string) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function parseBrowser(value: string): BrowserTarget {
  assert(BROWSERS.includes(value as BrowserTarget), `Unsupported browser "${value}". Expected one of: ${BROWSERS.join(', ')}`);
  return value as BrowserTarget;
}

function runWxtBuild(browser: BrowserTarget) {
  const command = process.platform === 'win32' ? 'bunx.cmd' : 'bunx';
  const entrypointArgs = SELECTED_ENTRYPOINTS.flatMap((entrypoint) => ['-e', entrypoint]);
  const result = spawnSync(command, ['wxt', 'build', '-b', browser, ...entrypointArgs], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  assert(result.status === 0, `WXT build failed for ${browser}`);
}

function validateManifest(browser: BrowserTarget, manifest: Manifest, expectedVersion: string) {
  const expectedManifestVersion = browser === 'firefox' ? 2 : 3;
  assert(manifest.version === expectedVersion, `${browser} manifest version ${manifest.version} does not match package ${expectedVersion}`);
  assert(
    manifest.manifest_version === expectedManifestVersion,
    `${browser} expected MV${expectedManifestVersion}, got MV${manifest.manifest_version}`,
  );
  if (browser !== 'firefox') {
    assert(
      JSON.stringify(manifest.permissions ?? []) === JSON.stringify(['storage']),
      `${browser} permissions changed: ${JSON.stringify(manifest.permissions ?? [])}`,
    );
    assert(
      JSON.stringify(manifest.host_permissions ?? []) === JSON.stringify(['https://game-icons.net/*']),
      `${browser} host permissions changed: ${JSON.stringify(manifest.host_permissions ?? [])}`,
    );
  } else {
    assert(
      JSON.stringify(manifest.permissions ?? []) === JSON.stringify(['storage', 'https://game-icons.net/*']),
      `${browser} permissions changed: ${JSON.stringify(manifest.permissions ?? [])}`,
    );
  }

  const serialized = JSON.stringify(manifest);
  for (const forbidden of ['localhost', '127.0.0.1', 'demo-dock']) {
    assert(!serialized.includes(forbidden), `${browser} manifest contains development-only token: ${forbidden}`);
  }

  const dockScript = (manifest.content_scripts ?? []).find((script) => (script.js ?? []).some((file) => file.includes('chatgpt-dock.js')));
  assert(dockScript, `${browser} manifest missing chatgpt-dock content script`);

  // The manual CSS path is the only sanctioned one: no content_scripts entry may
  // inject chatgpt-dock.css into the ChatGPT page document (Tailwind preflight leak).
  for (const script of manifest.content_scripts ?? []) {
    assert(
      !(script.css ?? []).some((file) => file.includes('chatgpt-dock.css')),
      `${browser} manifest injects chatgpt-dock.css into page scope: ${JSON.stringify(script.css ?? [])}`,
    );
  }

  // Airtight WAR check: inspect the actual web_accessible_resources structure
  // (per manifest version) rather than substring-matching the whole serialized
  // manifest — a stale manifest with the CSS in content_scripts (and absent from
  // WAR) must NOT satisfy this assertion.
  if (browser === 'firefox') {
    // MV2: flat string array of resources.
    const flatWar = (manifest.web_accessible_resources ?? []).filter(
      (entry): entry is string => typeof entry === 'string',
    );
    assert(
      manifest.web_accessible_resources?.every((entry) => typeof entry === 'string') ?? true,
      `${browser} (MV2) web_accessible_resources must be a flat string array, got objects`,
    );
    assert(
      flatWar.includes(MANUAL_DOCK_CSS),
      `${browser} (MV2) web_accessible_resources missing manual CSS resource: ${JSON.stringify(flatWar)}`,
    );

    // MV2 background must be scripts-based, not a service worker.
    assert(
      Array.isArray(manifest.background?.scripts) && manifest.background.scripts.length > 0,
      `${browser} (MV2) background must use scripts[], got ${JSON.stringify(manifest.background ?? null)}`,
    );
    assert(
      !manifest.background?.service_worker,
      `${browser} (MV2) background must not declare a service_worker`,
    );

    // AMO submission blocker: a stable gecko add-on id is required.
    assert(
      typeof manifest.browser_specific_settings?.gecko?.id === 'string' &&
        manifest.browser_specific_settings.gecko.id.length > 0,
      `${browser} manifest missing browser_specific_settings.gecko.id (AMO rejects without it)`,
    );
  } else {
    // MV3: WAR entries are objects with a resources[] array.
    const warObjects = (manifest.web_accessible_resources ?? []).filter(
      (entry): entry is { resources?: string[]; matches?: string[] } => typeof entry === 'object' && entry !== null,
    );
    assert(
      manifest.web_accessible_resources?.every((entry) => typeof entry === 'object') ?? false,
      `${browser} (MV3) web_accessible_resources must use object entries, got strings`,
    );
    assert(
      warObjects.some((entry) => (entry.resources ?? []).includes(MANUAL_DOCK_CSS)),
      `${browser} (MV3) web_accessible_resources missing manual CSS resource`,
    );

    // MV3 background must be a service worker, not scripts[].
    assert(
      typeof manifest.background?.service_worker === 'string',
      `${browser} (MV3) background must declare a service_worker`,
    );
  }
}

function validateOutputContents(browser: BrowserTarget, outDir: string) {
  const files = listFiles(outDir).map((file) => toZipPath(file, outDir));
  for (const zipPath of files) {
    const base = zipPath.split('/').pop() ?? zipPath;
    assert(
      !base.startsWith('.env'),
      `${browser} build output contains an env file that would be zipped: ${zipPath}`,
    );
    assert(
      !zipPath.includes('demo-dock'),
      `${browser} build output contains a demo-dock artifact that would be zipped: ${zipPath}`,
    );
  }
}

function writeZipFromDirectory(sourceDir: string, targetFile: string) {
  const files = listFiles(sourceDir).sort((a, b) => toZipPath(a, sourceDir).localeCompare(toZipPath(b, sourceDir)));
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(toZipPath(file, sourceDir), 'utf8');
    const data = readFileSync(file);
    const crc = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(FIXED_DOS_TIME, 10);
    localHeader.writeUInt16LE(FIXED_DOS_DATE, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(FIXED_DOS_TIME, 12);
    centralHeader.writeUInt16LE(FIXED_DOS_DATE, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  writeFileSync(targetFile, Buffer.concat([...localParts, centralDirectory, end]));
}

function listFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toZipPath(file: string, sourceDir: string) {
  return relative(sourceDir, file).split(sep).join('/');
}

function sha256File(file: string) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

run();
