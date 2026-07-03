<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { page } from '$app/state';
  import { browser as isBrowser } from '$app/environment';
  import {
    BROWSERS,
    VARIANTS,
    presetIds,
    presetSize,
    downloadHref,
    type BrowserId,
    type VariantId,
    type DownloadModule,
  } from '$lib/downloads/model';

  // Pull these from your existing i18n pipeline however you already do it.
  // If your layout supplies translations, you can switch to `data.t` etc.

  const { data } = $props();
  const t = $derived(data.t);

  function detectBrowser(ua: string): BrowserId {
    const s = ua.toLowerCase();
    if (s.includes('firefox')) return 'firefox';
    if (s.includes('edg/')) return 'edge';
    return 'chrome';
  }

  function parseModulesParam(raw: string): Set<string> {
    return new Set(
      raw
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    );
  }

  function inferVariant(
    modules: DownloadModule[],
    sel: Set<string>
  ): VariantId | 'custom' {
    for (const v of VARIANTS) {
      const ids = presetIds(modules, v.id);
      if (ids.size !== sel.size) continue;

      let ok = true;
      for (const id of ids)
        if (!sel.has(id)) {
          ok = false;
          break;
        }
      if (ok) return v.id;
    }
    return 'custom';
  }

  const modules = $derived((t?.downloads?.modules ?? []) as DownloadModule[]);
  const version = $derived(t?.downloads?.version ?? 'latest');
  const baseUrl = $derived(t?.downloads?.baseUrl as string | undefined);

  let selectedBrowser = $state<BrowserId>('chrome');
  let selectedVariant = $state<VariantId>('full');
  let selectionMode = $state<'preset' | 'custom'>('preset');

  // Initialize from URL once (and on navigation to a new modules param)
  $effect(() => {
    const q = page.url.searchParams.get('modules') ?? '';
    const sel = parseModulesParam(q);

    const guessed = inferVariant(modules, sel);
    if (guessed === 'custom') {
      selectionMode = 'custom';
      // pick a sensible default preset to show in the UI
      selectedVariant = 'full';
    } else {
      selectionMode = 'preset';
      selectedVariant = guessed;
    }
  });

  // Browser detection (client-side)
  $effect(() => {
    if (!isBrowser) return;
    const b = detectBrowser(navigator.userAgent);
    selectedBrowser = b;
  });

  const browserDef = $derived(BROWSERS.find((b) => b.id === selectedBrowser)!);

  const activeHref = $derived(
    downloadHref({
      baseUrl,
      version,
      browser: selectedBrowser,
      mv: browserDef.mv,
      variant: selectedVariant,
    })
  );
</script>

<section class="py-16">
  <div class="container mx-auto px-6">
    <h1 class="text-3xl font-bold text-white">Downloads</h1>
    <p class="text-zinc-400 mt-2">
      Choose a browser + build variant. Custom selections map to the closest
      preset (for now).
    </p>

    <div class="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <!-- Browser picker -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div
          class="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3"
        >
          Browser
        </div>
        <div class="grid grid-cols-2 gap-2">
          {#each BROWSERS as b (b.id)}
            <button
              type="button"
              class="px-3 py-2 rounded-xl border text-sm font-bold transition-colors
                {selectedBrowser === b.id
                ? 'bg-zinc-950 border-emerald-500/30 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}"
              onclick={() => (selectedBrowser = b.id)}
            >
              {b.label}
              <span class="ml-2 text-[10px] font-mono text-zinc-500"
                >MV{b.mv}</span
              >
            </button>
          {/each}
        </div>

        <div class="mt-4 text-xs text-zinc-500">
          Detected: <span class="text-zinc-300 font-bold"
            >{browserDef.label}</span
          >
        </div>
      </div>

      <!-- Variant grid -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-zinc-500 uppercase font-bold tracking-wider">
            Variant
          </div>
          <div class="text-xs text-zinc-500">
            Selection: <span class="text-zinc-300 font-bold"
              >{selectionMode}</span
            >
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each VARIANTS as v (v.id)}
            <button
              type="button"
              class="p-4 rounded-xl border text-left transition-all
                {selectedVariant === v.id
                ? 'bg-zinc-950 border-emerald-500/30 shadow-lg shadow-emerald-900/10'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}"
              onclick={() => {
                selectedVariant = v.id;
                selectionMode = 'preset';
              }}
            >
              <div class="flex items-center justify-between gap-3">
                <div class="font-bold text-white">{v.label}</div>
                <div class="text-sm font-mono text-zinc-500">
                  {presetSize(modules, v.id)} MB
                </div>
              </div>
              <div class="mt-1 text-xs text-zinc-500">
                {#if v.includes.pets}<span class="mr-2">Pets</span>{/if}
                {#if v.includes.quest}<span>PQ</span>{/if}
                {#if !v.includes.pets && !v.includes.quest}<span>Core</span
                  >{/if}
              </div>
            </button>
          {/each}
        </div>

        <div
          class="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between gap-4"
        >
          <a
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 transform
              {activeHref
              ? 'bg-white text-zinc-950 hover:bg-emerald-400'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}"
            href={activeHref ?? undefined}
            target={activeHref ? '_blank' : undefined}
            rel={activeHref ? 'noopener,noreferrer' : undefined}
            aria-disabled={!activeHref}
          >
            <Icon name="Download" class="w-5 h-5" />
            Download ZIP
          </a>

          {#if !baseUrl}
            <div class="text-xs text-zinc-600">
              Release ZIPs are generated locally until the GitHub release URL is set.
            </div>
          {/if}
        </div>

        {#if selectionMode === 'custom'}
          <div class="mt-3 text-xs text-zinc-500">
            Your module selection doesn’t match a published preset yet. Pick the
            closest preset above (or build your own locally).
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
