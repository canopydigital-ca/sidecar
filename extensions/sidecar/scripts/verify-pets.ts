import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_PETS_DIR = join(process.cwd(), 'dist/pets');
const DIST_VENDOR_DIR = join(process.cwd(), 'dist/vendor/vscode-pets');

function check(condition: boolean, msg: string) {
    if (!condition) {
        console.error(`[FAIL] ${msg}`);
        process.exit(1);
    }
    console.log(`[OK] ${msg}`);
}

async function verify() {
    console.log('Verifying Pets Integration...');

    // 1. Check Build Output (Dist)
    // Note: This requires 'bun run build' or 'bun run copy:assets' to have run.
    if (!existsSync(DIST_PETS_DIR)) {
        console.warn('! Dist directory missing. Run build first to verify output.');
    } else {
        check(existsSync(join(DIST_PETS_DIR, 'pets-host.html')), 'dist/pets/pets-host.html exists');
        check(existsSync(join(DIST_VENDOR_DIR, 'media/main-bundle.js')), 'dist/vendor/.../main-bundle.js exists');
        
        // Size Check (Sanity)
        const bundleStats = statSync(join(DIST_VENDOR_DIR, 'media/main-bundle.js'));
        check(bundleStats.size > 100000, `Bundle size reasonable (${(bundleStats.size / 1024).toFixed(0)}KB)`);
    }

    // 2. Version Pin Check
    if (existsSync(join(DIST_VENDOR_DIR, 'package.json'))) {
        const pkg = JSON.parse(readFileSync(join(DIST_VENDOR_DIR, 'package.json'), 'utf-8'));
        console.log(`Pinned Version: ${pkg.version}`);
        check(!!pkg.version, 'Version field present');
    } else {
        console.warn('! dist/vendor/vscode-pets/package.json missing.');
    }

    console.log('Verification Complete.');
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});
