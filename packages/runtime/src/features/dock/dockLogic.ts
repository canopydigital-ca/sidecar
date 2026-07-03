import type { GlobalSettings } from '../settings/schema';
import type { DockItemDef } from './icons';
import { DEFAULT_SETTINGS } from '../settings/schema';

export const DOCK_COMPAT_MAP: Record<string, string> = {
  'model-slot': 'modelSlot',
  'input-toggle': 'inputToggle',
  'collapse-code': 'collapseCode',
  'game-icons': 'gameIcons',
  'progress-quest': 'progressquest',
  'pq-chip': 'pqChip'
};

export function normalizeDockOrder(
  orderRaw: unknown,
  registry: Record<string, DockItemDef>,
  defaultOrder: string[],
  compatMap: Record<string, string> = DOCK_COMPAT_MAP
): { order: string[]; hasDefaults: boolean } {
  const registryKeys = new Set(Object.keys(registry));
  const list = Array.isArray(orderRaw) ? orderRaw : [];
  const mapped = list
    .map((id) => (typeof id === "string" ? (compatMap[id] || id) : ""))
    .filter((id) => id.length > 0);
  const normalized = mapped.filter((id) => registryKeys.has(id));

  if (normalized.length > 0) {
    // Merge missing defaults if we have some valid items
    const missingDefaults = defaultOrder.filter(id =>
      registryKeys.has(id) && !normalized.includes(id)
    );
    return { order: [...normalized, ...missingDefaults], hasDefaults: missingDefaults.length > 0 };
  }

  // Fallback to defaults if no valid items
  return {
    order: defaultOrder.filter(id => registryKeys.has(id)),
    hasDefaults: true
  };
}

export function isDockItemEnabled(id: string, settings: GlobalSettings): boolean {
  if (!settings) return true;

  if (id === 'project') {
    return !!(settings.ui?.enableProjects ?? DEFAULT_SETTINGS.ui.enableProjects);
  }

  if (id === 'progressquest' || id === 'pqChip') {
    const pq = settings.pq ?? DEFAULT_SETTINGS.pq;
    return !!(pq.enabled && pq.showDockButton);
  }

  return true;
}

export function getDockItemVisibility(
  items: GlobalSettings['dock']['items'],
  id: string
): boolean {
  if (!items) return true;

  if (Array.isArray(items)) {
    const item = items.find(item => item && typeof item === 'object' && 'id' in item && item.id === id);
    if (item && typeof item === 'object' && 'visible' in item) {
      const visibleItem = item as { visible?: boolean };
      return visibleItem.visible !== false;
    }
    return true;
  }

  if (items && typeof items === 'object') {
    const item = items[id];
    if (typeof item === 'boolean') {
      return item;
    }
    if (item && typeof item === 'object' && 'visible' in item) {
      const visibleItem = item as { visible?: boolean };
      return visibleItem.visible !== false;
    }
  }

  return true;
}

export function getVisibleMap(
  items: GlobalSettings['dock']['items'],
  allIds: string[]
): Map<string, boolean> {
  const map = new Map<string, boolean>();

  for (const id of allIds) {
    map.set(id, getDockItemVisibility(items, id));
  }

  return map;
}
