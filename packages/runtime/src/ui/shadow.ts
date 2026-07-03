export interface ShadowWrapper {
	root: ShadowRoot;
	container: HTMLElement;
	attach: () => void;
	detach: () => void;
}

/**
 * Creates a shadow-root wrapper for a given host element.
 *
 * @param target - The HTML element to attach the shadow root to, or a template string (which will create a div).
 * @param styles - Optional array of CSS strings to inject into the shadow root.
 * @param mode - Shadow root mode ('open' or 'closed'). Defaults to 'open'.
 * @returns A ShadowWrapper object with control methods.
 */
export function createShadowWrapper(
	target: HTMLElement | string,
	styles: string[] = [],
	mode: ShadowRootMode = 'open'
): ShadowWrapper {
	let host: HTMLElement;

	if (typeof target === 'string') {
		const div = document.createElement('div');
		div.innerHTML = target;
		// If template string, we assume the user wants the first element or just a container.
		// However, usually we attach shadow to a container.
		// If the string is HTML, we might need to find where to put it.
		// For this implementation, let's assume if string is provided, we create a host div with that ID or class?
		// The requirement says "template string or HTML element".
		// If it's a string, let's treat it as a selector or just create a new element.
		// "template string" usually implies HTML content.
		// Let's create a host div.
		host = div;
	} else {
		host = target;
	}

	// Attach shadow if not already attached (check shadowRoot property)
	const root = host.shadowRoot || host.attachShadow({ mode });
	const container = document.createElement('div');
	container.id = 'shadow-container';

	const attach = () => {
		// Clear to avoid duplicates if called multiple times
		root.innerHTML = '';

		// Inject styles
		if (styles.length > 0) {
			const styleEl = document.createElement('style');
			styleEl.textContent = styles.join('\n');
			root.appendChild(styleEl);
		}

		root.appendChild(container);
	};

	const detach = () => {
		root.innerHTML = '';
	};

	// Initial attach
	attach();

	return {
		root,
		container,
		attach,
		detach
	};
}
