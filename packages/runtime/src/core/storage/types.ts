export type StorageArea = "local" | "sync";

export interface StorageSlice<T> {
	key: string;
	area: StorageArea;
	defaultValue: T;
	version: number;
	/**
	 * Migrate from previous version or legacy keys.
	 * Return the new state or null if no migration needed.
	 */
	migrate?: (data: unknown, legacy: Record<string, any>) => T | null;
	/**
	 * Legacy keys to fetch for migration context.
	 */
	legacyKeys?: string[];
	/**
	 * Optional transformation before saving to storage (e.g. compression).
	 */
	encode?: (value: T) => Promise<any>;
	/**
	 * Optional transformation after loading from storage (e.g. decompression).
	 */
	decode?: (value: any) => Promise<T>;
}
