import { DEFAULT_PET_COLOR, DEFAULT_PET_TYPE, sanitizePetSelection } from './catalog';

export type PetRendererKind = 'canvas' | 'webview';
export type PetPlacementMode = 'dock-overlay' | 'composer' | 'background' | 'corner';
export type ReducedMotionMode = 'auto' | 'reduce' | 'off';

export interface PetSettings {
	version: number;
	enabled: boolean;
	renderer: PetRendererKind;
	placementMode: PetPlacementMode;
	scale: number;
	opacity: number;
	maxPets: number;
	speed: number;
	clickThrough: boolean;
	pauseWhenTyping: boolean;
	pauseOnInactivity: boolean;
	reducedMotionMode: ReducedMotionMode;
	debug: boolean;
	vendorEnabled: boolean;
	petType: string;
	petColor: string;

	// Background Settings (Single Source of Truth)
	backgroundMode: 'transparent' | 'solid' | 'theme';
	backgroundTheme: string | null; // e.g. "forest", "castle"
	hideVendorUi: boolean;

	// Deprecated
	theme?: string; // Kept for migration safety
}

export const settingsVersion = 3 as const;

export const DEFAULT_PET_SETTINGS: PetSettings = {
	version: settingsVersion,
	enabled: false,
	renderer: 'webview',
	placementMode: 'dock-overlay',
	scale: 1,
	opacity: 0.6,
	maxPets: 1,
	speed: 1,
	clickThrough: true,
	pauseWhenTyping: true,
	pauseOnInactivity: true,
	reducedMotionMode: 'auto',
	debug: false,
	vendorEnabled: false,
	petType: DEFAULT_PET_TYPE,
	petColor: DEFAULT_PET_COLOR,
	backgroundMode: 'transparent',
	backgroundTheme: null,
	hideVendorUi: true
};

const STORAGE_KEY = 'cgptPetsSettings';

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
	const n = typeof val === 'number' ? val : Number(val);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}

function isObject(val: unknown): val is Record<string, unknown> {
	return typeof val === 'object' && val !== null;
}

export function migratePetSettings(raw: unknown): PetSettings {
	const base: PetSettings = { ...DEFAULT_PET_SETTINGS };
	if (!isObject(raw)) return base;

	const version = clampNumber(raw.version, 0, settingsVersion, settingsVersion);
	const incoming: Record<string, unknown> = { ...raw };

    // Migration logic
    if (version < 3) {
        // v2 -> v3: Default to snake if not set
        if (!incoming.petType) {
            incoming.petType = 'snake';
            incoming.petColor = 'green';
        }
    }

	// ... (rest of migration logic)
    
    // Explicitly handle all fields to ensure parity with interface
    if (typeof incoming.placementMode !== 'string' && typeof incoming.placement === 'string') {
		incoming.placementMode = incoming.placement;
	}

	const placementMode = incoming.placementMode;
	if (
		placementMode === 'dock-overlay' ||
		placementMode === 'composer' ||
		placementMode === 'background' ||
		placementMode === 'corner'
	) {
		base.placementMode = placementMode;
	}

	const renderer = incoming.renderer;
	if (renderer === 'canvas' || renderer === 'webview') base.renderer = renderer;

	if (typeof incoming.enabled === 'boolean') base.enabled = incoming.enabled;
	if (typeof incoming.clickThrough === 'boolean') base.clickThrough = incoming.clickThrough;
	if (typeof incoming.pauseWhenTyping === 'boolean') base.pauseWhenTyping = incoming.pauseWhenTyping;
	if (typeof incoming.pauseOnInactivity === 'boolean') base.pauseOnInactivity = incoming.pauseOnInactivity;
	if (typeof incoming.debug === 'boolean') base.debug = incoming.debug;
	if (typeof incoming.vendorEnabled === 'boolean') base.vendorEnabled = incoming.vendorEnabled;

	const reducedMotionMode = incoming.reducedMotionMode;
	if (reducedMotionMode === 'auto' || reducedMotionMode === 'reduce' || reducedMotionMode === 'off') {
		base.reducedMotionMode = reducedMotionMode;
	}

	base.scale = clampNumber(incoming.scale, 0.5, 2.0, base.scale);
	base.opacity = clampNumber(incoming.opacity, 0.2, 1.0, base.opacity);
	base.speed = clampNumber(incoming.speed, 0.25, 2.0, base.speed);
	base.maxPets = Math.round(clampNumber(incoming.maxPets, 1, 5, base.maxPets));

	if (typeof incoming.petType === 'string' && incoming.petType.trim()) base.petType = incoming.petType;
	if (typeof incoming.petColor === 'string' && incoming.petColor.trim()) base.petColor = incoming.petColor;
	{
		const s = sanitizePetSelection(base.petType, base.petColor);
		base.petType = s.type;
		base.petColor = s.color;
	}
	if (typeof incoming.backgroundMode === 'string') {
		const m = incoming.backgroundMode;
		if (m === 'transparent' || m === 'solid' || m === 'theme') {
			base.backgroundMode = m;
		}
	} else if (incoming.theme && typeof incoming.theme === 'string') {
		// Migration from legacy theme
		if (incoming.theme === 'none') base.backgroundMode = 'transparent';
		else if (incoming.theme.startsWith('solid')) base.backgroundMode = 'solid';
		else {
			base.backgroundMode = 'theme';
			base.backgroundTheme = incoming.theme;
		}
	}

	if (typeof incoming.backgroundTheme === 'string' || incoming.backgroundTheme === null) {
		base.backgroundTheme = incoming.backgroundTheme as string | null;
	}

	if (typeof incoming.hideVendorUi === 'boolean') base.hideVendorUi = incoming.hideVendorUi;

	return base;
}

export async function resetPetSettings(): Promise<void> {
    await savePetSettings(DEFAULT_PET_SETTINGS);
}

async function storageGetWithFallback<T extends Record<string, any>>(keys: string[]): Promise<T> {
	try {
		const res = await chrome.storage.sync.get(keys);
		return res as T;
	} catch {
		const res = await chrome.storage.local.get(keys);
		return res as T;
	}
}

async function storageSetWithFallback(items: Record<string, any>): Promise<void> {
	try {
		await chrome.storage.sync.set(items);
	} catch {
		await chrome.storage.local.set(items);
	}
}

export async function loadPetSettings(): Promise<PetSettings> {
	const raw = await storageGetWithFallback<Record<string, unknown>>([STORAGE_KEY]);
	return migratePetSettings(raw[STORAGE_KEY]);
}

export async function savePetSettings(partial: Partial<PetSettings>): Promise<void> {
	const current = await loadPetSettings();
	const merged = migratePetSettings({ ...current, ...partial, version: settingsVersion });
	await storageSetWithFallback({ [STORAGE_KEY]: merged });
}

let debouncedTimer: number | null = null;
let debouncedPending: Partial<PetSettings> | null = null;

export function savePetSettingsDebounced(partial: Partial<PetSettings>, delay = 150): void {
	debouncedPending = { ...(debouncedPending ?? {}), ...partial };
	if (debouncedTimer) window.clearTimeout(debouncedTimer);
	debouncedTimer = window.setTimeout(() => {
		const payload = debouncedPending ?? {};
		debouncedPending = null;
		debouncedTimer = null;
		void savePetSettings(payload);
	}, delay);
}

export function watchPetSettings(cb: (settings: PetSettings) => void): () => void {
    if (!chrome?.storage?.onChanged) {
        console.warn('chrome.storage.onChanged not available');
        return () => {};
    }
	const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
		if (areaName !== 'sync' && areaName !== 'local') return;
		const change = changes[STORAGE_KEY];
		if (!change) return;
		cb(migratePetSettings(change.newValue));
	};
	chrome.storage.onChanged.addListener(listener);
	return () => chrome.storage.onChanged.removeListener(listener);
}

export const BACKGROUND_MODE_NOTE =
	'Background mode renders as a full-screen overlay screen (opacity + click-through) to avoid iframe reloads.';
