<script lang="ts">
  import { inview } from "$lib/actions/inview";
  import "$lib/styles/reveal.css";
  import steps from "$lib/content/howitworks.json";
  import { Download, ToggleRight, Command } from "lucide-svelte";
  const icons = { Download, ToggleRight, Command } as const;
</script>

<section id="how-it-works" class="py-32 border-t border-zinc-900">
  <div class="container mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">How it works</h2>
      <p class="text-zinc-400 text-lg">Three steps. Minimal drama. Your browser thanks you.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each steps as step, i (step.title)}
        {@const Icon = icons[step.icon] ?? Download}
        <div use:inview class="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 reveal" style={`transition-delay:${i * 120}ms`}>
          <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 mb-4">
            <svelte:component this={Icon} class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">{step.title}</h3>
          <p class="text-zinc-400 leading-relaxed">{step.body}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
