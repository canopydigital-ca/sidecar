import { spawn } from 'node:child_process';

const args = ['x', 'wxt', '-b', 'edge', ...process.argv.slice(2)];

const child = spawn(process.execPath, args, {
	stdio: 'inherit',
	env: {
		...process.env,
		WXT_USE_WEB_EXT: '1',
	},
});

child.on('exit', (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}

	process.exit(code ?? 0);
});
