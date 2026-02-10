import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.join(__dirname, '../harness/fixture.html');
const DIST_PATH = path.join(__dirname, '../../dist/content.js');
const STYLES_PATH = path.join(__dirname, '../../styles.css');

test.describe('Popover Manager Placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${FIXTURE_PATH}`);

    if (fs.existsSync(STYLES_PATH)) {
      const styles = fs.readFileSync(STYLES_PATH, 'utf8');
      await page.addStyleTag({ content: styles });
      const base64Styles = Buffer.from(styles).toString('base64');
      const dataUri = `data:text/css;base64,${base64Styles}`;
      await page.evaluate((uri) => {
        if (!window.chrome.runtime) window.chrome.runtime = {} as any;
        window.chrome.runtime.id = 'mock-id';
        window.chrome.runtime.getURL = (p) => {
          if (p === 'styles.css') return uri;
          return p;
        };
        window.chrome.storage.local.set({ cgptStatusbar: true });
      }, dataUri);
    }

    await page.addScriptTag({ path: DIST_PATH });
    await expect(page.locator('#cgpt-dock')).toBeVisible();
  });

  test('should place popover above trigger by default', async ({ page }) => {
    const btn = page.locator('button[data-action="settings"]');
    await btn.click();
    const popover = page.locator('#cgpt-portal .cgpt-popover'); // More specific locator
    await expect(popover).toBeVisible();

    const popBox = await popover.boundingBox();
    const btnBox = await btn.boundingBox();

    expect(popBox).toBeTruthy();
    expect(btnBox).toBeTruthy();

    if (popBox && btnBox) {
      // Should be above
      // Bottom of popover <= Top of button + 8
      expect(popBox.y + popBox.height).toBeLessThanOrEqual(btnBox.y + 10);
    }
  });

  test('should clamp width and height', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 600 });
    const btn = page.locator('button[data-action="settings"]');
    await btn.click();
    const popover = page.locator('.cgpt-popover');
    await expect(popover).toBeVisible();

    const box = await popover.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(400 - 16);
      expect(box.height).toBeLessThanOrEqual(600 - 140);
    }
  });

  test('should respect per-kind sizing', async ({ page }) => {
    // Prompts
    await page.locator('button[data-action="prompts"]').click();
    const popover = page.locator('.cgpt-popover[data-kind="prompts"]');
    await expect(popover).toBeVisible();

    // Wait for sizing application
    await page.waitForTimeout(100);

    await expect(popover).toHaveCSS('max-width', '480px');
  });
});
