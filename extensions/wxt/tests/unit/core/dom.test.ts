import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { $, $$, queryFirst, queryAll, getDef } from '@runtime/core/dom/query';
import { clamp, escapeHtml, setPressed, isRootClassOn, toggleRootClass } from '@runtime/core/dom/helpers';
import { isConnected, safeInsertBefore } from '@runtime/core/dom/mutation';
import { matchesPath } from '@runtime/core/dom/events';
import { waitFor } from '@runtime/core/observer';

// Mock registry
vi.mock('@runtime/core/registry', () => ({
  REGISTRY: {
    'test.key': { selector: '.test-class' },
    'test.fallback': { selector: '.non-existent', fallbacks: ['.fallback'] },
    'test.text': { selector: '.text-match', matchText: 'Hello' },
    'test.scope': { selector: '.child', scopes: ['test.key'] }
  }
}));

describe('core/dom', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.documentElement.className = ''; // Reset root classes
    vi.clearAllMocks();
  });

  describe('Query', () => {
    it('$ returns the first matching element', () => {
      container.innerHTML = '<div class="foo">1</div><div class="foo">2</div>';
      const el = $('.foo', container);
      expect(el?.textContent).toBe('1');
    });

    it('$$ returns all matching elements', () => {
      container.innerHTML = '<div class="foo">1</div><div class="foo">2</div>';
      const els = $$('.foo', container);
      expect(els.length).toBe(2);
      expect(els[1].textContent).toBe('2');
    });

    it('queryFirst finds element by registry key', () => {
      container.innerHTML = '<div class="test-class">Found</div>';
      const el = queryFirst('test.key' as any, container);
      expect(el).not.toBeNull();
      expect(el?.textContent).toBe('Found');
    });

    it('queryFirst uses fallbacks', () => {
      container.innerHTML = '<div class="fallback">Fallback</div>';
      const el = queryFirst('test.fallback' as any, container);
      expect(el?.className).toBe('fallback');
    });

    it('queryFirst checks text of the first match', () => {
      // It only checks the first element found by querySelector
      container.innerHTML = `
        <div class="text-match">Hello World</div>
        <div class="text-match">Other</div>
      `;
      const el = queryFirst('test.text' as any, container);
      expect(el?.textContent).toBe('Hello World');

      container.innerHTML = `
        <div class="text-match">Other</div>
        <div class="text-match">Hello World</div>
      `;
      const el2 = queryFirst('test.text' as any, container);
      expect(el2).toBeNull();
    });

    it('queryFirst respects scopes', () => {
      container.innerHTML = `
        <div class="test-class">
          <div class="child">Inside</div>
        </div>
        <div class="child">Outside</div>
      `;
      const el = queryFirst('test.scope' as any, container);
      expect(el?.textContent).toBe('Inside');
    });
  });

  describe('Helpers', () => {
    it('clamp should clamp value', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('escapeHtml should escape special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    it('setPressed should toggle aria-pressed', () => {
      const btn = document.createElement('button');
      setPressed(btn, true);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
      setPressed(btn, false);
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });

    it('toggleRootClass should toggle class on html element', () => {
      expect(isRootClassOn('foo')).toBe(false);
      toggleRootClass('foo');
      expect(isRootClassOn('foo')).toBe(true);
      toggleRootClass('foo');
      expect(isRootClassOn('foo')).toBe(false);
    });
  });

  describe('Mutation', () => {
    it('isConnected checks if node is in DOM', () => {
      const div = document.createElement('div');
      expect(isConnected(div)).toBe(false);
      container.appendChild(div);
      expect(isConnected(div)).toBe(true);
    });

    it('safeInsertBefore inserts node correctly', () => {
      const parent = document.createElement('div');
      container.appendChild(parent);
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      parent.appendChild(child2);

      const success = safeInsertBefore(parent, child1, child2);
      expect(success).toBe(true);
      expect(parent.firstChild).toBe(child1);
      expect(parent.lastChild).toBe(child2);
    });

    it('safeInsertBefore handles stale reference by appending', () => {
      const parent = document.createElement('div');
      container.appendChild(parent);
      const child1 = document.createElement('div');
      const stale = document.createElement('div'); // Not attached to parent

      const success = safeInsertBefore(parent, child1, stale);
      expect(success).toBe(true);
      expect(parent.lastChild).toBe(child1);
    });
  });

  describe('Events', () => {
    it('matchesPath finds element in composed path', () => {
      container.innerHTML = `
        <div class="test-class">
          <button id="btn">Click</button>
        </div>
      `;
      const btn = container.querySelector('#btn')!;
      // Mock composedPath since jsdom implementation might vary
      const event = {
        composedPath: () => [btn, container.querySelector('.test-class')!, container, document.body]
      } as unknown as Event;

      const el = matchesPath(event, 'test.key' as any);
      expect(el).not.toBeNull();
      expect(el?.className).toBe('test-class');
    });
  });

  describe('Wait', () => {
    it('waitFor resolves immediately if element exists', async () => {
      container.innerHTML = '<div class="test-class">Found</div>';
      const el = await waitFor('test.key' as any);
      expect(el).not.toBeNull();
    });
  });
});
