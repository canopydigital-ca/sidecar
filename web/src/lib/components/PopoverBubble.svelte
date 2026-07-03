<script module lang="ts">
  type UpdateFn = () => void;

  const updaters = new Set<UpdateFn>();
  let rafId = 0;
  let listenersAttached = false;

  const schedule = () => {
    if (typeof window === 'undefined' || rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updaters.forEach((fn) => fn());
    });
  };

  const attachListeners = () => {
    if (listenersAttached || typeof window === 'undefined') return;
    listenersAttached = true;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  };

  const detachListeners = () => {
    if (!listenersAttached || typeof window === 'undefined') return;
    listenersAttached = false;
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };

  export const registerPopoverUpdater = (fn: UpdateFn) => {
    updaters.add(fn);
    attachListeners();
    schedule();
    return () => {
      updaters.delete(fn);
      if (updaters.size === 0) detachListeners();
    };
  };

  export const schedulePopoverUpdate = () => {
    schedule();
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    computePopoverPosition,
    resolvePopoverPlacement,
    type PopoverPlacement,
  } from '$lib/components/popoverPositioning';

  export type PopoverTrigger = 'hover' | 'click' | 'focus';

  let {
    id,
    text,
    placement = 'top',
    offset = 0,
    trigger = 'hover',
    autoFlip = true,
    anchor,
    anchorRoot,
    targetSelector,
    open,
    hidden = false,
    dimmed = false,
    onActivate,
    onHoverChange,
  } = $props<{
    id?: string;
    text: string;
    placement?: PopoverPlacement;
    offset?: number;
    trigger?: PopoverTrigger;
    autoFlip?: boolean;
    anchor?: HTMLElement | null;
    anchorRoot?: HTMLElement | null;
    targetSelector?: string;
    open?: boolean;
    hidden?: boolean;
    dimmed?: boolean;
    onActivate?: () => void;
    onHoverChange?: (value: string | null) => void;
  }>();

  let popoverEl = $state<HTMLElement | null>(null);
  let currentAnchor: HTMLElement | null = null;
  let cleanupAnchor: (() => void) | null = null;
  let unregisterUpdate: (() => void) | null = null;
  let anchorObserver: ResizeObserver | null = null;
  let popoverObserver: ResizeObserver | null = null;

  let internalOpen = $state(false);
  let isOpen = $derived(open ?? internalOpen);
  let leftPx = $state('0px');
  let topPx = $state('0px');
  let actualPlacement = $state<PopoverPlacement>('top');
  let scale = $state(1);
  let pushOffset = $state(0);

  const appliedScale = $derived(dimmed ? scale * 0.9 : scale);
  const opacityValue = $derived(hidden ? 0 : dimmed ? 0.3 : scale);

  const translateY = $derived.by(() => {
    if (actualPlacement.includes('bottom')) return -pushOffset;
    if (actualPlacement.includes('top')) return pushOffset;
    return 0;
  });

  const transformValue = $derived.by(
    () => `translate(0, ${translateY}px) scale(${appliedScale})`
  );

  const resolveAnchor = () => {
    if (anchor) return anchor;
    if (typeof document === 'undefined') return null;
    if (anchorRoot && targetSelector) {
      return anchorRoot.querySelector(targetSelector) as HTMLElement | null;
    }
    if (targetSelector) {
      return document.querySelector(targetSelector) as HTMLElement | null;
    }
    return null;
  };

  const detachAnchorListeners = () => {
    if (cleanupAnchor) cleanupAnchor();
    cleanupAnchor = null;
  };

  const attachAnchorListeners = (el: HTMLElement) => {
    detachAnchorListeners();
    if (open !== undefined) return;

    const cleanups: Array<() => void> = [];

    if (trigger === 'hover') {
      const onEnter = () => {
        internalOpen = true;
      };
      const onLeave = () => {
        internalOpen = false;
      };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    }

    if (trigger === 'focus') {
      const onFocus = () => {
        internalOpen = true;
      };
      const onBlur = () => {
        internalOpen = false;
      };
      el.addEventListener('focusin', onFocus);
      el.addEventListener('focusout', onBlur);
      cleanups.push(() => {
        el.removeEventListener('focusin', onFocus);
        el.removeEventListener('focusout', onBlur);
      });
    }

    if (trigger === 'click') {
      const onClick = () => {
        internalOpen = !internalOpen;
      };
      el.addEventListener('click', onClick);
      cleanups.push(() => {
        el.removeEventListener('click', onClick);
      });
    }

    cleanupAnchor = () => {
      cleanups.forEach((fn) => fn());
    };
  };

  const setAnchor = (nextAnchor: HTMLElement | null) => {
    if (nextAnchor === currentAnchor) return;
    currentAnchor = nextAnchor;
    if (nextAnchor) {
      attachAnchorListeners(nextAnchor);
    } else {
      detachAnchorListeners();
    }
    if (anchorObserver) {
      anchorObserver.disconnect();
      if (nextAnchor) anchorObserver.observe(nextAnchor);
    }
  };

  const updatePosition = () => {
    if (typeof window === 'undefined' || !popoverEl) return;
    const anchorEl = resolveAnchor();
    if (!anchorEl) return;

    setAnchor(anchorEl);

    const targetRect = anchorEl.getBoundingClientRect();
    const popRect = popoverEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const nextPlacement = resolvePopoverPlacement(
      placement,
      targetRect,
      popRect,
      viewportWidth,
      viewportHeight,
      offset,
      autoFlip
    );

    actualPlacement = nextPlacement;

    const coords = computePopoverPosition(
      nextPlacement,
      targetRect,
      popRect,
      viewportWidth,
      viewportHeight,
      offset
    );

    leftPx = `${coords.left}px`;
    topPx = `${coords.top}px`;

    const progress = Math.max(
      0,
      Math.min(1, (viewportWidth - 768) / (1280 - 768))
    );
    scale = 0.8 + 0.2 * progress;
    pushOffset = (1 - progress) * 20;
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover' && open === undefined) internalOpen = true;
    if (onHoverChange) onHoverChange(id ?? null);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && open === undefined) internalOpen = false;
    if (onHoverChange) onHoverChange(null);
  };

  const handleClick = () => {
    if (onActivate) onActivate();
  };

  onMount(() => {
    unregisterUpdate = registerPopoverUpdater(updatePosition);
    if (typeof ResizeObserver !== 'undefined') {
      anchorObserver = new ResizeObserver(() => {
        schedulePopoverUpdate();
      });
      popoverObserver = new ResizeObserver(() => {
        schedulePopoverUpdate();
      });
    }
    schedulePopoverUpdate();
  });

  onDestroy(() => {
    if (unregisterUpdate) unregisterUpdate();
    if (anchorObserver) anchorObserver.disconnect();
    if (popoverObserver) popoverObserver.disconnect();
    detachAnchorListeners();
  });

  $effect(() => {
    if (anchorObserver) {
      anchorObserver.disconnect();
      const anchorEl = resolveAnchor();
      if (anchorEl) {
        anchorObserver.observe(anchorEl);
      }
    }
    schedulePopoverUpdate();
  });

  $effect(() => {
    if (popoverObserver) {
      popoverObserver.disconnect();
      if (popoverEl) {
        popoverObserver.observe(popoverEl);
      }
    }
    schedulePopoverUpdate();
  });

  $effect(() => {
    placement;
    offset;
    autoFlip;
    if (isOpen) schedulePopoverUpdate();
  });

  $effect(() => {
    if (open !== undefined) {
      internalOpen = false;
      return;
    }
    internalOpen = trigger !== 'click';
  });
</script>

{#if isOpen}
  <div
    bind:this={popoverEl}
    transition:fade={{ duration: 400 }}
    class="absolute transition-[transform,opacity] duration-300 ease-out pointer-events-auto cursor-pointer group"
    style:left={leftPx}
    style:top={topPx}
    style:transform={transformValue}
    style:opacity={opacityValue}
    data-popover-bubble="1"
    data-placement={actualPlacement}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onclick={handleClick}
    onkeydown={(e) => e.key === 'Enter' && handleClick()}
    tabindex="0"
    role="button"
  >
    <div class="relative">
      {#if actualPlacement === 'top-left'}
        <div class="absolute bottom-0 right-0 w-12 h-24 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 48 96"
            overflow="visible"
          >
            <path
              d="M48,96 C48,48 0,48 0,0"
              fill="none"
              stroke="white"
              stroke-width="1.5"
            />
            <circle cx="48" cy="96" r="2" fill="white" />
          </svg>
        </div>
        <div
          class="absolute bottom-24 right-0 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 translate-x-1/4 transition-colors duration-200"
        >
          {text}
        </div>
      {:else if actualPlacement === 'top-right'}
        <div class="absolute bottom-0 left-0 w-12 h-24 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 48 96"
            overflow="visible"
          >
            <path
              d="M0,96 C0,48 48,48 48,0"
              fill="none"
              stroke="white"
              stroke-width="1.5"
            />
            <circle cx="0" cy="96" r="2" fill="white" />
          </svg>
        </div>
        <div
          class="absolute bottom-24 left-0 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 -translate-x-1/4 transition-colors duration-200"
        >
          {text}
        </div>
      {:else if actualPlacement === 'bottom'}
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-white to-transparent opacity-50"
        ></div>
        <div
          class="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 text-center transition-colors duration-200"
        >
          {text}
        </div>
      {:else if actualPlacement === 'bottom-right'}
        <div class="absolute top-0 left-0 w-12 h-24 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 48 96"
            overflow="visible"
          >
            <path
              d="M0,0 C0,48 48,48 48,96"
              fill="none"
              stroke="white"
              stroke-width="1.5"
            />
            <circle cx="0" cy="0" r="2" fill="white" />
          </svg>
        </div>
        <div
          class="absolute top-24 left-0 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 -translate-x-1/4 transition-colors duration-200"
        >
          {text}
        </div>
      {:else if actualPlacement === 'bottom-left'}
        <div class="absolute top-0 right-0 w-12 h-24 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 48 96"
            overflow="visible"
          >
            <path
              d="M48,0 C48,48 0,48 0,96"
              fill="none"
              stroke="white"
              stroke-width="1.5"
            />
            <circle cx="48" cy="0" r="2" fill="white" />
          </svg>
        </div>
        <div
          class="absolute top-24 right-0 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 translate-x-1/4 transition-colors duration-200"
        >
          {text}
        </div>
      {:else if actualPlacement === 'left'}
        <div
          class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-l from-white to-transparent opacity-50"
        ></div>
        <div
          class="absolute right-8 top-1/2 -translate-y-1/2 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 text-center transition-colors duration-200"
        >
          {text}
        </div>
      {:else if actualPlacement === 'right'}
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-white to-transparent opacity-50"
        ></div>
        <div
          class="absolute left-8 top-1/2 -translate-y-1/2 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 text-center transition-colors duration-200"
        >
          {text}
        </div>
      {:else}
        <div
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-t from-white to-transparent opacity-50"
        ></div>
        <div
          class="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-black/80 group-hover:bg-black text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 text-center transition-colors duration-200"
        >
          {text}
        </div>
      {/if}
    </div>
  </div>
{/if}
