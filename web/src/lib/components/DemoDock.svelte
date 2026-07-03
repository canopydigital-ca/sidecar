<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

  type DemoDockItem = {
    id: string;
    label: string;
    icon: string;
    pressed?: boolean;
  };

  let {
    compact = false,
    vertical = false,
    onAction = () => {},
  }: {
    compact?: boolean;
    vertical?: boolean;
    onAction?: (id: string, trigger: HTMLElement) => void;
  } = $props();

  const items: DemoDockItem[] = [
    { id: 'sidebar', label: 'Sidebar', icon: 'PanelLeft' },
    { id: 'wide', label: 'Wide mode', icon: 'Maximize2', pressed: true },
    { id: 'inputToggle', label: 'Input handle', icon: 'ToggleRight' },
    { id: 'collapseCode', label: 'Code tools', icon: 'Code' },
    { id: 'prompts', label: 'Prompts', icon: 'Command' },
    { id: 'fonts', label: 'Fonts', icon: 'Type' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  function handleClick(id: string, event: MouseEvent) {
    onAction(id, event.currentTarget as HTMLElement);
  }
</script>

<div
  class:compact
  class:vertical
  class="demo-dock"
  data-demo-dock="sidecar"
  aria-label="Sidecar demo dock"
>
  {#each items as item (item.id)}
    <button
      type="button"
      class:pressed={item.pressed}
      class="demo-dock__button"
      data-item-id={item.id}
      title={item.label}
      aria-label={item.label}
      aria-pressed={item.pressed ? 'true' : 'false'}
      onclick={(event) => handleClick(item.id, event)}
    >
      <Icon name={item.icon} class="h-4 w-4" />
    </button>
  {/each}
</div>

<style>
  .demo-dock {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1rem;
    background: rgba(18, 18, 18, 0.92);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(18px);
  }

  .demo-dock.vertical {
    flex-direction: column;
  }

  .demo-dock.compact {
    transform: scale(0.92);
    transform-origin: bottom left;
  }

  .demo-dock__button {
    width: 2.25rem;
    height: 2.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    color: rgb(212, 212, 216);
    background: rgba(39, 39, 42, 0.8);
    transition:
      transform 140ms ease,
      background-color 140ms ease,
      border-color 140ms ease;
  }

  .demo-dock__button:hover,
  .demo-dock__button:focus-visible,
  .demo-dock__button.pressed {
    color: white;
    border-color: rgba(52, 211, 153, 0.45);
    background: rgba(5, 150, 105, 0.35);
    transform: translateY(-1px);
  }
</style>
