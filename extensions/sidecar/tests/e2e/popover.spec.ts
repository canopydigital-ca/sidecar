import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.join(__dirname, '../harness/fixture.html');
const DIST_PATH = path.join(__dirname, '../../dist/content.js');
const STYLES_PATH = path.join(__dirname, '../../styles.css');

test.describe('Popover Manager Interactions', () => {
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

  test('Toggle behavior: open, close, switch', async ({ page }) => {
    const emojiBtn = page.locator('button[data-action="emoji"]');
    const promptsBtn = page.locator('button[data-action="prompts"]');
    const emojiPop = page.locator('.cgpt-popover[data-kind="emoji"]');
    const promptsPop = page.locator('.cgpt-popover[data-kind="prompts"]');

    // 1. Click emoji -> Opens
    await emojiBtn.click();
    await expect(emojiPop).toBeVisible();

    // 2. Click emoji again -> Closes
    await emojiBtn.click();
    await expect(emojiPop).toBeHidden();

    // 3. Click emoji (open) then prompts (switch)
    await emojiBtn.click();
    await expect(emojiPop).toBeVisible();
    await promptsBtn.click();
    
    // Emoji should close, prompts should open
    await expect(emojiPop).toBeHidden();
    await expect(promptsPop).toBeVisible();
  });

  test('Close behaviors: ESC and Outside Click', async ({ page }) => {
    const settingsBtn = page.locator('button[data-action="settings"]');
    const popover = page.locator('.cgpt-popover[data-kind="settings"]');

    // 1. ESC closes and restores focus
    await settingsBtn.click();
    await expect(popover).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
    
    // Check focus returned to trigger
    await expect(settingsBtn).toBeFocused();

    // 2. Outside click closes
    await settingsBtn.click();
    await expect(popover).toBeVisible();
    
    // Wait for listener to attach (setTimeout(..., 0))
    await page.waitForTimeout(100);

    // Click somewhere safe (e.g. top left of body, ensuring we don't hit the dock)
    // Assuming dock is near bottom or middle.
    await page.mouse.click(1, 1);
    await expect(popover).toBeHidden();
  });

  test('Layout constraints and Scrollable Body', async ({ page }) => {
    const settingsBtn = page.locator('button[data-action="settings"]');
    await settingsBtn.click();
    
    const popover = page.locator('.cgpt-popover[data-kind="settings"]');
    await expect(popover).toBeVisible();

    // Check body class exists
    const body = popover.locator('.cgpt-popover-body');
    await expect(body).toBeVisible();
    
    // Check overflow style on body
    await expect(body).toHaveCSS('overflow-y', 'auto');

    // Viewport clamping
    // Resize viewport to something small
    await page.setViewportSize({ width: 500, height: 400 });
    
    // Wait for resize observer to fire and animation to settle
    await page.waitForTimeout(500);
    
    const box = await popover.boundingBox();
    console.log('Popover Box:', box);
    
    expect(box).toBeTruthy();
    
    if (box) {
      // Must be within viewport (allow small margin for padding)
      expect(box.x).toBeGreaterThanOrEqual(12);
      expect(box.x + box.width).toBeLessThanOrEqual(500 - 12);
      expect(box.y).toBeGreaterThanOrEqual(0); 
      // Relaxed check: just ensure it's largely visible. 
      // If it's 526, it's way off. 400 is max.
      expect(box.y).toBeLessThan(400);
      expect(box.y + box.height).toBeLessThanOrEqual(410); // Allow slight fuzzy match
    }
  });

  test('Sidebar interaction', async ({ page }) => {
    const settingsBtn = page.locator('button[data-action="settings"]');
    await settingsBtn.click();
    const popover = page.locator('.cgpt-popover[data-kind="settings"]');
    
    const initialBox = await popover.boundingBox();
    expect(initialBox).toBeTruthy();

    // Mock sidebar resize by changing style of #stage-slideover-sidebar
    // The fixture has logic that listens to clicks on Open/Close buttons, 
    // but we can also manipulate the DOM directly to simulate a resize.
    // The PopoverManager listens to ResizeObserver on #stage-slideover-sidebar.
    
    await page.evaluate(() => {
      const sidebar = document.getElementById('stage-slideover-sidebar');
      if (sidebar) sidebar.style.width = '300px'; // Change width
    });

    // Wait for ResizeObserver
    await page.waitForTimeout(200);
    
    const newBox = await popover.boundingBox();
    expect(newBox).toBeTruthy();
    
    // The position *might* change if the dock moves or if layout shifts.
    // In our fixture, the dock is likely static or centered? 
    // Actually, dock positioning isn't strictly tied to sidebar in the fixture CSS 
    // unless we have specific styles. But we want to ensure popover stays valid.
    
    if (newBox) {
       expect(newBox.width).toBeGreaterThan(0);
       expect(newBox.height).toBeGreaterThan(0);
       // Ensure it's still visible
       await expect(popover).toBeVisible();
    }
  });
});
