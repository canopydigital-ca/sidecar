// svelte.config.js (example)
import adapter from './adapters/php-simple/index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: 'build',
      appDir: '_app',
      fallback: null // set to 'index.html' if you want SPA-style fallback
    }),
    // Optional: if you want to force prerender all pages that can be prerendered:
    // prerender: { entries: ['*'] }
  }
};

export default config;
