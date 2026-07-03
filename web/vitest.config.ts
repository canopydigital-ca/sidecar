import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: resolve(__dirname, './src/lib')
		}
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts']
	}
});
