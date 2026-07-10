/// <reference types="vitest" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const runtimeSrc = fileURLToPath(new URL('../../packages/runtime/src', import.meta.url));

export default defineConfig({
  plugins: [
    svelte({ hot: !process.env.VITEST }),
  ],
  resolve: {
    conditions: ['browser'],
    alias: {
      '@runtime': runtimeSrc,
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./tests/vitest.setup.ts'],
  },
});
