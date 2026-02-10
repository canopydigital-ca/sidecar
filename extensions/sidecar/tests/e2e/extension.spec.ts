import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.join(__dirname, '../harness/fixture.html');
const DIST_PATH = path.join(__dirname, '../../dist/content.js');
const STYLES_PATH = path.join(__dirname, '../../styles.css');

test.describe('ChatGPT Dock Extension', () => {
  test.beforeAll(async () => {
    // Ensure build exists
    if (!fs.existsSync(DIST_PATH)) {
      throw new Error('dist/content.js not found. Run `bun run build` first.');
    }
  });

  test('should not mount dock on home page (no composer)', async ({ page }) => {
    // 1. Load fixture
    await page.goto(`file://${FIXTURE_PATH}`);

    // 2. Simulate Home BEFORE injection (remove composer/thread-bottom)
    await page.evaluate(() => (window as any).simulateHome());

    // 3. Inject styles and script
    if (fs.existsSync(STYLES_PATH)) {
      const styles = fs.readFileSync(STYLES_PATH, 'utf8');
      await page.addStyleTag({ content: styles });
    }
    await page.addScriptTag({ path: DIST_PATH });

    // 4. Wait for potential injection (scheduler loop)
    await page.waitForTimeout(1000);

    // 5. Assert Hidden
    const dock = page.locator('#cgpt-dock');
    await expect(dock).toBeHidden();

    const status = page.locator('#cgpt-statusbar');
    await expect(status).toBeHidden();
  });

  test.describe('Conversation View', () => {
    test.beforeEach(async ({ page }) => {
      // Fail on uncaught exceptions or console errors related to invalidation/uncaught promises
      page.on('pageerror', err => {
        throw new Error(`Uncaught exception in page: ${err.message}`);
      });

      page.on('console', msg => {
        // Log everything for debug
        console.log(`PAGE LOG: ${msg.text()}`);

        if (msg.type() === 'error') {
          const text = msg.text();
          if (text.includes('Uncaught (in promise)') || text.includes('Extension context invalidated')) {
            throw new Error(`Console error forbidden: ${text}`);
          }
        }
      });

      // Load the fixture
      await page.goto(`file://${FIXTURE_PATH}`);

      // Inject styles manually
      if (fs.existsSync(STYLES_PATH)) {
        const styles = fs.readFileSync(STYLES_PATH, 'utf8');
        await page.addStyleTag({ content: styles });
      }

      // Seed storage and mock runtime
      await page.evaluate(() => {
        window.chrome.storage.local.set({
          cgptStatusbar: true,
          cgptHideTopPicker: true,
          cgptStatMessages: true,
          cgptStatWords: true,
          cgptStatTokens: true,
          cgptStatCost: true,
          enableProjects: true
        });

        // Mock runtime for getURL
        if (!window.chrome.runtime) window.chrome.runtime = {} as any;
        window.chrome.runtime.id = 'mock-id';
        window.chrome.runtime.getURL = (path) => '../../' + path;
      });

      // Inject the content script
      await page.addScriptTag({ path: DIST_PATH });

      // Wait for the dock to appear (boot confirmation)
      await expect(page.locator('#cgpt-dock')).toBeVisible({ timeout: 5000 });
    });

    test('should hide header model picker', async ({ page }) => {
      const headerPicker = page.locator('header [data-testid="model-switcher-dropdown-button"]');
      await expect(headerPicker).toHaveCSS('opacity', '0');
      await expect(headerPicker).toHaveCSS('pointer-events', 'none');
    });

    test('should inject pill model trigger', async ({ page }) => {
      const trigger = page.locator('#cgpt-pill-model-trigger');
      await expect(trigger).toBeVisible();
      const composite = page.locator('.__composer-pill-composite');
      await expect(composite).toContainText('Extended thinking');
    });

    test('should open model menu from pill trigger', async ({ page }) => {
      const trigger = page.locator('#cgpt-pill-model-trigger');
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeHidden();
      await trigger.click();
      await expect(menu).toBeVisible();

      const triggerBox = await trigger.boundingBox();
      const menuBox = await menu.boundingBox();
      expect(triggerBox).toBeTruthy();
      expect(menuBox).toBeTruthy();
      if (triggerBox && menuBox) {
        expect(menuBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height);
        expect(Math.abs(menuBox.x - triggerBox.x)).toBeLessThan(50);
      }
    });

    test('should render dock and buttons', async ({ page }) => {
      const dock = page.locator('#cgpt-dock');
      await expect(dock).toBeVisible();
      await expect(dock.locator('button[data-action="emoji"]')).toBeVisible();
      await expect(dock.locator('button[data-action="settings"]')).toBeVisible();
      await expect(dock.locator('button[data-action="sidebar"]')).toBeVisible();
    });

    test('should adjust popover width on small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 420, height: 800 });
      await page.addStyleTag({ content: '#stage-slideover-sidebar { display: none !important; }' });
      await page.locator('button[data-action="prompts"]').click();
      const popover = page.locator('#cgpt-popover');
      await expect(popover).toBeVisible();

      const editor = page.locator('#prompt-textarea');
      const popBox = await popover.boundingBox();
      const edBox = await editor.boundingBox();
      expect(popBox).toBeTruthy();
      expect(edBox).toBeTruthy();
      if (popBox && edBox) {
        // Allow slightly larger diff (e.g. 60px) due to min-width constraints
        expect(Math.abs(popBox.width - edBox.width)).toBeLessThan(60);
      }
    });

    test('should have resize handle before dock', async ({ page }) => {
      const handle = page.locator('#cgpt-input-resize-handle');
      const dock = page.locator('#cgpt-dock');
      await expect(handle).toBeVisible();
      await expect(dock).toBeVisible();

      const isBefore = await page.evaluate(() => {
        const h = document.getElementById('cgpt-input-resize-handle');
        const d = document.getElementById('cgpt-dock');
        return h && d && h.nextElementSibling === d;
      });
      expect(isBefore).toBe(true);
    });

    test('should handle extension context invalidation gracefully', async ({ page }) => {
      await page.evaluate(() => { window.__mockInvalidation = true; });
      await page.locator('button[data-action="wide"]').click();
      const toast = page.locator('text=Extension reloaded. Refresh this tab.');
      await expect(toast).toBeVisible();
      const count = await toast.count();
      expect(count).toBe(1);
      const dock = page.locator('#cgpt-dock');
      await expect(dock).toHaveCSS('opacity', '0.5');
    });

    test('should fail gracefully when loading prompts during invalidation', async ({ page }) => {
      await page.evaluate(() => { window.__mockInvalidation = true; });
      await page.locator('button[data-action="prompts"]').click();
      const toast = page.locator('text=Extension reloaded. Refresh this tab.');
      await expect(toast).toBeVisible();
      const popover = page.locator('#cgpt-popover');
      await expect(popover).toBeVisible();
    });

    test('should trigger move to project flow', async ({ page }) => {
      const projectBtn = page.locator('button[data-action="project"]');
      await expect(projectBtn).toBeVisible();
      await projectBtn.click();
      const menu = page.locator('#mock-options-menu');
      await expect(menu).toBeVisible();
      const picker = page.locator('#mock-project-picker');
      try {
        await expect(picker).toBeVisible({ timeout: 2000 });
      } catch {
        await page.locator('#mock-move-to-project').click();
        await expect(picker).toBeVisible();
      }
    });

    test.describe('Status Bar', () => {
      test('should adjust left position and width when sidebar resizes', async ({ page }) => {
        const status = page.locator('#cgpt-statusbar');
        await expect(status).toBeAttached({ timeout: 10000 });
        await expect(status).toBeVisible();

        // Helper to check layout consistency
        // We expect width + left = 100vw (constant)
        let totalWidth = 0;

        const checkLayout = async (expectedLeft: number) => {
          // Wait for left to stabilize to expected value (since we have css transition or rAF)
          await expect(status).toHaveCSS('left', `${expectedLeft}px`);

          const box = await status.boundingBox();
          if (!box) throw new Error("No box");

          const currentTotal = box.x + box.width;
          if (totalWidth === 0) {
            totalWidth = currentTotal;
            console.log(`[TEST] Detected total width: ${totalWidth}`);
          } else {
            expect(currentTotal).toBeCloseTo(totalWidth, 1);
          }
        };

        // 1. Initial State (Sidebar is 260px + 20px padding + 40px rail = 320px)
        await checkLayout(320);

        // 2. Collapse Sidebar (0px)
        await page.evaluate(() => {
          const sb = document.getElementById('stage-slideover-sidebar');
          if (sb) {
            sb.setAttribute('style', 'width: 0px !important; padding: 0px !important; border: none !important; display: block !important;');
            window.dispatchEvent(new Event('resize')); // Force update
          }
        });

        await checkLayout(0);

        // 3. Expand Sidebar (300px + 20px padding + 40px rail = 360px)
        await page.evaluate(() => {
          const sb = document.getElementById('stage-slideover-sidebar');
          if (sb) {
            sb.setAttribute('style', 'width: 300px !important; padding: 10px !important; display: block !important;');
            window.dispatchEvent(new Event('resize'));
          }
        });
        await checkLayout(360);

        // 4. Regression guard: Sidebar < 16px should be treated as 0
        await page.evaluate(() => {
          const sb = document.getElementById('stage-slideover-sidebar');
          if (sb) {
            sb.setAttribute('style', 'width: 10px !important; padding: 0px !important; border: none !important; display: block !important;');
            window.dispatchEvent(new Event('resize'));
          }
        });
        await checkLayout(0);
      });

      test('should place version before refresh button', async ({ page }) => {
        const version = page.locator('#cgpt-version-label');
        const refresh = page.locator('#cgpt-refresh-btn');

        await expect(version).toBeVisible();
        await expect(refresh).toBeVisible();

        const vBox = await version.boundingBox();
        const rBox = await refresh.boundingBox();

        expect(vBox).toBeTruthy();
        expect(rBox).toBeTruthy();
        if (vBox && rBox) {
          // Version should be to the left of Refresh
          expect(vBox.x).toBeLessThan(rBox.x);
        }
      });

      test('should support alignment toggle', async ({ page }) => {
        const stats = page.locator('.cgpt-status-stats-container');

        // Default left
        await expect(stats).toHaveCSS('justify-content', 'flex-start');

        // Toggle to Center
        await page.locator('button[data-action="settings"]').click();
        const select = page.locator('select[data-setting="statusbarStatsAlign"]');
        await expect(select).toBeVisible();
        await select.selectOption('center');

        // Check Center
        await expect(stats).toHaveCSS('justify-content', 'center');
      });
    });

    test.describe('Sidebar Toggle', () => {
      test('should toggle sidebar open/close with robust verification', async ({ page }) => {
        const sidebarBtn = page.locator('button[data-action="sidebar"]');
        const sidebarHost = page.locator('#stage-slideover-sidebar');

        // Wait for hydration
        await page.waitForTimeout(500);

        // Initial state: Closed in fixture? No, fixture has sidebar host visible by default, but width 260px.
        // Let's check initial width.
        const width = await sidebarHost.evaluate((el) => window.getComputedStyle(el).width);
        const isOpen = parseInt(width) >= 200;

        // If open, close it first
        if (isOpen) {
          console.log("TEST: Closing initially open sidebar");
          await sidebarBtn.click();
          await expect(sidebarHost).toHaveCSS('width', '0px'); // Mock logic in fixture sets width 0
        }

        // Now test Open
        console.log("TEST: Opening sidebar");
        await sidebarBtn.click();
        // Wait for open state (width >= 200 OR scrollport interactive)
        // In fixture mock, toggling sets width to 260px or 0px.
        await expect(sidebarHost).toHaveCSS('width', '260px');

        // Now test Close
        console.log("TEST: Closing sidebar");
        await sidebarBtn.click();
        await expect(sidebarHost).toHaveCSS('width', '0px');
      });
    });
  });
});
