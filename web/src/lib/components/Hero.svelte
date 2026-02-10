<script lang="ts">
  import { fly } from 'svelte/transition';
  import { ArrowRight, Github } from 'lucide-svelte';
  import StoreButtons from '$lib/components/store-buttons/StoreButtons.svelte';
  import HeroFieldBackground from '$lib/components/HeroFieldBackground.svelte';
  import type { Translation } from '$lib/i18n/types';

  let { t } = $props<{ t: Translation['site'] }>();

  function openSource() {
    window.open(
      'https://github.com/your-org/sidecar',
      '_blank',
      'noopener,noreferrer'
    );
  }
</script>

<HeroFieldBackground class="pt-32 pb-20 lg:pt-40 lg:pb-28">
  <div class="container mx-auto px-6 text-center">
    <div in:fly={{ y: 20, duration: 600 }}>
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-emerald-400 text-sm font-medium mb-8"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
          ></span>
        </span>
        {t.versionBadge}
      </div>

      <h1 class="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
        {t.heroHeadline}<br />
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500"
          >{t.heroAccent}</span
        >
      </h1>

      <p class="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        {t.heroBody}
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          class="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          {t.ctaPrimary}
        </button>

        <button
          type="button"
          onclick={openSource}
          class="w-full sm:w-auto px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700"
        >
          <Github class="w-5 h-5" />
          {t.ctaSecondary}
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>

      <div class="mt-6 text-zinc-500 text-sm">
        <span class="opacity-80">Stores:</span>
      </div>
      <div class="mt-3"><StoreButtons variant="hero" /></div>
    </div>
  </div>
</HeroFieldBackground>
