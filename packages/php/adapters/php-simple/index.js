// adapters/php-simple/index.js
// A tiny "PHP static" adapter for SvelteKit + Apache:
// - emits a /build folder you can upload to your site root
// - uses .htaccess + index.php to map pretty URLs to prerendered HTML/JSON
//
// Limitations: this is NOT SSR. It expects prerendered output.

import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {{
 *   out?: string,
 *   appDir?: string,
 *   fallback?: null | 'index.html' | '200.html',
 *   phpFile?: string,
 *   htaccessFile?: string
 * }} PhpSimpleOptions
 */

/** @param {PhpSimpleOptions} [opts] */
export default function adapterPhpSimple(opts = {}) {
  const out = opts.out ?? 'build';
  const fallback = opts.fallback ?? null; // set to 'index.html' for SPA-like fallback
  const phpFile = opts.phpFile ?? 'index.php';
  const htaccessFile = opts.htaccessFile ?? '.htaccess';

  /** @param {string} rel */
  const readTemplate = (rel) =>
    fs.readFileSync(new URL(`./templates/${rel}`, import.meta.url), 'utf8');

  return {
    name: 'adapter-php-simple',
    /**
     * @param {import('@sveltejs/kit').Builder} builder
     */
    async adapt(builder) {
      const outDir = path.resolve(out);
      builder.rimraf(outDir);
      builder.mkdirp(outDir);

      // appDir determines the public folder name (default "_app") that SvelteKit writes.
      // IMPORTANT: builder.writeClient() already creates appDir under the destination.
      // So we must pass outDir (NOT outDir/appDir) to avoid "_app/_app/..." nesting.
      const appDir = opts.appDir ?? builder.config.kit.appDir ?? '_app';

      // Static assets (from /static) and client build.
      if (typeof builder.writeStatic === 'function') builder.writeStatic(outDir);
      builder.writeClient(outDir);

      // Prerendered output (HTML + __data.json).
      builder.writePrerendered(outDir);

      // Emit Apache + PHP entrypoint.
      const php = readTemplate('index.php')
        .replaceAll('{{ASSETS_DIR}}', appDir)
        .replaceAll('{{FALLBACK}}', fallback ? JSON.stringify(fallback) : 'null');
      fs.writeFileSync(path.join(outDir, phpFile), php, 'utf8');

      const ht = readTemplate('htaccess')
        .replaceAll('{{PHP_FILE}}', phpFile)
        .replaceAll('{{ASSETS_DIR}}', appDir);
      fs.writeFileSync(path.join(outDir, htaccessFile), ht, 'utf8');
    }
  };
}
