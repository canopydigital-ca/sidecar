<script lang="ts">
  import { onMount } from 'svelte';

  let { height = $bindable(44), minHeight = 44, maxHeight = 400 } = $props();

  let dragging = $state(false);
  let startY = 0;
  let startH = 0;
  let handleEl: HTMLElement;

  function onPointerDown(ev: PointerEvent) {
    try {
      (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    } catch {}

    dragging = true;
    startY = ev.clientY;
    startH = height;

    // Add global listeners
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onMove(ev: PointerEvent) {
    if (!dragging) return;

    const dy = startY - ev.clientY;
    // Moving up (dy > 0) increases height
    const next = Math.max(minHeight, Math.min(maxHeight, startH + dy));
    height = next;
  }

  function onUp() {
    dragging = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }

  function toggleHeight() {
    if (height > minHeight) {
      height = minHeight;
    } else {
      height = 200; // Default expanded height
    }
  }
</script>

<div
  bind:this={handleEl}
  class="group relative w-full h-4 flex items-center justify-center cursor-ns-resize touch-none select-none z-30"
  role="separator"
  aria-orientation="horizontal"
  aria-label="Resize input"
  onpointerdown={onPointerDown}
  ondblclick={toggleHeight}
>
  <!-- Hit area expansion -->
  <div class="absolute inset-0 -top-3 -bottom-3 z-10"></div>

  <!-- Visual Handle -->
  <div
    class="
      relative h-[2px] w-[50px] rounded-full
      bg-gradient-to-r from-transparent via-black/20 dark:via-white/30 to-transparent
      transition-all duration-300 ease-out
      group-hover:h-2.5 group-hover:w-[70px] group-hover:from-transparent group-hover:via-transparent group-hover:to-transparent
      {dragging
      ? '!h-2.5 !w-[70px] !from-transparent !via-transparent !to-transparent'
      : ''}
    "
  >
    <!-- Dots container (revealed on hover/drag) -->
    <div
      class="
        absolute inset-0 flex items-center justify-center gap-1
        opacity-0 scale-75 transition-all duration-300 delay-75
        group-hover:opacity-100 group-hover:scale-100
        {dragging ? '!opacity-100 !scale-100' : ''}
      "
    >
      <div
        class="h-1 w-1 rounded-full bg-black/40 dark:bg-white/60 shadow-sm transition-transform duration-300 group-hover:delay-100 {dragging
          ? 'scale-110 bg-black/60 dark:bg-white/80'
          : ''}"
      ></div>
      <div
        class="h-1 w-1 rounded-full bg-black/40 dark:bg-white/60 shadow-sm transition-transform duration-300 group-hover:delay-150 {dragging
          ? 'scale-110 bg-black/60 dark:bg-white/80'
          : ''}"
      ></div>
      <div
        class="h-1 w-1 rounded-full bg-black/40 dark:bg-white/60 shadow-sm transition-transform duration-300 group-hover:delay-200 {dragging
          ? 'scale-110 bg-black/60 dark:bg-white/80'
          : ''}"
      ></div>
    </div>

    <!-- Glass/Pill background for expanded state -->
    <div
      class="
            absolute inset-0 rounded-full bg-black/5 dark:bg-white/10 opacity-0 backdrop-blur-[2px] border border-black/5 dark:border-white/5
            transition-opacity duration-300
            group-hover:opacity-100
            {dragging ? '!opacity-100' : ''}
        "
    ></div>
  </div>
</div>
