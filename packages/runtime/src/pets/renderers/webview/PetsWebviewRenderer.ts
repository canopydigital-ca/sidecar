
import { IPetRenderer, PetSettings, DockToPetsMessage, PetsToDockMessage } from '../../core/types';
import { sanitizePetSelection } from '../../core/catalog';

export class PetsWebviewRenderer implements IPetRenderer {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private bridgeListener: ((e: MessageEvent) => void) | null = null;
  private lastAppliedSignature: string | null = null;
  private lastAppliedPetKey: string | null = null;
  private lastAppliedEnvKey: string | null = null;
  private wasEnabled = false;

  // Handshake & Queue
  private isReady = false;
  private commandQueue: any[] = [];
  private lastSettings: PetSettings | null = null;
  private lastVendorTheme: string | null = null;

  // Animation Loop
  private tickInterval: number | null = null;
  private isPaused = false;
  private debug = false; // Toggle for lightweight logging

  mount(container: HTMLElement) {
    this.container = container;

    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      // Use chrome.runtime.getURL to find the host file
      const hostUrl = chrome.runtime.getURL('pets/pets-host.html');

      // Inject initial theme if known (to avoid flicker)
      const url = new URL(hostUrl);
      url.searchParams.set('hideUi', '1');

      // Determine mode for variables (light/dark)
      const isDark = document.documentElement.classList.contains('dark-theme') ||
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      url.searchParams.set('mode', isDark ? 'dark' : 'light');

      // 1. Background Settings
      // bg: transparent | solid | theme
      // theme: <name> | none
      const bgMode = this.lastSettings?.backgroundMode || 'transparent';
      url.searchParams.set('bg', bgMode);

      if (bgMode === 'solid') {
        url.searchParams.set('bgColor', isDark ? '#212121' : '#ffffff');
      }

      if (bgMode === 'theme' && this.lastSettings?.backgroundTheme) {
        url.searchParams.set('theme', this.lastSettings.backgroundTheme);
      } else {
        url.searchParams.set('theme', 'none');
      }

      // 2. Debug & UI
      url.searchParams.set('debug', this.lastSettings?.debug ? '1' : '0');
      url.searchParams.set('hideUi', this.lastSettings?.hideVendorUi ? '1' : '0');

      this.iframe.src = url.toString();
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        background-color: transparent;
        pointer-events: auto;
        color-scheme: light; /* Force light mode base to avoid dark UA background */
      `;
      
      // Allow transparent background
      this.iframe.setAttribute('allowtransparency', 'true');
      this.iframe.style.backgroundColor = 'transparent'; // Ensure JS style matches

      this.setupBridge();
    }

    // Append if not already there.
    if (this.iframe.parentElement !== this.container) {
      this.container.appendChild(this.iframe);
    }

    // Note: We do NOT start tick loop here.
    // We wait for 'ready' event to start anything.
  }

  unmount() {
    this.stopTickLoop();
    if (this.iframe) {
      this.iframe.remove();
      if (this.bridgeListener) {
        window.removeEventListener('message', this.bridgeListener);
        this.bridgeListener = null;
      }
      this.iframe = null;
    }
    this.container = null;
    this.isReady = false;
    this.commandQueue = [];
    this.lastAppliedSignature = null;
    this.lastAppliedPetKey = null;
    this.lastAppliedEnvKey = null;
    this.wasEnabled = false;
  }

  update(settings: PetSettings) {
    this.lastSettings = settings;
    if (settings.debug !== this.debug) {
      this.debug = settings.debug;
    }

    if (!this.iframe || !this.iframe.contentWindow) return;

    // Determine target size
    // small/medium/large/nano
    let size = 'medium';
    if (settings.scale <= 0.5) size = 'nano';
    else if (settings.scale <= 0.8) size = 'small';
    else if (settings.scale >= 1.5) size = 'large';

    // Resolve Theme/Mode
    const bgMode = settings.backgroundMode;
    const bgTheme = settings.backgroundTheme || 'none';
    const isDark = document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const solidColor = isDark ? '#212121' : '#ffffff';

    // Check if critical params changed that require reload (theme kind switch?)
    // Actually, we can hot-swap most things now.
    // Theme changes in vendor script usually require reload if we want to be safe,
    // but we can try to send a command first.

    const pet = sanitizePetSelection(settings.petType, settings.petColor);

    const alwaysClickThrough = settings.placementMode === 'background' || settings.placementMode === 'composer';
    const iframeInteractive = !alwaysClickThrough && !settings.clickThrough;
    if (this.iframe) {
      this.iframe.style.pointerEvents = iframeInteractive ? 'auto' : 'none';
    }

    const petKey = `${pet.type}|${pet.color}|${settings.maxPets}`;
    const envKey = `${settings.enabled}|${this.isPaused}|${size}|${bgMode}|${bgTheme}|${settings.debug}|${settings.hideVendorUi}`;
    const signature = `${petKey}|${envKey}`;

    if (this.isReady && signature === this.lastAppliedSignature) return;
    this.lastAppliedSignature = signature;

    if (!settings.enabled || this.isPaused) {
      this.wasEnabled = settings.enabled;
      this.stopTickLoop();
      this.postMessage({ command: 'pause-pet' });
      return;
    }

    const needsFullSync =
      !this.wasEnabled ||
      this.lastAppliedPetKey === null ||
      this.lastAppliedPetKey !== petKey;

    const needsEnvSync =
      this.lastAppliedEnvKey === null ||
      this.lastAppliedEnvKey !== envKey;

    this.wasEnabled = true;
    this.lastAppliedPetKey = petKey;
    this.lastAppliedEnvKey = envKey;

    this.postMessage({ command: 'set-size', size });

    if (needsEnvSync) {
      this.postMessage({
        command: 'host:setBackground',
        bg: bgMode,
        theme: bgTheme,
        bgColor: solidColor,
        hideUi: settings.hideVendorUi
      });
    }

    if (needsFullSync) {
      this.postMessage({ command: 'reset-pet' });
      for (let i = 0; i < settings.maxPets; i += 1) {
        this.postMessage({
          command: 'spawn-pet',
          type: pet.type,
          color: pet.color,
        });
      }
    }

    this.postMessage({ command: 'host:validatePositions' });
    this.startTickLoop();
  }

  pause() {
    this.isPaused = true;
    // Force update to stop tick and send pause-pet
    if (this.lastSettings) {
      this.update(this.lastSettings);
    } else {
      this.stopTickLoop();
      this.postMessage({ command: 'pause-pet' });
    }
  }

  resume() {
    this.isPaused = false;
    // Force update to restart tick and potentially re-spawn/sync
    if (this.lastSettings) {
      this.update(this.lastSettings);
    }
  }

  private startTickLoop() {
    if (this.tickInterval) return;
    if (this.debug) console.log('[PetsRenderer] Starting tick loop');

    // Immediate tick
    if (this.isReady && !this.isPaused) {
      this.postMessage({ command: 'tick' });
    }

    this.tickInterval = window.setInterval(() => {
      if (this.isReady && !this.isPaused) {
        this.postMessage({ command: 'tick' });
      }
    }, 100);
  }

  private stopTickLoop() {
    if (this.tickInterval) {
      if (this.debug) console.log('[PetsRenderer] Stopping tick loop');
      window.clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private setupBridge() {
    this.bridgeListener = (event: MessageEvent) => {
      // Validate origin if possible, but for local extensions strict origin checks can be tricky with frames
      // event.source check is good enough combined with __vscodePets check
      if (this.iframe && event.source !== this.iframe.contentWindow) return;

      if (event.data && event.data.__vscodePets) {
        const payload = event.data.__vscodePets;
        if (payload.event === 'ready') {
          if (this.debug) console.log('[PetsRenderer] Host is ready. Flushing queue...');
          this.isReady = true;

          // Flush any pending commands first
          this.flushQueue();

          // Then force a full update with current settings to ensure state is correct
          if (this.lastSettings) {
            // Bypass signature check to force re-send
            this.lastAppliedSignature = null;
            this.update(this.lastSettings);
          }
        }
      }
    };
    window.addEventListener('message', this.bridgeListener);
  }

  private postMessage(command: any) {
    if (!this.iframe || !this.iframe.contentWindow) return;

    if (!this.isReady) {
      this.commandQueue.push(command);
      return;
    }

    if (this.debug && command.command !== 'tick') {
      console.log('[PetsRenderer] TX:', command);
    }

    const msg: DockToPetsMessage = { __dockToPets: command };
    this.iframe.contentWindow.postMessage(msg, '*');
  }

  private flushQueue() {
    if (!this.iframe || !this.iframe.contentWindow) return;

    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift();
      if (this.debug) console.log('[PetsRenderer] TX (Flushed):', cmd);
      const msg: DockToPetsMessage = { __dockToPets: cmd };
      this.iframe.contentWindow.postMessage(msg, '*');
    }
  }

  sendFakeMouseMove(x: number, y: number) {
      this.postMessage({ command: 'fake-mouse-move', x, y });
  }

  throwBall() {
    this.postMessage({ command: 'throw-ball' });
  }
}
