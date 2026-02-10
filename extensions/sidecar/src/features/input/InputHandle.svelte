<script lang="ts">
  import { INPUT_MIN, INPUT_MAX, FLAGS, DOCK_ID } from '../../core/constants';
  import { state } from '../../core/state';
  import { updateSettings } from '../settings/storage';
  import { clamp } from '../../core/dom';
  import type { PerfTracker } from '../composer/find';

  interface Props {
    findComposerResizeTarget: (track?: PerfTracker) => Element | null;
    track?: PerfTracker;
  }

  let { findComposerResizeTarget, track }: Props = $props();

  let dragging = $state(false);
  let startY = 0;
  let startH = 0;
  let currentHeight = $state(state.uiState.inputHeight ?? INPUT_MIN);
  let handleEl: HTMLElement;

  function onPointerDown(ev: PointerEvent) {
    const el = findComposerResizeTarget(track);
    if (!el) return;

    try {
      (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    } catch {}

    dragging = true;
    startY = ev.clientY;
    startH = el.getBoundingClientRect().height || INPUT_MIN;
    currentHeight = startH;

    // Add global listeners
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onMove(ev: PointerEvent) {
    if (!dragging) return;

    const el = findComposerResizeTarget(track);
    if (!el) return;

    const dy = startY - ev.clientY;
    const next = clamp(startH + dy, INPUT_MIN, INPUT_MAX);
    currentHeight = next;

    // Apply styles directly for smoothness
    const target = el as HTMLElement;
    target.style.setProperty('height', `${next}px`, 'important');
    target.style.setProperty('min-height', `${INPUT_MIN}px`, 'important');
    target.style.setProperty('max-height', 'none', 'important');
    target.style.resize = 'none';

    // Sync pressed states locally
    const btn = document.querySelector(
      `#${DOCK_ID} button[data-action="inputToggle"]`
    );
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

  function onUp() {
    dragging = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);

    // Persist final state
    updateSettings({
      ui: {
        inputCollapsed: false,
        inputHeight: currentHeight,
        inputHeightExpanded: currentHeight
      }
    });
  }
</script>

<div
  bind:this={handleEl}
  class="group relative w-full flex items-center justify-center cursor-ns-resize touch-none select-none py-2"
  role="separator"
  aria-orientation="horizontal"
  aria-label="Resize input"
  aria-valuenow={currentHeight}
  aria-valuemin={INPUT_MIN}
  aria-valuemax={INPUT_MAX}
  onpointerdown={onPointerDown}
>
  <!-- Hit area expansion -->
  <div class="absolute inset-0 -top-2 -bottom-2 z-10"></div>

  <!-- Visual Handle -->
  <div
    class="
      relative h-[2px] w-[100px] rounded-full
      bg-gradient-to-r from-transparent via-white/30 to-transparent
      transition-all duration-500 ease-spring
      group-hover:h-6 group-hover:w-[140px] group-hover:from-transparent group-hover:via-transparent group-hover:to-transparent
      {dragging
      ? '!h-6 !w-[140px] !from-transparent !via-transparent !to-transparent'
      : ''}
    "
  >
    <!-- Dots container (revealed on hover/drag) -->
    <div
      class="
        absolute inset-0 flex items-center justify-center gap-1.5
        opacity-0 scale-75 transition-all duration-300 delay-75
        group-hover:opacity-100 group-hover:scale-100
        {dragging ? '!opacity-100 !scale-100' : ''}
      "
    >
      <div
        class="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm transition-transform duration-300 group-hover:delay-100 {dragging
          ? 'scale-110 bg-white/80'
          : ''}"
      ></div>
      <div
        class="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm transition-transform duration-300 group-hover:delay-150 {dragging
          ? 'scale-110 bg-white/80'
          : ''}"
      ></div>
      <div
        class="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm transition-transform duration-300 group-hover:delay-200 {dragging
          ? 'scale-110 bg-white/80'
          : ''}"
      ></div>
    </div>

    <!-- Glass/Pill background for expanded state -->
    <div
      class="
            absolute inset-0 rounded-full bg-white/10 opacity-0 backdrop-blur-[2px] border border-white/5
            transition-opacity duration-300
            group-hover:opacity-100
            {dragging ? '!opacity-100 !bg-white/15 !border-white/10' : ''}
        "
    ></div>
  </div>
</div>

<style>
  /* Ensure it sits above other elements if needed */
  :global(.cgpt-input-handle-host) {
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 10;
  }

  /* Custom timing for a "playful" snap */
  .ease-spring {
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
