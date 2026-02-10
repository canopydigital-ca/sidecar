import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ensureOverlayHost, getPortal } from '../../src/features/overlay';

describe('Overlay Root', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates overlay host and portal container', () => {
    const { root } = ensureOverlayHost();
    const portal = getPortal();
    expect(root).toBeDefined();
    expect(portal).toBeDefined();
    expect(portal.id).toBe('cgpt-portal');
  });
});
