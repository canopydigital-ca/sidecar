<script lang="ts">
  import '../../../app.css';
  import InteractiveDemo from '$lib/components/InteractiveDemo.svelte';
  import PopoverBubble from '$lib/components/PopoverBubble.svelte';

  // Minimal wrapper to keep the route working if needed,
  // or we can redirect to home. For now let's keep it using the new component.

  import { page } from '$app/stores';

  let transparent = $derived(
    $page.url.searchParams.get('transparent') === 'true'
  );
  let stress = $derived($page.url.searchParams.get('stress') === 'true');
  let stressWrapper = $state<HTMLElement | null>(null);

  const stressItems = Array.from({ length: 24 }, (_, index) => ({
    id: `stress-${index + 1}`,
    label: `Item ${index + 1}`,
  }));

  const stressPlacements = [
    'top',
    'top-left',
    'top-right',
    'bottom',
    'bottom-left',
    'bottom-right',
    'left',
    'right',
  ] as const;
</script>

{#if stress}
  <div class="min-h-screen bg-[#343541] text-white flex flex-col">
    <div class="px-6 pt-6 text-sm text-white/70">
      Popover stress test: 24 simultaneous popovers
    </div>
    <div class="flex-1 relative">
      <div
        bind:this={stressWrapper}
        class="grid grid-cols-6 gap-6 p-10 place-items-center"
      >
        {#each stressItems as item}
          <button
            data-stress-id={item.id}
            class="w-20 h-12 rounded-md bg-white/10 border border-white/15 text-xs text-white/80 hover:bg-white/20 transition-colors"
          >
            {item.label}
          </button>
        {/each}
      </div>
      <div class="fixed inset-0 pointer-events-none">
        {#each stressItems as item, index (item.id)}
          <PopoverBubble
            id={item.id}
            text={`Stress bubble ${index + 1}`}
            placement={stressPlacements[index % stressPlacements.length]}
            anchorRoot={stressWrapper}
            targetSelector={`[data-stress-id="${item.id}"]`}
            trigger="hover"
            autoFlip={true}
            open={true}
          />
        {/each}
      </div>
    </div>
  </div>
{:else}
  <InteractiveDemo {transparent} />
{/if}
