<script lang="ts">
  interface TabItem {
    id: string;
    label: string;
  }

  interface Props {
    items: TabItem[];
    activeId: string;
    onchange?: (id: string) => void;
    label?: string; // Aria-label for the tablist
  }

  let {
    items,
    activeId = $bindable(),
    onchange,
    label = 'Tabs',
  }: Props = $props();

  function handleSelect(id: string) {
    activeId = id;
    onchange?.(id);
  }
</script>

<div class="flex gap-1.5 my-2" role="tablist" aria-label={label}>
  {#each items as item}
    <button
      class="appearance-none border border-white/14 bg-white/6 text-white/80 px-2.5 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-200 hover:bg-white/10 aria-selected:bg-white/16 aria-selected:text-white/92 aria-selected:border-white/22 focus-visible:outline-2 focus-visible:outline-[#10a37f] focus-visible:outline-offset-2"
      type="button"
      role="tab"
      aria-selected={activeId === item.id}
      aria-controls={`panel-${item.id}`}
      id={`tab-${item.id}`}
      tabindex={activeId === item.id ? 0 : -1}
      onclick={() => handleSelect(item.id)}
    >
      {item.label}
    </button>
  {/each}
</div>
