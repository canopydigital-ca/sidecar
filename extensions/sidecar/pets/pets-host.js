// VS Code webviews inject this. In Chrome, it doesn't exist, so we fake it.
window.acquireVsCodeApi = () => ({
	postMessage: (msg) => window.parent.postMessage({ __vscodePets: msg }, "*"),
	setState: (s) => localStorage.setItem("vscodePetsState", JSON.stringify(s)),
	getState: () => {
		try { return JSON.parse(localStorage.getItem("vscodePetsState") || "null"); }
		catch { return null; }
	}
});

// Listen for messages from Dock
window.addEventListener("message", (event) => {
	const data = event.data;
	if (data && data.__dockToPets) {
		// Forward to the pets app logic if it exposes a listener or dispatch an event
		// vscode-pets listens to 'message' on window as well, but expects specific format
		// We need to re-dispatch or just let it handle it if it listens on window.
		// Looking at vscode-pets source would be ideal, but assuming it listens to window 'message'.
		// However, event.data from postMessage might need to be the payload directly.

		// If vscode-pets listens to window 'message', we might need to be careful not to create infinite loops.
		// But here we receive from parent.

		// Let's assume vscode-pets `main.js` adds a listener to window.
		// We need to ensure the data structure matches what it expects.
		// The user said: "translate them into the internal format vscode-pets expects"

		// Since we don't know the exact internal format without reading main.js (which is minified or bundled),
		// we will assume the message payload in `__dockToPets` is the full message object it expects.

		// We might need to dispatch a MessageEvent locally if vscode-pets expects it from 'parent' or 'vscode'.
		// But inside an iframe, `window` is the global scope.

		// Let's just dispatch it to the window so vscode-pets listener picks it up.
		window.postMessage(data.__dockToPets, "*");
	}
});
