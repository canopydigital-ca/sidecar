import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');
const PETS_DIR = join(DIST_DIR, 'pets');
const VENDOR_DIR = join(DIST_DIR, 'vendor/vscode-pets');

function check(condition: boolean, msg: string) {
    if (!condition) {
        console.error(`❌ [FAIL] ${msg}`);
        process.exit(1);
    }
    console.log(`✅ [PASS] ${msg}`);
}

async function verify() {
    console.log('Running Sanity Verification...');

    // 1. Check Dist Existence
    check(existsSync(DIST_DIR), 'dist directory exists');

    // 2. Check Pets Assets
    check(existsSync(join(PETS_DIR, 'pets-host.html')), 'pets-host.html exists');
    check(existsSync(join(PETS_DIR, 'pets-host.js')), 'pets-host.js exists');
    check(existsSync(join(VENDOR_DIR, 'media/main-bundle.js')), 'main-bundle.js exists');

    // 3. Check Manifest
    const manifestPath = join(process.cwd(), 'manifest.json');
    check(existsSync(manifestPath), 'manifest.json exists');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    
    // Check web_accessible_resources
    const resources = manifest.web_accessible_resources?.[0]?.resources || [];
    check(resources.includes('dist/pets/**'), 'Manifest includes pets resources');
    check(resources.includes('dist/vendor/**'), 'Manifest includes vendor resources');

    // 4. Check Settings Schema Version
    // Heuristic: Check settings.ts source for "settingsVersion ="
    const settingsPath = join(process.cwd(), 'src/pets/core/settings.ts');
    const settingsContent = readFileSync(settingsPath, 'utf8');
    check(settingsContent.includes('export const settingsVersion = 3'), 'Settings version is 3');

    console.log('Sanity Check Complete.');
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});