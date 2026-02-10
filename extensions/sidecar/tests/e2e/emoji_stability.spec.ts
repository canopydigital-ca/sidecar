import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.join(__dirname, '../harness/fixture.html');
const DIST_PATH = path.join(__dirname, '../../dist/content.js');
const STYLES_PATH = path.join(__dirname, '../../styles.css');

test.describe('Emoji Insertion & Stability', () => {
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

  test('Emoji Insertion into ContentEditable', async ({ page }) => {
    const emojiBtn = page.locator('button[data-action="emoji"]');
    const editor = page.locator('#prompt-textarea');
    
    // Focus editor first
    await editor.click();
    await editor.focus();
    
    // Open Emoji Popover
    await emojiBtn.click();
    const popover = page.locator('.cgpt-popover[data-kind="emoji"]');
    await expect(popover).toBeVisible();
    
    // Click an emoji (e.g. first one)
    const firstEmoji = popover.locator('button[data-emoji]').first();
    const emojiChar = await firstEmoji.getAttribute('data-emoji');
    
    // Listen for input events to verify method used (optional but good for debugging)
    await page.evaluate(() => {
        document.getElementById('prompt-textarea')?.addEventListener('input', (e) => {
            (window as any).__lastInputEvent = e.inputType;
        });
    });

    await firstEmoji.click();
    
    // Check if text was inserted
    await expect(editor).toHaveText(emojiChar || "", { timeout: 2000 });
    
    // Popover should close automatically on selection
    await expect(popover).toBeHidden();
  });

  test('Scheduler Pausing', async ({ page }) => {
    // We can't easily check internal scheduler state from E2E without exposing it.
    // But we can check if heavy tasks are NOT running.
    // For now, let's just verify no console errors during rapid toggle
    // which would indicate scheduler thrashing.
    
    const emojiBtn = page.locator('button[data-action="emoji"]');
    const promptsBtn = page.locator('button[data-action="prompts"]');
    
    const errors: string[] = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Rapid toggle
    for (let i = 0; i < 5; i++) {
        await emojiBtn.click();
        await page.waitForTimeout(50);
        await promptsBtn.click();
        await page.waitForTimeout(50);
    }
    
    expect(errors).toEqual([]);
  });
});
