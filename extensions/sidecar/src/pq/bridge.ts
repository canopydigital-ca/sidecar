// Bridge script to handle messages and init
// This script is bundled and loaded via src="bridge.js" to avoid CSP issues

declare const storage: any;

window.alert = function (msg) {
    console.warn("PQ Internal Alert:", msg);
    if (msg && typeof msg === 'string' && msg.includes("Error loading")) {
        window.parent.postMessage({ type: 'pq:internalError', error: msg }, '*');
        try { localStorage.clear(); } catch (e) { }
    }
};

window.onerror = function (msg, url, line, col, error) {
    console.error("PQ Runtime Error:", msg, error);
    if (msg && typeof msg === 'string' && (msg.includes("Name") || msg.includes("undefined"))) {
        window.parent.postMessage({ type: 'pq:internalError', error: 'GameStateMissing' }, '*');
        return true;
    }
    return false;
};

// Button handlers
document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('shell-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Global click handler to capture interactions with legacy elements
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target) return;

        // Gold click
        if (target.closest('#shell-gold') || (target.closest('#Stats') && target.textContent?.includes('Gold'))) {
                window.parent.postMessage({ type: 'pq:uiAction', action: 'gold' }, '*');
        }
        
        // Inventory/Equips click
        if (target.closest('#Equips') || target.closest('#Inventory')) {
                window.parent.postMessage({ type: 'pq:uiAction', action: 'inventory' }, '*');
        }
    });

    // Boot Logic: Determine whether to load Main Game or New Character
    const initGame = () => {
        if (!document.querySelector('.cgpt-window')) return;

        let hasSave = false;
        try {
            // Check if hash is already set (e.g. reload)
            if (window.location.hash && window.location.hash.length > 1) {
                hasSave = true;
            } else {
                const roster = JSON.parse(localStorage.getItem('roster') || '{}');
                hasSave = Object.keys(roster).length > 0;
            }
        } catch (e) {
            console.warn('PQ: Roster check failed', e);
        }

        if (hasSave) {
            console.log('PQ: Loading Main Game...');
            // Auto-select character if hash missing
            if (!window.location.hash || window.location.hash.length <= 1) {
                 try {
                    const roster = JSON.parse(localStorage.getItem('roster') || '{}');
                    const names = Object.keys(roster);
                    if (names.length > 0) {
                        // Pick last played? storage doesn't track it, main.js updates it.
                        // Just pick the last one in the list (most recently added/saved likely).
                        window.location.hash = names[names.length - 1];
                    }
                 } catch(e) {}
            }
            
            const script = document.createElement('script');
            script.src = 'main.js';
            document.body.appendChild(script);
        } else {
            console.log('PQ: No save found, loading New Character...');
            const mainDiv = document.getElementById('main');
            if (mainDiv) mainDiv.style.display = 'none';

            const tmpl = document.getElementById('tmpl-newguy') as HTMLTemplateElement;
            if (tmpl) {
                const clone = tmpl.content.cloneNode(true);
                document.querySelector('.cgpt-content')?.appendChild(clone);
            }

            // Monkey-patch storage.addToRoster to prevent redirect
            if (typeof storage !== 'undefined') {
                const originalAddToRoster = storage.addToRoster;
                storage.addToRoster = function(newguy: any, callback: any) {
                    console.log('PQ: Intercepted addToRoster');
                    originalAddToRoster.call(storage, newguy, function() {
                        console.log('PQ: Character saved, reloading...');
                        window.location.reload();
                    });
                };
            }

            const script = document.createElement('script');
            script.src = 'newguy.js';
            document.body.appendChild(script);
        }
    };
    
    // Defer init slightly to ensure config.js/storage is ready
    setTimeout(initGame, 10);
});
