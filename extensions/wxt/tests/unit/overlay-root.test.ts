import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// The legacy `features/overlay` module was a re-export shim for these two
// functions (ensureGlobalOverlay as ensureOverlayHost, getGlobalPortal as
// getPortal). In the runtime they live directly on the overlay manager.
import { ensureGlobalOverlay, getGlobalPortal } from '@runtime/ui/manager';

describe('Overlay Root', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById('cgpt-ext-root')?.remove();
    document.querySelectorAll('#cgpt-ext-root').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.getElementById('cgpt-ext-root')?.remove();
    document.querySelectorAll('#cgpt-ext-root').forEach((el) => el.remove());
  });

  it('creates overlay host and portal container', () => {
    const { root } = ensureGlobalOverlay();
    const portal = getGlobalPortal();
    expect(root).toBeDefined();
    expect(portal).toBeDefined();
    expect(portal.id).toBe('cgpt-portal');
  });
});
