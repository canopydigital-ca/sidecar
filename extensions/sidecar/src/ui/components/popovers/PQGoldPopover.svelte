<script lang="ts">
  import { onMount } from 'svelte';
  import type { DockContext } from '../../../core/context';
  import { fetchFullState, type PQState } from '../../../pq/progressQuestState';
  import Button from '../common/Button.svelte';

  let { onClose, ctx }: { onClose: () => void; ctx: DockContext } = $props();

  let pqState = $state<PQState | null>(null);
  let loading = $state(true);

  onMount(async () => {
    loading = true;
    pqState = await fetchFullState(ctx);
    loading = false;
  });
</script>

<div
  class="flex flex-col h-full w-full min-w-[280px] bg-transparent text-white"
>
  <!-- Header -->
  <div
    class="flex items-center justify-between p-3 border-b border-white/10 shrink-0"
  >
    <h4 class="m-0 text-sm font-semibold text-yellow-500">Gold Pouch</h4>
    <Button size="sm" variant="ghost" onclick={onClose} ariaLabel="Close"
      >Close</Button
    >
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center">
    {#if loading}
      <div class="text-white/40 text-sm mt-10">Counting coins...</div>
    {:else}
      <!-- Coin Pile Visual -->
      <div class="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div class="text-6xl filter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
          💰
        </div>
        <!-- Simple CSS stacking effect could go here -->
      </div>

      <!-- Total -->
      <div
        class="text-3xl font-bold text-yellow-400 mb-1 font-mono tracking-tight"
      >
        {pqState?.gold?.toLocaleString() ?? 0}
      </div>
      <div class="text-xs text-white/40 uppercase tracking-widest mb-8">
        Gold Coins
      </div>

      <!-- Recent Deltas (Mocked if not available) -->
      <div class="w-full bg-white/5 rounded-lg p-3">
        <div class="text-xs font-medium text-white/50 mb-2 uppercase">
          Recent Transactions
        </div>
        <div class="space-y-1">
          {#if pqState?.recentGold && pqState.recentGold.length > 0}
            {#each pqState.recentGold as delta}
              <div class="flex justify-between text-xs font-mono">
                <span class="opacity-70">Loot</span>
                <span class={delta > 0 ? 'text-green-400' : 'text-red-400'}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              </div>
            {/each}
          {:else}
            <div class="text-xs text-white/20 italic text-center py-2">
              No recent transactions
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
