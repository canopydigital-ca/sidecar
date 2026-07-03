import { defineConfig, devices } from '@playwright/test';

const HARNESS_PORT = Number(process.env.SIDECAR_HARNESS_PORT ?? 4175);
const HARNESS_BASE_URL = `http://127.0.0.1:${HARNESS_PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'line',
  webServer: {
    command: 'bun ./tests/harness/server.ts',
    url: HARNESS_BASE_URL,
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    baseURL: HARNESS_BASE_URL,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
