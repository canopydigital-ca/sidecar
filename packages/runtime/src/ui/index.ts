import './app.css'; // Ensure Tailwind styles are included in the build

import { mount, unmount, type Component } from 'svelte';
import DemoComponent from './components/DemoComponent.svelte';
import WelcomePopover from './components/WelcomePopover.svelte';
import OverlayRoot from './OverlayRoot.svelte';
import type { ComponentProps } from './types';
import { createShadowWrapper, type ShadowWrapper } from './shadow';
import { getConfiguredShadowCssText } from './styles';
// @ts-ignore
import appCss from './app.css?inline';
// @ts-ignore
import stylesCss from '../../styles.css?inline';

// 1. Declarative Mount Configuration
export interface MountItem {
  selector: string;
  component: Component<any>;
  props?: Record<string, any>;
}

export const MOUNT_LIST: MountItem[] = [
];

// 2. Refactored ShadowMount using factory
export class ShadowMount {
  private wrapper: ShadowWrapper;
  private instance: any = null;

  constructor(
    private hostElement: HTMLElement,
    private ComponentClass: Component<any>,
    private props: Record<string, any> = {},
    private styles: string = ''
  ) {
    // Use factory to create shadow root and container
    this.wrapper = createShadowWrapper(hostElement, styles ? [styles] : []);
    this.mount();
  }

  private mount() {
    // Mount Svelte 5 component into the container created by wrapper
    this.instance = mount(this.ComponentClass, {
      target: this.wrapper.container,
      props: this.props
    });
  }

  updateProps(newProps: Record<string, any>) {
    if (this.instance) {
      unmount(this.instance);
    }
    this.props = { ...this.props, ...newProps };
    this.mount();
  }

  destroy() {
    if (this.instance) {
      unmount(this.instance);
      this.instance = null;
    }
    this.wrapper.detach();
  }

  addEventListener(event: string, callback: (detail: any) => void) {
    this.hostElement.addEventListener(event, (e: Event) => {
      const customEvent = e as CustomEvent;
      callback(customEvent.detail);
    });
  }
}

// 3. Auto-mount function
export function initUI() {
  const mountedInstances: ShadowMount[] = [];

  MOUNT_LIST.forEach(item => {
    const elements = document.querySelectorAll(item.selector);
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Check if already mounted? For now, just mount.
        const mountInstance = new ShadowMount(el, item.component, item.props);
        mountedInstances.push(mountInstance);
      }
    });
  });

  return mountedInstances;
}

// 4. Programmatic opener for WelcomePopover
export function openWelcomePopover(mode: 'intro' | 'changelog' | 'welcome' | 'demo' | 'changelog-slim' = 'intro', version?: string) {
  const host = document.createElement('div');
  host.id = 'cgpt-welcome-root-manual';
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    pointerEvents: 'auto',
    // Above the dock stage (2147483000/1). Hosting inside #cgpt-ext-root (below)
    // keeps this ordering stable even though the dock reinserts its root to the
    // end of <body> to stay on top of the page.
    zIndex: '2147483647'
  });
  // Mount inside the dock's overlay root when present so the modal shares its
  // stacking context and rides along with dock reinsertions — a body-level
  // sibling at equal z-index loses the DOM-order tiebreak once the dock
  // re-appends #cgpt-ext-root. Fall back to <body> before the dock exists.
  const overlayRoot = document.getElementById('cgpt-ext-root');
  (overlayRoot ?? document.body).appendChild(host);

  // Use the configured (compiled) shadow CSS the dock/overlay use — the raw
  // app.css?inline is uncompiled ("@import tailwindcss"), so relying on it
  // here left this popover unstyled in the WXT build. Falls back to the inline
  // CSS only when runtime styles have not been configured (tests/demo).
  const fallbackCss = [appCss, stylesCss].filter(Boolean).join('\n');
  const css = getConfiguredShadowCssText(fallbackCss);
  const instance = new ShadowMount(host, WelcomePopover, {
    mode,
    version,
    onClose: () => {
      instance.destroy();
      host.remove();
    }
  }, css);
}

// Export for direct usage
export { DemoComponent, WelcomePopover };
export { popoverManager, PopoverManager } from './manager';
export { OverlayRoot };
export type { ComponentProps };
export { bootRuntime } from './bootstrap';

export function mountOverlayRoot(root: ShadowRoot) {
  const target = root.getElementById('cgpt-overlay-app') || (() => {
    const div = document.createElement('div');
    div.id = 'cgpt-overlay-app';
    root.appendChild(div);
    return div;
  })();
  if ((target as any).__cgptMounted) return;
  mount(OverlayRoot, { target });
  (target as any).__cgptMounted = true;
}
