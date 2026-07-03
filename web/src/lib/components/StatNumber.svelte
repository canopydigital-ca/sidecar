<script lang="ts">
  import { inview } from "$lib/actions/inview";
  import "$lib/styles/reveal.css";
  import RollingNumber from "$lib/components/animations/RollingNumber.svelte";

  let { label, target, suffix = "", note, decimals } = $props<{
    label: string;
    target: number;
    suffix?: string;
    note?: string;
    decimals?: number;
  }>();

  let currentValue = $state(0);
  let started = false;

  const d = () => decimals ?? (Number.isInteger(target) ? 0 : 1);

  function start() {
    if (started) return;
    started = true;
    
    // Slight delay to ensure the "spin" is visible from 0
    setTimeout(() => {
        currentValue = target;
    }, 100);
  }
</script>

<div class="text-center reveal" use:inview={{ onEnter: start }}>
  <div class="text-3xl md:text-4xl font-bold text-white mb-2 tabular-nums flex items-baseline justify-center gap-0.5">
    <RollingNumber value={currentValue} decimals={d()} duration={800} />
    {#if suffix}<span>{suffix}</span>{/if}
  </div>
  <div class="text-zinc-500 font-medium">{label}</div>
  {#if note}
    <div class="text-zinc-600 text-xs mt-2">{note}</div>
  {/if}
</div>
