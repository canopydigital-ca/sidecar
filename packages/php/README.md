# SvelteKit PHP "upload-only" adapter (static / prerender)

This is a tiny local adapter that builds a **/build** folder you can upload to the
root of an **Apache + PHP** site. It uses:

- `build/.htaccess` (mod_rewrite) to route "pretty URLs" to `build/index.php`
- `build/index.php` to map requests to prerendered `index.html` + `__data.json`

## What it is
- ✅ Great for: marketing sites, docs, portfolios, content sites that are fully **prerendered**
- ✅ Supports: client-side navigation (SvelteKit’s `__data.json` output), assets caching headers
- ❌ Not SSR: it does **not** run SvelteKit server code on PHP
- ❌ No SvelteKit endpoints/actions on the PHP side

If you need server-side endpoints, you can still add your own `/api/*.php` endpoints
next to the build output.

## Install (local adapter)
1) Copy this folder into your project (recommended):
   - `adapters/php-simple/*`

2) In `svelte.config.js`:

```js
import adapter from './adapters/php-simple/index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: 'build',      // folder you upload to your Apache site root
      appDir: '_app',     // optional: only if you changed kit.appDir
      fallback: null     // set to 'index.html' for SPA fallback
    })
  }
};

export default config;
```

3) Make sure your routes are prerendered:

- Per-page: `export const prerender = true;` in `+page.js/+page.ts`
- Or globally: `kit.prerender.entries = ['*']` (only if you truly want everything)

4) Build:
```bash
npm run build
```

5) Upload everything inside `build/` to your Apache document root.

## Host requirements
- Apache 2.4+
- `mod_rewrite` enabled
- Directory allows `.htaccess` overrides (`AllowOverride All`)
- PHP 8+ recommended (works on 7.4, but don’t do that to yourself)

## SPA fallback (optional)
If you want unknown routes to load the app shell instead of returning 404:
- Set `fallback: 'index.html'` in the adapter options.

That’s it. Humans love making deployment harder than it needs to be.


## Changelog
- 0.1.1: Explicit rewrite bypass + MIME types for JS modules.

- 0.1.2: Fix nested `/_app/_app/...` output (writeClient dest) and use kit.appDir.
