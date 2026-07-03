<script lang="ts">
  import {
    PRESET_FONTS,
    SYSTEM_FONTS,
    POPULAR_GOOGLE_FONTS,
  } from '../../../core/constants';
  import {
    applyFontChoice,
    persistFontChoice,
  } from '../../../features/fonts/fonts';
  import type { DockContext } from '../../../core/context';

  // Common Components
  import Input from '../common/Input.svelte';
  import Button from '../common/Button.svelte';

  let { ctx, onClose } = $props<{ ctx: DockContext; onClose: () => void }>();

  let query = $state('');
  let systemFonts = $state([...SYSTEM_FONTS]);

  type FontKind = 'preset' | 'system' | 'google';
  type FontItem = { name: string; css: string | null; type: FontKind };

  let items = $derived.by((): FontItem[] => {
    const q = query.trim().toLowerCase();
    const candidates: FontItem[] = [];
    const seen = new Set<string>();

    const add = (name: string, css: string | null, type: FontKind) => {
      const low = name.toLowerCase();
      if (seen.has(low)) return;
      seen.add(low);
      candidates.push({ name, css, type });
    };

    PRESET_FONTS.forEach((f) => add(f.name, f.css, 'preset'));

    systemFonts.forEach((name) => {
      if (!q || name.toLowerCase().includes(q)) add(name, null, 'system');
    });

    POPULAR_GOOGLE_FONTS.forEach((name) => {
      if (!q || name.toLowerCase().includes(q)) {
        const css = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        add(name, css, 'google');
      }
    });

    return candidates
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .slice(0, 60);
  });

  let exactMatch = $derived(
    items.some((f) => f.name.toLowerCase() === query.trim().toLowerCase())
  );

  async function handleSelect(name: string, css: string | null) {
    ctx.uiState.fontName = name;
    ctx.uiState.fontCss = css;
    applyFontChoice(ctx.uiState);
    await persistFontChoice(ctx.uiState);
  }

  function handleCustomLoad() {
    const name = query.trim();
    if (!name) return;
    const family = encodeURIComponent(name).replace(/%20/g, '+');
    const css = `https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`;
    void handleSelect(name, css);
  }

  async function handleScan() {
    if (!('queryLocalFonts' in window)) return;
    const fonts = await (window as any).queryLocalFonts();
    const next = new Set(systemFonts.map((f) => f.toLowerCase()));
    const added: string[] = [];
    for (const f of fonts as any[]) {
      const name = typeof f?.family === 'string' ? f.family : null;
      if (!name) continue;
      const low = name.toLowerCase();
      if (next.has(low)) continue;
      next.add(low);
      added.push(name);
    }
    if (added.length)
      systemFonts = [...systemFonts, ...added].sort((a, b) =>
        a.localeCompare(b)
      );
    ctx.uiState.localFontsLoaded = true;
  }
</script>

<div class="flex justify-between items-center mb-2">
  <h4 class="m-0 text-sm font-semibold text-white">Font</h4>
  <Button onclick={onClose} size="sm" variant="ghost" ariaLabel="Close fonts"
    >Close</Button
  >
</div>

<div class="flex gap-2">
  <Input placeholder="Search fonts…" bind:value={query} />
</div>

<div class="grid gap-2 mt-2.5">
  {#if 'queryLocalFonts' in window && !ctx.uiState.localFontsLoaded}
    <div
      class="border border-white/10 bg-white/5 rounded-xl p-2 mb-2 flex items-center justify-between"
    >
      <div class="text-xs">Scan installed local fonts</div>
      <Button onclick={handleScan} dataAction="scan-local">Scan</Button>
    </div>
  {/if}

  {#if query && !exactMatch}
    <div
      class="border border-dashed border-white/30 bg-white/3 rounded-xl p-2 flex items-center justify-between gap-2.5"
    >
      <div class="min-w-0">
        <div class="text-xs font-semibold text-white/92">
          Load "{query}"
        </div>
        <div class="text-xs text-white/55">Try loading from Google Fonts</div>
      </div>
      <Button onclick={handleCustomLoad} dataAction={`font-custom-${query}`}>
        Load
      </Button>
    </div>
  {/if}

  {#each items as f}
    {@const selected = ctx.uiState.fontName === f.name}
    <div
      class="border border-white/10 bg-white/6 rounded-xl p-2 flex items-center justify-between gap-2.5"
    >
      <div class="min-w-0">
        <div class="text-xs font-semibold text-white/92 flex items-center">
          {f.name}
          {#if f.type === 'system'}
            <span
              class="opacity-50 text-[10px] border border-white/30 px-[3px] rounded ml-1.5"
              >LOCAL</span
            >
          {/if}
          {#if f.type === 'google'}
            <span
              class="opacity-50 text-[10px] border border-white/30 px-[3px] rounded ml-1.5"
              >WEB</span
            >
          {/if}
        </div>
        <div class="text-xs text-white/55">
          Sample: <span
            style="font-family: '{f.name}', ui-sans-serif, system-ui;"
            >Sphinx of black quartz, judge my vow.</span
          >
        </div>
      </div>
      <Button
        onclick={() => void handleSelect(f.name, f.css)}
        pressed={selected}
        variant={selected ? 'primary' : 'secondary'}
        dataAction={`font-${f.name}`}
      >
        {selected ? 'Selected' : 'Select'}
      </Button>
    </div>
  {/each}
</div>
