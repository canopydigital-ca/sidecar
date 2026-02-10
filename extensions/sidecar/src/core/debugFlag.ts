const KEY = "cgpt:debug";

function isExtensionContext(): boolean {
	// Check if we're in extension context by testing chrome.runtime
	try {
		return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
	} catch {
		return false;
	}
}

export async function getDebugEnabled(): Promise<boolean> {
	// In content script context, fall back to localStorage
	if (!isExtensionContext()) {
		try {
			const v = window.localStorage.getItem(KEY);
			return v === "true" || v === "1";
		} catch {
			return false;
		}
	}

	// In extension context, use chrome.storage
	try {
		const area = chrome.storage.session ?? chrome.storage.local;
		const v = await area.get(KEY);
		return v[KEY] === true;
	} catch {
		return false;
	}
}

export async function setDebugEnabled(on: boolean): Promise<void> {
	// In content script context, fall back to localStorage
	if (!isExtensionContext()) {
		try {
			window.localStorage.setItem(KEY, String(on));
		} catch {
			// Silently fail in restricted contexts
		}
		return;
	}

	// In extension context, use chrome.storage
	try {
		const area = chrome.storage.session ?? chrome.storage.local;
		await area.set({ [KEY]: on });
	} catch {
		// Silently fail if storage is unavailable
	}
}
