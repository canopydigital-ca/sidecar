<script lang="ts">
  import { onDestroy } from "svelte";
  import { inview } from "$lib/actions/inview";
  import { countUp, formatNumber } from "$lib/utils/countUp";
  import "$lib/styles/reveal.css";

  export let label: string;
  export let target: number;
  export let suffix: string = "";
  export let note: string | undefined = undefined;
  export let decimals: number | undefined = undefined;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let value = $state(0);
  let started = false;
  let ctrl: { cancel: () => void } | null = null;

  function start() {
    if (started) return;
    started = true;
    const d = decimals ?? (Number.isInteger(target) ? 0 : 1);
    ctrl = countUp({
      to: target,
      durationMs: 900,
      decimals: d,
      reducedMotion: prefersReducedMotion,
      onUpdate: (v) => (value = v)
    });
  }

  onDestroy(() => ctrl?.cancel());
</script>

<div class="text-center reveal" use:inview on:inview={start}>
  <div class="text-3xl md:text-4xl font-bold text-white mb-2 tabular-nums">
    {formatNumber(value, decimals ?? (Number.isInteger(target) ? 0 : 1))}{suffix}
  </div>
  <div class="text-zinc-500 font-medium">{label}</div>
  {#if note}
    <div class="text-zinc-600 text-xs mt-2">{note}</div>
  {/if}
</div>
