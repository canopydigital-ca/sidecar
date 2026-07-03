import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ensureDockInstalled } from '@runtime/features/dock/dock';
import { findComposerAnchor } from '@runtime/features/composer/find';

vi.mock('@runtime/features/composer/find', () => ({
  findComposerAnchor: vi.fn()
}));

vi.mock('@runtime/core/log', () => ({
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));
vi.mock('@runtime/ui/components/dock/mountDock', () => ({
    ensureDockMount: vi.fn(),
    updateDockMount: vi.fn(),
    destroyDockMount: vi.fn()
}));
vi.mock('@runtime/pq/service', () => ({
    getProgressQuestService: () => ({ init: vi.fn() })
}));
vi.mock('@runtime/features/settings/storage', () => ({
    peekSettings: () => ({}),
    subscribeSettings: vi.fn()
}));
vi.mock('@runtime/core/debugFlag', () => ({
    getDebugEnabled: async () => false
}));
vi.mock('@runtime/features/dock/dockLogic', () => ({
    normalizeDockOrder: () => ({ order: [], hasDefaults: false }),
    isDockItemEnabled: () => true,
    DOCK_COMPAT_MAP: {}
}));

describe('Dock Reinsertion Logic', () => {
  let parent: HTMLElement;
  let anchor: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    parent = document.createElement('div');
    anchor = document.createElement('div');
    parent.appendChild(anchor);
    document.body.appendChild(parent);

    vi.clearAllMocks();

    (window as any).__CGPT_DOCK_CRASHED = undefined;

    document.getElementById('cgpt-dock')?.remove();
    document.getElementById('cgpt-ext-root')?.remove();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should position the dock when a visible composer anchor is found', () => {
    (findComposerAnchor as any).mockReturnValue({ parent, anchor });
    anchor.getBoundingClientRect = () => ({
      width: 200,
      height: 40,
      top: 0,
      left: 10,
      right: 210,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);

    expect(ensureDockInstalled({} as any)).toBe(true);

    expect(findComposerAnchor).toHaveBeenCalled();
    const dock = document.getElementById('cgpt-dock');
    expect(dock).toBeTruthy();
    expect(dock?.style.display).toBe('block');
    expect(dock?.style.width).toBe('184px');
    expect(dock?.style.left).toBe('18px');
  });

  it('should hide the dock when the anchor has no layout', () => {
    (findComposerAnchor as any).mockReturnValue({ parent, anchor });
    anchor.getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);

    expect(ensureDockInstalled({} as any)).toBe(true);

    const dock = document.getElementById('cgpt-dock');
    expect(dock).toBeTruthy();
    expect(dock?.style.display).toBe('none');
  });
});
