import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ensureDockInstalled } from '../../../../src/features/dock/dock';
import { findComposerAnchor } from '../../../../src/features/composer/find';
import { safeInsertBefore } from '../../../../src/core/dom';

vi.mock('../../../../src/features/composer/find', () => ({
  findComposerAnchor: vi.fn()
}));

vi.mock('../../../../src/core/dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        safeInsertBefore: vi.fn()
    };
});

vi.mock('../../../../src/core/log', () => ({
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));
vi.mock('../../../../src/ui/components/dock/mountDock', () => ({
    ensureDockMount: vi.fn(),
    updateDockMount: vi.fn(),
    destroyDockMount: vi.fn()
}));
vi.mock('../../../../src/pq/service', () => ({
    getProgressQuestService: () => ({ init: vi.fn() })
}));
vi.mock('../../../../src/features/settings/storage', () => ({
    peekSettings: () => ({}),
    subscribeSettings: vi.fn()
}));
vi.mock('../../../../src/core/debugFlag', () => ({
    getDebugEnabled: async () => false
}));
vi.mock('../../../../src/features/dock/dockLogic', () => ({
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
    vi.useFakeTimers();

    (window as any).__CGPT_DOCK_CRASHED = undefined;
    
    const existing = document.getElementById('cgpt-dock');
    if (existing) existing.remove();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start reinsertion loop and insert dock when anchor found', () => {
    (findComposerAnchor as any).mockReturnValue({ parent, anchor });
    (safeInsertBefore as any).mockImplementation((p: Node, n: Node) => {
        p.appendChild(n);
        return true;
    });
    anchor.getBoundingClientRect = () => ({
      width: 10,
      height: 10,
      top: 0,
      left: 0,
      right: 10,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);

    ensureDockInstalled({} as any);

    vi.advanceTimersByTime(1100);

    expect(findComposerAnchor).toHaveBeenCalled();
    expect(safeInsertBefore).toHaveBeenCalled();
  });

  it('should skip reinsertion when anchor has no layout', () => {
    (findComposerAnchor as any).mockReturnValue({ parent, anchor });
    (safeInsertBefore as any).mockImplementation((p: Node, n: Node) => {
      p.appendChild(n);
      return true;
    });
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

    ensureDockInstalled({} as any);
    expect(safeInsertBefore).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1100);

    expect(safeInsertBefore).toHaveBeenCalledTimes(1);
  });
});
