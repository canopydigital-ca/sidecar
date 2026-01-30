<script lang="ts">
  import stats from "$lib/content/stats.json";
  import StatNumber from "$lib/components/StatNumber.svelte";
</script>

<div class="border-y border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
  <div class="container mx-auto px-6 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      {#each stats as stat, i (stat.label)}
        <div style={`transition-delay:${i * 100}ms`}>
          <StatNumber label={stat.label} target={stat.target} suffix={stat.suffix ?? ""} note={stat.note} decimals={stat.decimals} />
        </div>
      {/each}
    </div>
  </div>
</div>
