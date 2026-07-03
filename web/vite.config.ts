import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sidecarPackage = JSON.parse(
	readFileSync(new URL('../extensions/wxt/package.json', import.meta.url), 'utf8')
) as { version: string };

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__SIDECAR_VERSION__: JSON.stringify(sidecarPackage.version)
	},
	resolve: {
		alias: {
			'@icons': resolve(__dirname, '../packages/icons')
		}
	}
});
