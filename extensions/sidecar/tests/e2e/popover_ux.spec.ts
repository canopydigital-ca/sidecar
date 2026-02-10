import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.join(__dirname, '../harness/fixture.html');
const DIST_PATH = path.join(__dirname, '../../dist/content.js');
const STYLES_PATH = path.join(__dirname, '../../styles.css');

test.describe('Popover UX & Accessibility', () => {
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

  test('ARIA State Management', async ({ page }) => {
    const emojiBtn = page.locator('button[data-action="emoji"]');
    
    // Initial State
    await expect(emojiBtn).toHaveAttribute('aria-pressed', 'false');
    
    // Open
    await emojiBtn.click();
    await expect(page.locator('.cgpt-popover[data-kind="emoji"]')).toBeVisible();
    await expect(emojiBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(emojiBtn).toHaveAttribute('aria-expanded', 'true');
    
    // Close via re-click
    await emojiBtn.click();
    await expect(page.locator('.cgpt-popover[data-kind="emoji"]')).toBeHidden();
    await expect(emojiBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(emojiBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('Initial Focus Management', async ({ page }) => {
    const emojiBtn = page.locator('button[data-action="emoji"]');
    await emojiBtn.click();
    
    // Wait for animation frame focus
    await page.waitForTimeout(100);
    
    // Should focus the search input
    const input = page.locator('.cgpt-popover[data-kind="emoji"] input');
    await expect(input).toBeFocused();
  });

  test('Focus Trap (Tab Cycle)', async ({ page }) => {
    const settingsBtn = page.locator('button[data-action="settings"]');
    await settingsBtn.click();
    await page.waitForTimeout(100);
    
    const popover = page.locator('.cgpt-popover[data-kind="settings"]');
    
    // Find first and last focusable
    // Based on settings structure:
    // 1. Checkbox "Show status bar" (or its label input)
    // ...
    // Last. "Import JSON" or "Reset input size"
    
    // Test Tab Cycle (Forward)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const activeId = await page.evaluate(() => {
        const host = document.getElementById('cgpt-ext-root');
        const root = host?.shadowRoot;
        const el = root?.activeElement || document.activeElement;
        return el?.closest('.cgpt-popover') ? 'inside' : 'outside';
      });
      expect(activeId).toBe('inside');
    }
    
    // Test Shift+Tab (Reverse)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+Tab');
      const activeId = await page.evaluate(() => {
        const host = document.getElementById('cgpt-ext-root');
        const root = host?.shadowRoot;
        const el = root?.activeElement || document.activeElement;
        return el?.closest('.cgpt-popover') ? 'inside' : 'outside';
      });
      expect(activeId).toBe('inside');
    }
  });

  test('Return Focus on ESC', async ({ page }) => {
    const promptsBtn = page.locator('button[data-action="prompts"]');
    await promptsBtn.click();
    await expect(page.locator('.cgpt-popover[data-kind="prompts"]')).toBeVisible();
    
    // Press ESC
    await page.keyboard.press('Escape');
    
    // Popover hidden
    await expect(page.locator('.cgpt-popover[data-kind="prompts"]')).toBeHidden();
    
    // Trigger focused
    await expect(promptsBtn).toBeFocused();
  });
});
