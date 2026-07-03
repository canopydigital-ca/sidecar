<script lang="ts">
  import { popoverState } from '../../state.svelte';
  import { popoverManager } from '../../manager';
  import { onMount } from 'svelte';
  import { PetsLayer } from '../../../pets/layer/PetsLayer';
  import EmojiPopover from './EmojiPopover.svelte';
  import HelpPopover from './HelpPopover.svelte';
  import SettingsPopover from './SettingsPopover.svelte';
  import PromptsPopover from './PromptsPopover.svelte';
  import FontsPopover from './FontsPopover.svelte';
  import PetsPopover from './PetsPopover.svelte';
  import PetsInspector from './PetsInspector.svelte';
  import ProgressQuestPopover from './ProgressQuestPopover.svelte';
  import GameIconsDemoPopover from './GameIconsDemoPopover.svelte';

  let popoverEl = $state<HTMLElement | null>(null);
  let resizing = $state(false);

  function close() {
    popoverState.context?.closePopover();
  }

  // Animation and Focus action
  function animateIn(node: HTMLElement) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.dataset.state = 'open';
        const first =
          (node.querySelector(
            'input[type="text"], input[type="search"], textarea'
          ) as HTMLElement) ||
          (node.querySelector(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement);

        if (first) first.focus();
        else node.focus();
      });
    });
  }

  // Restore saved size if available
  $effect(() => {
    if (popoverState.activeKind && popoverState.context) {
      const kind = popoverState.activeKind;
      const ctx = popoverState.context;
      const meta = popoverState.metadata || {};
      
      // Load saved size asynchronously but apply it when ready
      // Since effect runs reactive, we should be careful not to loop.
      // We only read once per kind open.
      const storageKey = `cgpt_popover_size_${kind}`;
      ctx.storageGet({ [storageKey]: null }).then(res => {
        const saved = res[storageKey];
        if (saved && typeof saved.w === 'number' && typeof saved.h === 'number') {
          // Update metadata locally and trigger reposition
          popoverState.metadata = {
            ...meta,
            userW: saved.w,
            userH: saved.h
          };
          // Reposition will happen automatically due to effect on metadata
        }
      });
    }
  });

  // Reposition logic
  $effect(() => {
    if (popoverState.activeKind && popoverEl && popoverState.triggerEl) {
      // We depend on metadata changes too
      const _meta = popoverState.metadata; 
      reposition();
    }
  });

  function reposition() {
    if (!popoverEl || !popoverState.triggerEl) return;

    const pop = popoverEl;
    const trigger = popoverState.triggerEl;
    const kind = popoverState.activeKind;
    const meta = popoverState.metadata || {};

    if (!trigger.isConnected) {
      close();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const padding = 12;

    const safeTop = Math.min(Math.max(rect.top, padding), Math.max(padding, viewportH - padding));
    const safeBottom = Math.min(Math.max(rect.bottom, padding), Math.max(padding, viewportH - padding));

    let baseMaxH = typeof meta.userH === 'number' ? meta.userH : (meta.defaultH || 360);
    // Hardcoded fallback for kinds that might not have metadata set correctly yet
    if (kind === 'fonts') baseMaxH = typeof meta.userH === 'number' ? meta.userH : 280;

    const spaceBelow = viewportH - safeBottom - padding;
    const spaceAbove = safeTop - padding;

    let placeAbove = true;
    if (spaceAbove < baseMaxH && spaceBelow > spaceAbove) {
      placeAbove = false;
    }

    const availableH = placeAbove ? spaceAbove : spaceBelow;
    const safeAvailableH = availableH - 8;
    const constrainedH = Math.min(baseMaxH, safeAvailableH);

    pop.style.setProperty(
      'max-height',
      `${Math.max(100, constrainedH)}px`,
      'important'
    );
    // Also set height explicitly if resizing
    if (meta.userH) {
       pop.style.height = `${Math.max(100, constrainedH)}px`;
    } else {
       pop.style.height = '';
    }

    const allowedMaxW = viewportW - 24;
    let maxWidth = 480;
    if (kind === 'help') maxWidth = 420;
    if (kind === 'emoji') maxWidth = 320;

    if (meta.resizable) {
      const minW = typeof meta.minW === 'number' ? meta.minW : 320;
      const hardMaxW = typeof meta.maxW === 'number' ? meta.maxW : allowedMaxW;
      const effectiveMaxW = Math.min(hardMaxW, allowedMaxW);
      const safeMinW = Math.min(minW, effectiveMaxW);
      let desiredW =
        typeof meta.userW === 'number'
          ? meta.userW
          : typeof meta.defaultW === 'number'
            ? meta.defaultW
            : 380;

      if (kind === 'prompts' && typeof meta.userW !== 'number') {
        const editor = (document.querySelector('#prompt-textarea') ||
          document.querySelector('form.group\\/composer') ||
          document.querySelector('#thread-bottom-container')) as HTMLElement | null;
        const editorRect = editor?.getBoundingClientRect?.();
        if (editorRect && editorRect.width > 0) {
          desiredW = editorRect.width;
        }
      }
      const w = Math.max(safeMinW, Math.min(desiredW, effectiveMaxW));
      pop.style.width = `${w}px`;
      pop.style.maxWidth = `${effectiveMaxW}px`;
    } else {
      pop.style.width = '';
      const constrainedW = Math.min(maxWidth, allowedMaxW);
      pop.style.maxWidth = `${constrainedW}px`;
    }

    const btnCenter = rect.left + rect.width / 2;
    pop.style.position = 'fixed';

    if (placeAbove) {
      pop.style.bottom = `${viewportH - safeTop + 8}px`;
      pop.style.top = 'auto';
      pop.style.transformOrigin = 'bottom center';
    } else {
      pop.style.top = `${safeBottom + 8}px`;
      pop.style.bottom = 'auto';
      pop.style.transformOrigin = 'top center';
    }

    const width = pop.offsetWidth || pop.getBoundingClientRect().width;
    const halfW = width / 2;
    let exactLeft = btnCenter - halfW;

    if (exactLeft < padding) exactLeft = padding;
    if (exactLeft + width > viewportW - padding) {
      exactLeft = viewportW - padding - width;
    }

    pop.style.left = `${exactLeft}px`;
  }

  function startResize(e: PointerEvent) {
    const meta = popoverState.metadata || {};
    if (!popoverEl || !meta.resizable) return;
    resizing = true;

    const rect = popoverEl.getBoundingClientRect();
    
    // Ensure metadata is populated
    popoverState.metadata = {
      ...meta,
      minW: typeof meta.minW === 'number' ? meta.minW : 280,
      minH: typeof meta.minH === 'number' ? meta.minH : 180,
      defaultW: typeof meta.defaultW === 'number' ? meta.defaultW : rect.width,
      defaultH: typeof meta.defaultH === 'number' ? meta.defaultH : rect.height,
      userW: typeof meta.userW === 'number' ? meta.userW : rect.width,
      userH: typeof meta.userH === 'number' ? meta.userH : rect.height,
    };

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = rect.width;
    const startH = rect.height;

    const onMove = (ev: PointerEvent) => {
      if (!popoverEl) return;

      const nextMeta = popoverState.metadata || {};
      const minW = typeof nextMeta.minW === 'number' ? nextMeta.minW : 280;
      const minH = typeof nextMeta.minH === 'number' ? nextMeta.minH : 180;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const allowedMaxW = window.innerWidth - 24;
      const allowedMaxH = window.innerHeight - 24;

      // Logic for top-left resize handle (resizing towards top-left)
      // Wait, standard resize handle is usually bottom-right.
      // But here the handle is at top-left: `top-1.5 left-1.5`.
      // If it's top-left, dragging left increases width, dragging up increases height.
      // dx is positive when moving right (decreasing width).
      // dy is positive when moving down (decreasing height).
      
      const w = Math.max(minW, Math.min(startW - dx, allowedMaxW));
      const h = Math.max(minH, Math.min(startH - dy, allowedMaxH));

      popoverEl.style.width = `${w}px`;
      popoverEl.style.height = `${h}px`; // Force height for immediate feedback
      popoverEl.style.setProperty('max-height', `${h}px`, 'important');
      
      popoverState.metadata = { ...nextMeta, userW: w, userH: h };
      reposition();
    };

    const onUp = () => {
      resizing = false;
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      
      // Save size to storage
      if (popoverState.context && popoverState.activeKind) {
        const meta = popoverState.metadata;
        const key = `cgpt_popover_size_${popoverState.activeKind}`;
        popoverState.context.storageSet({
            [key]: { w: meta.userW, h: meta.userH }
        });
      }
    };

    e.preventDefault();
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
  }

  function resizeBy(dw: number, dh: number) {
    const meta = popoverState.metadata || {};
    if (!popoverEl || !meta.resizable) return;
    
    const rect = popoverEl.getBoundingClientRect();
    const minW = typeof meta.minW === 'number' ? meta.minW : 280;
    const minH = typeof meta.minH === 'number' ? meta.minH : 180;
    const allowedMaxW = window.innerWidth - 24;
    const allowedMaxH = window.innerHeight - 24;

    const baseW = typeof meta.userW === 'number' ? meta.userW : rect.width;
    const baseH = typeof meta.userH === 'number' ? meta.userH : rect.height;

    const w = Math.max(minW, Math.min(baseW + dw, allowedMaxW));
    const h = Math.max(minH, Math.min(baseH + dh, allowedMaxH));

    popoverEl.style.width = `${w}px`;
    popoverEl.style.height = `${h}px`;
    popoverEl.style.setProperty('max-height', `${h}px`, 'important');
    popoverState.metadata = { ...meta, userW: w, userH: h };
    reposition();
    
    // Save on keyboard resize too? Maybe debounce or just save.
    if (popoverState.context && popoverState.activeKind) {
        const key = `cgpt_popover_size_${popoverState.activeKind}`;
        popoverState.context.storageSet({
            [key]: { w, h }
        });
    }
  }

  function onResizeHandleKeydown(e: KeyboardEvent) {
    const meta = popoverState.metadata || {};
    if (!meta.resizable) return;
    const step = e.shiftKey ? 30 : 10;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      resizeBy(step, 0); // Left arrow -> expand width (dragging left)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      resizeBy(-step, 0); // Right arrow -> shrink width
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      resizeBy(0, step); // Up arrow -> expand height
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      resizeBy(0, -step); // Down arrow -> shrink height
    }
  }

  $effect(() => {
    const kind = popoverState.activeKind;
    const el = popoverEl;
    const trig = popoverState.triggerEl;

    if (kind && el) {
      popoverManager.register(kind, el, trig);
      return () => {
        popoverManager.unregister(kind);
      };
    }
  });

  function onResize() {
    reposition();
    PetsLayer.getInstance().handleResize();
  }

  onMount(() => {
    window.addEventListener('scroll', onResize, {
      passive: true,
      capture: true,
    });

    let sidebarRO: ResizeObserver | null = null;
    const sidebar =
      document.querySelector('nav') ||
      document.querySelector('[data-testid="sidebar"]');
    if (sidebar) {
      sidebarRO = new ResizeObserver(() => onResize());
      sidebarRO.observe(sidebar);
    }

    return () => {
      window.removeEventListener('scroll', onResize, { capture: true });
      sidebarRO?.disconnect();
    };
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      popoverManager.close('escape');
      return;
    }
    if (e.key === 'Tab' && popoverEl) {
      const focusables = popoverEl.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;

      const root = popoverEl.getRootNode() as Document | ShadowRoot;
      const active = root.activeElement || document.activeElement;

      if (e.shiftKey) {
        if (active === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  }
</script>

<svelte:window onresize={onResize} />

{#if popoverState.activeKind}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={popoverEl}
    use:animateIn
    id="cgpt-popover"
    class="cgpt-popover fixed z-[9999] bg-[#121212] border border-white/12 rounded-2xl shadow-2xl backdrop-blur-xl outline-none opacity-0 scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top data-[state=open]:opacity-100 data-[state=open]:scale-100 pointer-events-auto flex flex-col"
    role="dialog"
    aria-modal="false"
    aria-label={`${popoverState.activeKind} menu`}
    tabindex="-1"
    onkeydown={onKeydown}
    data-kind={popoverState.activeKind}
  >
    {#if popoverState.metadata?.resizable}
      <button
        type="button"
        class="absolute top-1.5 left-1.5 w-3.5 h-3.5 cursor-nwse-resize rounded bg-white/6 border border-white/12 p-0 focus-visible:outline-2 focus-visible:outline-[#10a37f] focus-visible:outline-offset-2 before:content-[''] before:absolute before:inset-[3px] before:border-l-2 before:border-t-2 before:border-white/35 before:rounded-[2px] z-50"
        onpointerdown={startResize}
        onkeydown={onResizeHandleKeydown}
        aria-label="Resize panel"
      ></button>
    {/if}
    <div
      class={popoverState.activeKind === 'progressquest'
        ? 'cgpt-popover-body p-3 overflow-hidden text-white flex-1 min-h-0'
        : 'cgpt-popover-body p-3 overflow-y-auto overflow-x-hidden text-white flex-1 min-h-0'}
    >
      {#if popoverState.activeKind === 'emoji'}
        <EmojiPopover onClose={close} />
      {:else if popoverState.activeKind === 'help'}
        <HelpPopover onClose={close} />
      {:else if popoverState.activeKind === 'settings' && popoverState.context}
        <SettingsPopover ctx={popoverState.context} onClose={close} />
      {:else if popoverState.activeKind === 'prompts' && popoverState.context}
        <PromptsPopover ctx={popoverState.context} onClose={close} />
      {:else if popoverState.activeKind === 'gameIcons'}
        <GameIconsDemoPopover onClose={close} />
      {:else if popoverState.activeKind === 'pets'}
        <PetsPopover onClose={close} />
      {:else if popoverState.activeKind === 'pets-inspector'}
        <PetsInspector onClose={close} />
      {:else if popoverState.activeKind === 'fonts' && popoverState.context}
        <FontsPopover ctx={popoverState.context} onClose={close} />
      {:else if popoverState.activeKind === 'progressquest' && popoverState.context}
        <ProgressQuestPopover onClose={close} ctx={popoverState.context} />
      {/if}
    </div>
  </div>
{/if}
