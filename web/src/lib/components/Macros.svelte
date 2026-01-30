<script lang="ts">
  import { inview } from "$lib/actions/inview";
  import "$lib/styles/reveal.css";
  import data from "$lib/content/macros.json";
  import { Command, Workflow, History, Gauge } from "lucide-svelte";
  const icons = { Command, Workflow, History, Gauge } as const;
</script>

<section id="macros" class="py-32 border-t border-zinc-900">
  <div class="container mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">{data.headline}</h2>
      <p class="text-zinc-400 text-lg">{data.subhead}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each data.items as item, i (item.title)}
        {@const Icon = icons[item.icon] ?? Command}
        <div use:inview class="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 reveal" style={`transition-delay:${i * 120}ms`}>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <svelte:component this={Icon} class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p class="text-zinc-400 leading-relaxed">{item.body}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-10 text-center text-zinc-600 text-sm">
      Non-negotiables: no heavy deps, no global DOM scans, everything in the Shadow DOM.
    </div>
  </div>
</section>
