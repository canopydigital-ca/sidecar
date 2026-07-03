<script lang="ts">
  import { onMount } from 'svelte';
  import {
    startPQStateFeed,
    type PQState,
  } from '../../../pq/progressQuestState';
  import type { DockContext } from '../../../core/context';

  let { ctx } = $props<{ ctx: DockContext }>();

  let pqState = $state<PQState | null>(null);
  let stopFeed: (() => void) | null = null;

  onMount(() => {
    stopFeed = startPQStateFeed(ctx, {
      onUpdate: (s) => {
        pqState = s;
      },
    });

    return () => {
      stopFeed?.();
    };
  });

  function openMainPopover() {
    const btn = document.querySelector(
      'button[data-action="progressquest"]'
    ) as HTMLElement;
    if (btn) ctx.openPopover('progressquest', btn);
  }
</script>

{#if pqState}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/10 select-none group"
    role="button"
    tabindex="0"
    onclick={openMainPopover}
  >
    <!-- Icon -->
    <div
      class="flex items-center justify-center w-6 h-6 rounded bg-indigo-500/20 text-indigo-300"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>

    <div class="flex flex-col min-w-[80px]">
      <div class="flex items-center justify-between text-[11px] leading-tight">
        <span class="font-medium text-white/90">Lv {pqState.level}</span>
        <span class="text-white/60 truncate max-w-[60px]"
          >{pqState.className || 'Hero'}</span
        >
      </div>

      <!-- Progress Bar -->
      <div class="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
        <div
          class="h-full bg-indigo-500 transition-all duration-1000 ease-out"
          style:width="{Math.min(
            100,
            Math.max(
              0,
              ((pqState.xp?.current || 0) / (pqState.xp?.next || 100)) * 100
            )
          )}%"
        ></div>
      </div>
    </div>

    <!-- Stats -->
    <div
      class="flex flex-col gap-0.5 text-[10px] text-white/50 font-mono hidden sm:flex"
    >
      <div>HP {pqState.hp?.current ?? '?'}/{pqState.hp?.max ?? '?'}</div>
      <div class="text-yellow-500/80">{pqState.gold ?? 0} G</div>
    </div>
  </div>
{/if}

<style>
  /* Optional scoped styles if tailwind isn't enough */
</style>
