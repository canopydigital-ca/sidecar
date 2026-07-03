import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = resolve(fileURLToPath(new URL("..", import.meta.url)));
const host = process.env.SIDECAR_DEMO_HOST ?? "127.0.0.1";
const port = Math.max(1, Number(process.env.SIDECAR_DEMO_PORT ?? "4173") || 4173);
const healthUrl = `http://${host}:${port}/healthz`;
const startUrl = `http://localhost:${port}/c/demo-thread`;
const bunExecutable = process.execPath;

function prefixOutput(prefix: string, data: string) {
  const lines = data.split(/\r?\n/);
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    process.stdout.write(`${prefix} ${line}\n`);
  }
}

async function waitForDemoHost(url: string, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }

  throw new Error(`Timed out waiting for demo host at ${url}`);
}

const demoHost = spawn(bunExecutable, [resolve(cwd, "scripts/demo-host.ts")], {
  cwd,
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

demoHost.stdout.on("data", (chunk) => prefixOutput("[demo-host]", String(chunk)));
demoHost.stderr.on("data", (chunk) => prefixOutput("[demo-host]", String(chunk)));

demoHost.on("exit", (code) => {
  if (code && code !== 0) {
    process.stderr.write(`[sidecar-demo] Demo host exited early with code ${code}\n`);
  }
});

await waitForDemoHost(healthUrl);

process.stdout.write(`[sidecar-demo] Launching WXT dev against ${startUrl}\n`);

const devChild = spawn(bunExecutable, [resolve(cwd, "scripts/dev-edge.ts"), ...process.argv.slice(2)], {
  cwd,
  stdio: "inherit",
  env: {
    ...process.env,
    WXT_START_URL: startUrl,
  },
});

function shutdown() {
  if (!demoHost.killed) {
    demoHost.kill();
  }

  if (!devChild.killed) {
    devChild.kill();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

devChild.on("exit", (code, signal) => {
  shutdown();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
