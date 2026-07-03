<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import RollingNumber from '$lib/components/animations/RollingNumber.svelte';
  import type { Translation } from '$lib/i18n/types';
  import {
    BROWSERS,
    VARIANTS,
    presetSize,
    downloadHref,
    type BrowserId,
    type VariantId,
  } from './model';

  let { t } = $props<{ t: Translation['secondaryFeatures'] }>();

  let browser = $state<BrowserId>('chrome');
  let variant = $state<VariantId>('full');

  const modules = $derived((t.downloads.modules ?? []) as any[]);
  const browserDef = $derived(BROWSERS.find((b) => b.id === browser)!);

  const version = $derived((t.downloads as any)?.version ?? 'latest');
  const baseUrl = $derived((t.downloads as any)?.baseUrl as string | undefined);

  const size = $derived(presetSize(modules, variant));
  const href = $derived(
    downloadHref({ baseUrl, version, browser, mv: browserDef.mv, variant })
  );
</script>

<div
  class="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50"
>
  <div
    class="p-8 md:p-10 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50"
  >
    <div>
      <h3 class="text-2xl font-bold text-white mb-2 flex items-center gap-3">
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
          <RollingNumber value={size} decimals={0} /> MB
        </div>
      </div>
      <Icon name="HardDrive" class="w-8 h-8 text-zinc-700" />
    </div>
  </div>

  <div class="p-6 md:p-10 bg-zinc-950/30">
    <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      <div>
        <div
          class="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2"
        >
          Browser
        </div>
        <div class="grid grid-cols-2 gap-2">
          {#each BROWSERS as b (b.id)}
            <button
              type="button"
              class="px-3 py-2 rounded-xl border text-sm font-bold transition-colors
                {browser === b.id
                ? 'bg-zinc-900 border-emerald-500/30 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}"
              onclick={() => (browser = b.id)}
            >
              {b.label}
              <span class="ml-2 text-[10px] font-mono text-zinc-500"
                >MV{b.mv}</span
              >
            </button>
          {/each}
        </div>
      </div>

      <div>
        <div
          class="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2"
        >
          Variant
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each VARIANTS as v (v.id)}
            <button
              type="button"
              class="p-4 rounded-xl border text-left transition-all
                {variant === v.id
                ? 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-900/10'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}"
              onclick={() => (variant = v.id)}
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
      </div>
    </div>

    <div
      class="mt-8 pt-8 border-t border-zinc-800 flex items-center justify-between gap-4"
    >
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

      <a
        class="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 font-bold hover:border-zinc-700 transition-colors"
        href="/download/custom"
      >
        <Icon name="Wrench" class="w-5 h-5 text-zinc-500" />
        Custom build
      </a>
    </div>

    {#if !baseUrl}
      <div class="mt-3 text-xs text-zinc-600">
        Set <span class="font-mono text-zinc-500">t.downloads.baseUrl</span> (GitHub
        release download base) to enable real download links.
      </div>
    {/if}
  </div>
</div>
