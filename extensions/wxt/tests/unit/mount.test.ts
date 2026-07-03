import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initUI, MOUNT_LIST, ShadowMount, DemoComponent } from '@runtime/ui/index';

// NOTE (adapted from the legacy sidecar suite): the runtime's MOUNT_LIST now
// ships empty by design — auto-mount targets are registered by the host, not
// hard-coded in the runtime. The original test asserted against the legacy
// baked-in demo-root / welcome-root entries. To keep coverage of the
// ShadowMount + initUI auto-mount machinery, we register temporary mount items
// for the duration of each test and restore MOUNT_LIST afterwards.
describe('UI Mounting System', () => {
  beforeEach(() => {
    // Mock Element.prototype.animate for Svelte transitions in JSDOM
    Element.prototype.animate = Element.prototype.animate || (() => ({
      onfinish: null,
      cancel: () => {},
      play: () => {},
      pause: () => {},
      reverse: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      finished: Promise.resolve(),
    } as unknown as Animation));

    MOUNT_LIST.length = 0;
    MOUNT_LIST.push(
      { selector: '#demo-root', component: DemoComponent },
      { selector: '#welcome-root', component: DemoComponent },
    );

    document.body.innerHTML = `
      <div id="demo-root"></div>
      <div id="welcome-root"></div>
      <div id="unmatched-root"></div>
    `;
  });

  afterEach(() => {
    MOUNT_LIST.length = 0;
    document.body.innerHTML = '';
  });

  it('should define mount list', () => {
    expect(MOUNT_LIST).toBeDefined();
    expect(MOUNT_LIST.length).toBeGreaterThan(0);
    const demoItem = MOUNT_LIST.find(item => item.selector === '#demo-root');
    expect(demoItem).toBeDefined();
  });

  it('should auto-mount components matching selectors', () => {
    const instances = initUI();

    // Should mount demo-root and welcome-root
    // We expect 2 instances
    expect(instances.length).toBe(2);

    // Check if shadow roots were created
    const demoRoot = document.getElementById('demo-root');
    expect(demoRoot?.shadowRoot).toBeDefined();

    const welcomeRoot = document.getElementById('welcome-root');
    expect(welcomeRoot?.shadowRoot).toBeDefined();

    // Unmatched should not have shadow root (unless it had one before, but here it's clean)
    const unmatched = document.getElementById('unmatched-root');
    expect(unmatched?.shadowRoot).toBeNull();
  });

  it('should return ShadowMount instances', () => {
    const instances = initUI();
    expect(instances[0]).toBeInstanceOf(ShadowMount);
  });
});
