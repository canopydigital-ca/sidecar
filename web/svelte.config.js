import adapter from '../packages/php/adapters/php-simple/index.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      out: 'build',     // upload contents of this folder to site root
      assets: '_app',
      fallback: 'index.html'    // set to 'index.html' if you want SPA fallback
    })
  }
};

export default config;
