<script lang="ts">
  import StatNumber from "$lib/components/StatNumber.svelte";
  import type { Translation } from "$lib/i18n/types";

  let { t } = $props<{ t: Translation['stats'] }>();

  const stats = $derived([
    {
      label: t.timeSaved,
      target: 2,
      suffix: t.suffixPerWeek,
      note: t.noteProjected,
      decimals: 0
    },
    {
      label: t.promptLibrary,
      target: 100,
      suffix: "+",
      note: t.noteTemplates
    },
    {
      label: t.privacyFocus,
      target: 100,
      suffix: "%",
      note: t.noteLocalStorage
    },
    {
      label: t.betaStatus,
      target: 2,
      suffix: ".0",
      note: t.notePublicPreview,
      decimals: 1
    }
  ]);
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
