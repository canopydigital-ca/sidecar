<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import type { Translation } from '$lib/i18n/types';
  import { inview } from '$lib/actions/inview';
  import '$lib/styles/reveal.css';
  import PetAnimation from '$lib/components/animations/PetAnimation.svelte';
  import QuestAnimation from '$lib/components/animations/QuestAnimation.svelte';
  import RollingNumber from '$lib/components/animations/RollingNumber.svelte';

  let { t } = $props<{ t: Translation['secondaryFeatures'] }>();

  type BrowserId = 'chrome' | 'edge' | 'firefox' | 'safari';
  type VariantId = 'full' | 'light' | 'light-pq' | 'light-pets' | 'custom';

  type BrowserDef = {
    id: BrowserId;
    label: string;
    mv: 2 | 3;
    badge?: string;
  };

  type VariantDef = {
    id: Exclude<VariantId, 'custom'>;
    label: string;
    short: string;
    includes: { pets: boolean; quest: boolean };
  };

  const BROWSERS: BrowserDef[] = [
    { id: 'chrome', label: 'Chrome', mv: 3, badge: 'MV3' },
    { id: 'edge', label: 'Edge', mv: 3, badge: 'MV3' },
    { id: 'firefox', label: 'Firefox', mv: 2, badge: 'MV2' },
    { id: 'safari', label: 'Safari', mv: 2, badge: 'MV2' },
  ];

  const VARIANTS: VariantDef[] = [
    {
      id: 'full',
      label: 'Full',
      short: 'Full',
      includes: { pets: true, quest: true },
    },
    {
      id: 'light-pq',
      label: 'Light + PQ',
      short: 'Light+PQ',
      includes: { pets: false, quest: true },
    },
    {
      id: 'light-pets',
      label: 'Light + Pets',
      short: 'Light+Pets',
      includes: { pets: true, quest: false },
    },
    {
      id: 'light',
      label: 'Light',
      short: 'Light',
      includes: { pets: false, quest: false },
    },
  ];

  // ---- State ---------------------------------------------------------------

  let selectedBrowser = $state<BrowserId>('chrome');
  let selectedVariant = $state<VariantId>('full');

  let selectedModules = $state(new Set<string>());

  // Initialize: select all modules by default (same as your current behavior)
  $effect(() => {
    if (selectedModules.size === 0 && t.downloads.modules) {
      for (const m of t.downloads.modules) selectedModules.add(m.id);
      selectedModules = new Set(selectedModules);
    }
  });

  // ---- Helpers -------------------------------------------------------------

  function requiredIds(): Set<string> {
    const req = new Set<string>();
    for (const m of t.downloads.modules || []) {
      if (m.required) req.add(m.id);
    }
    return req;
  }

  function allIds(): Set<string> {
    const all = new Set<string>();
    for (const m of t.downloads.modules || []) all.add(m.id);
    return all;
  }

  function applyPreset(variantId: Exclude<VariantId, 'custom'>) {
    const variant = VARIANTS.find((v) => v.id === variantId);
    if (!variant) return;

    const req = requiredIds();
    const next = new Set<string>();

    // baseline: required
    for (const id of req) next.add(id);

    // include extras by convention (supports either id="pets"/"quest" or "pq")
    if (variant.includes.pets) next.add('pets');
    if (variant.includes.quest) {
      next.add('quest');
      next.add('pq');
    }

    // Full = everything
    if (variantId === 'full') {
      const all = allIds();
      for (const id of all) next.add(id);
    }

    selectedModules = next;
    selectedVariant = variantId;
  }

  function toggleModule(id: string, required: boolean | undefined) {
    if (required) return;

    // Any manual change flips you into custom mode.
    selectedVariant = 'custom';

    if (selectedModules.has(id)) selectedModules.delete(id);
    else selectedModules.add(id);

    selectedModules = new Set(selectedModules);
  }

  let totalSize = $derived(
    (t.downloads.modules || [])
      .filter((m) => selectedModules.has(m.id))
      .reduce((acc, m) => acc + m.size, 0)
  );

  function presetSize(variantId: Exclude<VariantId, 'custom'>): number {
    const variant = VARIANTS.find((v) => v.id === variantId);
    if (!variant) return 0;

    const req = requiredIds();
    const ids = new Set<string>(req);

    if (variant.includes.pets) ids.add('pets');
    if (variant.includes.quest) {
      ids.add('quest');
      ids.add('pq');
    }

    if (variantId === 'full') {
      const all = allIds();
      for (const id of all) ids.add(id);
    }

    return (t.downloads.modules || [])
      .filter((m) => ids.has(m.id))
      .reduce((acc, m) => acc + m.size, 0);
  }

  function artifactName(
    browserId: BrowserId,
    mv: 2 | 3,
    variantId: Exclude<VariantId, 'custom'>
  ) {
    // For the marketing site, you probably want to display “latest”.
    // If you have a real version string, expose it via t.downloads.version.
    const version = (t.downloads as any)?.version ?? 'latest';
    return `sidecar-v${version}-${browserId}-mv${mv}-${variantId}.zip`;
  }

  function downloadHref(
    browserId: BrowserId,
    mv: 2 | 3,
    variantId: Exclude<VariantId, 'custom'>
  ) {
    // Expect this to be something like:
    // "https://github.com/<org>/<repo>/releases/latest/download"
    // Keep it in i18n/config so this component stays portable.
    const base = (t.downloads as any)?.baseUrl as string | undefined;
    if (!base) return null;
    return `${base.replace(/\/$/, '')}/${artifactName(browserId, mv, variantId)}`;
  }

  function selectCell(
    browserId: BrowserId,
    variantId: Exclude<VariantId, 'custom'>
  ) {
    selectedBrowser = browserId;
    applyPreset(variantId);
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
                <Icon name="Cat" class="w-8 h-8" />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {t.vscodePets.title}
              </h3>
            </div>

            <p class="text-zinc-400 text-lg mb-8 leading-relaxed">
              {t.vscodePets.description}
            </p>

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
                <Icon name="Gamepad2" class="w-8 h-8" />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {t.progressQuest.title}
              </h3>
            </div>

            <p class="text-zinc-400 text-lg mb-8 leading-relaxed">
              {t.progressQuest.description}
            </p>

            <div
              class="mt-auto relative w-full aspect-[2/1] bg-zinc-950/50 rounded-2xl border border-zinc-800/50 overflow-hidden flex items-center justify-center group-hover:border-purple-500/30 transition-colors"
            >
              <QuestAnimation />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Downloads: Build Matrix + Modules -->
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
              <Icon name="Package" class="w-6 h-6 text-emerald-400" />
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
              <div class="text-xs text-zinc-500 mt-1">
                {selectedVariant === 'custom'
                  ? 'Custom'
                  : VARIANTS.find((v) => v.id === selectedVariant)?.label}
                • {BROWSERS.find((b) => b.id === selectedBrowser)?.label}
              </div>
            </div>
            <Icon name="HardDrive" class="w-8 h-8 text-zinc-700" />
          </div>
        </div>

        <div class="p-6 md:p-10 bg-zinc-950/30">
          <!-- Matrix -->
          <div class="mb-10">
            <div class="flex items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-2">
                <Icon name="Grid3X3" class="w-5 h-5 text-zinc-500" />
                <div class="text-sm text-zinc-400">
                  Build matrix (browser × variant). Click a cell to apply a
                  preset.
                </div>
              </div>

              {#if selectedVariant !== 'custom'}
                {@const b = BROWSERS.find((x) => x.id === selectedBrowser)}
                {@const v = VARIANTS.find((x) => x.id === selectedVariant)}
                {@const href = b && v ? downloadHref(b.id, b.mv, v.id) : null}

                <a
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 transform
                         {href
                    ? 'bg-white text-zinc-950 hover:bg-emerald-400'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}"
                  href={href ?? undefined}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener,noreferrer' : undefined}
                  aria-disabled={!href}
                >
                  <Icon name="Download" class="w-4 h-4" />
                  {t.downloads.download}
                </a>
              {/if}
            </div>

            <div class="overflow-x-auto">
              <div
                class="min-w-[860px] grid grid-cols-[220px_repeat(4,minmax(0,1fr))] gap-3"
              >
                <!-- Corner -->
                <div
                  class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-sm font-bold"
                >
                  Browser
                </div>

                {#each VARIANTS as variant (variant.id)}
                  <div
                    class="p-3 rounded-xl bg-zinc-950 border border-zinc-800"
                  >
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-white">{variant.label}</div>
                      <div class="text-[10px] font-mono text-zinc-500">
                        {variant.short}
                      </div>
                    </div>
                    <div
                      class="text-xs text-zinc-500 mt-1 flex items-center gap-2"
                    >
                      {#if variant.includes.pets}
                        <span class="inline-flex items-center gap-1">
                          <Icon name="Cat" class="w-3 h-3 text-pink-400" /> Pets
                        </span>
                      {/if}
                      {#if variant.includes.quest}
                        <span class="inline-flex items-center gap-1">
                          <Icon
                            name="Gamepad2"
                            class="w-3 h-3 text-purple-400"
                          /> PQ
                        </span>
                      {/if}
                      {#if !variant.includes.pets && !variant.includes.quest}
                        <span>Core</span>
                      {/if}
                    </div>
                  </div>
                {/each}

                <!-- Rows -->
                {#each BROWSERS as browser (browser.id)}
                  <div
                    class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div class="font-bold text-white">{browser.label}</div>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-zinc-800 text-zinc-400"
                    >
                      {browser.badge ?? `MV${browser.mv}`}
                    </span>
                  </div>

                  {#each VARIANTS as variant (variant.id)}
                    {@const size = presetSize(variant.id)}
                    {@const href = downloadHref(
                      browser.id,
                      browser.mv,
                      variant.id
                    )}
                    {@const isActive =
                      selectedBrowser === browser.id &&
                      selectedVariant === variant.id}

                    <button
                      type="button"
                      class="group relative p-3 rounded-xl border text-left transition-all duration-150
                             {isActive
                        ? 'bg-zinc-900 border-emerald-500/35 shadow-lg shadow-emerald-900/10'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}"
                      onclick={() => selectCell(browser.id, variant.id)}
                    >
                      <div class="flex items-center justify-between gap-3">
                        <div class="text-sm font-bold text-white truncate">
                          {variant.short}
                        </div>
                        <div
                          class="text-sm font-mono font-medium text-zinc-500"
                        >
                          {size} MB
                        </div>
                      </div>

                      <div class="mt-2 flex items-center justify-between gap-3">
                        <div class="text-xs text-zinc-500">
                          {browser.label} • MV{browser.mv}
                        </div>

                        <a
                          class="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors
                                 {href
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-emerald-500/40'
                            : 'bg-zinc-900/30 border border-zinc-800/40 text-zinc-600 cursor-not-allowed'}"
                          href={href ?? undefined}
                          target={href ? '_blank' : undefined}
                          rel={href ? 'noopener,noreferrer' : undefined}
                          onclick={(e) => e.stopPropagation()}
                          aria-disabled={!href}
                          title={href
                            ? artifactName(browser.id, browser.mv, variant.id)
                            : 'Configure t.downloads.baseUrl'}
                        >
                          <Icon name="Download" class="w-3 h-3" />
                          ZIP
                        </a>
                      </div>
                    </button>
                  {/each}
                {/each}
              </div>
            </div>

            {#if selectedVariant === 'custom'}
              <div class="mt-4 text-sm text-zinc-500 flex items-center gap-2">
                <Icon name="Info" class="w-4 h-4 text-zinc-600" />
                Manual module selection is in
                <span class="text-zinc-300 font-bold">Custom</span> mode. Preset
                downloads are available via the matrix.
              </div>
            {/if}
          </div>

          <!-- Modules List (kept, but now it doubles as “what’s inside” + custom toggle) -->
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
                  <Icon name="Check" class="w-4 h-4" />
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
                      <Icon name="Cat" class="w-4 h-4 text-pink-400" />
                    {/if}
                    {#if module.id === 'quest'}
                      <Icon name="Gamepad2" class="w-4 h-4 text-purple-400" />
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
          <div
            class="mt-8 pt-8 border-t border-zinc-800 flex justify-end gap-3"
          >
            {#if selectedVariant === 'custom'}
              <button
                class="inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-zinc-300 rounded-xl font-bold cursor-not-allowed"
                disabled
                title="Custom builds are not published as artifacts yet."
              >
                <Icon name="Wrench" class="w-5 h-5" />
                Custom build (coming soon)
              </button>
            {:else}
              {@const b = BROWSERS.find((x) => x.id === selectedBrowser)}
              {@const v = VARIANTS.find((x) => x.id === selectedVariant)}
              {@const href = b && v ? downloadHref(b.id, b.mv, v.id) : null}

              <a
                class="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-xl active:scale-95 transform
                       {href
                  ? 'bg-white text-zinc-950 hover:bg-emerald-400'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}"
                href={href ?? undefined}
                target={href ? '_blank' : undefined}
                rel={href ? 'noopener,noreferrer' : undefined}
                aria-disabled={!href}
              >
                <Icon name="Download" class="w-5 h-5" />
                {t.downloads.download}
              </a>
            {/if}
          </div>

          {#if !(t.downloads as any)?.baseUrl}
            <div class="mt-4 text-xs text-zinc-600">
              Tip: set <span class="font-mono text-zinc-500"
                >t.downloads.baseUrl</span
              >
              to your GitHub release download base (ex:
              <span class="font-mono">.../releases/latest/download</span>) so
              the matrix links become real.
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
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
