<script lang="ts">
  import { DOCK_ITEM_DEFS } from '../../../features/dock/icons';
  import { runAction } from '../../../features/dock/actions';
  import {
    DOCK_COMPAT_MAP,
    normalizeDockOrder,
    isDockItemEnabled,
    getVisibleMap,
  } from '../../../features/dock/dockLogic';
  import type { DockContext } from '../../../core/context';
  import type { GlobalSettings } from '../../../features/settings/schema';
  import type { DockItemDef } from '../../../features/dock/icons';

  const {
    ctx,
    settings,
    defs = DOCK_ITEM_DEFS,
    defaultOrder,
    debugEnabled = false,
  } = $props<{
    ctx: DockContext;
    settings: GlobalSettings;
    defs?: typeof DOCK_ITEM_DEFS;
    defaultOrder: string[];
    debugEnabled?: boolean;
  }>();

  // Get all available item IDs for visibility mapping
  const allItemIds = $derived(Object.keys(defs));

  // Get visible state from settings using shared logic
  const visibleMap = $derived(getVisibleMap(settings.dock?.items, allItemIds));

  // Derived dock order
  const orderRaw = $derived(
    Array.isArray(settings.dock?.order) ? settings.dock?.order : []
  );

  const normalized = $derived(
    normalizeDockOrder(orderRaw, defs, defaultOrder, DOCK_COMPAT_MAP)
  );

  // Final desired items to render
  const desired = $derived.by(() => {
    return normalized.order.filter(
      (id) =>
        defs[id] &&
        visibleMap.get(id) !== false &&
        isDockItemEnabled(id, settings)
    ) as string[];
  });

  // Debug information
  $effect(() => {
    if (debugEnabled) {
      console.log('[Dock] rendered', { desiredCount: desired.length });
      window.__dockDebug = {
        desiredCount: desired.length,
        order: normalized.order,
        normalized: normalized,
        visibleMap: Object.fromEntries(visibleMap),
        rawOrder: orderRaw,
      };
    }
  });

  // Handle button clicks
  function handleClick(id: string, event: MouseEvent) {
    const buttonEl = event.currentTarget as HTMLElement;
    const def = defs[id];

    if (def?.onClick) {
      def.onClick(ctx, buttonEl, settings);
    } else {
      runAction(id, buttonEl, ctx);
    }
  }

  // Get pressed state for toggle buttons
  function getPressedState(id: string): boolean {
    switch (id) {
      case 'wide':
        return settings.ui?.wideMode ?? false;
      case 'collapseCode':
        return settings.ui?.collapseCode ?? false;
      case 'inputToggle':
        return settings.ui?.inputCollapsed ?? false;
      default:
        return false;
    }
  }

  // Import custom render subcomponents
  import PqChip from './PqChip.svelte';
  import ModelSlot from './ModelSlot.svelte';
  import Spacer from './Spacer.svelte';
</script>

<div class="cgpt-dock">
  {#each desired as id (id)}
    {@const def = defs[id]}
    {#if def.render}
      <!-- Custom render items -->
      {#if id === 'pqChip'}
        <PqChip data-item-id={id} />
      {:else if id === 'modelSlot'}
        <ModelSlot data-item-id={id} />
      {:else if id === 'spacer'}
        <Spacer data-item-id={id} />
      {:else}
        <!-- Fallback for unknown custom render items -->
        <div data-item-id={id}></div>
      {/if}
    {:else}
      <!-- Standard button items -->
      <button
        type="button"
        class="cgpt-btn cgpt-dock-item"
        class:pressed={getPressedState(id)}
        data-item-id={id}
        data-action={id}
        title={def.label}
        aria-label={def.label}
        onclick={(e) => handleClick(id, e)}
        aria-pressed={getPressedState(id) ? 'true' : 'false'}
      >
        {@html def.iconSvg}
      </button>
    {/if}
  {/each}
</div>

<!-- Styles are handled by global CSS -->
