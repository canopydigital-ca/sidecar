<script lang="ts">
  import {
    Cat,
    Gamepad2,
    Package,
    Check,
    Download,
    HardDrive,
  } from 'lucide-svelte';
  import type { Translation } from '$lib/i18n/types';
  import { inview } from '$lib/actions/inview';
  import '$lib/styles/reveal.css';
  import PetAnimation from '$lib/components/animations/PetAnimation.svelte';
  import QuestAnimation from '$lib/components/animations/QuestAnimation.svelte';
  import RollingNumber from '$lib/components/animations/RollingNumber.svelte';

  let { t } = $props<{ t: Translation['secondaryFeatures'] }>();

  // State for download modules
  let selectedModules = $state(new Set<string>());

  // Initialize selection
  $effect(() => {
    // Only run once or when t changes significantly
    if (selectedModules.size === 0 && t.downloads.modules) {
      t.downloads.modules.forEach((m) => selectedModules.add(m.id));
      selectedModules = new Set(selectedModules); // Trigger update
    }
  });

  let totalSize = $derived(
    (t.downloads.modules || [])
      .filter((m) => selectedModules.has(m.id))
      .reduce((acc, m) => acc + m.size, 0)
  );

  function toggleModule(id: string, required: boolean | undefined) {
    if (required) return;
    if (selectedModules.has(id)) {
      selectedModules.delete(id);
    } else {
      selectedModules.add(id);
    }
    selectedModules = new Set(selectedModules);
  }
</script>

<section class="py-24 bg-zinc-950 border-t border-zinc-900 overflow-hidden">
  <div class="container mx-auto px-6">
    <!-- Playful Section: Pets & Quest -->
    <div class="mb-32">
      <div class="text-center mb-16 max-w-2xl mx-auto">
        <h2
          class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6 animate-gradient-x"
        >
          {t.title}
        </h2>
        <p class="text-zinc-400 text-lg">
          Inject some personality into your workflow. Who said productivity has
          to be boring?
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <!-- VS Code Pets Card -->
        <div
          use:inview
          class="reveal relative group rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 transition-all duration-500"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>

          <div class="relative p-8 md:p-12 flex flex-col h-full z-10">
            <div class="flex items-center gap-4 mb-6">
              <div
                class="p-3 rounded-2xl bg-pink-500/10 text-pink-400 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300"
              >
                <Cat class="w-8 h-8" />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {t.vscodePets.title}
              </h3>
            </div>

            <p class="text-zinc-400 text-lg mb-8 leading-relaxed">
              {t.vscodePets.description}
            </p>

            <!-- Lottie Placeholder / Interactive Area -->
            <div
              class="mt-auto relative w-full aspect-[2/1] bg-zinc-950/50 rounded-2xl border border-zinc-800/50 overflow-hidden flex items-center justify-center group-hover:border-pink-500/30 transition-colors"
            >
              <PetAnimation />
            </div>
          </div>
        </div>

        <!-- Progress Quest Card -->
        <div
          use:inview
          class="reveal delay-100 relative group rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 transition-all duration-500"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>

          <div class="relative p-8 md:p-12 flex flex-col h-full z-10">
            <div class="flex items-center gap-4 mb-6">
              <div
                class="p-3 rounded-2xl bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300"
              >
                <Gamepad2 class="w-8 h-8" />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {t.progressQuest.title}
              </h3>
            </div>

            <p class="text-zinc-400 text-lg mb-8 leading-relaxed">
              {t.progressQuest.description}
            </p>

            <!-- Lottie Placeholder / Interactive Area -->
            <div
              class="mt-auto relative w-full aspect-[2/1] bg-zinc-950/50 rounded-2xl border border-zinc-800/50 overflow-hidden flex items-center justify-center group-hover:border-purple-500/30 transition-colors"
            >
              <QuestAnimation />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modular Downloads Section -->
    <div use:inview class="reveal delay-200">
      <div
        class="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50"
      >
        <!-- Header -->
        <div
          class="p-8 md:p-10 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50"
        >
          <div>
            <h3
              class="text-2xl font-bold text-white mb-2 flex items-center gap-3"
            >
              <Package class="w-6 h-6 text-emerald-400" />
              {t.downloads.title}
            </h3>
            <p class="text-zinc-400 max-w-xl">{t.downloads.description}</p>
          </div>
          <div
            class="flex items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800"
          >
            <div class="text-right">
              <div
                class="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1"
              >
                {t.downloads.totalSize}
              </div>
              <div
                class="text-2xl font-mono font-bold text-white flex items-baseline justify-end gap-1"
              >
                <RollingNumber value={totalSize} decimals={0} /> MB
              </div>
            </div>
            <HardDrive class="w-8 h-8 text-zinc-700" />
          </div>
        </div>

        <!-- Modules List -->
        <div class="p-6 md:p-10 bg-zinc-950/30">
          <div class="grid grid-cols-1 gap-4">
            {#each t.downloads.modules as module (module.id)}
              {@const isSelected = selectedModules.has(module.id)}
              {@const isRequired = module.required}

              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer
                            {isSelected
                  ? 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-900/10'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}"
                onclick={() => toggleModule(module.id, isRequired)}
              >
                <!-- Checkbox -->
                <div
                  class="flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors
                                {isSelected
                    ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                    : 'bg-zinc-950 border-zinc-700 text-transparent group-hover:border-zinc-500'}"
                >
                  <Check class="w-4 h-4" />
                </div>

                <!-- Content -->
                <div class="flex-grow min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <h4 class="font-bold text-white truncate">{module.name}</h4>
                    {#if isRequired}
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-zinc-800 text-zinc-400"
                      >
                        Required
                      </span>
                    {/if}
                    {#if module.id === 'pets'}
                      <Cat class="w-4 h-4 text-pink-400" />
                    {/if}
                    {#if module.id === 'quest'}
                      <Gamepad2 class="w-4 h-4 text-purple-400" />
                    {/if}
                  </div>
                  <p class="text-sm text-zinc-400 truncate">
                    {module.description}
                  </p>
                </div>

                <!-- Size -->
                <div class="flex-shrink-0 text-right">
                  <span
                    class="text-sm font-mono font-medium"
                    class:text-emerald-400={isSelected}
                    class:text-zinc-600={!isSelected}
                  >
                    {module.size} MB
                  </span>
                </div>
              </div>
            {/each}
          </div>

          <!-- Action Bar -->
          <div class="mt-8 pt-8 border-t border-zinc-800 flex justify-end">
            <button
              class="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-950 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-white/5 active:scale-95 transform"
            >
              <Download class="w-5 h-5" />
              {t.downloads.download}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* Custom animation for gradient text */
  @keyframes gradient-x {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 15s ease infinite;
  }
</style>
