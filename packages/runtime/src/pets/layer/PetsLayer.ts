
import { IPetRenderer, PetSettings } from '../core/types';
import { getHostAdapter } from '../../core/host';
import { PetsWebviewRenderer } from '../renderers/webview/PetsWebviewRenderer';
import { PetCanvasRenderer } from '../renderers/canvas/PetCanvasRenderer';

const PETS_HOST_ID = 'cgpt-pets-host';

export class PetsLayer {
  private static instance: PetsLayer;
  private activeRenderer: IPetRenderer | null = null;
  private currentSettings: PetSettings | null = null;

  // Single host strategy
  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;

  // Observers
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private observedResizeTargets = new Set<Element>();

  // Debug
  private debugBadge: HTMLElement | null = null;

  private viewportHandler: (() => void) | null = null;
  private placementRaf: number | null = null;
  private settleRaf: number | null = null;
  private settleUntil = 0;

  private ctrlHandler: ((e: KeyboardEvent) => void) | null = null;
  private ctrlHeld = false;

  private constructor() { }

  static getInstance(): PetsLayer {
    if (!PetsLayer.instance) {
      PetsLayer.instance = new PetsLayer();
    }
    return PetsLayer.instance;
  }

  initialize() {
    this.ensureHost();
    this.startObservers();
    this.ensureViewportListeners();
    this.ensureInputListeners();
  }

  private getViewportBox() {
    const vv = window.visualViewport;
    if (vv) {
      return {
        width: vv.width,
        height: vv.height,
        offsetLeft: vv.offsetLeft,
        offsetTop: vv.offsetTop,
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      offsetLeft: 0,
      offsetTop: 0,
    };
  }

  private clampNumber(n: number, min: number, max: number) {
    if (!Number.isFinite(n)) return min;
    if (max < min) return min;
    return Math.min(max, Math.max(min, n));
  }

  private computeScaledSize(settings: PetSettings, baseWidth: number, baseHeight: number) {
    const scale = Number.isFinite(settings.scale) ? settings.scale : 1;
    return {
      baseWidth,
      baseHeight,
      scaledWidth: baseWidth * scale,
      scaledHeight: baseHeight * scale,
    };
  }

  private resolvePetSize(scale: number) {
    if (scale <= 0.5) return 'nano';
    if (scale <= 0.8) return 'small';
    if (scale >= 1.5) return 'large';
    return 'medium';
  }

  private resolveThemeName(settings: PetSettings) {
    if (settings.backgroundMode === 'theme' && settings.backgroundTheme) return settings.backgroundTheme;
    return 'none';
  }

  private themeFloorPx(theme: string, petSize: string) {
    if (theme === 'forest') {
      if (petSize === 'small') return 30;
      if (petSize === 'medium') return 40;
      if (petSize === 'large') return 65;
      return 23;
    }
    if (theme === 'castle' || theme === 'beach') {
      if (petSize === 'small') return 60;
      if (petSize === 'medium') return 80;
      if (petSize === 'large') return 120;
      return 45;
    }
    if (theme === 'winter') {
      if (petSize === 'small') return 20;
      if (petSize === 'medium') return 30;
      if (petSize === 'large') return 45;
      return 18;
    }
    if (theme === 'autumn') {
      if (petSize === 'small') return 9;
      if (petSize === 'medium') return 15;
      if (petSize === 'large') return 20;
      return 7;
    }
    return 0;
  }

  private resolveStatusBarRect() {
    const statusBar = document.getElementById('cgpt-statusbar');
    if (!statusBar) return null;
    const rect = statusBar.getBoundingClientRect();
    if (!Number.isFinite(rect.top) || rect.height <= 0) return null;
    return rect;
  }

  private resolveSidebarRightEdge() {
    return getHostAdapter().getSidebarRightEdge();
  }

  private getContentBox() {
    const { width: vw, height: vh, offsetLeft, offsetTop } = this.getViewportBox();
    const sidebarRight = this.resolveSidebarRightEdge();
    const statusRect = this.resolveStatusBarRect();
    
    // Left boundary: Max of viewport left or sidebar right
    const left = Math.max(offsetLeft, sidebarRight);
    
    // Top boundary: Always viewport top
    const top = offsetTop;
    
    // Width: Available space from left boundary to viewport right edge
    const right = offsetLeft + vw;
    const width = Math.max(1, right - left);
    
    // Height: Available space from top to status bar (if visible) or viewport bottom
    const bottom = statusRect ? Math.min(statusRect.top, offsetTop + vh) : offsetTop + vh;
    const height = Math.max(1, bottom - top);

    return { left, top, width, height };
  }

  private applyFixedBoxPosition(container: HTMLElement, left: number, top: number, width: number, height: number) {
    container.style.position = 'fixed';
    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
  }

  private ensureHost() {
    const existing = document.getElementById(PETS_HOST_ID);
    if (existing) {
      this.host = existing as HTMLElement;
      this.shadow = this.host.shadowRoot as ShadowRoot;
      return;
    }

    // Not in DOM. Check if we have a detached instance.
    if (this.host) {
      if (!this.host.isConnected) {
        document.documentElement.appendChild(this.host);
      }
      return;
    }

    this.host = document.createElement('div');
    this.host.id = PETS_HOST_ID;
    // Base styles for the host - high z-index by default, but pointer-events: none
    Object.assign(this.host.style, {
      background: 'transparent',
      backgroundColor: 'transparent',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483646', // Below Popovers (2147483647)
    });

    // Insert into documentElement (html) to avoid body-level transforms/clearing
    document.documentElement.appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: 'open' });
    this.injectStyles(this.shadow);
  }

  private injectStyles(shadow: ShadowRoot) {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .pet-container {
        position: absolute;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
        will-change: transform, left, top;
      }
      
      /* Placement Modes */
      .mode-corner {
        bottom: 20px;
        right: 20px;
        position: fixed; /* Use fixed for corner to stick to viewport */
      }

      .mode-background {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none; /* Background mode usually non-interactive or specific */
        opacity: 0.6; /* Blend slightly */
        z-index: -1; /* Logical z-index within the shadow DOM (won't escape host z-index though) */
      }

      /* Debug Badge */
      .debug-badge {
        position: fixed;
        top: 4px;
        right: 4px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 4px;
        pointer-events: none;
        font-family: monospace;
        z-index: 9999;
      }
    `;
    shadow.appendChild(style);
  }

  async setSettings(settings: PetSettings) {
    this.currentSettings = settings;

    if (!settings.enabled) {
      this.dispose();
      return;
    }

    this.ensureHost();
    this.startObservers();

    const desiredRenderer =
      settings.renderer === 'webview' && settings.vendorEnabled ? 'webview' : 'canvas';

    const activeKind =
      this.activeRenderer instanceof PetsWebviewRenderer
        ? 'webview'
        : this.activeRenderer instanceof PetCanvasRenderer
          ? 'canvas'
          : null;

    if (!this.activeRenderer || activeKind !== desiredRenderer) {
      this.activeRenderer?.unmount();
      this.activeRenderer = desiredRenderer === 'webview' ? new PetsWebviewRenderer() : new PetCanvasRenderer();
    }

    this.updatePlacement(settings);
    this.activeRenderer.update(settings);
    this.updateDebug();
  }

  private applyInteractivity(container: HTMLElement, settings: PetSettings) {
    // If Ctrl is held, allow interaction (override everything else)
    if (this.ctrlHeld) {
      container.style.pointerEvents = 'auto';
      return;
    }

    // Default behaviors
    if (settings.placementMode === 'background' || settings.placementMode === 'composer') {
      container.style.pointerEvents = 'none';
      return;
    }
    
    // Normal modes respect the setting
    container.style.pointerEvents = settings.clickThrough ? 'none' : 'auto';
  }

  private schedulePlacementUpdate() {
    if (this.placementRaf) return;
    this.placementRaf = window.requestAnimationFrame(() => {
      this.placementRaf = null;
      if (this.currentSettings) this.updatePlacement(this.currentSettings);
    });
  }

  private startPlacementSettle(ms = 500) {
    const until = performance.now() + ms;
    if (until > this.settleUntil) this.settleUntil = until;
    if (this.settleRaf) return;

    const tick = () => {
      this.settleRaf = null;
      const now = performance.now();
      if (now >= this.settleUntil) {
        this.settleUntil = 0;
        return;
      }

      if (
        this.currentSettings &&
        (this.currentSettings.placementMode === 'dock-overlay' || this.currentSettings.placementMode === 'composer')
      ) {
        this.updatePlacement(this.currentSettings);
      }

      this.settleRaf = window.requestAnimationFrame(tick);
    };

    this.settleRaf = window.requestAnimationFrame(tick);
  }

  private ensureViewportListeners() {
    if (this.viewportHandler) return;

    this.viewportHandler = () => {
      this.handleResize();
    };

    // window.resize is now handled by Svelte (via PopoverRoot -> handleResize)
    // window.addEventListener('resize', this.viewportHandler, true);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.viewportHandler, true);
      window.visualViewport.addEventListener('scroll', this.viewportHandler, true);
    }
  }

  public handleResize() {
    if (
      this.currentSettings &&
      (this.currentSettings.placementMode === 'dock-overlay' || this.currentSettings.placementMode === 'composer')
    ) {
      // Force immediate update for responsiveness
      this.updatePlacement(this.currentSettings);
      // And settle
      this.startPlacementSettle(700);
    } else if (this.currentSettings) {
        // For background/corner, we also need to update (e.g. sidebar changes)
        this.updatePlacement(this.currentSettings);
    }
  }

  private ensureInputListeners() {
    if (this.ctrlHandler) return;

    this.ctrlHandler = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') { // Support Cmd on Mac too just in case
        const isDown = e.type === 'keydown';
        if (this.ctrlHeld !== isDown) {
          this.ctrlHeld = isDown;
          if (this.currentSettings && this.shadow) {
            const container = this.shadow.querySelector('.pet-container') as HTMLElement;
            if (container) this.applyInteractivity(container, this.currentSettings);
          }
        }
      }
    };

    window.addEventListener('keydown', this.ctrlHandler, true);
    window.addEventListener('keyup', this.ctrlHandler, true);
  }

  private updatePlacement(settings: PetSettings) {
    if (!this.activeRenderer || !this.shadow) return;

    let container = this.shadow.querySelector('.pet-container') as HTMLElement;

    if (!container) {
      container = document.createElement('div');
      container.className = 'pet-container';
      this.shadow.appendChild(container);
      this.activeRenderer.mount(container);
    }

    // Reset styles
    container.className = 'pet-container';
    container.style.cssText = '';

    // Handle Background Mode special case:
    // If we want it visually behind everything, but we are in a z-index: max host,
    // we can't truly put it behind the <body>.
    // However, if we make the host pointer-events: none and the container pointer-events: none,
    // it overlays visually but doesn't block interaction.
    // To truly be "background", we'd need a separate host at z-index: -1.
    // BUT, swapping hosts causes reload.
    // COMPROMISE: For "background", we use the same host but apply `mix-blend-mode` or `opacity`
    // and rely on it being an "overlay background" (like a weather effect on top of the lens).
    // If the user *strictly* needs it behind text, we must accept the reload penalty and swap hosts.
    //
    // User instruction: "If background causes reload, document it and consider a mitigation".
    //
    // Let's implement the robust single-host approach where "background" is just a full-screen overlay
    // with pointer-events: none. This is "Option B" from the prompt.

    container.style.opacity = String(settings.opacity);
    container.style.transform = settings.placementMode === 'background' ? 'none' : `scale(${settings.scale})`;

    switch (settings.placementMode) {
      case 'corner':
        this.positionStatusBarStrip(container, settings);
        container.style.transformOrigin = 'top left';
        break;
      case 'background':
        this.positionBackground(container, settings);
        container.style.transformOrigin = 'top left';
        break;
      case 'dock-overlay':
        this.positionAboveDock(container, settings);
        container.style.transformOrigin = 'top left';
        break;
      case 'composer':
        this.positionInComposer(container, settings);
        container.style.transformOrigin = 'top left';
        break;
    }

    this.ensureResizeTargetsObserved(settings);
    this.applyInteractivity(container, settings);
  }

  private positionAboveDock(container: HTMLElement, settings: PetSettings) {
    const dock = document.getElementById('cgpt-dock');
    if (dock) {
      // Use getContentBox to respect sidebar/statusbar boundaries
      const { left: contentLeft, top: contentTop, width: contentW, height: contentH } = this.getContentBox();
      const rect = dock.getBoundingClientRect();
      
      const baseWidth = Math.max(320, Math.floor(rect.width));
      const baseHeight = 220;
      const { scaledWidth, scaledHeight } = this.computeScaledSize(settings, baseWidth, baseHeight);
      
      const margin = 8;
      // Boundaries relative to the content box
      const minLeft = contentLeft + margin;
      const minTop = contentTop + margin;
      const maxLeft = contentLeft + contentW - scaledWidth - margin;
      const maxTop = contentTop + contentH - scaledHeight - margin;

      const theme = this.resolveThemeName(settings);
      const petSize = this.resolvePetSize(settings.scale);
      const floor = this.themeFloorPx(theme, petSize);
      const floorScaled = floor * (Number.isFinite(settings.scale) ? settings.scale : 1);

      // Clamp absolute dock position within safe content area
      const left = this.clampNumber(rect.left, minLeft, maxLeft);
      // Ensure we don't go below the content area (statusbar top)
      // FIX: Ensure we are strictly above the dock if possible, but floorScaled allows visual overlap
      // rect.top is the top of the dock. We want feet at rect.top.
      // container top = rect.top - scaledHeight + floorScaled.
      const top = this.clampNumber(rect.top - scaledHeight + floorScaled, minTop, maxTop);

      this.applyFixedBoxPosition(container, left, top, baseWidth, baseHeight);
    } else {
      container.classList.add('mode-corner');
    }
  }

  private positionStatusBarStrip(container: HTMLElement, settings: PetSettings) {
    const statusRect = this.resolveStatusBarRect();
    const { left: contentLeft, top: contentTop, width: contentW, height: vh } = this.getContentBox();
    const baseWidth = Math.max(320, Math.floor(contentW));
    const baseHeight = 240;
    const { scaledWidth, scaledHeight } = this.computeScaledSize(settings, baseWidth, baseHeight);
    const margin = 8;
    const minLeft = contentLeft;
    const minTop = contentTop + margin;
    const maxLeft = contentLeft + contentW - scaledWidth;
    const maxTop = contentTop + vh - scaledHeight - margin;

    const theme = this.resolveThemeName(settings);
    const petSize = this.resolvePetSize(settings.scale);
    const floor = this.themeFloorPx(theme, petSize);
    const floorScaled = floor * (Number.isFinite(settings.scale) ? settings.scale : 1);

    const targetTop = statusRect ? statusRect.top - scaledHeight + floorScaled : (contentTop + vh - scaledHeight + floorScaled);
    const left = this.clampNumber(contentLeft, minLeft, maxLeft);
    const top = this.clampNumber(targetTop, minTop, maxTop);

    this.applyFixedBoxPosition(container, left, top, baseWidth, baseHeight);
  }

  private positionBackground(container: HTMLElement, settings: PetSettings) {
    const { left: contentLeft, top: contentTop, width: contentW, height: vh } = this.getContentBox();
    const statusRect = this.resolveStatusBarRect();
    const usableHeight = statusRect ? Math.max(1, statusRect.top - contentTop) : vh;

    container.style.position = 'fixed';
    container.style.left = `${contentLeft}px`;
    container.style.top = `${contentTop}px`;
    container.style.width = `${contentW}px`;
    container.style.height = `${usableHeight}px`;
    container.classList.add('mode-background');
  }

  private positionInComposer(container: HTMLElement, settings: PetSettings) {
    const composerEl = getHostAdapter().findComposerEditor() as HTMLElement | null;
    const composer = composerEl?.closest('form') ?? composerEl;
    if (composer instanceof HTMLElement) {
      const { width: vw, height: vh, offsetLeft, offsetTop } = this.getViewportBox();
      const rect = composer.getBoundingClientRect();
      const baseWidth = Math.max(320, Math.floor(rect.width));
      const baseHeight = 220;
      const { scaledWidth, scaledHeight } = this.computeScaledSize(settings, baseWidth, baseHeight);
      const margin = 8;
      const minLeft = offsetLeft + margin;
      const minTop = offsetTop + margin;
      const maxLeft = offsetLeft + vw - scaledWidth - margin;
      const maxTop = offsetTop + vh - scaledHeight - margin;

      const theme = this.resolveThemeName(settings);
      const petSize = this.resolvePetSize(settings.scale);
      const floor = this.themeFloorPx(theme, petSize);
      const floorScaled = floor * (Number.isFinite(settings.scale) ? settings.scale : 1);

      const left = this.clampNumber(rect.left, minLeft, maxLeft);
      const top = this.clampNumber(rect.top - scaledHeight + floorScaled, minTop, maxTop);

      this.applyFixedBoxPosition(container, left, top, baseWidth, baseHeight);
    }
  }

  private ensureResizeTargetsObserved(settings: PetSettings) {
    if (!this.resizeObserver) return;

    const nextTargets: Element[] = [document.body];

    if (settings.placementMode === 'corner' || settings.placementMode === 'background') {
      const sidebar = getHostAdapter().findSidebarContainer();
      if (sidebar) nextTargets.push(sidebar);
    }

    if (settings.placementMode === 'dock-overlay') {
      const dock = document.getElementById('cgpt-dock');
      if (dock) nextTargets.push(dock);
    }

    if (settings.placementMode === 'composer') {
      const composer = getHostAdapter().findComposerEditor();
      if (composer) nextTargets.push(composer);
    }

    const nextSet = new Set(nextTargets);
    for (const el of this.observedResizeTargets) {
      if (!nextSet.has(el)) {
        try { this.resizeObserver.unobserve(el); } catch { }
        this.observedResizeTargets.delete(el);
      }
    }

    for (const el of nextSet) {
      if (!this.observedResizeTargets.has(el)) {
        try { this.resizeObserver.observe(el); } catch { }
        this.observedResizeTargets.add(el);
      }
    }
  }

  private startObservers() {
    // Resize Observer to update positioning when layout changes
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        if (
          this.currentSettings &&
          (this.currentSettings.placementMode === 'dock-overlay' ||
            this.currentSettings.placementMode === 'composer')
        ) {
          this.startPlacementSettle(700);
        }
      });
      this.resizeObserver.observe(document.body);
      this.observedResizeTargets.add(document.body);
    }

    // Mutation Observer to ensure host persistence
    if (!this.mutationObserver) {
      this.mutationObserver = new MutationObserver((mutations) => {
        let detached = false;
        for (const m of mutations) {
          for (let i = 0; i < m.removedNodes.length; i++) {
            if (m.removedNodes[i] === this.host) {
              detached = true;
              break;
            }
          }
          if (detached) break;
        }

        if (detached && this.host) {
          // Re-attach immediately
          document.documentElement.appendChild(this.host);
        }
      });
      this.mutationObserver.observe(document.documentElement, { childList: true });
    }
  }

  private updateDebug() {
    if (!this.shadow) return;

    if (!this.currentSettings?.debug) {
      this.debugBadge?.remove();
      this.debugBadge = null;
      return;
    }

    if (!this.debugBadge) {
      this.debugBadge = document.createElement('div');
      this.debugBadge.className = 'debug-badge';
      this.shadow.appendChild(this.debugBadge);
    }

    this.debugBadge.textContent = `clickThrough=${this.currentSettings.clickThrough ? 'on' : 'off'} | ${this.currentSettings.placementMode}`;
  }

  public getDebugState() {
      return {
          rendererKind: this.activeRenderer instanceof PetsWebviewRenderer ? 'webview' : 'canvas',
          settings: this.currentSettings
      };
  }

  public dispose() {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.activeRenderer?.unmount();
    this.host?.remove();
    this.host = null;
    this.shadow = null;
    this.activeRenderer = null;
    this.currentSettings = null;
    this.debugBadge = null;

    if (this.viewportHandler) window.removeEventListener('resize', this.viewportHandler, true);
    if (this.viewportHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.viewportHandler, true);
      window.visualViewport.removeEventListener('scroll', this.viewportHandler, true);
    }
    if (this.ctrlHandler) {
      window.removeEventListener('keydown', this.ctrlHandler, true);
      window.removeEventListener('keyup', this.ctrlHandler, true);
      this.ctrlHandler = null;
    }
    if (this.placementRaf) window.cancelAnimationFrame(this.placementRaf);
    if (this.settleRaf) window.cancelAnimationFrame(this.settleRaf);
    this.viewportHandler = null;
    this.placementRaf = null;
    this.settleRaf = null;
    this.settleUntil = 0;
  }

  public throwBall() {
      if (this.activeRenderer instanceof PetsWebviewRenderer) {
          this.activeRenderer.throwBall();
      }
  }
}
