import { defineConfig, devices } from '@playwright/test';

const DEMO_PORT = Number(process.env.SIDECAR_DEMO_PORT ?? 4181);
const BASE_URL = `http://127.0.0.1:${DEMO_PORT}`;

// Separate harness server used by tests/e2e/wxt-parity.spec.ts. It serves the
// static fixture at /tests/harness/fixture.html and the built WXT chrome output
// under /wxt/. Kept on its own configurable port so both specs can run together.
const HARNESS_PORT = Number(process.env.SIDECAR_HARNESS_PORT ?? 4175);
const HARNESS_BASE_URL = `http://127.0.0.1:${HARNESS_PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'line',
  webServer: [
    {
      command: 'bun ./scripts/demo-host.ts',
      url: `${BASE_URL}/healthz`,
      reuseExistingServer: false,
      env: {
        SIDECAR_DEMO_PORT: String(DEMO_PORT),
        SIDECAR_DEMO_HOST: '127.0.0.1',
      },
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'bun ./tests/harness/server.ts',
      url: HARNESS_BASE_URL,
      reuseExistingServer: false,
      env: {
        SIDECAR_HARNESS_PORT: String(HARNESS_PORT),
      },
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
