// v0.1.0
// src/lib/ui/flow.svelte.ts
import { writable, type Writable } from "svelte/store";
import { Flow, type FlowEvent, type Logger } from "./flow";

export type FlowStore = {
	events: Writable<FlowEvent[]>;
	last: Writable<FlowEvent | null>;
	makeFlow: (opts?: { logger?: Logger; signal?: AbortSignal }) => Flow;
	reset: () => void;
};

export function createFlowStore(): FlowStore {
	const events = writable<FlowEvent[]>([]);
	const last = writable<FlowEvent | null>(null);

	function reset() {
		events.set([]);
		last.set(null);
	}

	function makeFlow(opts?: { logger?: Logger; signal?: AbortSignal }) {
		return new Flow({
			logger: opts?.logger,
			signal: opts?.signal,
			onEvent: (e) => {
				last.set(e);
				events.update((arr) => [...arr, e]);
			},
		});
	}

	return { events, last, makeFlow, reset };
}
