import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';

export type EdgeProfileMode = 'isolated' | 'system';

export type EdgeLaunchConfig = {
	edgeBinary: string | undefined;
	extensionDir: string | null;
	profileMode: EdgeProfileMode;
	profileDir: string | null;
	profileDirectory: string | null;
	startUrl: string;
	launchUrl: string;
	navigationDelayMs: number;
};

function isEdgeRunning(): boolean {
	try {
		const output = execFileSync('tasklist', ['/FI', 'IMAGENAME eq msedge.exe', '/FO', 'CSV'], {
			windowsHide: true,
			stdio: ['ignore', 'pipe', 'ignore'],
		}).toString();
		return output.toLowerCase().includes('msedge.exe');
	} catch {
		return false;
	}
}

function resolveProfileMode(): EdgeProfileMode {
	if (process.env.WXT_EDGE_PROFILE_MODE === 'system' || process.env.WXT_EDGE_USE_SYSTEM_PROFILE === '1') {
		return 'system';
	}

	if (process.env.WXT_EDGE_PROFILE_MODE === 'isolated' || process.env.WXT_EDGE_USE_ISOLATED_PROFILE === '1') {
		return 'isolated';
	}

	return isEdgeRunning() ? 'isolated' : 'system';
}

function buildBootstrapUrl(startUrl: string, navigationDelayMs: number): string {
	const safeUrl = JSON.stringify(startUrl);
	const safeDelay = Math.max(0, Math.floor(navigationDelayMs));
	const html = `<!doctype html>
<meta charset="utf-8">
<title>Sidecar Dev</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    font: 15px/1.4 system-ui, sans-serif;
    color: #111827;
    background: #f3f4f6;
  }
  main {
    padding: 20px 24px;
    border-radius: 14px;
    background: white;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
  strong {
    display: block;
    margin-bottom: 6px;
  }
</style>
<main>
  <strong>Starting Sidecar dev…</strong>
  <div>Opening ChatGPT once the extension finishes booting.</div>
</main>
<script>
  setTimeout(() => location.replace(${safeUrl}), ${safeDelay});
</script>`;
	return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export function getEdgeCandidates(): string[] {
	return [
		process.env.WXT_EDGE_BINARY,
		`${process.env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
		`${process.env['ProgramFiles(x86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
	].filter(Boolean) as string[];
}

export function resolveExtensionDir(): string | null {
	const outputCandidates = [
		resolve('.output/edge'),
		resolve('.output/chrome'),
	];

	return outputCandidates.find((candidate) => existsSync(candidate)) ?? null;
}

export function resolveEdgeLaunchConfig(): EdgeLaunchConfig {
	const edgeBinary = getEdgeCandidates().find((candidate) => existsSync(candidate));
	const extensionDir = resolveExtensionDir();
	const profileMode = resolveProfileMode();
	const profileDir = profileMode === 'isolated' ? resolve('.wxt/manual-profiles/edge') : null;
	const profileDirectory = profileMode === 'system'
		? process.env.WXT_EDGE_PROFILE_DIRECTORY ?? 'Default'
		: null;
	const startUrl = process.env.WXT_START_URL ?? 'https://chatgpt.com/';
	const navigationDelayMs = Math.max(0, Number(process.env.WXT_EDGE_NAVIGATION_DELAY_MS ?? '1500') || 0);
	const launchUrl = navigationDelayMs > 0
		? buildBootstrapUrl(startUrl, navigationDelayMs)
		: startUrl;

	return {
		edgeBinary,
		extensionDir,
		profileMode,
		profileDir,
		profileDirectory,
		startUrl,
		launchUrl,
		navigationDelayMs,
	};
}

export function buildEdgeLaunchArgs(config: {
	extensionDir: string;
	profileMode: EdgeProfileMode;
	profileDir: string | null;
	profileDirectory: string | null;
	launchUrl: string;
}) {
	const args = [
		`--disable-extensions-except=${config.extensionDir}`,
		`--load-extension=${config.extensionDir}`,
		'--no-first-run',
		'--no-default-browser-check',
		'--new-window',
	];

	if (config.profileMode === 'isolated' && config.profileDir) {
		args.unshift(`--user-data-dir=${config.profileDir}`);
	}

	if (config.profileMode === 'system' && config.profileDirectory) {
		args.unshift(`--profile-directory=${config.profileDirectory}`);
	}

	return [
		...args,
		config.launchUrl,
	];
}

export function launchEdgeWithExtension(config = resolveEdgeLaunchConfig()) {
	if (!config.edgeBinary) {
		throw new Error('Unable to find Microsoft Edge. Set WXT_EDGE_BINARY if it is installed somewhere else.');
	}

	if (!config.extensionDir) {
		throw new Error('Unable to find a built extension output directory. Run `bun run dev` or `bun run build` first.');
	}

	if (config.profileMode === 'isolated' && config.profileDir) {
		mkdirSync(config.profileDir, { recursive: true });
	}

	const child = spawn(config.edgeBinary, buildEdgeLaunchArgs({
		extensionDir: config.extensionDir,
		profileMode: config.profileMode,
		profileDir: config.profileDir,
		profileDirectory: config.profileDirectory,
		launchUrl: config.launchUrl,
	}), {
		detached: true,
		stdio: 'ignore',
	});

	child.unref();

	return config;
}

if (import.meta.main) {
	const config = resolveEdgeLaunchConfig();
	const isDryRun = process.argv.includes('--dry-run');

	if (isDryRun) {
		console.log(JSON.stringify({
			...config,
			launchArgs: config.extensionDir
				? buildEdgeLaunchArgs({
					extensionDir: config.extensionDir,
					profileMode: config.profileMode,
					profileDir: config.profileDir,
					profileDirectory: config.profileDirectory,
					launchUrl: config.launchUrl,
				})
				: null,
		}, null, 2));
		process.exit(0);
	}

	try {
		const launched = launchEdgeWithExtension(config);
		const profileHint =
			launched.profileMode === 'isolated'
				? `isolated profile ${launched.profileDir}`
				: `system profile ${launched.profileDirectory ?? 'Default'}`;
		console.log(`Opened Edge with Sidecar from ${launched.extensionDir} using ${profileHint}`);
		if (launched.navigationDelayMs > 0) {
			console.log(`Bootstrapping through a short redirect page for ${launched.navigationDelayMs}ms before opening ${launched.startUrl}`);
		}
		if (launched.startUrl.includes('localhost') || launched.startUrl.includes('127.0.0.1')) {
			console.log('Local demo mode is active. The dock should mount on the repo demo page without requiring a ChatGPT session.');
		} else if (launched.profileMode === 'isolated') {
			console.log('If ChatGPT opens without the dock, sign into ChatGPT in that Sidecar dev profile first.');
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}
