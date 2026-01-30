<script lang="ts">
  import type { ComponentType, SvelteComponent } from "svelte";
  import { inview } from "$lib/actions/inview";
  import "$lib/styles/reveal.css";
  import features from "$lib/content/features.json";

  import {
    PanelLeft, Maximize2, Minimize2, Code, MessageSquare, Activity,
    Type as TypeIcon, Settings, Layout, Cpu
  } from "lucide-svelte";

  type IconCmp = ComponentType<SvelteComponent> & { new (...args: any[]): SvelteComponent };
  const icons: Record<string, IconCmp> = {
    PanelLeft, Maximize2, Minimize2, Code, MessageSquare, Activity,
    Type: TypeIcon, Settings, Layout, Cpu
  };
</script>

<section id="features" class="py-32 relative">
  <div class="container mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-20">
      <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Power tools for power users</h2>
      <p class="text-zinc-400 text-lg">Everything you need to manage your AI conversations more effectively, built directly into the interface you already use.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each features as feature, index (feature.title)}
        {@const Icon = icons[feature.icon] ?? Layout}
        <div use:inview class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all duration-300 group reveal" style={`transition-delay:${index * 100}ms`}>
          <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svelte:component this={Icon} class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">{feature.title}</h3>
          <p class="text-zinc-400 leading-relaxed">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
