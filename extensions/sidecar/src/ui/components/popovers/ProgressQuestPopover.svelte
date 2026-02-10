<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../common/Button.svelte';
  import Switch from '../common/Switch.svelte';
  import Select from '../common/Select.svelte';
  import type { DockContext } from '../../../core/context';
  import {
    getProgressQuestService,
    type PqSaveRecord,
  } from '../../../pq/service';
  import type { ProgressQuestThemeTokens } from '../../../pq/renderers/ProgressQuestRenderer';
  import PQInventoryPopover from './PQInventoryPopover.svelte';
  import PQGoldPopover from './PQGoldPopover.svelte';

  let { onClose, ctx } = $props<{ onClose: () => void; ctx: DockContext }>();

  let rootEl = $state<HTMLElement | null>(null);
  let hostEl = $state<HTMLElement | null>(null);
  let paused = $state(false);
  let muted = $state(false);
  let pauseWhenHidden = $state(true);
  let summaryText = $state('Loading…');
  let backups = $state<PqSaveRecord[]>([]);
  let selectedBackup = $state<string>('');

  // Sub-views state
  let activeOverlay = $state<'inventory' | 'gold' | null>(null);

  const svc = getProgressQuestService();

  function backupOptions() {
    return backups.map((b) => {
      const ts = typeof b.ts === 'number' ? b.ts : 0;
      const label = new Date(ts).toLocaleString();
      return { value: String(ts), label };
    });
  }

  async function loadBackups() {
    backups = await svc.listBackups(ctx);
    if (!selectedBackup && backups.length > 0) {
      selectedBackup = String(backups[0].ts);
    }
  }

  async function resetToDefaults() {
    if (
      confirm(
        'Reset ProgressQuest settings and view state to defaults? (Your game save is safe)'
      )
    ) {
      await svc.resetSettings(ctx);
      const s = svc.getSettings();
      muted = s.muted;
      pauseWhenHidden = s.pauseWhenHidden;
      paused = false;
      svc.resume();
    }
  }

  async function refreshSummary() {
    const s = await svc.refreshSummary();
    const current = s ?? svc.getLastSummary();
    if (!current || current.level == null || !current.className) {
      summaryText = 'Grinding…';
      return;
    }
    const quest = current.currentQuest ? ` · ${current.currentQuest}` : '';
    summaryText = `Lvl ${current.level} ${current.className}${quest}`;
  }

  function togglePause() {
    paused = !paused;
    if (paused) svc.pause();
    else svc.resume();
  }

  async function toggleMuted() {
    muted = !muted;
    await svc.setMuted(ctx, muted);
  }

  function popOut() {
    const isDark =
      document.documentElement.classList.contains('dark-theme') ||
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    svc.popOut(isDark ? 'dark' : 'light');
  }

  function computeThemeTokens(): ProgressQuestThemeTokens {
    const dialog = rootEl?.closest?.('[role="dialog"]') as HTMLElement | null;
    const target = dialog ?? rootEl ?? document.body;
    const cs = getComputedStyle(target);
    const bg =
      cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
        ? cs.backgroundColor
        : '#121212';
    const text =
      cs.color && cs.color !== 'rgba(0, 0, 0, 0)' ? cs.color : '#ececec';
    const border =
      cs.borderColor && cs.borderColor !== 'rgba(0, 0, 0, 0)'
        ? cs.borderColor
        : 'rgba(255,255,255,0.12)';
    return { background: bg, text, border, accent: '#10a37f' };
  }

  function applyTheme() {
    svc.setTheme(computeThemeTokens());
  }

  async function exportSave() {
    const data = await svc.exportSaveNow(ctx);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progressquest-save-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
    await loadBackups();
  }

  async function restoreSelected() {
    const ts = Number(selectedBackup);
    if (!Number.isFinite(ts)) return;
    await svc.restoreBackup(ctx, ts);
    await refreshSummary();
    await loadBackups();
  }

  function onImportFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    file.text().then(async (txt) => {
      let payload: any = txt;
      try {
        payload = JSON.parse(txt);
      } catch {}
      await svc.importSaveNow(ctx, payload);
      await refreshSummary();
      await loadBackups();
    });
  }

  onMount(() => {
    let themeRaf: number | null = null;
    const mo = new MutationObserver(() => {
      if (themeRaf) cancelAnimationFrame(themeRaf);
      themeRaf = requestAnimationFrame(() => applyTheme());
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    const onKeydown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!rootEl || !t || !rootEl.contains(t)) return;
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'p') {
        e.preventDefault();
        togglePause();
      } else if (key === 'm') {
        e.preventDefault();
        void toggleMuted();
      } else if (key === 'o') {
        e.preventDefault();
        popOut();
      }
    };
    window.addEventListener('keydown', onKeydown, true);

    void svc.init(ctx).then(() => {
      const s = svc.getSettings();
      muted = s.muted;
      pauseWhenHidden = s.pauseWhenHidden;
      if (hostEl) svc.attachToPanel(hostEl, ctx);
      applyTheme();
      void refreshSummary();
      void loadBackups();

      svc.onUiAction = (action) => {
        if (action === 'gold') activeOverlay = 'gold';
        if (action === 'inventory') activeOverlay = 'inventory';
      };
    });

    return () => {
      mo.disconnect();
      window.removeEventListener('keydown', onKeydown, true);
      if (pauseWhenHidden) svc.pause();
      svc.detachFromPanel(ctx);
    };
  });
</script>

<div
  bind:this={rootEl}
  class="flex flex-col w-full h-full min-w-[320px] bg-[#121212] relative"
>
  <!-- Sticky Header -->
  <header
    class="flex items-center justify-between gap-2 p-2 border-b border-white/10 shrink-0 bg-[#121212] z-10 sticky top-0"
  >
    <div class="flex items-center gap-2 min-w-0">
      <h4 class="m-0 text-sm font-semibold text-white whitespace-nowrap">
        ProgressQuest
      </h4>
      <div
        class="text-xs opacity-70 truncate hidden sm:block"
        title={summaryText}
      >
        {summaryText}
      </div>
    </div>
    <div class="flex items-center gap-1 shrink-0">
      <Button
        size="sm"
        variant="ghost"
        onclick={() => (activeOverlay = 'inventory')}
        ariaLabel="Inventory"
      >
        🎒 Inv
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onclick={() => (activeOverlay = 'gold')}
        ariaLabel="Gold Pouch"
      >
        💰 Gold
      </Button>
      <div class="w-px h-4 bg-white/20 mx-1"></div>
      <Button
        size="sm"
        variant="ghost"
        onclick={togglePause}
        ariaLabel={paused ? 'Resume' : 'Pause'}
      >
        {paused ? '▶' : '⏸'}
      </Button>
      <Button size="sm" variant="ghost" onclick={onClose} ariaLabel="Close"
        >✕</Button
      >
    </div>
  </header>

  <!-- Main Content (Game) -->
  <main class="flex-1 relative min-h-0 w-full overflow-hidden bg-black/20">
    <!-- Game Container -->
    <div bind:this={hostEl} class="absolute inset-0 w-full h-full"></div>

    <!-- Overlays -->
    {#if activeOverlay === 'inventory'}
      <div
        class="absolute inset-0 bg-[#121212] z-20 flex flex-col animate-fade-in"
      >
        <PQInventoryPopover {ctx} onClose={() => (activeOverlay = null)} />
      </div>
    {/if}
    {#if activeOverlay === 'gold'}
      <div
        class="absolute inset-0 bg-[#121212] z-20 flex flex-col animate-fade-in"
      >
        <PQGoldPopover {ctx} onClose={() => (activeOverlay = null)} />
      </div>
    {/if}
  </main>

  <!-- Footer Controls -->
  <footer
    class="p-2 border-t border-white/10 shrink-0 bg-[#121212] flex flex-wrap gap-2 items-center text-xs"
  >
    <div class="flex items-center gap-2">
      <Switch
        label="Bg Pause"
        checked={pauseWhenHidden}
        onchange={(v) => {
          pauseWhenHidden = v;
          void svc.setPauseWhenHidden(ctx, v);
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        onclick={toggleMuted}
        ariaLabel={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔈' : '🔊'}
      </Button>
    </div>

    <div class="flex-1"></div>

    <div class="flex items-center gap-2">
      <Button size="sm" variant="ghost" onclick={refreshSummary}>Ref</Button>
      <Button size="sm" variant="ghost" onclick={exportSave}>Export</Button>
      <Button
        size="sm"
        variant="ghost"
        onclick={resetToDefaults}
        ariaLabel="Reset Settings">Reset</Button
      >
      <label
        class="cursor-pointer hover:bg-white/5 px-2 py-1 rounded transition-colors"
      >
        <input
          type="file"
          accept=".json,.txt"
          class="hidden"
          onchange={onImportFile}
        />
        Import
      </label>
      {#if backups.length > 0}
        <Select
          label=""
          value={selectedBackup}
          options={backupOptions()}
          onchange={(v) => (selectedBackup = v)}
          width="100px"
        />
        <Button size="sm" variant="ghost" onclick={restoreSelected}>Rest</Button
        >
      {/if}
    </div>
  </footer>
</div>

<style>
  :global(.animate-fade-in) {
    animation: fadeIn 0.2s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
