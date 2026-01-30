<script lang="ts">
  import { fly } from "svelte/transition";
  import site from "$lib/content/site.json";
  import { ArrowRight, Github } from "lucide-svelte";
  import StoreButtons from "$lib/components/StoreButtons.svelte";

  function openSource() {
    window.open(site.githubUrl, "_blank", "noopener,noreferrer");
  }
</script>

<div class="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

  <div class="container mx-auto px-6 relative z-10 text-center">
    <div in:fly={{ y: 20, duration: 600 }}>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-emerald-400 text-sm font-medium mb-8">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {site.versionBadge}
      </div>

      <h1 class="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
        {site.heroHeadline}<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">{site.heroAccent}</span>
      </h1>

      <p class="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">{site.heroBody}</p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button type="button" class="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
          {site.ctaPrimary}
        </button>

        <button type="button" on:click={openSource} class="w-full sm:w-auto px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700">
          <Github class="w-5 h-5" />
          {site.ctaSecondary}
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>

      <div class="mt-6 text-zinc-500 text-sm"><span class="opacity-80">Stores:</span></div>
      <div class="mt-3"><StoreButtons variant="hero" /></div>
    </div>
  </div>
</div>
