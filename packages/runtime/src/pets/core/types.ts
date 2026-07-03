
export type { PetPlacementMode, PetRendererKind, PetSettings, ReducedMotionMode } from './settings';

export interface IPetRenderer {
	/**
	 * Mounts the renderer into the provided container.
	 */
	mount(container: HTMLElement): void;

	/**
	 * Unmounts and cleans up resources.
	 */
	unmount(): void;

	/**
	 * Updates settings (e.g., placement changed, pet type changed).
	 */
	update(settings: import('./settings').PetSettings): void;

	/**
	 * Pauses the rendering (e.g., when tab is hidden).
	 */
	pause(): void;

	/**
	 * Resumes the rendering.
	 */
	resume(): void;
}

// --- Bridge Types (moved from src/ui/types/pets.ts) ---

export interface PetCommand {
	command: string;
	[key: string]: any;
}

export interface PetEvent {
	event: string;
	[key: string]: any;
}

export interface DockToPetsMessage {
	__dockToPets: PetCommand;
}

export interface PetsToDockMessage {
	__vscodePets: PetEvent;
}

export interface SpawnPetCommand extends PetCommand {
	command: 'spawn-pet';
	type: string;
	color: string;
	size?: 'nano' | 'medium' | 'large';
}

export interface ResetPetCommand extends PetCommand {
	command: 'reset-pet';
}

export interface PetSpawnedEvent extends PetEvent {
	event: 'pet-spawned';
	id: string;
}
