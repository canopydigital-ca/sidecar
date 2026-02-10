import { mkdirSync, existsSync, cpSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const srcHostDir = join(rootDir, "src/pets/renderers/webview");
const distPetsDir = join(rootDir, "dist/pets");
const distPqDir = join(rootDir, "dist/pq");

const vendorDistDir = join(rootDir, "dist/vendor/vscode-pets");
const vendorSrcPqDir = join(rootDir, "src/vendor/progressquest");
const vendorDistPqDir = join(rootDir, "dist/vendor/progressquest");
const vendorSrcGameIconsDir = join(rootDir, "src/vendor/game-icons.net");
const vendorDistGameIconsDir = join(rootDir, "dist/vendor/game-icons.net");

const srcExtensionPagesDir = join(rootDir, "src/extension_pages");
const distExtensionPagesDir = join(rootDir, "dist/extension_pages");

function ensure(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.error("Missing source:", src);
    return false;
  }
  ensure(dirname(dest));
  cpSync(src, dest, { recursive: true, force: true });
  console.log("Copied:", src, "->", dest);
  return true;
}

console.log("Copying pets host + vendor assets...");

ensure(distPetsDir);
ensure(distPqDir);
ensure(distExtensionPagesDir);

// Copy extension pages
copyDir(srcExtensionPagesDir, distExtensionPagesDir);

// Copy host files
copyDir(join(srcHostDir, "pets-host.html"), join(distPetsDir, "pets-host.html"));
copyDir(join(srcHostDir, "pets-host.js"), join(distPetsDir, "pets-host.js"));
copyDir(join(srcHostDir, "pets-boot.js"), join(distPetsDir, "pets-boot.js"));

// Copy ProgressQuest host + vendor assets
const pqBridgeRes = spawnSync(
  "bun",
  ["build", "src/pq/bridge.ts", "--outdir", distPqDir, "--target=browser", "--format=iife", "--sourcemap"],
  { cwd: rootDir, stdio: "inherit" }
);
if (pqBridgeRes.status !== 0) {
  console.error("CRITICAL BUILD ERROR: Failed to build ProgressQuest bridge.");
  process.exit(1);
}
copyDir(join(rootDir, "src/pq/pq-host.html"), join(distPqDir, "pq-host.html"));
copyDir(join(rootDir, "src/pq/pq-theme.css"), join(distPqDir, "pq-theme.css"));
copyDir(vendorSrcPqDir, vendorDistPqDir);
copyDir(vendorSrcGameIconsDir, vendorDistGameIconsDir);

// Verify critical asset
const mainBundlePath = join(vendorDistDir, "media/main-bundle.js");
if (!existsSync(mainBundlePath)) {
  console.log("vscode-pets assets missing in dist; downloading VSIX payload...");
  const res = spawnSync(
    "bun",
    ["run", "scripts/update-pets.ts", "--", "--out", vendorDistDir],
    { cwd: rootDir, stdio: "inherit" }
  );
  if (res.status !== 0) {
    console.error("CRITICAL BUILD ERROR: Failed to download vscode-pets assets.");
    process.exit(1);
  }
}

if (!existsSync(mainBundlePath)) {
  console.error("CRITICAL BUILD ERROR: dist/vendor/vscode-pets/media/main-bundle.js is missing!");
  process.exit(1);
} else {
  console.log("Verified: main-bundle.js exists.");
}

// Verify BUILD_STAMP in dist/pets/pets-host.js
const distHostJsPath = join(distPetsDir, "pets-host.js");
if (existsSync(distHostJsPath)) {
  const content = readFileSync(distHostJsPath, 'utf8');
  if (!content.includes('const BUILD_STAMP =')) {
    console.error("CRITICAL BUILD ERROR: dist/pets/pets-host.js missing BUILD_STAMP!");
    process.exit(1);
  }
  console.log("Verified: pets-host.js contains BUILD_STAMP.");
} else {
  console.error("CRITICAL BUILD ERROR: dist/pets/pets-host.js missing after copy!");
  process.exit(1);
}

console.log("Done.");
