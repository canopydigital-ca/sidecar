<script lang="ts">
  import '../../../app.css';
  import type { PageData } from './$types';
  import { fade, fly, slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let { data }: { data: PageData } = $props();

  let searchTerm = $state('');
  let copiedId = $state<string | null>(null);
  let customIcons = $state<Record<string, any>>({});
  let showUploadModal = $state(false);

  // Upload state
  let uploadFiles: FileList | null = $state(null);
  let pastedSvg = $state('');
  let uploadName = $state('');
  let uploadCategory = $state('');

  onMount(() => {
    const saved = localStorage.getItem('sidecar-custom-icons');
    if (saved) {
      try {
        customIcons = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load custom icons', e);
      }
    }
  });

  function saveCustomIcons() {
    localStorage.setItem('sidecar-custom-icons', JSON.stringify(customIcons));
  }

  async function handleUpload() {
    if ((!uploadFiles || uploadFiles.length === 0) && !pastedSvg.trim()) return;

    if (uploadFiles && uploadFiles.length > 0) {
      for (const file of Array.from(uploadFiles)) {
        if (file.type !== 'image/svg+xml') continue;

        const text = await file.text();
        // Simple hash or ID generation
        const id = 'custom-' + Math.random().toString(36).substring(2, 9);
        const name = uploadName || file.name.replace('.svg', '');

        customIcons[id] = {
          hash: id,
          svg: text, // Storing raw SVG content
          meta: {
            viewBox: '0 0 24 24', // Default, should parse ideally but this is a demo
          },
          tags: {
            labels: [name, uploadCategory].filter(Boolean),
            classes: [],
          },
        };
      }
    } else if (pastedSvg.trim()) {
      const text = pastedSvg.trim();
      // Basic validation
      if (!text.includes('<svg')) {
        alert('Invalid SVG content. Please paste valid SVG code.');
        return;
      }

      const id = 'custom-' + Math.random().toString(36).substring(2, 9);
      const name = uploadName || 'Pasted Icon';

      customIcons[id] = {
        hash: id,
        svg: text,
        meta: {
          viewBox: '0 0 24 24',
        },
        tags: {
          labels: [name, uploadCategory].filter(Boolean),
          classes: [],
        },
      };
    }

    // Reset form
    uploadFiles = null;
    pastedSvg = '';
    uploadName = '';
    uploadCategory = '';
    showUploadModal = false;
    saveCustomIcons();
  }

  function deleteCustomIcon(id: string) {
    const newIcons = { ...customIcons };
    delete newIcons[id];
    customIcons = newIcons;
    saveCustomIcons();
  }

  // Create derived lists
  let existingIcons = $derived(
    Object.entries(data.icons || {}).map(([id, icon]: [string, any]) => ({
      id,
      ...icon,
      group: 'existing',
    }))
  );

  let newIcons = $derived(
    Object.entries(data.newIcons || {}).map(([id, icon]: [string, any]) => ({
      id,
      ...icon,
      group: 'new',
    }))
  );

  let customIconList = $derived(
    Object.entries(customIcons).map(([id, icon]: [string, any]) => ({
      id,
      ...icon,
      group: 'custom',
    }))
  );

  // Filter icons based on search term
  let filteredIcons = $derived(
    searchTerm
      ? [...existingIcons, ...newIcons, ...customIconList].filter(
          (icon) =>
            icon.id.includes(searchTerm) ||
            icon.tags?.labels?.some((l: string) =>
              l.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
      : [...existingIcons, ...newIcons, ...customIconList]
  );

  let groupedIcons = $derived({
    new: filteredIcons.filter((i) => i.group === 'new'),
    custom: filteredIcons.filter((i) => i.group === 'custom'),
    existing: filteredIcons.filter((i) => i.group === 'existing'),
  });

  function copyToClipboard(id: string) {
    navigator.clipboard.writeText(id);
    copiedId = id;
    setTimeout(() => {
      if (copiedId === id) copiedId = null;
    }, 2000);
  }
</script>

<div
  class="min-h-screen bg-[#0f0f0f] text-gray-200 font-sans selection:bg-cgpt-focus selection:text-white"
>
  <div class="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
    <header
      class="mb-8 sticky top-0 z-20 bg-[#0f0f0f]/95 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-white/5"
    >
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1
            class="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2"
          >
            <span class="text-cgpt-focus">❖</span> Icon System
          </h1>
          <p class="text-gray-500 text-sm">
            Browsing <span class="font-mono text-white"
              >{filteredIcons.length}</span
            >
            of
            <span class="font-mono"
              >{existingIcons.length +
                newIcons.length +
                customIconList.length}</span
            > icons
          </p>
        </div>

        <div class="relative w-full md:w-80 lg:w-96 group">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-4 w-4 text-gray-500 group-focus-within:text-cgpt-focus transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search hash or tag..."
            bind:value={searchTerm}
            class="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-cgpt-focus focus:border-cgpt-focus text-sm transition-all placeholder-gray-600 text-white shadow-sm"
          />
          {#if searchTerm}
            <button
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
              onclick={() => (searchTerm = '')}
              aria-label="Clear search"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          {/if}
        </div>
      </div>
    </header>

    <div class="flex justify-end mb-8">
      <button
        class="px-4 py-2 bg-cgpt-focus text-white rounded-lg font-medium hover:brightness-110 transition-all flex items-center gap-2"
        onclick={() => (showUploadModal = true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
            points="17 8 12 3 7 8"
          /><line x1="12" x2="12" y1="3" y2="15" /></svg
        >
        Upload Icon
      </button>
    </div>

    {#if showUploadModal}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        transition:fade
      >
        <div
          class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          in:fly={{ y: 20 }}
        >
          <h2 class="text-xl font-bold text-white mb-4">Upload Custom Icon</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-zinc-400 mb-1" for="icon-svg-file">SVG File</label>
              <input
                id="icon-svg-file"
                type="file"
                accept=".svg"
                class="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 mb-2"
                bind:files={uploadFiles}
                disabled={!!pastedSvg}
              />

              <div class="relative flex py-2 items-center">
                <div class="flex-grow border-t border-zinc-800"></div>
                <span class="flex-shrink-0 mx-4 text-zinc-600 text-xs"
                  >OR PASTE SVG</span
                >
                <div class="flex-grow border-t border-zinc-800"></div>
              </div>

              <textarea
                aria-label="Paste SVG"
                class="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cgpt-focus font-mono text-xs h-24 resize-none"
                placeholder="<svg>...</svg>"
                bind:value={pastedSvg}
                disabled={uploadFiles && uploadFiles.length > 0}
              ></textarea>
            </div>

            <div>
              <label class="block text-sm text-zinc-400 mb-1" for="icon-upload-name"
                >Name (optional)</label
              >
              <input
                id="icon-upload-name"
                type="text"
                class="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cgpt-focus"
                bind:value={uploadName}
                placeholder="e.g. My Icon"
              />
            </div>

            <div>
              <label class="block text-sm text-zinc-400 mb-1" for="icon-upload-category"
                >Category (optional)</label
              >
              <input
                id="icon-upload-category"
                type="text"
                class="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cgpt-focus"
                bind:value={uploadCategory}
                placeholder="e.g. UI"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 text-zinc-400 hover:text-white"
              onclick={() => (showUploadModal = false)}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-cgpt-focus text-white rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={handleUpload}
              disabled={!uploadFiles?.length && !pastedSvg.trim()}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if filteredIcons.length === 0}
      <div
        class="flex flex-col items-center justify-center py-32 text-center"
        in:fade
      >
        <div
          class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-2xl"
        >
          🔍
        </div>
        <h3 class="text-xl font-medium text-white mb-2">No icons found</h3>
        <p class="text-gray-500 max-w-sm mx-auto mb-6">
          We couldn't find any icons matching "{searchTerm}".
        </p>
        <button
          class="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-white"
          onclick={() => (searchTerm = '')}
        >
          Clear Search
        </button>
      </div>
    {:else}
      <div class="space-y-12 pb-20">
        <!-- New Icons Section -->
        {#if groupedIcons.new.length > 0}
          <section>
            <div class="flex items-center gap-3 mb-6">
              <h2 class="text-xl font-bold text-white">New Icons</h2>
              <span
                class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20"
              >
                {groupedIcons.new.length}
              </span>
            </div>
            <div
              class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:gap-6"
            >
              {#each groupedIcons.new as icon (icon.id)}
                {@render iconCard(icon)}
              {/each}
            </div>
          </section>
        {/if}

        <!-- Custom Icons Section -->
        {#if groupedIcons.custom.length > 0}
          <section>
            <div class="flex items-center gap-3 mb-6">
              <h2 class="text-xl font-bold text-white">Custom Icons</h2>
              <span
                class="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20"
              >
                {groupedIcons.custom.length}
              </span>
            </div>
            <div
              class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:gap-6"
            >
              {#each groupedIcons.custom as icon (icon.id)}
                {@render iconCard(icon, true)}
              {/each}
            </div>
          </section>
        {/if}

        <!-- Existing Icons Section -->
        {#if groupedIcons.existing.length > 0}
          <section>
            <div class="flex items-center gap-3 mb-6">
              <h2 class="text-xl font-bold text-white">Existing Icons</h2>
              <span
                class="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-mono border border-zinc-500/20"
              >
                {groupedIcons.existing.length}
              </span>
            </div>
            <div
              class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:gap-6"
            >
              {#each groupedIcons.existing as icon (icon.id)}
                {@render iconCard(icon)}
              {/each}
            </div>
          </section>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#snippet iconCard(icon, isCustom = false)}
  <div
    class="group flex flex-col items-center p-5 bg-[#1a1a1a] border border-white/5 rounded-xl hover:border-cgpt-focus/50 hover:bg-[#222] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition-all duration-300 text-left relative overflow-hidden cursor-pointer"
    onclick={() => copyToClipboard(icon.id)}
    onkeydown={(e) => e.key === 'Enter' && copyToClipboard(icon.id)}
    role="button"
    tabindex="0"
    title="Click to copy ID: {icon.id}"
    in:fly={{ y: 20, duration: 400, delay: 0 }}
  >
    {#if isCustom}
      <button
        class="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-30 p-1"
        onclick={(e) => {
          e.stopPropagation();
          deleteCustomIcon(icon.id);
        }}
        title="Delete custom icon"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M3 6h18" /><path
            d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
          /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg
        >
      </button>
    {/if}

    <!-- Icon Display -->
    <div
      class="icon-wrapper w-10 h-10 flex items-center justify-center mb-4 text-gray-300 group-hover:text-cgpt-focus group-hover:scale-110 transition-all duration-300 ease-out"
    >
      {@html icon.svg}
    </div>

    <!-- Info -->
    <div class="w-full text-center z-10 space-y-2">
      <div
        class="bg-black/30 rounded px-2 py-1 border border-white/5 group-hover:border-white/10 transition-colors"
      >
        <code
          class="block w-full text-[10px] font-mono text-gray-400 truncate group-hover:text-white transition-colors"
        >
          {icon.id}
        </code>
      </div>

      <div class="h-4 overflow-hidden">
        {#if icon.tags?.labels?.length}
          <p
            class="text-[10px] text-gray-600 truncate px-1 group-hover:text-gray-500 transition-colors"
          >
            {icon.tags.labels.join(', ')}
          </p>
        {:else}
          <p class="text-[10px] text-gray-700 italic">No tags</p>
        {/if}
      </div>
    </div>

    <!-- Hover Effect Gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-tr from-cgpt-focus/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>

    <!-- Copied Overlay -->
    {#if copiedId === icon.id}
      <div
        class="absolute inset-0 bg-cgpt-focus flex flex-col items-center justify-center z-20"
        in:fade={{ duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <svg
          class="w-6 h-6 text-white mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span class="text-white font-bold text-xs uppercase tracking-wider"
          >Copied</span
        >
      </div>
    {/if}
  </div>
{/snippet}

<style>
  /* Ensure SVGs inherit color and size correctly */
  .icon-wrapper :global(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
</style>
