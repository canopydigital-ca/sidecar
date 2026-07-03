import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { launchEdgeWithExtension, resolveExtensionDir } from './open-edge-dev';

const shouldOpenBrowser = !process.argv.includes('--no-open');
const childArgs = ['x', 'wxt', '-b', 'edge', ...process.argv.slice(2).filter((arg) => arg !== '--no-open')];

let launchedBrowser = false;
let buildReady = false;

const child = spawn(process.execPath, childArgs, {
	stdio: ['inherit', 'pipe', 'pipe'],
	env: process.env,
});

function maybeLaunchBrowser() {
	if (!shouldOpenBrowser || launchedBrowser || !buildReady) {
		return;
	}

	const extensionDir = resolveExtensionDir();
	if (!extensionDir || !existsSync(resolve(extensionDir, 'manifest.json'))) {
		return;
	}

	const launched = launchEdgeWithExtension();
	launchedBrowser = true;
	const profileHint =
		launched.profileMode === 'isolated'
			? `isolated profile ${launched.profileDir}`
			: `system profile ${launched.profileDirectory ?? 'Default'}`;

	process.stdout.write(`\n[sidecar-dev] Opened Edge with ${extensionDir} using ${profileHint}\n`);
	if (launched.navigationDelayMs > 0) {
		process.stdout.write(`[sidecar-dev] Waiting ${launched.navigationDelayMs}ms before navigating to ${launched.startUrl}\n`);
	}

	if (launched.startUrl.includes('localhost') || launched.startUrl.includes('127.0.0.1')) {
		process.stdout.write('[sidecar-dev] Local demo mode is active. The dock should mount on the repo demo page without a ChatGPT login.\n');
	} else if (launched.profileMode === 'isolated') {
		process.stdout.write('[sidecar-dev] If ChatGPT opens without a dock, sign into ChatGPT in that dev profile first.\n');
	}
}

function handleOutput(chunk: string, stream: NodeJS.WriteStream) {
	stream.write(chunk);

	if (chunk.includes('Built extension in')) {
		buildReady = true;
	}

	maybeLaunchBrowser();
}

child.stdout.on('data', (chunk) => {
	handleOutput(String(chunk), process.stdout);
});

child.stderr.on('data', (chunk) => {
	handleOutput(String(chunk), process.stderr);
});

const poll = setInterval(() => {
	if (buildReady) {
		maybeLaunchBrowser();
	}
}, 500);

child.on('exit', (code, signal) => {
	clearInterval(poll);

	if (signal) {
		process.kill(process.pid, signal);
		return;
	}

	process.exit(code ?? 0);
});
