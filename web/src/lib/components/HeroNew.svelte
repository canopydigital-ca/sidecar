<script lang="ts">
  import { fly } from 'svelte/transition';
  import Icon from '$lib/components/Icon.svelte';
  import StoreButtons from '$lib/components/store-buttons/StoreButtons.svelte';
  import HeroFieldBackground from '$lib/components/HeroFieldBackground.svelte';
  import BrowserFrame from '$lib/components/BrowserFrame.svelte';
  import type { Translation } from '$lib/i18n/types';
  import DemoDock from '$lib/components/DemoDock.svelte';
  import site from '$lib/content/site.json';

  let { t } = $props<{ t: Translation['site'] }>();

  function openSource() {
    if (!site.githubUrl) return;
    window.open(
      site.githubUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }
</script>

<HeroFieldBackground
  class="min-h-[90vh] flex items-center pt-32 pb-20 lg:pt-0 lg:pb-0"
>
  <div class="container mx-auto px-6">
    <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <!-- Left Column: Content -->
      <div
        in:fly={{ y: 20, duration: 600, delay: 100 }}
        class="text-center lg:text-left"
      >
        <!-- Version Badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-emerald-400 text-sm font-medium mb-8 mx-auto lg:mx-0"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
            ></span>
          </span>
          {t.versionBadge}
        </div>

        <h1
          class="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight"
        >
          {t.heroHeadline}
        </h1>

        <p
          class="text-xl text-zinc-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
        >
          {t.heroBody}
        </p>

        <!-- CTAs -->
        <div
          class="flex flex-col sm:flex-row items-center gap-6 mb-10 justify-center lg:justify-start"
        >
          <!-- Primary CTA (Detected) -->
          <div class="flex flex-col items-center lg:items-start gap-2">
            <div class="shadow-lg shadow-emerald-500/20 rounded-xl">
              <StoreButtons variant="hero" />
            </div>
            <div class="text-xs text-zinc-500 font-medium pl-1">
              Free • 1-click install
            </div>
          </div>

          <!-- Secondary CTA -->
          <div class="flex flex-col items-center lg:items-start gap-2">
            <button
              type="button"
              onclick={openSource}
              disabled={!site.githubUrl}
              class="min-w-[200px] px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700"
            >
              <Icon name="Github" class="w-5 h-5" />
              {t.ctaSecondary}
            </button>
          </div>
        </div>

        <!-- Trust Row -->
        <div
          class="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-zinc-500 font-medium"
        >
          <div class="flex items-center gap-2">
            <Icon name="Github" class="w-4 h-4" />
            {t.trust?.openSource || 'Open Source'}
          </div>
          <div class="flex items-center gap-2">
            <Icon name="Shield" class="w-4 h-4" />
            {t.trust?.noAccount || 'No account required'}
          </div>
        </div>
      </div>

      <!-- Right Column: Visual -->
      <div
        in:fly={{ y: 20, duration: 600, delay: 300 }}
        class="relative hidden lg:block perspective-1000"
      >
        <div
          class="relative transform rotate-y-[-5deg] rotate-x-[2deg] transition-transform duration-500 hover:rotate-0"
        >
          <BrowserFrame
            class="h-[600px] shadow-2xl border-zinc-700/50 bg-zinc-900"
          >
            <div class="flex flex-col h-full text-zinc-300 font-sans relative">
              <!-- Fake ChatGPT UI -->
              <div class="flex-1 p-8">
                <!-- Chat Bubbles -->
                <div class="space-y-8 max-w-2xl mx-auto">
                  <div class="flex justify-end">
                    <div
                      class="bg-zinc-800 p-4 rounded-2xl rounded-tr-sm text-sm"
                    >
                      Help me write a macro for Sidecar.
                    </div>
                  </div>
                  <div class="flex justify-start gap-4">
                    <div
                      class="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center"
                    >
                      <div class="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                    </div>
                    <div class="space-y-3 text-sm">
                      <p>Sure! Here is a simple macro script:</p>
                      <div
                        class="bg-black/40 p-3 rounded-md font-mono text-xs border border-white/5"
                      >
                        const macro = new Macro("Hello World");
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dock at bottom -->
              <div class="absolute bottom-6 left-6 z-50">
                <DemoDock compact />
              </div>

              <!-- Feature Highlight Ring (Optional) -->
              <div
                class="absolute bottom-4 left-4 right-auto top-auto w-[400px] h-[100px] border-2 border-emerald-500/30 rounded-full blur-xl pointer-events-none"
              ></div>
            </div>
          </BrowserFrame>

          <!-- Label -->
          <div
            class="absolute -bottom-6 left-20 text-xs text-zinc-500 font-mono flex items-center gap-2"
          >
            <div class="w-px h-8 bg-zinc-700"></div>
            Sidecar Dock
          </div>
        </div>
      </div>
    </div>
  </div>
</HeroFieldBackground>
