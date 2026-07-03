import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPopoverUpdater } from '../PopoverBubble.svelte';
import {
  computePopoverPosition,
  resolvePopoverPlacement,
} from '../popoverPositioning';

const flushRaf = (callbacks: FrameRequestCallback[]) => {
  const pending = callbacks.splice(0);
  pending.forEach((cb) => cb(0));
};

const makeRect = (rect: Partial<DOMRect> = {}) => ({
  x: rect.left ?? 0,
  y: rect.top ?? 0,
  width: rect.width ?? 0,
  height: rect.height ?? 0,
  top: rect.top ?? 0,
  left: rect.left ?? 0,
  right: rect.right ?? 0,
  bottom: rect.bottom ?? 0,
  toJSON: () => ({}),
});

describe('PopoverBubble', () => {
  const rafCallbacks: FrameRequestCallback[] = [];

  beforeEach(() => {
    rafCallbacks.length = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => { });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('renders without layout thrashing', () => {
    const anchor = document.createElement('button');
    const bubble = document.createElement('div');
    document.body.appendChild(anchor);
    document.body.appendChild(bubble);
    anchor.getBoundingClientRect = vi.fn(() =>
      makeRect({
        left: 100,
        top: 100,
        width: 20,
        height: 20,
        right: 120,
        bottom: 120,
      })
    ) as unknown as () => DOMRect;
    bubble.getBoundingClientRect = vi.fn(() =>
      makeRect({ width: 200, height: 80, right: 200, bottom: 80 })
    ) as unknown as () => DOMRect;

    const update = () => {
      anchor.getBoundingClientRect();
      bubble.getBoundingClientRect();
    };

    const unregister = registerPopoverUpdater(update);

    (anchor.getBoundingClientRect as ReturnType<typeof vi.fn>).mockClear();
    (bubble.getBoundingClientRect as ReturnType<typeof vi.fn>).mockClear();

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(rafCallbacks.length).toBe(1);

    flushRaf(rafCallbacks);

    expect(anchor.getBoundingClientRect).toHaveBeenCalledTimes(1);
    expect(bubble.getBoundingClientRect).toHaveBeenCalledTimes(1);

    unregister();
  });

  it('recalculates position within one animation frame', () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);

    let left = 100;
    anchor.getBoundingClientRect = vi.fn(() =>
      makeRect({
        left,
        top: 100,
        width: 20,
        height: 20,
        right: left + 20,
        bottom: 120,
      })
    ) as unknown as () => DOMRect;

    const bubble = document.createElement('div');
    document.body.appendChild(bubble);
    bubble.getBoundingClientRect = vi.fn(() =>
      makeRect({ width: 200, height: 80, right: 200, bottom: 80 })
    ) as unknown as () => DOMRect;

    let lastLeft = 0;
    const update = () => {
      const coords = computePopoverPosition(
        'top',
        anchor.getBoundingClientRect(),
        bubble.getBoundingClientRect(),
        1024,
        768,
        0
      );
      lastLeft = coords.left;
    };

    const unregister = registerPopoverUpdater(update);

    window.dispatchEvent(new Event('scroll'));
    flushRaf(rafCallbacks);

    const initialLeft = lastLeft;

    left = 200;
    window.dispatchEvent(new Event('scroll'));
    expect(rafCallbacks.length).toBe(1);
    flushRaf(rafCallbacks);

    expect(lastLeft).not.toBe(initialLeft);

    unregister();
  });

  it('flips placement near small viewport edges', () => {
    const targetRect = makeRect({
      left: 280,
      top: 100,
      width: 20,
      height: 20,
      right: 300,
      bottom: 120,
    }) as DOMRect;
    const popRect = makeRect({ width: 200, height: 80 }) as DOMRect;

    const nextPlacement = resolvePopoverPlacement(
      'right',
      targetRect,
      popRect,
      320,
      240,
      0,
      true
    );

    expect(nextPlacement).toBe('left');
  });

  it('cleans up global listeners after destroy', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const unregisterA = registerPopoverUpdater(() => { });
    const unregisterB = registerPopoverUpdater(() => { });

    const addCalls = addSpy.mock.calls.filter(
      ([event]) => event === 'scroll' || event === 'resize'
    );
    expect(addCalls.length).toBe(2);

    unregisterA();
    unregisterB();

    const removeCalls = removeSpy.mock.calls.filter(
      ([event]) => event === 'scroll' || event === 'resize'
    );
    expect(removeCalls.length).toBe(2);
  });
});
