import { getProgressQuestService } from './service';
import type { DockContext } from '../core/context';

export type PQItem = {
  id: string;
  name: string;
  qty: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
};

export type PQState = {
  name: string;
  level: number;
  className?: string;
  quest?: string;
  xp?: { current: number; next: number };
  hp?: { current: number; max: number };
  gold?: number;
  inventory?: PQItem[];
  recentGold?: number[]; // For gold pouch
};

type Listener = (s: PQState) => void;

let listeners: Listener[] = [];
let pollingInterval: number | null = null;
let lastState: PQState | null = null;
let lastFullState: PQState | null = null;
let lastFullFetchAt = 0;

export function getPQProgress01(state: PQState | null | undefined): number {
  const xp = state?.xp;
  const current = xp?.current;
  const next = xp?.next;
  if (typeof current !== "number" || typeof next !== "number" || !Number.isFinite(current) || !Number.isFinite(next) || next <= 0) return 0;
  const v = current / next;
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

// Helper to map save data to PQState
// We'll try to parse the save data if available, otherwise fall back to summary
function mapSaveToState(save: any, summary: any): PQState {
  // Default values from summary
  const state: PQState = {
    name: save?.traits?.Name || 'Hero',
    level: summary?.level || save?.traits?.Level || 1,
    className: summary?.className || save?.traits?.Class || 'Peasant',
    quest: summary?.currentQuest || save?.quest?.name || 'Grinding...',
    gold: summary?.gold ?? save?.stats?.Gold ?? 0,
    xp: { current: 0, next: 100 },
    hp: { current: 10, max: 10 },
    inventory: [],
    recentGold: [],
  };

  if (save) {
    // Attempt to extract more details from save object structure
    // Note: This assumes a standard PQ save structure. Adjust as needed.
    if (save.traits) {
      state.level = Number(save.traits.Level) || state.level;
      state.className = save.traits.Class || state.className;
      state.name = save.traits.Name || state.name;
    }

    if (save.stats) {
      state.hp = {
        current: Number(save.stats['HP Max']) || 10, // PQ often treats HP as max since it auto-heals
        max: Number(save.stats['HP Max']) || 10,
      };
      // XP in PQ is often a bar position, but save might have raw numbers
      // If not, we might need to rely on what we can scrape or calc
      // For now, let's look for Exp or similar
    }
    
    // XP Bar from summary or save? 
    // The save format usually has "experience" or "exp"
    if (save.exp) {
        state.xp = {
            current: Number(save.exp.current) || 0,
            next: Number(save.exp.max) || 100
        }
    }

    if (save.inventory) {
      // Map inventory array
      // Save structure: array of [name, qty, ...] or objects
      if (Array.isArray(save.inventory)) {
        state.inventory = save.inventory.map((item: any, idx: number) => {
          // Heuristic for item mapping
          const name = item.name || (Array.isArray(item) ? item[0] : 'Unknown');
          const qty = item.qty || (Array.isArray(item) ? item[1] : 1);
          // Rarity heuristic based on name or other props?
          let rarity: PQItem['rarity'] = 'common';
          if (name.includes('Magic')) rarity = 'uncommon';
          if (name.includes('Rare')) rarity = 'rare';
          if (name.includes('Epic')) rarity = 'epic';
          if (name.includes('Legendary')) rarity = 'legendary';
          
          return {
            id: `item-${idx}`,
            name,
            qty: Number(qty),
            rarity
          };
        });
      }
    }
  }

  return state;
}

export function startPQStateFeed(ctx: DockContext, opts: { onUpdate: (s: PQState) => void }): () => void {
  const svc = getProgressQuestService();
  
  const listener = opts.onUpdate;
  listeners.push(listener);

  // Send last known state immediately
  if (lastState) {
    listener(lastState);
  } else {
    // Initial fetch
    fetchUpdate(ctx);
  }

  if (!pollingInterval) {
    pollingInterval = window.setInterval(() => fetchUpdate(ctx), 1000);
  }

  return () => {
    listeners = listeners.filter(l => l !== listener);
    if (listeners.length === 0 && pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}

export function startPQProgressFeed(ctx: DockContext, opts: { onProgress: (p: number) => void }): () => void {
  return startPQStateFeed(ctx, {
    onUpdate: (s) => opts.onProgress(getPQProgress01(s)),
  });
}

async function fetchUpdate(ctx: DockContext) {
  const svc = getProgressQuestService();
  // Get summary (fast)
  const summary = svc.getLastSummary() || await svc.refreshSummary();
  
  // Occasionally get full save? Or just use summary for now to avoid overhead?
  // The user wants "Status chip updates within 1s". 
  // Summary has: level, className, race, gold, currentQuest.
  // It lacks: XP, HP, Inventory.
  
  // If we need XP/HP for the chip, we might need to patch the service/renderer to include it in summary,
  // or poll exportSave. exportSave might be heavy.
  // For now, let's rely on summary for the chip basics, and maybe mock XP/HP or use cached save data.
  
  // Let's try to get the latest save from storage (which might be updated by the service background loop)
  // svc.listBackups() gets from storage.
  
  // Current strategy: Use summary for live updates. 
  // If popovers need more, they can trigger a specific fetch.
  // But the chip needs XP bar. 
  
  const now = Date.now();
  if (now - lastFullFetchAt > 15000) {
    try {
      const data = await svc.exportSaveNow(ctx);
      const full = mapSaveToState(data, summary);
      lastFullFetchAt = now;
      lastFullState = full;
      lastState = full;
      listeners.forEach(l => l(full));
      return;
    } catch (e: any) {
        // Suppress "not ready" error which is expected during boot
        if (e.message !== "ProgressQuest is not ready") {
            console.warn("PQ fetch failed", e);
        }
    }
  }

  const xp = lastFullState?.xp || { current: 0, next: 100 };
  const hp = lastFullState?.hp || { current: 100, max: 100 };

  const state: PQState = {
    name: lastFullState?.name || "Hero",
    level: summary?.level || lastFullState?.level || 1,
    className: summary?.className || lastFullState?.className || "Class",
    quest: summary?.currentQuest || lastFullState?.quest || "",
    gold: summary?.gold ?? lastFullState?.gold ?? 0,
    xp,
    hp,
    inventory: lastFullState?.inventory || [],
    recentGold: lastFullState?.recentGold || [],
  };

  // Notify listeners
  lastState = state;
  listeners.forEach(l => l(state));
}

// Function to trigger full data load (e.g. for popovers)
export async function fetchFullState(ctx: DockContext): Promise<PQState> {
    const svc = getProgressQuestService();
    try {
        const data = await svc.exportSaveNow(ctx);
        const summary = svc.getLastSummary();
        const state = mapSaveToState(data, summary);
        lastState = state;
        listeners.forEach(l => l(state));
        return state;
    } catch (e) {
        console.warn('Failed to fetch full PQ state', e);
        return lastState || { name: 'Error', level: 0, gold: 0 };
    }
}
