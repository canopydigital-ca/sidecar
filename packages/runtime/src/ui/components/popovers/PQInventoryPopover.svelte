<script lang="ts">
  import { onMount } from 'svelte';
  import type { DockContext } from '../../../core/context';
  import {
    fetchFullState,
    type PQState,
    type PQItem,
  } from '../../../pq/progressQuestState';
  import Button from '../common/Button.svelte';

  let { onClose, ctx }: { onClose: () => void; ctx: DockContext } = $props();

  let pqState = $state<PQState | null>(null);
  let loading = $state(true);

  onMount(async () => {
    loading = true;
    pqState = await fetchFullState(ctx);
    loading = false;
  });

  function getItemColor(rarity?: string) {
    switch (rarity) {
      case 'uncommon':
        return 'border-green-500/50 text-green-400 bg-green-500/10';
      case 'rare':
        return 'border-blue-500/50 text-blue-400 bg-blue-500/10';
      case 'epic':
        return 'border-purple-500/50 text-purple-400 bg-purple-500/10';
      case 'legendary':
        return 'border-orange-500/50 text-orange-400 bg-orange-500/10';
      default:
        return 'border-white/10 text-white/70 bg-white/5';
    }
  }
</script>

<div
  class="flex flex-col h-full w-full min-w-[320px] max-w-[480px] bg-transparent text-white"
>
  <!-- Header -->
  <div
    class="flex items-center justify-between p-3 border-b border-white/10 shrink-0"
  >
    <h4 class="m-0 text-sm font-semibold text-white">Inventory</h4>
    <Button size="sm" variant="ghost" onclick={onClose} ariaLabel="Close"
      >Close</Button
    >
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-3">
    {#if loading}
      <div
        class="flex items-center justify-center h-full text-white/40 text-sm"
      >
        Loading...
      </div>
    {:else if !pqState?.inventory || pqState.inventory.length === 0}
      <div
        class="flex items-center justify-center h-full text-white/40 text-sm"
      >
        Empty Pouch
      </div>
    {:else}
      <div class="grid grid-cols-5 gap-2">
        {#each pqState.inventory as item}
          <button
            type="button"
            class="aspect-square rounded border flex flex-col items-center justify-center p-1 relative group cursor-help transition-colors {getItemColor(
              item.rarity
            )} w-full"
            title="{item.name} ({item.qty})"
            aria-label="{item.name}, Quantity {item.qty}"
          >
            <div class="text-xl mb-1">📦</div>
            {#if item.qty > 1}
              <div
                class="absolute bottom-0.5 right-1 text-[9px] font-mono bg-black/60 px-1 rounded text-white/90"
              >
                {item.qty}
              </div>
            {/if}

            <!-- Tooltip handled by title for now, or could be custom -->
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
