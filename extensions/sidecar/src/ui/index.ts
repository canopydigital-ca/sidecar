import './app.css'; // Ensure Tailwind styles are included in the build

import { mount, unmount, type Component } from 'svelte';
import DemoComponent from './components/DemoComponent.svelte';
import WelcomePopover from './components/WelcomePopover.svelte';
import DemoPage from './components/DemoPage.svelte';
import OverlayRoot from './OverlayRoot.svelte';
import type { ComponentProps } from './types';
import { createShadowWrapper, type ShadowWrapper } from './shadow';

// 1. Declarative Mount Configuration
export interface MountItem {
  selector: string;
  component: Component<any>;
  props?: Record<string, any>;
}

export const MOUNT_LIST: MountItem[] = [
  // {
  //   selector: '#demo-root',
  //   component: DemoComponent,
  //   props: { title: 'Auto Mounted Demo' }
  // },
  {
    selector: '#demo-root',
    component: WelcomePopover,
    props: { mode: 'welcome' }
  },
  {
    selector: 'body',
    component: DemoPage,
    props: {}
  }
];

// 2. Refactored ShadowMount using factory
export class ShadowMount {
  private wrapper: ShadowWrapper;
  private instance: any = null;

  constructor(
    private hostElement: HTMLElement,
    private ComponentClass: Component<any> = DemoComponent,
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
    zIndex: '10000'
  });
  document.body.appendChild(host);

  // Fetch styles if possible (or rely on them being injected already if global, but ShadowMount needs them)
  // Ideally we cache the CSS text or fetch it.
  // For simplicity, we'll try to fetch or skip.
  let css = '';
  // Note: This fetch is async but we need to mount synchronously or handle it.
  // ShadowMount accepts styles string.
  // We can just try to grab it from a known style tag if it exists, or re-fetch.
  // Or just rely on the component having internal styles (which it does mostly).
  // But global vars might be missing.
  // Let's try to find the style from existing shadow roots? No.
  // Let's just fetch it quickly if we can, or proceed.
  // Since we can't await here easily without making this async, let's make it async.
  // But the caller might not await. That's fine.

  const mount = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const url = chrome.runtime.getURL('dist/chatgpt-dock.css');
        const res = await fetch(url);
        if (res.ok) css = await res.text();
      }
    } catch (e) { }

    const instance = new ShadowMount(host, WelcomePopover, {
      mode,
      version,
      onClose: () => {
        instance.destroy();
        host.remove();
      }
    }, css);
  };

  mount();
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
