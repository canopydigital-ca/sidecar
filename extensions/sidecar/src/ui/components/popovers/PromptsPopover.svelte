<script lang="ts">
  import { tick } from 'svelte';
  import { ICONS } from '../../../core/constants';
  import type { DockContext } from '../../../core/context';
  import { insertAtCursor } from '../../../features/composer/insert';
  import {
    loadPrompts,
    savePrompt,
    setPrompts,
    loadRecentPrompts,
    setRecentPrompts,
  } from '../../../features/prompts/storage';
  import { TokenService } from '../../../features/prompts/tokenService';

  // Common Components
  import Button from '../common/Button.svelte';
  import Input from '../common/Input.svelte';
  import Tabs from '../common/Tabs.svelte';
  import PromptViewer from './PromptViewer.svelte';

  type TabId = 'saved' | 'recent';

  type SavedPrompt = {
    id: string;
    title?: string;
    text: string;
  };

  type RecentPrompt = {
    id: string;
    text: string;
    ts: number;
  };

  type SavedVM = SavedPrompt & {
    preview: string;
    tokens: number; // ~estimated
  };

  type RecentVM = RecentPrompt & {
    preview: string;
    when: string;
    tokens: number; // ~estimated
  };

  const PAGE_SIZE = 24;
  const PREVIEW_CHARS = 520;

  let { ctx, onClose } = $props<{ ctx: DockContext; onClose: () => void }>();

  let tab = $state<TabId>('saved');
  let hydratedTab = $state(false);

  let promptTitle = $state('');
  let status = $state('');

  // Global busy overlay: disable all interactions, show spinner, then dismiss popover
  let busy = $state(false);

  // Viewer state
  let viewerOpen = $state(false);
  let viewerTitle = $state('');
  let viewerMeta = $state('');
  let viewerText = $state('');
  let viewerTokens = $state(0);

  // Per-tab caches
  let saved = $state({
    items: [] as SavedVM[],
    loaded: false,
    loading: false,
    visible: PAGE_SIZE,
  });

  let recent = $state({
    items: [] as RecentVM[],
    loaded: false,
    loading: false,
    visible: PAGE_SIZE,
  });

  // Avoid stale async writes when user flips tabs quickly
  let savedSeq = 0;
  let recentSeq = 0;

  // Token service interaction
  const tokenService = TokenService.getInstance();
  // We keep a local reactive map for the UI to bind to
  let tokenMap = $state(new Map<string, number>());

  $effect(() => {
    return tokenService.subscribe((id, count) => {
      // Update local reactive map
      // Note: We create a new Map to trigger reactivity if needed, or rely on fine-grained if using Svelte 5 Map (not yet native reactive Map in 5.0 runes, usually need wrapper)
      // Since we used $state(new Map()), simply .set() might not trigger updates for *other* consumers unless we reassign.
      // Svelte 5 Maps are reactive if created with $state? No, only their reference.
      // We should use a reactive wrapper or just re-assign.
      // Let's try re-assigning for safety or using a dedicated reactive object.
      // Actually, for granular updates, let's just use a specialized map wrapper or `tokenMap = new Map(tokenMap.set(id, count))`

      const next = new Map(tokenMap);
      next.set(id, count);
      tokenMap = next;
    });
  });

  // Date formatting: compute once per loaded item
  const dtf = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  function truncateText(s: string, max = PREVIEW_CHARS) {
    const t = (s ?? '').trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trimEnd() + '…';
  }

  function getEstimatedTokens(id: string, text: string): number {
    const cached = tokenService.get(id);
    if (cached !== undefined) return cached;
    // Don't estimate synchronously on main thread anymore.
    // Return 0 (loading state) and queue it.
    // However, queuing happens in toSavedVM/toRecentVM mostly.
    return 0;
  }

  function toSavedVM(p: any): SavedVM {
    const text = String(p.text ?? '');
    const id = String(p.id);

    return {
      id,
      title: p.title ? String(p.title) : '',
      text,
      preview: truncateText(text),
      tokens: getEstimatedTokens(id, text),
    };
  }

  function toRecentVM(p: any): RecentVM {
    const text = String(p.text ?? '');
    const id = String(p.id);
    const ts = Number(p.ts ?? 0);

    return {
      id,
      text,
      ts,
      when: ts ? dtf.format(new Date(ts)) : '',
      preview: truncateText(text),
      tokens: getEstimatedTokens(id, text),
    };
  }

  function clampVisibleCount(current: number, total: number) {
    return Math.min(Math.max(current, PAGE_SIZE), total);
  }

  function requestIdle(fn: () => void) {
    const ric = (window as any).requestIdleCallback as
      | undefined
      | ((cb: () => void) => number);
    if (ric) ric(fn);
    else setTimeout(fn, 40);
  }

  function raf() {
    return new Promise<void>((r) => requestAnimationFrame(() => r()));
  }

  // Hydrate tab preference once
  $effect(() => {
    let alive = true;
    (async () => {
      const res = await ctx.storageGet({ cgptPromptTab: 'saved' });
      if (!alive) return;
      tab = res?.cgptPromptTab === 'recent' ? 'recent' : 'saved';
      hydratedTab = true;
    })();
    return () => {
      alive = false;
    };
  });

  // Load active tab (cached), persist tab choice, and idle-preload the other tab
  $effect(() => {
    if (!hydratedTab) return;

    void ensureTabLoaded(tab);
    ctx.storageSet({ cgptPromptTab: tab });

    requestIdle(() => {
      void ensureTabLoaded(tab === 'saved' ? 'recent' : 'saved');
    });
  });

  async function ensureTabLoaded(which: TabId, force = false) {
    if (which === 'saved') return ensureSaved(force);
    return ensureRecent(force);
  }

  async function ensureSaved(force = false) {
    if (saved.loading) return;
    if (saved.loaded && !force) return;

    saved.loading = true;
    const seq = ++savedSeq;

    try {
      const raw = await loadPrompts();
      if (seq !== savedSeq) return;

      const items = (raw ?? []).map(toSavedVM);
      saved.items = items;
      saved.visible = clampVisibleCount(saved.visible, items.length);
      saved.loaded = true;

      // Batch process token estimation for better performance
      if (items.length > 0) {
        const tokenJobs = items.map((item) => ({
          id: item.id,
          text: item.text,
        }));
        tokenService.queueBatch(tokenJobs);
      }
    } catch (err) {
      console.warn('Failed to load saved prompts:', err);
    } finally {
      if (seq === savedSeq) saved.loading = false;
    }
  }

  async function ensureRecent(force = false) {
    if (recent.loading) return;
    if (recent.loaded && !force) return;

    recent.loading = true;
    const seq = ++recentSeq;

    try {
      const raw = await loadRecentPrompts();
      if (seq !== recentSeq) return;

      const items = (raw ?? []).map(toRecentVM);
      recent.items = items;
      recent.visible = clampVisibleCount(recent.visible, items.length);
      recent.loaded = true;

      // Batch process token estimation for better performance
      if (items.length > 0) {
        const tokenJobs = items.map((item) => ({
          id: item.id,
          text: item.text,
        }));
        tokenService.queueBatch(tokenJobs);
      }
    } catch (err) {
      console.warn('Failed to load recent prompts:', err);
    } finally {
      if (seq === recentSeq) recent.loading = false;
    }
  }

  // Cache the insert target so we don't query DOM on every click
  let cachedInsertTarget: HTMLElement | null = null;

  function getInsertTarget(): HTMLElement | null {
    if (cachedInsertTarget && document.contains(cachedInsertTarget)) {
      return cachedInsertTarget;
    }

    cachedInsertTarget =
      (document.querySelector(
        '#prompt-textarea.ProseMirror'
      ) as HTMLElement | null) ||
      (document.getElementById('prompt-textarea') as HTMLElement | null);

    return cachedInsertTarget;
  }

  function doInsert(text: string) {
    const target = getInsertTarget();
    if (target) insertAtCursor(target, text);
  }

  function getComposerText(): string {
    const el = document.getElementById(
      'prompt-textarea'
    ) as HTMLTextAreaElement | null;
    if (el && typeof el.value === 'string') return el.value;

    const pm = document.querySelector(
      '#prompt-textarea.ProseMirror'
    ) as HTMLElement | null;
    return pm?.textContent ?? '';
  }

  async function handleSaveCurrent() {
    if (busy) return;

    const text = getComposerText().trim();
    if (!text) return;

    await savePrompt({ text, title: promptTitle.trim() });
    promptTitle = '';
    status = 'Saved.';

    saved.loaded = false;
    void ensureSaved(true);

    if (tab !== 'saved') tab = 'saved';
  }

  async function handleDeleteSaved(id: string) {
    if (busy) return;
    if (!confirm('Delete this prompt?')) return;

    const next = saved.items.filter((p) => p.id !== id);
    saved.items = next;
    saved.visible = Math.min(saved.visible, next.length);
    status = 'Deleted.';

    await setPrompts(next.map(({ id, title, text }) => ({ id, title, text })));
  }

  async function handleDeleteRecent(id: string) {
    if (busy) return;

    const next = recent.items.filter((p) => p.id !== id);
    recent.items = next;
    recent.visible = Math.min(recent.visible, next.length);
    status = 'Removed from recent.';

    await setRecentPrompts(next.map(({ id, text, ts }) => ({ id, text, ts })));
  }

  async function handleSaveRecent(id: string) {
    if (busy) return;

    const item = recent.items.find((p) => p.id === id);
    if (!item) return;

    await savePrompt({ text: item.text, title: '' });
    status = 'Saved to prompts.';

    saved.loaded = false;
    requestIdle(() => void ensureSaved(true));
  }

  async function handleClearRecent() {
    if (busy) return;
    if (!confirm('Clear all recent history?')) return;

    recent.items = [];
    recent.visible = PAGE_SIZE;
    recent.loaded = true;
    status = 'Recent cleared.';

    await setRecentPrompts([]);
  }

  function loadMoreSaved() {
    if (busy) return;
    saved.visible = Math.min(saved.visible + PAGE_SIZE, saved.items.length);
  }

  function loadMoreRecent() {
    if (busy) return;
    recent.visible = Math.min(recent.visible + PAGE_SIZE, recent.items.length);
  }

  async function copyTextToClipboard(text: string) {
    const t = (text ?? '').toString();
    if (!t) return false;

    try {
      // IMPORTANT: must be invoked during user gesture when possible
      await navigator.clipboard.writeText(t);
      return true;
    } catch {
      // Fallback for clipboard permission / gesture weirdness
      try {
        const ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', 'true');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  type BlockingOpts = {
    // Preserve clipboard "user activation" by starting action before awaiting.
    preserveGesture?: boolean;
  };

  // Enhanced runBlockingAction with better paint scheduling
  async function runBlockingAction(
    action: () => void | Promise<void>,
    opts: BlockingOpts = {}
  ) {
    if (busy) return;

    busy = true;

    // Keyboard lock: block key events while busy (including ESC)
    const onKeyDown = (e: KeyboardEvent) => {
      // Allow copy? Nope. They asked "disable all events".
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown, true);

    try {
      if (opts.preserveGesture) {
        // Start immediately (clipboard-safe), then yield so overlay can paint.
        const p = Promise.resolve(action());
        await tick();
        await raf();
        await raf();
        await p;
      } else {
        // Yield first so overlay paints, then do the work.
        await tick();
        await raf();
        await raf();
        await Promise.resolve(action());
      }

      // Give DOM/selection updates a beat before closing.
      await raf();
    } finally {
      window.removeEventListener('keydown', onKeyDown, true);
      busy = false;
      onClose();
    }
  }

  function insertAndDismiss(text: string) {
    void runBlockingAction(() => {
      doInsert(text);
    });
  }

  function copyAndDismiss(text: string) {
    void runBlockingAction(
      async () => {
        const ok = await copyTextToClipboard(text);
        status = ok ? 'Copied.' : 'Copy failed.';
      },
      { preserveGesture: true }
    );
  }

  // Event delegation to prevent multiple rapid clicks
  function withEventDebounce(fn: () => void) {
    if (busy) return;

    // Add a small delay to allow UI to update before heavy operations
    requestAnimationFrame(() => {
      if (!busy) fn();
    });
  }
</script>

<div class="relative" aria-busy={busy}>
  <!-- Content wrapper: disable pointer events while busy -->
  <div class={busy ? 'pointer-events-none select-none opacity-70' : ''}>
    <div class="flex justify-between items-center mb-2">
      <h4 class="m-0 text-sm font-semibold text-white">Prompts</h4>
      <Button
        onclick={onClose}
        size="sm"
        variant="ghost"
        ariaLabel="Close prompts">Close</Button
      >
    </div>

    <div class="flex gap-2 mb-2">
      <Input placeholder="Title (optional)" bind:value={promptTitle} />
      <Button
        onclick={() => withEventDebounce(handleSaveCurrent)}
        dataAction="save-current"
        ariaLabel="Save current input"
      >
        Save
      </Button>
    </div>

    <Tabs
      activeId={tab}
      items={[
        { id: 'saved', label: 'Saved' },
        { id: 'recent', label: 'Recent' },
      ]}
      onchange={(id) => (tab = id as TabId)}
      label="Prompt tabs"
    />

    {#if status}
      <div class="mt-2 text-[11px] text-white/55">{status}</div>
    {/if}

    <div class="grid gap-2 mt-2">
      {#if tab === 'saved'}
        {#if saved.loading && !saved.loaded}
          <div
            class="border border-white/10 bg-white/6 rounded-xl p-2 text-xs text-white/70"
          >
            Loading…
          </div>
        {:else if saved.items.length === 0}
          <div
            class="border border-white/10 bg-white/6 rounded-xl p-2 text-xs text-white/70"
          >
            No saved prompts yet.
          </div>
        {:else}
          {#each saved.items.slice(0, saved.visible) as p (p.id)}
            <div class="border border-white/10 bg-white/6 rounded-xl p-2">
              <div class="flex items-center justify-between gap-2">
                {#if p.title}
                  <div
                    class="text-xs font-semibold text-white/92 mb-1.5 truncate"
                  >
                    {p.title}
                  </div>
                {:else}
                  <div class="text-xs text-white/50 mb-1.5">Saved prompt</div>
                {/if}
                <div class="shrink-0 text-[11px] text-white/55">
                  ~{tokenMap.get(p.id) ?? p.tokens ?? 0} tok
                </div>
              </div>

              <div
                class="m-0 whitespace-pre-wrap break-words text-white/86 text-xs leading-[1.25]
                       max-w-full clamp-6"
              >
                {p.preview}
              </div>

              <div class="flex gap-2 mt-2 flex-wrap">
                <Button
                  onclick={() =>
                    withEventDebounce(() => insertAndDismiss(p.text || ''))}
                  dataAction={`insert-${p.id}`}
                >
                  Insert
                </Button>

                <Button
                  size="sm"
                  onclick={() =>
                    withEventDebounce(() => {
                      viewerText = p.text;
                      viewerTitle = p.title || '';
                      viewerMeta = 'Saved';
                      viewerTokens = tokenMap.get(p.id) ?? p.tokens ?? 0;
                      viewerOpen = true;
                    })}
                  dataAction={`view-${p.id}`}
                >
                  View
                </Button>

                <Button
                  onclick={() =>
                    withEventDebounce(() => handleDeleteSaved(p.id))}
                  variant="danger"
                  dataAction={`delete-${p.id}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          {/each}

          {#if saved.visible < saved.items.length}
            <div class="flex justify-center pt-1">
              <Button
                size="sm"
                onclick={() => withEventDebounce(loadMoreSaved)}
                dataAction="saved-load-more"
              >
                Load more ({saved.items.length - saved.visible} left)
              </Button>
            </div>
          {/if}
        {/if}
      {:else if recent.loading && !recent.loaded}
        <div
          class="border border-white/10 bg-white/6 rounded-xl p-2 text-xs text-white/70"
        >
          Loading…
        </div>
      {:else if recent.items.length === 0}
        <div
          class="border border-white/10 bg-white/6 rounded-xl p-2 text-xs text-white/70"
        >
          No recent prompts yet.
        </div>
      {:else}
        <div class="flex justify-end mb-2">
          <Button
            size="sm"
            onclick={() => withEventDebounce(handleClearRecent)}
            dataAction="clear-all-recent"
          >
            Clear all history
          </Button>
        </div>

        {#each recent.items.slice(0, recent.visible) as p (p.id)}
          <div
            class="border border-white/10 bg-white/6 rounded-xl p-2 cursor-pointer outline-none
                     focus-visible:ring-2 focus-visible:ring-[#10a37f]"
            data-recent-card="1"
            role="button"
            tabindex="0"
            onclick={() =>
              withEventDebounce(() => insertAndDismiss(p.text || ''))}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                withEventDebounce(() => insertAndDismiss(p.text || ''));
              }
            }}
          >
            <div class="flex items-center justify-between gap-2">
              <div class="text-[11px] text-white/50 mb-1">{p.when}</div>
              <div class="shrink-0 text-[11px] text-white/55">
                ~{tokenMap.get(p.id) ?? p.tokens ?? 0} tok
              </div>
            </div>

            <div
              class="m-0 whitespace-pre-wrap break-words text-white/86 text-xs leading-[1.25]
                       max-w-full clamp-6"
            >
              {p.preview}
            </div>

            <div class="flex gap-2 mt-2 flex-wrap">
              <Button
                size="sm"
                onclick={(e) => {
                  e.stopPropagation();
                  withEventDebounce(() => {
                    viewerText = p.text;
                    viewerTitle = '';
                    viewerMeta = p.when;
                    viewerTokens = tokenMap.get(p.id) ?? p.tokens ?? 0;
                    viewerOpen = true;
                  });
                }}
                dataAction={`view-recent-${p.id}`}
              >
                View
              </Button>

              <Button
                onclick={(e) => {
                  e.stopPropagation();
                  withEventDebounce(() => handleSaveRecent(p.id));
                }}
                dataAction={`save-recent-${p.id}`}
                ariaLabel="Move to saved"
              >
                {@html ICONS.save}
              </Button>

              <Button
                variant="danger"
                onclick={(e) => {
                  e.stopPropagation();
                  withEventDebounce(() => handleDeleteRecent(p.id));
                }}
                dataAction={`delete-recent-${p.id}`}
                ariaLabel="Delete from history"
              >
                {@html ICONS.trash}
              </Button>
            </div>
          </div>
        {/each}

        {#if recent.visible < recent.items.length}
          <div class="flex justify-center pt-1">
            <Button
              size="sm"
              onclick={() => withEventDebounce(loadMoreRecent)}
              dataAction="recent-load-more"
            >
              Load more ({recent.items.length - recent.visible} left)
            </Button>
          </div>
        {/if}
      {/if}
    </div>

    <div class="mt-3 text-xs text-white/55">
      {tab === 'recent'
        ? 'Recent history. Click card to insert.'
        : "Saved prompts. Click 'Insert' to use."}
    </div>
  </div>

  <!-- Modular Prompt Viewer -->
  <PromptViewer
    open={viewerOpen}
    title={viewerTitle}
    meta={viewerMeta}
    text={viewerText}
    tokens={viewerTokens}
    {busy}
    onClose={() => {
      viewerOpen = false;
    }}
    onInsert={insertAndDismiss}
    onCopy={copyAndDismiss}
    onCopyAndClose={copyAndDismiss}
    onInsertAndClose={insertAndDismiss}
  />

  <!-- Busy overlay: blocks everything in THIS popover while insert/copy is happening -->
  {#if busy}
    <div
      class="absolute inset-0 z-[10002] flex items-center justify-center bg-black/35"
      aria-label="Working"
    >
      <div class="flex flex-col items-center gap-2">
        <div
          class="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin"
        ></div>
        <div class="text-[11px] text-white/70">Working…</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .clamp-6 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 6;
    overflow: hidden;
  }
</style>
