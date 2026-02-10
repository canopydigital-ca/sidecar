import { describe, it, expect, beforeEach } from 'vitest';
import { createShadowWrapper } from '../../src/ui/shadow';

describe('createShadowWrapper', () => {
  it('should create shadow root on an element', () => {
    const host = document.createElement('div');
    const wrapper = createShadowWrapper(host);
    
    expect(wrapper.root).toBeDefined();
    expect(wrapper.root.mode).toBe('open');
    expect(wrapper.container).toBeDefined();
    // JSDOM shadow root handling might not reflect parentElement correctly for manually appended elements?
    // Or maybe we need to append host to document body for some JSDOM behaviors.
    // However, wrapper.root.contains(wrapper.container) should be true.
    expect(wrapper.root.contains(wrapper.container)).toBe(true);
  });

  it('should create host element from template string', () => {
    const wrapper = createShadowWrapper('<div id="host"></div>');
    expect(wrapper.root).toBeDefined();
    // In current implementation, if we pass string, we assume it's created but not attached to body.
    // The wrapper.root belongs to the newly created element.
    expect(wrapper.root.host.tagName).toBe('DIV');
  });

  it('should inject styles', () => {
    const host = document.createElement('div');
    const styles = ['.foo { color: red; }'];
    const wrapper = createShadowWrapper(host, styles);
    
    const styleEl = wrapper.root.querySelector('style');
    expect(styleEl).toBeDefined();
    expect(styleEl?.textContent).toContain('color: red');
  });

  it('should clear content on detach', () => {
    const host = document.createElement('div');
    const wrapper = createShadowWrapper(host);
    
    expect(wrapper.root.innerHTML).toContain('shadow-container');
    
    wrapper.detach();
    expect(wrapper.root.innerHTML).toBe('');
  });
});
