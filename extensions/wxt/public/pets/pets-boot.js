// pets-boot.js
// Bootstrapper: Verifies vendor execution and launches the app using the mirrored logic.

(function () {
    const debugEl = document.getElementById('debug-overlay');
    function log(msg) {
        if (debugEl) debugEl.textContent += msg + '\n';
        console.log('[pets-boot]', msg);
    }

    log('BOOT: Starting verification...');

    // 1. Check for vendor global
    if (!window.petApp || !window.petApp.petPanelApp) {
        log('CRITICAL: window.petApp missing. Vendor script did not execute.');
        // (Optional: fetch bundle logic from previous step could remain here for debugging)
        return;
    }

    // 2. Check for configuration
    if (!window.petsConfig) {
        log('CRITICAL: window.petsConfig missing. Is pets-host.js loaded?');
        return;
    }

    log('BOOT: Vendor loaded. Launching petPanelApp...');

    // 3. Launch App (Mirrors the inline script in extension.js)
    try {
        const c = window.petsConfig;

        // Signature: petPanelApp(basePetUri, theme, themeKind, petColor, petSize, petType, throwBallWithMouse, disableEffects)
        window.petApp.petPanelApp(
            c.basePetUri,
            c.theme,
            c.themeKind,
            c.petColor,
            c.petSize,
            c.petType,
            c.throwBallWithMouse,
            c.disableEffects
        );

        log('Mirrored webview bootstrap: OK');

        // Notify Host that init is done (to enforce background)
        if (window.petsHost && window.petsHost.initComplete) {
            window.petsHost.initComplete();
        }

        // Notify Parent
        if (window.parent) {
            window.parent.postMessage({ __vscodePets: { event: "ready" } }, "*");
        }

    } catch (e) {
        log(`BOOT EXCEPTION: ${e}`);
        console.error(e);
    }

    // 4. Demo Mode Auto-Commands
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
        setTimeout(() => {
            log('DEMO: Spawning default pet...');
            // In demo, we simulate a "spawn-pet" command from the extension
            const syntheticEvent = new MessageEvent('message', {
                data: {
                    command: 'spawn-pet',
                    type: window.petsConfig.petType,
                    color: window.petsConfig.petColor,
                    name: 'DemoPet'
                },
                source: window // pretend it's from extension/host
            });
            window.dispatchEvent(syntheticEvent);

            // Start Ticking
            setInterval(() => {
                window.dispatchEvent(new MessageEvent('message', {
                    data: { command: 'tick' },
                    source: window
                }));
            }, 100);

        }, 500);
    }

})();
