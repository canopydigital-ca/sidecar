import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The parity harness is served by tests/harness/server.ts on its own port
// (kept separate from the demo host used by demo-host.spec.ts). Use an
// absolute URL so this spec is independent of the config-level baseURL.
const HARNESS_PORT = Number(process.env.SIDECAR_HARNESS_PORT ?? 4175);
const FIXTURE_URL = `http://127.0.0.1:${HARNESS_PORT}/tests/harness/fixture.html`;

const WXT_OUT_DIR = path.resolve(__dirname, '../../.output/chrome');
const WXT_SCRIPT_PATH = path.join(WXT_OUT_DIR, 'content-scripts', 'chatgpt-dock.js');
const WXT_CSS_PATH = path.join(WXT_OUT_DIR, 'content-scripts', 'chatgpt-dock.css');

test.describe('WXT Parity Harness (fixture)', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(WXT_SCRIPT_PATH)) {
      throw new Error(
        'WXT build output not found. Run `cd extensions/wxt; bunx wxt build -b chrome -e background -e chatgpt-dock` first.',
      );
    }
  });

  test.describe('Conversation View', () => {
    test.beforeEach(async ({ page }) => {
      page.on('pageerror', (err) => {
        throw new Error(`Uncaught exception in page: ${err.message}`);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (text.includes('Uncaught (in promise)') || text.includes('Extension context invalidated')) {
            throw new Error(`Console error forbidden: ${text}`);
          }
        }
      });

      await page.goto(FIXTURE_URL);

      if (fs.existsSync(WXT_CSS_PATH)) {
        const css = fs.readFileSync(WXT_CSS_PATH, 'utf8');
        await page.addStyleTag({ content: css });
      }

      // Ensure chrome.runtime.getURL returns a stable, fetchable URL for WAR loads when exercised.
      // For most tests below, this should not be required, but keeping it consistent reduces flake.
      await page.evaluate(() => {
        const baseUrl = new URL('/wxt/', window.location.origin).toString();
        if (!window.chrome.runtime) window.chrome.runtime = {} as any;
        window.chrome.runtime.id = 'mock-id';
        window.chrome.runtime.getURL = (p) => {
          const rel = String(p ?? '').replace(/^\/+/, '');
          return new URL(rel, baseUrl).toString();
        };

        window.chrome.storage.local.set({
          cgptStatusbar: true,
          cgptHideTopPicker: true,
          cgptStatMessages: true,
          cgptStatWords: true,
          cgptStatTokens: true,
          cgptStatCost: true,
          enableProjects: true,
        });
      });

      await page.addScriptTag({ path: WXT_SCRIPT_PATH });
      await page.waitForTimeout(350);
      // Helpful debug if the content script runs but docking doesn't position.
      const debug = await page.evaluate(() => {
        const form = document.querySelector('form.group\\/composer');
        const editor = document.querySelector('#prompt-textarea');
        const bottom = document.querySelector('#thread-bottom-container');
        const dock = document.getElementById('cgpt-dock');
        const style = dock ? getComputedStyle(dock) : null;
        const parent = dock?.parentElement ?? null;
        const grandparent = parent?.parentElement ?? null;
        const parentStyle = parent ? getComputedStyle(parent) : null;
        const grandparentStyle = grandparent ? getComputedStyle(grandparent) : null;
        const shadowRoot = (dock as any)?.shadowRoot as ShadowRoot | undefined;
        const shadowContainer = shadowRoot?.getElementById?.('shadow-container') as HTMLElement | null | undefined;
        const shadowContainerStyle = shadowContainer ? getComputedStyle(shadowContainer) : null;
        const extRoot = document.getElementById('cgpt-ext-root') as HTMLElement | null;
        const extStage = document.getElementById('cgpt-ext-stage') as HTMLElement | null;

        return {
          viewport: { innerWidth: window.innerWidth, innerHeight: window.innerHeight },
          extRoot: extRoot
            ? {
                style: extRoot.getAttribute('style'),
                rect: (() => {
                  const r = extRoot.getBoundingClientRect();
                  return { x: r.x, y: r.y, width: r.width, height: r.height };
                })(),
                offsetWidth: extRoot.offsetWidth,
                offsetHeight: extRoot.offsetHeight,
              }
            : null,
          extStage: extStage
            ? {
                style: extStage.getAttribute('style'),
                computedPosition: getComputedStyle(extStage).position,
                computedDisplay: getComputedStyle(extStage).display,
                computedInset: getComputedStyle(extStage).inset,
                computedWidth: getComputedStyle(extStage).width,
                computedHeight: getComputedStyle(extStage).height,
                rect: (() => {
                  const r = extStage.getBoundingClientRect();
                  return { x: r.x, y: r.y, width: r.width, height: r.height };
                })(),
                offsetWidth: extStage.offsetWidth,
                offsetHeight: extStage.offsetHeight,
              }
            : null,
          hasComposerForm: !!form,
          composerFormRect: form
            ? ((form as HTMLElement).getBoundingClientRect().toJSON?.() ??
                (() => {
                  const r = (form as HTMLElement).getBoundingClientRect();
                  return {
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                    top: r.top,
                    right: r.right,
                    bottom: r.bottom,
                    left: r.left,
                  };
                })())
            : null,
          hasEditor: !!editor,
          hasBottom: !!bottom,
          dockExists: !!dock,
          dockStyleAttr: dock?.getAttribute('style') ?? null,
          dockLeft: dock ? (dock as HTMLElement).style.left : null,
          dockTop: dock ? (dock as HTMLElement).style.top : null,
          dockWidth: dock ? (dock as HTMLElement).style.width : null,
          dockTransform: dock ? (dock as HTMLElement).style.transform : null,
          dockIsConnected: dock ? dock.isConnected : null,
          dockOffset: dock
            ? {
                offsetWidth: (dock as HTMLElement).offsetWidth,
                offsetHeight: (dock as HTMLElement).offsetHeight,
                clientWidth: (dock as HTMLElement).clientWidth,
                clientHeight: (dock as HTMLElement).clientHeight,
              }
            : null,
          dockDisplay: style?.display ?? null,
          dockVisibility: style?.visibility ?? null,
          dockOpacity: style?.opacity ?? null,
          dockShadow: dock
            ? {
                mode: (dock as any).shadowRoot ? 'open' : 'none',
                childCount: (dock as HTMLElement).childElementCount,
                shadowChildCount: (dock as any).shadowRoot?.childElementCount ?? 0,
                shadowContainerChildCount: shadowContainer?.childElementCount ?? 0,
                shadowContainerDisplay: shadowContainerStyle?.display ?? null,
                shadowContainerRect: shadowContainer
                  ? (() => {
                      const r = shadowContainer.getBoundingClientRect();
                      return {
                        x: r.x,
                        y: r.y,
                        width: r.width,
                        height: r.height,
                        top: r.top,
                        right: r.right,
                        bottom: r.bottom,
                        left: r.left,
                      };
                    })()
                  : null,
              }
            : null,
          dockAncestors: dock
            ? {
                parentId: parent?.id ?? null,
                parentDisplay: parentStyle?.display ?? null,
                parentVisibility: parentStyle?.visibility ?? null,
                parentOpacity: parentStyle?.opacity ?? null,
                grandparentId: grandparent?.id ?? null,
                grandparentDisplay: grandparentStyle?.display ?? null,
                grandparentVisibility: grandparentStyle?.visibility ?? null,
                grandparentOpacity: grandparentStyle?.opacity ?? null,
              }
            : null,
          dockRect: dock
            ? ((dock as HTMLElement).getBoundingClientRect().toJSON?.() ??
                (() => {
                  const r = (dock as HTMLElement).getBoundingClientRect();
                  return {
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                    top: r.top,
                    right: r.right,
                    bottom: r.bottom,
                    left: r.left,
                  };
                })())
            : null,
        };
      });
      if (process.env.SIDECAR_PARITY_DEBUG) {
        console.log('[WXT parity] pre-expect debug:', debug);
      }

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

    test('should render dock and common buttons', async ({ page }) => {
      const dock = page.locator('#cgpt-dock');
      await expect(dock).toBeVisible();
      await expect(dock.locator('button[data-action="emoji"]')).toBeVisible();
      await expect(dock.locator('button[data-action="settings"]')).toBeVisible();
      await expect(dock.locator('button[data-action="sidebar"]')).toBeVisible();
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

    test('should align dock with visible composer input shell', async ({ page }) => {
      await expect(page.locator('#cgpt-dock')).toBeVisible();

      const metrics = await page.evaluate(() => {
        const dock = document.getElementById('cgpt-dock') as HTMLElement | null;
        const editor = document.getElementById('prompt-textarea') as HTMLElement | null;
        const shell = editor?.parentElement as HTMLElement | null;
        if (!dock || !shell) return null;

        const dockRect = dock.getBoundingClientRect();
        const shellRect = shell.getBoundingClientRect();

        return {
          dock: {
            left: Math.round(dockRect.left),
            right: Math.round(dockRect.right),
            width: Math.round(dockRect.width),
            bottom: Math.round(dockRect.bottom),
          },
          shell: {
            left: Math.round(shellRect.left),
            right: Math.round(shellRect.right),
            width: Math.round(shellRect.width),
            top: Math.round(shellRect.top),
          },
          gap: Math.round(shellRect.top - dockRect.bottom),
          widthDelta: Math.round(shellRect.width - dockRect.width),
          leftDelta: Math.round(dockRect.left - shellRect.left),
          rightDelta: Math.round(shellRect.right - dockRect.right),
        };
      });

      if (process.env.SIDECAR_PARITY_DEBUG) {
        console.log('[WXT parity] composer alignment metrics:', metrics);
      }

      expect(metrics).not.toBeNull();
      expect(metrics!.gap).toBeGreaterThanOrEqual(4);
      expect(metrics!.gap).toBeLessThanOrEqual(16);
      expect(Math.abs(metrics!.widthDelta - 16)).toBeLessThanOrEqual(8);
      expect(Math.abs(metrics!.leftDelta - 8)).toBeLessThanOrEqual(6);
      expect(Math.abs(metrics!.rightDelta - 8)).toBeLessThanOrEqual(6);
    });

    test('should toggle wide mode root class', async ({ page }) => {
      const wideBtn = page.locator('#cgpt-dock button[data-action="wide"]');
      await expect(wideBtn).toBeVisible();

      await expect(page.locator('html')).not.toHaveClass(/cgpt-wide/);
      await wideBtn.click();
      await expect(page.locator('html')).toHaveClass(/cgpt-wide/);
      await wideBtn.click();
      await expect(page.locator('html')).not.toHaveClass(/cgpt-wide/);
    });

    test('should open and close prompts popover', async ({ page }) => {
      const promptsBtn = page.locator('#cgpt-dock button[data-action="prompts"]');
      await expect(promptsBtn).toBeVisible();

      await promptsBtn.click();
      const popover = page.locator('#cgpt-popover[data-kind="prompts"]');
      await expect(popover).toBeVisible();

      await promptsBtn.click();
      await expect(popover).toBeHidden();
    });

    test('should trigger project move flow', async ({ page }) => {
      const projectBtn = page.locator('#cgpt-dock button[data-action="project"]');
      await expect(projectBtn).toBeVisible();

      await projectBtn.click();

      // The harness simulates the "Move to project" menu item by spawning a picker.
      const picker = page.locator('#mock-project-picker');
      await expect(picker).toBeVisible();
    });

    test('should render status bar when enabled', async ({ page }) => {
      const status = page.locator('#cgpt-statusbar');
      await expect(status).toBeVisible();
      await expect(status).toContainText('Tokens:');
    });

    test('should toggle sidebar via dock button', async ({ page }) => {
      const dockSidebar = page.locator('#cgpt-dock button[data-action="sidebar"]');
      await expect(dockSidebar).toBeVisible();

      const openBtn = page.locator('button[aria-label="Open sidebar"]');
      const closeBtn = page.locator('button[aria-label="Close sidebar"]');

      await expect(openBtn).toBeHidden();
      await expect(closeBtn).toBeVisible();

      await dockSidebar.click();
      await expect(openBtn).toBeVisible();
      await expect(closeBtn).toBeHidden();

      await dockSidebar.click();
      await expect(openBtn).toBeHidden();
      await expect(closeBtn).toBeVisible();
    });

    test('should open and close settings popover', async ({ page }) => {
      const settingsBtn = page.locator('#cgpt-dock button[data-action="settings"]');
      await expect(settingsBtn).toBeVisible();

      await settingsBtn.click();
      const popover = page.locator('#cgpt-popover[data-kind="settings"]');
      await expect(popover).toBeVisible();

      await settingsBtn.click();
      await expect(popover).toBeHidden();
    });

    test('should open and close fonts popover', async ({ page }) => {
      const fontsBtn = page.locator('#cgpt-dock button[data-action="fonts"]');
      await expect(fontsBtn).toBeVisible();

      await fontsBtn.click();
      const popover = page.locator('#cgpt-popover[data-kind="fonts"]');
      await expect(popover).toBeVisible();

      await fontsBtn.click();
      await expect(popover).toBeHidden();
    });

    test('should toggle collapse code root class', async ({ page }) => {
      const collapseBtn = page.locator('#cgpt-dock button[data-action="collapseCode"]');
      await expect(collapseBtn).toBeVisible();

      await expect(page.locator('html')).not.toHaveClass(/cgpt-collapse-code/);
      await collapseBtn.click();
      await expect(page.locator('html')).toHaveClass(/cgpt-collapse-code/);
      await collapseBtn.click();
      await expect(page.locator('html')).not.toHaveClass(/cgpt-collapse-code/);
    });

    test('should open and close emoji popover', async ({ page }) => {
      const btn = page.locator('#cgpt-dock button[data-action="emoji"]');
      await expect(btn).toBeVisible();

      await btn.click();
      const popover = page.locator('#cgpt-popover[data-kind="emoji"]');
      await expect(popover).toBeVisible();

      await btn.click();
      await expect(popover).toBeHidden();
    });

    test('should open and close help popover', async ({ page }) => {
      const btn = page.locator('#cgpt-dock button[data-action="help"]');
      await expect(btn).toBeVisible();

      await btn.click();
      const popover = page.locator('#cgpt-popover[data-kind="help"]');
      await expect(popover).toBeVisible();

      await btn.click();
      await expect(popover).toBeHidden();
    });

    test('should open and close pets popover', async ({ page }) => {
      const btn = page.locator('#cgpt-dock button[data-action="pets"]');
      await expect(btn).toBeVisible();

      await btn.click();
      const popover = page.locator('#cgpt-popover[data-kind="pets"]');
      await expect(popover).toBeVisible();

      await btn.click();
      await expect(popover).toBeHidden();
    });

    test('should open and close progressquest popover', async ({ page }) => {
      const btn = page.locator('#cgpt-dock button[data-action="progressquest"]');
      await expect(btn).toBeVisible();

      await btn.click();
      const popover = page.locator('#cgpt-popover[data-kind="progressquest"]');
      await expect(popover).toBeVisible();

      await btn.click();
      await expect(popover).toBeHidden();
    });
  });
});
