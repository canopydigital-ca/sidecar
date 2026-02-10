// pets-host.js
// Environment Setup & Message Bridge
// Replicates the VS Code Webview environment for the vendor script.

const BUILD_STAMP = "pets-host.js @ " + new Date().toISOString();
document.title = BUILD_STAMP;

// --- Configuration (Mirrors extension.js defaults) ---
const params = new URLSearchParams(window.location.search);
const isDemo = params.get('demo') === '1';
const debugParam = params.get('debug') === '1';
const themeParam = params.get('theme');
const modeParam = params.get('mode'); // light/dark for variables
const bgParam = params.get('bg'); // transparent|solid
const bgColorParam = params.get('bgColor'); // CSS color
const hideUi = params.get('hideUi') === '1';

// Mutable state for background enforcement
let currentBgMode = bgParam || 'transparent';

// --- Debug & Logging ---
const debugEl = document.getElementById('debug-overlay');
const msgRingBuffer = [];

// 2. Strict Overlay Management
if (!debugParam && debugEl) {
    debugEl.remove();
}

function updateOverlay() {
    if (!debugParam) return;
    const el = document.getElementById('debug-overlay');
    if (!el) return;
    const logText = msgRingBuffer.join('\n');
    el.textContent = logText;
}

// 3. Logger Wrappers
const logger = {
    dbg: (msg) => {
        if (debugParam) {
            console.log('[pets-host]', msg);
            msgRingBuffer.push(msg);
            if (msgRingBuffer.length > 8) msgRingBuffer.shift();
            updateOverlay();
        }
    },
    log: (msg) => {
        if (debugParam) {
            console.log('[pets-host]', msg);
            msgRingBuffer.push(msg);
            if (msgRingBuffer.length > 8) msgRingBuffer.shift();
            updateOverlay();
        }
    },
    warn: (msg) => {
        if (debugParam) {
            console.warn('[pets-host]', msg);
            msgRingBuffer.push(`WARN: ${msg}`);
            if (msgRingBuffer.length > 8) msgRingBuffer.shift();
            updateOverlay();
        }
    },
    error: (msg) => {
        console.error('[pets-host]', msg); // Always console error
        if (debugParam) {
            msgRingBuffer.push(`ERR: ${msg}`);
            if (msgRingBuffer.length > 8) msgRingBuffer.shift();
            updateOverlay();
        }
    }
};

// Replace global log function
function log(msg) {
    logger.log(msg);
}

// Expose dbg globally for internal use
window.dbg = logger.dbg;

// Capture console.log from vendor scripts
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

if (debugParam) {
    console.log = function (...args) {
        originalConsoleLog.apply(console, args);
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        if (msg.includes('ChaseState') || msg.includes('BallState') || msg.includes('throw-ball')) {
            logger.log(`[vendor] ${msg}`);
        }
    };
    console.warn = function (...args) {
        originalConsoleWarn.apply(console, args);
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        logger.warn(`[vendor] ${msg}`);
    };
}
// Always capture errors if possible, or just leave them be.
// User asked: "err(msg): always console.error; if debug -> overlay too"
console.error = function (...args) {
    originalConsoleError.apply(console, args);
    if (debugParam) {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        logger.error(`[vendor] ${msg}`);
    }
};

function logBridge(msg) {
    if (debugParam) {
        console.log('[pets-bridge]', msg);
        msgRingBuffer.push(`> ${msg}`);
        if (msgRingBuffer.length > 8) msgRingBuffer.shift();
        updateOverlay();
    }
}

log(BUILD_STAMP);

// --- 1. Polyfill acquireVsCodeApi ---
if (!window.acquireVsCodeApi) {
    window.acquireVsCodeApi = () => ({
        postMessage: (msg) => {
            // Forward to parent (Dock)
            window.parent.postMessage({ __vscodePets: msg }, "*");
        },
        setState: (s) => {
            try {
                localStorage.setItem("vscodePetsState", JSON.stringify(s));
            } catch (e) { console.error(e); }
        },
        getState: () => {
            try {
                return JSON.parse(localStorage.getItem("vscodePetsState") || "null");
            } catch { return null; }
        }
    });
    log('Polyfilled acquireVsCodeApi');
}

// --- 2. Configuration (Already loaded at top) ---
// Base URI for assets (relative to this file)
const basePetUri = new URL("../vendor/vscode-pets/media", window.location.href).toString();

// --- Apply Transparency Overrides (Shared Logic) ---
function applyTransparencyOverrides() {
    performSafeDOMUpdate(() => {
        // 1. Inject robust stylesheet (Persistent protection)
        const cssId = 'cgpt-pets-transparency-style';
        if (!document.getElementById(cssId)) {
            const style = document.createElement('style');
            style.id = cssId;
            style.textContent = `
                html, body, #petCanvasContainer, #petsContainer, #foreground, #background, canvas {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                }
                /* Ensure VS Code variables are transparent */
                :root {
                    --vscode-editor-background: transparent !important;
                    --vscode-panel-background: transparent !important;
                }
            `;
            document.head.appendChild(style);
        }

        const root = document.documentElement;
        const layers = [
            document.getElementById('petCanvasContainer'),
            document.getElementById('petsContainer'),
            document.getElementById('foreground'),
            document.getElementById('background')
        ];
        // Add all canvas elements
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(c => layers.push(c));

        // 2. Root & Body -> Transparent !important (Inline backup)
        root.style.setProperty("background", "transparent", "important");
        document.body.style.setProperty("background", "transparent", "important");

        // Also root & body background-color
        root.style.setProperty("background-color", "transparent", "important");
        document.body.style.setProperty("background-color", "transparent", "important");

        // #root if exists (react)
        const appRoot = document.getElementById('root') || document.getElementById('app');
        if (appRoot) {
            appRoot.style.setProperty("background", "transparent", "important");
            appRoot.style.setProperty("background-color", "transparent", "important");
        }

        // 3. Layers -> Transparent !important
        layers.forEach(el => {
            if (!el) return;
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty("background-color", "transparent", "important");
            el.style.setProperty("background-image", "none", "important");
        });

        // 4. VS Code Vars -> Transparent !important
        root.style.setProperty("--vscode-editor-background", "transparent", "important");
        root.style.setProperty("--vscode-panel-background", "transparent", "important");
    });
}

// --- Apply Background Mode (Important Overrides) ---
function applyBackgroundMode(mode, color, theme) {
    performSafeDOMUpdate(() => {
        // Mode can be 'transparent' (default), 'solid', or 'theme' (handled by vendor)
        const root = document.documentElement;
        const layers = [
            document.getElementById('petCanvasContainer'),
            document.getElementById('petsContainer'),
            document.getElementById('foreground'),
            document.getElementById('background')
        ];
        // Add all canvas elements
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(c => layers.push(c));

        if (mode === 'transparent') {
            applyTransparencyOverrides();

            // Remove theme classes
            document.body.className = document.body.className.replace(/\bvscode-\S+/g, '');

        } else if (mode === 'solid') {
            const solidColor = color || '#0b0b0c'; // Default dark

            // 1. Root & Body -> Solid Color !important
            root.style.setProperty("background-color", solidColor, "important");
            document.body.style.setProperty("background-color", solidColor, "important");

            // 2. Layers -> Transparent !important
            layers.forEach(el => {
                if (!el) return;
                el.style.setProperty("background-color", "transparent", "important");
                el.style.setProperty("background-image", "none", "important");
            });

        } else if (mode === 'theme') {
            // 1. Root & Body -> Transparent (let theme paint) or Fallback
            // We set it to transparent to allow the theme's background (usually on body or fixed div) to show
            // But we must remove the !important overrides we might have set
            root.style.removeProperty("background");
            document.body.style.removeProperty("background");

            // 2. Layers -> Remove forced overrides
            layers.forEach(el => {
                if (!el) return;
                el.style.removeProperty("background-color");
                el.style.removeProperty("background-image");
            });

            // 3. VS Code Vars -> Let them be (or set to theme defaults if we knew them)
            root.style.removeProperty("--vscode-editor-background");
            root.style.removeProperty("--vscode-panel-background");
        }
    });
}

// --- Debug Inspector & Background Detection ---
function enforceTransparencyScan() {
    if (currentBgMode !== 'transparent') return;

    if (debugParam) log('--- Transparency Scan ---');

    // Sample points: 4 corners + center
    const w = window.innerWidth;
    const h = window.innerHeight;
    const points = [
        { x: 10, y: 10 },
        { x: w - 10, y: 10 },
        { x: 10, y: h - 10 },
        { x: w - 10, y: h - 10 },
        { x: w / 2, y: h / 2 }
    ];

    let culpritFound = null;

    points.forEach(p => {
        const el = document.elementFromPoint(p.x, p.y);
        if (el) {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundColor;
            const img = style.backgroundImage;
            const tag = el.tagName.toLowerCase();

            // Check for white/opaque
            // White: rgb(255, 255, 255), #fff, etc.
            // Canvas default might be transparent, but if it's painted white...

            // We consider it a culprit if it's NOT transparent and it's visible
            const isTransparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
            const isVisible = style.opacity !== '0' && style.visibility !== 'hidden' && style.display !== 'none';

            // Ignore known safe elements if they are transparent
            // But if they are opaque, we must fix them.

            if (isVisible && !isTransparent) {
                if (debugParam) log(`[!] OPAQUE PAINTER: ${tag} bg=${bg}`);
                culpritFound = el;
            }
        }
    });

    if (culpritFound) {
        if (debugParam) log(`[!!!] Culprit found: ${culpritFound.tagName}. Attempting force fix...`);
        performSafeDOMUpdate(() => {
            culpritFound.style.setProperty('background', 'transparent', 'important');
            culpritFound.style.setProperty('background-color', 'transparent', 'important');
            culpritFound.style.setProperty('background-image', 'none', 'important');
        });
    }
}

function detectBackgroundPainter() {
    // Alias for legacy debug calls
    enforceTransparencyScan();
}

function runDebugInspector() {
    if (!debugParam) return;

    detectBackgroundPainter();

    log('--- Layer Inspector ---');
    // ... existing inspector logic ...
    const nodes = [
        { name: 'HTML', el: document.documentElement },
        { name: 'BODY', el: document.body },
        { name: 'CanvasContainer', el: document.getElementById('petCanvasContainer') },
        { name: 'PetsContainer', el: document.getElementById('petsContainer') },
        { name: 'Foreground', el: document.getElementById('foreground') },
        { name: 'Background', el: document.getElementById('background') }
    ];

    let whitePainterFound = false;
    const viewportArea = window.innerWidth * window.innerHeight;

    nodes.forEach(node => {
        if (!node.el) return;
        const style = window.getComputedStyle(node.el);
        const bg = style.backgroundColor;
        const img = style.backgroundImage;

        // Simple check for non-transparent
        const isTransparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
        const hasImg = img !== 'none';

        const rect = node.el.getBoundingClientRect();
        const area = rect.width * rect.height;
        const coversMost = area > (viewportArea * 0.8);

        if (!isTransparent || hasImg) {
            log(`${node.name}: bg=${bg} img=${img.substring(0, 20)}... covers=${Math.round((area / viewportArea) * 100)}%`);
            if (coversMost && !whitePainterFound) {
                log(`[!] PRIMARY OBSTRUCTION: ${node.name}`);
                whitePainterFound = true;
            }
        }
    });

    if (!whitePainterFound) {
        log('No major obstructions found.');
    }
    log('---------------------------');
}

function validatePetPositions() {
    const app = window.petApp;
    const collection = app && app.allPets && app.allPets.pets ? app.allPets.pets : null;
    if (!collection || !Array.isArray(collection)) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!Number.isFinite(vw) || !Number.isFinite(vh) || vw <= 0 || vh <= 0) return;

    for (const petItem of collection) {
        const pet = petItem && petItem.pet ? petItem.pet : null;
        if (!pet) continue;

        let sprite = 55;
        try {
            if (typeof pet.calculateSpriteWidth === 'function' && typeof pet.size === 'string') {
                sprite = Number(pet.calculateSpriteWidth(pet.size)) || sprite;
            }
        } catch { }

        const minLeft = 0;
        const minBottom = 0;
        const maxLeft = Math.max(0, vw - sprite);
        const maxBottom = Math.max(0, vh - sprite);

        const left = Number(pet.left);
        const bottom = Number(pet.bottom);

        const nextLeft = Math.min(maxLeft, Math.max(minLeft, Number.isFinite(left) ? left : minLeft));
        const nextBottom = Math.min(maxBottom, Math.max(minBottom, Number.isFinite(bottom) ? bottom : minBottom));

        if (nextLeft !== left && typeof pet.positionLeft === 'function') {
            try { pet.positionLeft(nextLeft); } catch { }
        }
        if (nextBottom !== bottom && typeof pet.positionBottom === 'function') {
            try { pet.positionBottom(nextBottom); } catch { }
        }
    }
}

    // Expose API for Bootstrapper
    window.petsHost = {
        initComplete: () => {
            log('Init complete. Enforcing background...');
            // Force apply current mode
            applyBackgroundMode(currentBgMode, bgColorParam, themeParam);

            setTimeout(validatePetPositions, 0);

            // Run inspector shortly after
            if (debugParam) {
                setTimeout(runDebugInspector, 1000);
            }

            // Schedule proactive scans to catch late renders (The "Voodoo" fix)
            enforceTransparencyScan();
            setTimeout(enforceTransparencyScan, 500);
            setTimeout(enforceTransparencyScan, 1000);
            setTimeout(enforceTransparencyScan, 2000);
            setTimeout(enforceTransparencyScan, 5000);
        }
    };

    // --- Transparency Debug Mode ---
    function reportTransparencyStatus() {
        const report = [];
        const nodes = [
            { name: 'HTML', el: document.documentElement },
            { name: 'BODY', el: document.body },
            { name: 'CanvasContainer', el: document.getElementById('petCanvasContainer') },
            { name: 'PetsContainer', el: document.getElementById('petsContainer') }
        ];

        nodes.forEach(n => {
            if (!n.el) return;
            const style = window.getComputedStyle(n.el);
            report.push(`${n.name}: bg=${style.backgroundColor} img=${style.backgroundImage}`);
        });

        console.group('Transparency Report');
        report.forEach(line => console.log(line));
        console.groupEnd();
        
        if (debugParam) {
            log('--- Transparency Report ---');
            report.forEach(log);
        }
    }

    // Hook into debug inspector
    const originalInspector = runDebugInspector;
    runDebugInspector = function() {
        if (originalInspector) originalInspector();
        reportTransparencyStatus();
    };

// --- Enforce Background Transparency (MutationObserver) ---
// Vendor scripts might try to reset body background. We must fight back.
let bgObserver = null;

function getObservedNodes() {
    return [document.documentElement, document.body].filter(Boolean);
}

let isSafeUpdate = false;

function performSafeDOMUpdate(action) {
    if (isSafeUpdate) {
        action();
        return;
    }

    isSafeUpdate = true;
    if (bgObserver) bgObserver.disconnect();
    try {
        action();
    } finally {
        if (bgObserver) {
            getObservedNodes().forEach(n => bgObserver.observe(n, { attributes: true, attributeFilter: ['style', 'class'] }));
        }
        isSafeUpdate = false;
    }
}

function startBackgroundEnforcement() {
    if (bgObserver) return;

    bgObserver = new MutationObserver((mutations) => {
        if (currentBgMode === 'transparent') {
            let needsFix = false;
            mutations.forEach(m => {
                // Check for style/class changes on ANY element in subtree
                if (m.type === 'attributes' && (m.attributeName === 'style' || m.attributeName === 'class')) {
                    needsFix = true;
                }
                // Check for new nodes (e.g. canvas recreation)
                if (m.type === 'childList' && m.addedNodes.length > 0) {
                    needsFix = true;
                }
            });

            if (needsFix) {
                // Use safe update to prevent infinite loop
                // Debounce slightly if possible? No, immediate is better to prevent flash.
                // But performSafeDOMUpdate disconnects, so it's fine.
                // log('External mutation detected. Re-enforcing transparency...');
                applyBackgroundMode('transparent');
            }
        }
    });

    getObservedNodes().forEach(n => {
        // Observe subtree to catch inner elements (canvases, containers)
        bgObserver.observe(n, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: true,
            subtree: true
        });
    });
}

// Initial Background Application
if (bgParam) {
    applyBackgroundMode(bgParam, bgColorParam);
} else {
    // Default to transparent if not specified
    applyBackgroundMode('transparent');
}
startBackgroundEnforcement();

// --- Apply Theme Variables (Mimic VS Code) ---
function applyTheme(theme) {
    performSafeDOMUpdate(() => {
        const root = document.documentElement;

        // 1. Foregrounds (Always Apply)
        if (theme === 'dark' || theme === 'solid-dark') {
            root.style.setProperty('--vscode-editor-foreground', '#ececf1');
        } else if (theme === 'light' || theme === 'solid-light') {
            root.style.setProperty('--vscode-editor-foreground', '#000000');
        }

        // 2. Backgrounds (Only if NOT transparent)
        if (currentBgMode !== 'transparent') {
            if (theme === 'dark' || theme === 'solid-dark') {
                root.style.setProperty('--vscode-editor-background', '#343541'); // ChatGPT Dark
                root.style.setProperty('--vscode-panel-background', '#202123');
            } else if (theme === 'light' || theme === 'solid-light') {
                root.style.setProperty('--vscode-editor-background', '#ffffff');
                root.style.setProperty('--vscode-panel-background', '#f7f7f8');
            }
        } else {
            // Ensure variables are transparent
            root.style.setProperty('--vscode-editor-background', 'transparent', 'important');
            root.style.setProperty('--vscode-panel-background', 'transparent', 'important');
        }
    });
}

// Apply initial mode from params if present
if (modeParam) {
    applyTheme(modeParam);
}

// --- UI Visibility (Vendor Controls) ---
function applyUiVisibility(hidden) {
    performSafeDOMUpdate(() => {
        const styleId = 'hide-vendor-ui-style';
        let style = document.getElementById(styleId);

        if (hidden) {
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    #pets-control-panel,
                    .pet-panel-controls,
                    .controls,
                    .settings,
                    .pet-panel {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
            document.documentElement.classList.add('hide-ui');
        } else {
            if (style) {
                style.remove();
            }
            document.documentElement.classList.remove('hide-ui');
        }
    });
}

// Initial UI Visibility
applyUiVisibility(hideUi);

window.petsConfig = {
    basePetUri: basePetUri,
    theme: themeParam || 'none',
    themeKind: 1, // 1 = Light, 2 = Dark
    petColor: 'brown',
    petSize: 'medium',
    petType: 'dog',
    throwBallWithMouse: true,
    disableEffects: false
};

// Check if we are running in standalone mode (extension protocol)
const isStandalone = window.location.protocol === 'chrome-extension:' || window.location.protocol === 'moz-extension:' || isDemo;

// Only show demo controls if we are explicitly in demo mode OR standalone (top-level) AND UI is not hidden
// This prevents controls from appearing in the sidebar iframe
if ((isDemo || (isStandalone && window.parent === window)) && !hideUi) {
    log('STANDALONE / DEMO MODE ACTIVE');
    createDemoControls();
}

// --- Demo Controls ---
function createDemoControls() {
    const controls = document.createElement('div');
    Object.assign(controls.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: '10000',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        fontFamily: 'sans-serif',
        fontSize: '12px'
    });

    // Valid Pets & Colors (Based on dist/vendor/vscode-pets/media)
    const VALID_PETS = {
        'chicken': ['white'],
        'clippy': ['black', 'brown', 'green', 'yellow'],
        'cockatiel': ['gray'],
        'crab': ['red'],
        'deno': ['green'],
        'dog': ['akita', 'black', 'brown', 'red', 'white'],
        'fox': ['red', 'white'],
        'horse': ['black', 'brown', 'magical', 'paint_beige', 'paint_black', 'paint_brown', 'socks_beige', 'socks_black', 'socks_brown', 'warrior', 'white'],
        'mod': ['purple'],
        'morph': ['purple'],
        'panda': ['black', 'brown'],
        'rat': ['brown', 'gray', 'white'],
        'rocky': ['gray'],
        'rubber-duck': ['yellow'],
        'snake': ['green'],
        'totoro': ['gray'],
        'zappy': ['yellow']
    };

    const sizes = ['nano', 'small', 'medium', 'large'];

    // Pet Type
    const typeSelect = document.createElement('select');
    Object.keys(VALID_PETS).forEach(p => typeSelect.add(new Option(p, p)));

    // Set initial valid type
    if (!VALID_PETS[window.petsConfig.petType]) {
        window.petsConfig.petType = 'dog';
    }
    typeSelect.value = window.petsConfig.petType;

    // Pet Color
    const colorSelect = document.createElement('select');

    function updateColors() {
        colorSelect.innerHTML = '';
        const colors = VALID_PETS[typeSelect.value] || ['brown'];
        colors.forEach(c => colorSelect.add(new Option(c, c)));

        // Try to preserve current color if valid, else pick first
        if (colors.includes(window.petsConfig.petColor)) {
            colorSelect.value = window.petsConfig.petColor;
        } else {
            colorSelect.value = colors[0];
            window.petsConfig.petColor = colors[0];
        }
    }

    typeSelect.onchange = () => {
        window.petsConfig.petType = typeSelect.value;
        updateColors(); // Update colors for new type
        spawnPet();
    };

    colorSelect.onchange = () => {
        window.petsConfig.petColor = colorSelect.value;
        spawnPet();
    };

    // Initialize colors
    updateColors();

    // Pet Size
    const sizeSelect = document.createElement('select');
    sizes.forEach(s => sizeSelect.add(new Option(s, s)));
    sizeSelect.value = window.petsConfig.petSize;
    sizeSelect.onchange = () => {
        window.petsConfig.petSize = sizeSelect.value;
        dispatchCommand({ command: 'set-size', size: sizeSelect.value });
        spawnPet();
    };

    // Reset Button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => {
        dispatchCommand({ command: 'reset-pet' });
    };

    // Controls Layout
    controls.appendChild(document.createTextNode('Type:'));
    controls.appendChild(typeSelect);
    controls.appendChild(document.createTextNode('Color:'));
    controls.appendChild(colorSelect);
    controls.appendChild(document.createTextNode('Size:'));
    controls.appendChild(sizeSelect);
    controls.appendChild(resetBtn);

    document.body.appendChild(controls);

    function spawnPet() {
        const payload = {
            command: 'spawn-pet',
            type: window.petsConfig.petType,
            color: window.petsConfig.petColor,
            name: 'DemoPet'
        };
        fixupCommand(payload);
        dispatchCommand(payload);
    }

    function dispatchCommand(payload) {
        window.dispatchEvent(new MessageEvent('message', {
            data: payload,
            origin: window.location.origin,
            source: window
        }));
    }
}


// --- 3. Message Bridge (Parent -> Window) ---

window.addEventListener('message', (event) => {
    // Relaxed Validation: Accept from parent regardless of origin
    const isSelf = event.source === window;
    const isParent = event.source === window.parent;

    if (isSelf) return;

    if (isParent) {
        const origin = event.origin;
        let payload = event.data;
        let valid = false;

        // Unwrap envelope
        if (payload && payload.__dockToPets) {
            payload = payload.__dockToPets;
            valid = true;
        } else if (payload && payload.command) {
            // Direct command shape
            valid = true;
        }

        if (valid) {
            logBridge(`RX parent cmd="${payload.command}" origin=${origin}`);

            // Handle Host Commands
            if (payload.command === 'host:setBackground') {
                // { bg: 'transparent'|'solid'|'theme', theme: string, bgColor: string, hideUi: boolean }
                log(`Setting background mode: ${payload.bg} theme=${payload.theme} hideUi=${payload.hideUi}`);

                currentBgMode = payload.bg;
                applyBackgroundMode(payload.bg, payload.bgColor, payload.theme);

                // Update UI Visibility
                if (typeof payload.hideUi === 'boolean') {
                    applyUiVisibility(payload.hideUi);
                }

                // If switching themes, we might need to reload if vendor doesn't support hot-swap well
                // But for now, let's try to update class and let vendor handle it via mutation or reload
                if (payload.bg === 'theme') {
                    // Update URL params for next reload
                    const url = new URL(window.location.href);
                    url.searchParams.set('theme', payload.theme);
                    url.searchParams.set('bg', 'theme');
                    window.history.replaceState(null, '', url.toString());

                    // Force reload if theme changed?
                    // Vendor script reads theme from URL on boot.
                    // We can try to set window.petsConfig.theme and hope vendor observes it?
                    // Usually it doesn't.
                    // For seamless theme switching, we might need to reload the iframe.
                    // BUT requirement says "without requiring iframe reload".
                    // If vendor doesn't support hot-swap, we might be limited.
                    // For now, let's just apply what we can.
                }
            }

            if (payload.command === 'host:validatePositions') {
                validatePetPositions();
                return;
            }

            // Legacy Command Support (if needed)
            if (payload.command === 'set-background') {
                log(`Setting background mode: ${payload.mode} color=${payload.bgColor}`);
                // Use new override function
                const mode = payload.mode.startsWith('solid') ? 'solid' : (payload.mode === 'transparent' ? 'transparent' : 'theme');
                currentBgMode = mode === 'solid' ? 'solid' : (payload.mode === 'transparent' ? 'transparent' : 'theme');
                applyBackgroundMode(mode, payload.bgColor);

                // Keep class logic for debug/theme
                document.documentElement.className = document.documentElement.className.replace(/\bmode-\S+/g, '');
                if (payload.mode) document.documentElement.classList.add(`mode-${payload.mode}`);
            }

            // Handle Fake Mouse Move (for deliberate activation)
            if (payload.command === 'fake-mouse-move') {
                const rect = document.body.getBoundingClientRect();
                const x = payload.x - rect.left; // Relative to body/iframe
                const y = payload.y - rect.top;
                
                window.dispatchEvent(new MouseEvent('mousemove', {
                    clientX: x,
                    clientY: y,
                    bubbles: true
                }));
                return; // Don't forward to vendor as command, just event
            }

            // Dispatch to vendor (must appear local)
            const synthEvent = new MessageEvent('message', {
                data: payload,
                origin: window.location.origin, // Pretend it's from same origin to satisfy any strict checks
                source: window
            });
            window.dispatchEvent(synthEvent);

            if (payload.command === 'spawn-pet' || payload.command === 'reset-pet' || payload.command === 'set-size') {
                setTimeout(validatePetPositions, 0);
            }
        } else {
            // Only log if it looks somewhat relevant, otherwise noise
            if (payload && (payload.type || payload.command)) {
                log(`Rejected parent msg from ${origin}: ${JSON.stringify(payload).substring(0, 50)}...`);
            }
        }
    }
});

log('Host ready. Waiting for boot...');

window.addEventListener('resize', () => {
    setTimeout(validatePetPositions, 0);
});

// --- Background Inspector (Debug only) ---
if (debugParam) {
    // Run after a short delay to allow DOM to settle
    setTimeout(() => {
        log('Running Background Inspector...');
        const suspects = [];
        const viewportArea = window.innerWidth * window.innerHeight;

        function scan(el) {
            if (!el) return;
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const area = rect.width * rect.height;
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

            // Check for background color/image
            const hasBgColor = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
            const hasBgImage = style.backgroundImage !== 'none';

            if (isVisible && (hasBgColor || hasBgImage)) {
                // Check if covers significant area (>80%)
                if (area >= viewportArea * 0.8) {
                    suspects.push({
                        tag: el.tagName.toLowerCase(),
                        id: el.id,
                        class: el.className,
                        bg: style.backgroundColor,
                        img: style.backgroundImage,
                        z: style.zIndex,
                        pos: style.position,
                        rect: `${Math.round(rect.width)}x${Math.round(rect.height)}`
                    });
                }
            }

            // Recurse
            Array.from(el.children).forEach(scan);
        }

        // Scan specific containers of interest first, then body
        const roots = [
            document.documentElement,
            document.body,
            document.getElementById('petCanvasContainer'),
            document.getElementById('petsContainer'),
            document.getElementById('foreground'),
            document.getElementById('background')
        ];

        roots.forEach(scan);

        if (suspects.length > 0) {
            log(`WHITE SOURCE FOUND (${suspects.length}):`);
            suspects.slice(0, 10).forEach(s => {
                const idStr = s.id ? `#${s.id}` : '';
                const classStr = s.class ? `.${s.class.replace(/\s+/g, '.')}` : '';
                const msg = `WHITE SOURCE: ${s.tag}${idStr}${classStr} bg=${s.bg} img=${s.img.substring(0, 20)}...`;
                log(msg);
                console.log(msg, s);
            });
        } else {
            log('Background Inspector: No large non-transparent elements found.');
        }

    }, 2000); // 2 seconds after load
}
