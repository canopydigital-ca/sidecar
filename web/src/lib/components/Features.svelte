<script lang="ts">
  import type { ComponentType, SvelteComponent } from "svelte";
  import { inview } from "$lib/actions/inview";
  import "$lib/styles/reveal.css";
  import type { Translation } from "$lib/i18n/types";
  
  import {
    PanelLeft, Maximize2, Minimize2, Code, MessageSquare, Activity,
    Type as TypeIcon, Settings, Layout, Cpu
  } from "lucide-svelte";

  let { features } = $props<{ features: Translation['features'] }>();

  // Map icon names from JSON/Translation to components
  // Note: We need a mapping strategy since translations just have title/desc
  // For now, we'll map by index or add 'icon' to translation type if strict
  // But strict type has title/desc.
  // Let's assume the order matches the original 'features.json' which had icons.
  // Or better, update Translation type to include icon key (but that's not translatable)
  // Let's hardcode the icon keys for now matching the English order
  const iconKeys = [
    "Layout", "PanelLeft", "Maximize2", "Minimize2", "Code", 
    "MessageSquare", "Activity", "Cpu", "Type", "Settings"
  ];

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
      {#each features as feature, index}
        {@const iconKey = iconKeys[index] || 'Layout'}
        {@const Icon = icons[iconKey] ?? Layout}
        <div use:inview class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all duration-300 group reveal" style={`transition-delay:${index * 100}ms`}>
          <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">{feature.title}</h3>
          <p class="text-zinc-400 leading-relaxed">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
