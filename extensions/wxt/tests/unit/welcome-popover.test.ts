import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openWelcomePopover } from '@runtime/ui/index';
import { configureRuntimeStyles } from '@runtime/ui/styles';

// Regression guard for two status-bar gear (changelog) popover bugs:
//  1. It built its shadow CSS from the raw app.css?inline (uncompiled
//     "@import tailwindcss") instead of the configured/compiled shadow CSS the
//     dock and overlay use -> the popover rendered unstyled in the WXT build.
//  2. It was appended to <body> at a z-index tied with the dock's overlay root,
//     so the dock (which reinserts its root to the end of <body>) painted over
//     it. It now mounts inside #cgpt-ext-root to share the dock's stacking
//     context and stay above the dock stage.
describe('openWelcomePopover', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    configureRuntimeStyles({ documentCssText: '', shadowCssText: '' });
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts inside the dock overlay root (#cgpt-ext-root) when present', () => {
    const root = document.createElement('div');
    root.id = 'cgpt-ext-root';
    document.body.appendChild(root);

    openWelcomePopover('changelog-slim', '9.9.9');

    const host = document.getElementById('cgpt-welcome-root-manual');
    expect(host).not.toBeNull();
    expect(host!.parentElement!.id).toBe('cgpt-ext-root');
  });

  it('falls back to <body> when the overlay root is absent', () => {
    openWelcomePopover('changelog-slim', '9.9.9');
    const host = document.getElementById('cgpt-welcome-root-manual');
    expect(host).not.toBeNull();
    expect(host!.parentElement).toBe(document.body);
  });

  it('delivers the configured (compiled) shadow CSS to the popover shadow root', () => {
    const MARKER = '.cgpt-welcome-regression-marker{color:rgb(1,2,3)}';
    configureRuntimeStyles({ documentCssText: '', shadowCssText: MARKER });

    openWelcomePopover('changelog-slim', '9.9.9');

    const host = document.getElementById('cgpt-welcome-root-manual')!;
    const styleText = host.shadowRoot?.querySelector('style')?.textContent ?? '';
    expect(styleText).toContain('cgpt-welcome-regression-marker');
  });
});
