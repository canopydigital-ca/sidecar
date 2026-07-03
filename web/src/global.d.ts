declare const __SIDECAR_VERSION__: string;

interface Window {
	chrome?: {
		runtime?: {
			getURL?: (path: string) => string;
			sendMessage?: (...args: unknown[]) => void;
			onMessage?: {
				addListener?: (...args: unknown[]) => void;
				removeListener?: (...args: unknown[]) => void;
			};
		};
		storage?: {
			local?: unknown;
			sync?: unknown;
		};
		i18n?: {
			getMessage?: (key: string) => string;
		};
	};
}
