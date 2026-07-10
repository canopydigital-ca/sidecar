import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Regression suite: runs the built WXT chrome output against its OWN demo
 * host (extensions/wxt/demo + scripts/demo-host.ts).
 *
 * This is the regression net for the shadow-CSS split (Tailwind must reach
 * the shadow UI, preflight must NOT reach the document) and the deterministic
 * composer-anchor work in packages/host-chatgpt/src/adapter.ts.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WXT_OUT_DIR = path.resolve(__dirname, '../../.output/chrome');
const WXT_SCRIPT_PATH = path.join(WXT_OUT_DIR, 'content-scripts', 'chatgpt-dock.js');

// All popover kinds reachable from default dock buttons (data-action == kind).
const POPOVER_KINDS = [
  'settings',
  'prompts',
  'gameIcons',
  'pets',
  'fonts',
  'progressquest',
  'emoji',
  'help',
] as const;

// The composer input shell the dock is expected to hug on the demo host DOM.
const SHELL_SELECTOR = '.wcDTda_prosemirror-parent';
const FORM_SELECTOR = 'form.group\\/composer';

// Keep in sync with FORBIDDEN_DOCUMENT_CSS in scripts/assert-style-parity.ts.
// (That script runs its assertions at import time, so the patterns are
// duplicated here instead of imported.)
const FORBIDDEN_DOCUMENT_CSS = [
  { label: 'Tailwind universal reset', source: String.raw`(^|})\s*\*\s*,\s*:(before|after)`, flags: 'i' },
  { label: 'Tailwind form reset', source: String.raw`(^|})\s*button\s*,\s*input\s*,\s*select`, flags: 'i' },
  { label: 'Tailwind media reset', source: String.raw`(^|})\s*img\s*,\s*svg\s*,\s*video`, flags: 'i' },
  { label: 'Tailwind container utility', source: String.raw`(^|})\s*\.container\s*\{`, flags: 'i' },
  { label: 'Tailwind base layer', source: String.raw`@layer\s+base`, flags: 'i' },
];

// pq-host.html now base-escapes to /pq/ for bridge.js and pq-theme.css; no
// console errors are ignored, so a regression of those 404s fails the suite.
const KNOWN_PREEXISTING_ERRORS: RegExp[] = [];

let consoleErrors: string[] = [];
let pageErrors: string[] = [];

function unexpectedConsoleErrors(): string[] {
  return consoleErrors.filter((text) => !KNOWN_PREEXISTING_ERRORS.some((re) => re.test(text)));
}

function dockButton(page: Page, action: string) {
  return page.locator(`#cgpt-dock button[data-action="${action}"]`);
}

function popover(page: Page, kind: string) {
  return page.locator(`#cgpt-popover[data-kind="${kind}"]`);
}

/** Number of popover nodes inside the overlay shadow root. */
async function popoverCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.getElementById('cgpt-ext-root');
    return root?.shadowRoot?.querySelectorAll('.cgpt-popover').length ?? 0;
  });
}

/** Resolves the deepest focused element across shadow boundaries. */
async function deepActiveDescriptor(page: Page): Promise<string> {
  return page.evaluate(() => {
    let el: Element | null = document.activeElement;
    while (el && (el as HTMLElement).shadowRoot?.activeElement) {
      el = (el as HTMLElement).shadowRoot!.activeElement;
    }
    if (!el) return '(none)';
    const action = el.getAttribute('data-action');
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${action ? `[data-action=${action}]` : ''}`;
  });
}

/** Dock placement metrics relative to an anchor-ish element. */
async function placementMetrics(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const dock = document.getElementById('cgpt-dock');
    const target = document.querySelector(sel);
    if (!dock || !target) return null;
    const d = dock.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    if (d.width === 0 || t.width === 0) return null;
    return {
      gap: Math.round(t.top - d.bottom),
      widthDelta: Math.round(t.width - d.width),
      leftDelta: Math.round(d.left - t.left),
      rightDelta: Math.round(t.right - d.right),
      centerDelta: Math.round(d.left + d.width / 2 - (t.left + t.width / 2)),
      dockWidth: Math.round(d.width),
      targetWidth: Math.round(t.width),
    };
  }, selector);
}

async function waitForPopoverOpenState(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const root = document.getElementById('cgpt-ext-root');
    const pop = root?.shadowRoot?.getElementById('cgpt-popover');
    if (!pop) return false;
    return pop.dataset.state === 'open' && getComputedStyle(pop).opacity === '1';
  });
}

test.describe('WXT demo host regression suite', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(WXT_SCRIPT_PATH)) {
      throw new Error(
        'WXT chrome build output not found. Run `cd extensions/wxt && bunx wxt build -b chrome -e background -e chatgpt-dock` first.',
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const location = msg.location();
        consoleErrors.push(`${msg.text()}${location.url ? ` [${location.url}]` : ''}`);
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/c/demo-thread');

    // Minimal chrome mock: storage areas + runtime.getURL pointed at the demo
    // host's /wxt/ mount so the content script's real CSS fetch/split path
    // (content-scripts/chatgpt-dock.css) is exercised, exactly like the
    // packaged extension does with web-accessible resources.
    await page.evaluate(() => {
      const storageData: Record<string, unknown> = {};
      const makeArea = () => ({
        get: (keys: unknown, cb?: (res: Record<string, unknown>) => void) => {
          const exec = () => {
            const res: Record<string, unknown> = {};
            if (Array.isArray(keys)) {
              for (const k of keys) res[k] = storageData[k];
            } else if (keys && typeof keys === 'object') {
              for (const k of Object.keys(keys)) {
                res[k] = storageData[k] !== undefined ? storageData[k] : (keys as Record<string, unknown>)[k];
              }
            } else if (typeof keys === 'string') {
              res[keys] = storageData[keys];
            } else {
              Object.assign(res, storageData);
            }
            return res;
          };
          if (typeof cb === 'function') {
            setTimeout(() => cb(exec()), 5);
            return;
          }
          return new Promise((resolveGet) => setTimeout(() => resolveGet(exec()), 5));
        },
        set: (items: Record<string, unknown>, cb?: () => void) => {
          const exec = () => Object.assign(storageData, items);
          if (typeof cb === 'function') {
            setTimeout(() => {
              exec();
              cb();
            }, 5);
            return;
          }
          return new Promise<void>((resolveSet) =>
            setTimeout(() => {
              exec();
              resolveSet();
            }, 5),
          );
        },
        remove: (keys: unknown, cb?: () => void) => {
          const exec = () => {
            for (const k of Array.isArray(keys) ? keys : [keys]) delete storageData[k as string];
          };
          if (typeof cb === 'function') {
            setTimeout(() => {
              exec();
              cb();
            }, 5);
            return;
          }
          return new Promise<void>((resolveRemove) =>
            setTimeout(() => {
              exec();
              resolveRemove();
            }, 5),
          );
        },
      });
      const onChanged = { addListener: () => undefined, removeListener: () => undefined };
      const baseUrl = new URL('/wxt/', window.location.origin).toString();
      (window as any).chrome = {
        runtime: {
          id: 'mock-id',
          lastError: null,
          getURL: (p: string) => new URL(String(p ?? '').replace(/^\/+/, ''), baseUrl).toString(),
        },
        storage: {
          local: makeArea(),
          sync: makeArea(),
          session: makeArea(),
          onChanged,
        },
      };
    });

    await page.addScriptTag({ path: WXT_SCRIPT_PATH });
    await expect(page.locator('#cgpt-dock')).toBeVisible({ timeout: 5000 });
  });

  test('opens and closes every popover kind inside the overlay shadow root', async ({ page }) => {
    for (const kind of POPOVER_KINDS) {
      const btn = dockButton(page, kind);
      await expect(btn, `dock button for ${kind}`).toBeVisible();

      await btn.click();
      await expect(popover(page, kind), `${kind} popover should open`).toBeVisible();
      await expect(btn).toHaveAttribute('aria-expanded', 'true');

      const mounted = await page.evaluate(() => {
        const root = document.getElementById('cgpt-ext-root');
        const pop = root?.shadowRoot?.getElementById('cgpt-popover');
        return {
          inOverlayShadow: !!pop && !!root?.shadowRoot?.contains(pop),
          count: root?.shadowRoot?.querySelectorAll('.cgpt-popover').length ?? 0,
        };
      });
      expect(mounted.inOverlayShadow, `${kind} popover mounts in #cgpt-ext-root shadow`).toBe(true);
      expect(mounted.count, `${kind}: exactly one popover node`).toBe(1);

      await btn.click();
      await expect(popover(page, kind), `${kind} popover should close`).toBeHidden();
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
      expect(await popoverCount(page), `${kind}: no popover nodes after close`).toBe(0);
    }
  });

  test('switching popovers leaves exactly zero-or-one popover nodes', async ({ page }) => {
    await dockButton(page, 'settings').click();
    await expect(popover(page, 'settings')).toBeVisible();
    expect(await popoverCount(page)).toBe(1);

    await dockButton(page, 'prompts').click();
    await expect(popover(page, 'prompts')).toBeVisible();
    await expect(popover(page, 'settings')).toBeHidden();
    expect(await popoverCount(page)).toBe(1);

    await dockButton(page, 'emoji').click();
    await expect(popover(page, 'emoji')).toBeVisible();
    expect(await popoverCount(page)).toBe(1);

    await dockButton(page, 'emoji').click();
    await expect(popover(page, 'emoji')).toBeHidden();
    expect(await popoverCount(page)).toBe(0);
  });

  test('Escape closes the popover and returns focus to the trigger', async ({ page }) => {
    await dockButton(page, 'settings').click();
    await expect(popover(page, 'settings')).toBeVisible();
    await waitForPopoverOpenState(page);

    await page.keyboard.press('Escape');
    await expect(popover(page, 'settings')).toBeHidden();
    expect(await popoverCount(page)).toBe(0);

    await expect
      .poll(() => deepActiveDescriptor(page), { message: 'focus should return to the settings trigger' })
      .toContain('[data-action=settings]');
  });

  test('outside click closes the popover without returning focus', async ({ page }) => {
    await dockButton(page, 'settings').click();
    await expect(popover(page, 'settings')).toBeVisible();
    await waitForPopoverOpenState(page);

    await page.locator('#thread-title').click();
    await expect(popover(page, 'settings')).toBeHidden();
    expect(await popoverCount(page)).toBe(0);
    expect(await deepActiveDescriptor(page)).not.toContain('[data-action=settings]');
  });

  test('opened popover is fully styled by the generated shadow CSS', async ({ page }) => {
    await dockButton(page, 'settings').click();
    await expect(popover(page, 'settings')).toBeVisible();
    await waitForPopoverOpenState(page);

    const styles = await page.evaluate(() => {
      const root = document.getElementById('cgpt-ext-root');
      const pop = root!.shadowRoot!.getElementById('cgpt-popover')! as HTMLElement;
      const cs = getComputedStyle(pop);
      const handle = pop.querySelector('button[aria-label="Resize panel"]') as HTMLElement | null;
      const handleCs = handle ? getComputedStyle(handle) : null;
      const handleBefore = handle ? getComputedStyle(handle, '::before') : null;
      return {
        backgroundColor: cs.backgroundColor,
        borderTopLeftRadius: cs.borderTopLeftRadius,
        boxShadow: cs.boxShadow,
        backdropFilter: cs.backdropFilter || (cs as unknown as Record<string, string>).webkitBackdropFilter || '',
        transitionDuration: cs.transitionDuration,
        opacity: cs.opacity,
        dataState: pop.dataset.state ?? null,
        hasResizeHandle: !!handle,
        handleCursor: handleCs?.cursor ?? '',
        beforeContent: handleBefore?.content ?? 'none',
        beforeBorderLeftWidth: handleBefore?.borderLeftWidth ?? '',
      };
    });

    // Popover chrome (would be browser defaults if shadow CSS went missing).
    expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(styles.backgroundColor).not.toBe('transparent');
    expect(Number.parseFloat(styles.borderTopLeftRadius)).toBeGreaterThan(0);
    expect(styles.boxShadow).not.toBe('none');
    expect(styles.backdropFilter).toContain('blur');

    // Tailwind-only signals: transition utilities + data-state open animation.
    expect(styles.transitionDuration).toContain('0.2');
    expect(styles.dataState).toBe('open');
    expect(styles.opacity).toBe('1');

    // Resize handle chevron is drawn purely with Tailwind before:* utilities.
    expect(styles.hasResizeHandle).toBe(true);
    expect(styles.handleCursor).toBe('nwse-resize');
    expect(styles.beforeContent).not.toBe('none');
    expect(styles.beforeBorderLeftWidth).toBe('2px');
  });

  test('Tailwind preflight does not leak into the document', async ({ page }) => {
    // Open a popover first so all runtime CSS paths have executed.
    await dockButton(page, 'settings').click();
    await expect(popover(page, 'settings')).toBeVisible();

    const leak = await page.evaluate((patterns) => {
      // Fresh unstyled probes: preflight would zero the h1 margin and strip
      // the button's default background/border.
      const probeH1 = document.createElement('h1');
      probeH1.textContent = 'probe';
      const probeButton = document.createElement('button');
      probeButton.textContent = 'probe';
      document.body.append(probeH1, probeButton);
      const h1Cs = getComputedStyle(probeH1);
      const buttonCs = getComputedStyle(probeButton);
      const result = {
        h1MarginTop: h1Cs.marginTop,
        buttonBackground: buttonCs.backgroundColor,
        buttonBorderTopWidth: buttonCs.borderTopWidth,
        forbidden: [] as string[],
      };
      probeH1.remove();
      probeButton.remove();

      for (const styleEl of Array.from(document.querySelectorAll('style'))) {
        const css = styleEl.textContent ?? '';
        for (const pattern of patterns) {
          if (new RegExp(pattern.source, pattern.flags).test(css)) {
            result.forbidden.push(`${pattern.label} found in style#${styleEl.id || '(anonymous)'}`);
          }
        }
      }
      return result;
    }, FORBIDDEN_DOCUMENT_CSS);

    expect(Number.parseFloat(leak.h1MarginTop)).toBeGreaterThan(0);
    expect(leak.buttonBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(leak.buttonBorderTopWidth).not.toBe('0px');
    expect(leak.forbidden).toEqual([]);
  });

  test('dock hugs the composer input shell and follows composer changes', async ({ page }) => {
    // Initial placement contract (mirrors the wxt-parity fixture contract).
    const metrics = await placementMetrics(page, SHELL_SELECTOR);
    expect(metrics).not.toBeNull();
    expect(metrics!.gap).toBeGreaterThanOrEqual(4);
    expect(metrics!.gap).toBeLessThanOrEqual(16);
    expect(Math.abs(metrics!.widthDelta - 16)).toBeLessThanOrEqual(8);
    expect(Math.abs(metrics!.leftDelta - 8)).toBeLessThanOrEqual(6);
    expect(Math.abs(metrics!.rightDelta - 8)).toBeLessThanOrEqual(6);

    // Composer resize: the anchor must be recomputed. With a narrow composer
    // the dock may legitimately stop at its content-min width (widen-to-fit
    // contract) — in that case it must still recenter over the new anchor.
    const initialDockWidth = metrics!.dockWidth;
    await page.evaluate((formSel) => {
      const form = document.querySelector(formSel) as HTMLElement;
      form.style.maxWidth = '720px';
      window.dispatchEvent(new Event('resize'));
    }, FORM_SELECTOR);

    await expect
      .poll(
        async () => {
          const m = await placementMetrics(page, SHELL_SELECTOR);
          if (!m) return 'no metrics';
          if (m.targetWidth > 720) return `shell not resized: ${m.targetWidth}`;
          if (m.gap < 4 || m.gap > 16) return `gap off: ${JSON.stringify(m)}`;
          if (Math.abs(m.centerDelta) > 6) return `not centered on anchor: ${JSON.stringify(m)}`;
          if (m.dockWidth >= initialDockWidth) return `dock width not recomputed: ${JSON.stringify(m)}`;
          const hugsShell = Math.abs(m.widthDelta - 16) <= 8;
          const contentMinExpansion = m.dockWidth > m.targetWidth - 16;
          if (!hugsShell && !contentMinExpansion) return `width contract broken: ${JSON.stringify(m)}`;
          return 'aligned';
        },
        { message: 'dock should realign after composer resize' },
      )
      .toBe('aligned');

    // Composer hidden: the dock must hide.
    await page.evaluate(() => {
      document.getElementById('thread-bottom-container')!.style.display = 'none';
      window.dispatchEvent(new Event('resize'));
    });
    await expect(page.locator('#cgpt-dock')).toBeHidden();

    // Composer restored: the dock must come back, aligned.
    await page.evaluate(() => {
      document.getElementById('thread-bottom-container')!.style.display = '';
      window.dispatchEvent(new Event('resize'));
    });
    await expect(page.locator('#cgpt-dock')).toBeVisible();
    await expect
      .poll(
        async () => {
          const m = await placementMetrics(page, SHELL_SELECTOR);
          return m && m.gap >= 4 && m.gap <= 16 ? 'aligned' : JSON.stringify(m);
        },
        { message: 'dock should realign after composer restore' },
      )
      .toBe('aligned');
  });

  test('rapid popover toggling leaves no orphans and no console errors', async ({ page }) => {
    const kinds = ['settings', 'emoji', 'help'];

    for (let round = 0; round < 10; round += 1) {
      for (const kind of kinds) {
        await dockButton(page, kind).click();
        const count = await popoverCount(page);
        expect(count, `round ${round}, ${kind}: at most one popover`).toBeLessThanOrEqual(1);
      }
    }

    // Last click opened 'help'; close it.
    await dockButton(page, 'help').click();
    await expect(popover(page, 'help')).toBeHidden();
    expect(await popoverCount(page)).toBe(0);

    expect(pageErrors, 'no uncaught page errors during rapid toggling').toEqual([]);
    expect(unexpectedConsoleErrors(), 'no console errors during rapid toggling').toEqual([]);
  });

  test('false thread-bottom boundary still anchors the dock to the composer form', async ({ page }) => {
    // Regression for the closest()-based structural recovery in
    // packages/host-chatgpt/src/adapter.ts: a `.composer`-classed wrapper
    // nested between the editor and the form is a false thread-bottom
    // boundary that cuts the ancestor walk short. The dock must still anchor
    // to the structural form, not degrade to the editor's parent (the
    // injected wrapper).
    await page.evaluate(() => {
      const editor = document.getElementById('prompt-textarea')!;
      const wrapper = document.createElement('div');
      wrapper.className = 'composer';
      editor.parentElement!.insertBefore(wrapper, editor);
      wrapper.appendChild(editor);
      window.dispatchEvent(new Event('resize'));
    });

    await expect
      .poll(
        async () => {
          const m = await page.evaluate((formSel) => {
            const dock = document.getElementById('cgpt-dock');
            const form = document.querySelector(formSel);
            const wrapper = document.querySelector('.wcDTda_prosemirror-parent > .composer');
            if (!dock || !form || !wrapper) return null;
            const d = dock.getBoundingClientRect();
            const f = form.getBoundingClientRect();
            const w = wrapper.getBoundingClientRect();
            if (d.width === 0) return null;
            return {
              formGap: Math.round(f.top - d.bottom),
              wrapperGap: Math.round(w.top - d.bottom),
              formWidthDelta: Math.round(f.width - d.width),
            };
          }, FORM_SELECTOR);
          if (!m) return 'no metrics';
          if (m.formGap < 4 || m.formGap > 16) return `not anchored to form: ${JSON.stringify(m)}`;
          if (m.wrapperGap <= 24) return `anchored to wrapper instead: ${JSON.stringify(m)}`;
          if (Math.abs(m.formWidthDelta - 16) > 8) return `width not derived from form: ${JSON.stringify(m)}`;
          return 'form-anchored';
        },
        { message: 'dock should recover the structural form anchor' },
      )
      .toBe('form-anchored');
  });
});
