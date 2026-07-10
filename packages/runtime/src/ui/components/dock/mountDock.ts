import { mount, unmount } from "svelte";
import { createShadowWrapper } from "../../shadow";
import { log } from "../../../core/log";
import type { DockContext } from "../../../core/context";
import type { GlobalSettings } from "../../../features/settings/schema";
import { DOCK_ITEM_DEFS } from "../../../features/dock/icons";
import DockRoot from "./DockRoot.svelte";
import { getConfiguredShadowCssText } from "../../styles";
// @ts-ignore
import appCss from "../../app.css?inline";
// @ts-ignore
import stylesCss from "../../../../styles.css?inline";

export interface DockMount {
  component: any;
  shadow: ReturnType<typeof createShadowWrapper>;
  update: (props: DockProps) => void;
  destroy: () => void;
}

export interface DockProps {
  ctx: DockContext;
  settings: GlobalSettings;
  defs: typeof DOCK_ITEM_DEFS;
  defaultOrder: string[];
  debugEnabled: boolean;
}

let _dockMount: DockMount | null = null;
let _lastProps: DockProps | null = null;

export function ensureDockMount(target: HTMLElement, initialProps: DockProps): DockMount {
  if (_dockMount) {
    if (_dockMount.shadow.root.host === target) {
      _dockMount.update(initialProps);
      return _dockMount;
    }

    if (initialProps.debugEnabled) {
      log.warn("[Dock] Remounting dock to new target (old target disconnected?)");
    }
    _dockMount.destroy();
    _dockMount = null;
  }

  _lastProps = initialProps;

  const fallbackStyles = [];
  if (appCss) {
    fallbackStyles.push(appCss);
  } else if (initialProps.debugEnabled) {
    log.warn("[Dock] app.css not loaded (inline import failed?)");
  }

  if (stylesCss) fallbackStyles.push(stylesCss);

  const localDockCss = `
    :host {
      display: block;
      width: 100%;
      height: auto;
    }
    .cgpt-dock {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 40px;
      height: auto;
      padding: 8px 10px;
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 12px;
      background: rgba(20, 20, 20, 0.55);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-sizing: border-box;
      flex-wrap: nowrap;
      /* Scroll the button row (rather than clip it) when it can't fit at
         narrow viewport widths, so every dock button stays reachable. The
         scrollbar itself stays hidden (see rules below) for a clean look. */
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      color: var(--text-primary, currentColor);
    }
    .cgpt-dock::-webkit-scrollbar {
      display: none;
    }
    .cgpt-spacer {
      flex: 1 1 auto;
      min-width: 12px;
    }
    #cgpt-model-slot:empty,
    #cgpt-pq-chip-root:empty {
      display: none;
    }
    #cgpt-model-slot,
    #cgpt-pq-chip-root {
      flex: 0 1 auto;
    }
    #cgpt-model-slot {
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 420px;
      overflow: hidden;
      padding: 3px 4px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    #cgpt-model-slot .cgpt-moved-model-picker {
      max-width: 100%;
    }
    #cgpt-pq-chip-root {
      align-items: center;
      gap: 7px;
      min-width: 196px;
      max-width: 260px;
      height: 32px;
      padding: 4px 9px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.88);
      overflow: hidden;
      white-space: nowrap;
    }
    #cgpt-pq-chip-root:not(:empty) {
      display: flex;
    }
    .cgpt-pq-chip-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 7px;
      background: rgba(124, 92, 255, 0.34);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: rgba(255, 255, 255, 0.9);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0;
      flex: 0 0 auto;
    }
    .cgpt-pq-chip-meta {
      display: inline-flex;
      align-items: baseline;
      gap: 7px;
      min-width: 0;
      flex: 1 1 auto;
      overflow: hidden;
    }
    .cgpt-pq-chip-primary {
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      flex: 0 0 auto;
    }
    .cgpt-pq-chip-secondary {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.66);
      line-height: 1;
    }
    .cgpt-pq-chip-progress {
      display: block;
      width: 64px;
      height: 4px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.16);
      flex: 0 0 auto;
    }
    .cgpt-pq-chip-progress > span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: rgba(255, 255, 255, 0.58);
    }
    .cgpt-dock:not(:has(#cgpt-model-slot:not(:empty), #cgpt-pq-chip-root:not(:empty))) .cgpt-spacer {
      display: none;
    }
    .cgpt-btn {
      cursor: pointer;
      color: currentColor;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    * {
      box-sizing: border-box;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      min-width: 0;
    }
  `;
  const styles = [
    getConfiguredShadowCssText(fallbackStyles.filter(Boolean).join("\n")),
    localDockCss,
  ].filter(Boolean);

  const shadow = createShadowWrapper(target, styles);

  const component = mount(DockRoot, {
    target: shadow.container,
    props: initialProps
  });

  _dockMount = {
    component,
    shadow,
    update: (next: DockProps) => {
      _lastProps = next;
      if (typeof (component as any).$set === "function") {
        (component as any).$set(next);
        return;
      }
      if (typeof (component as any).update === "function") {
        (component as any).update(next);
        return;
      }
      log.warn("[Dock] Component does not support $set/update. Props update skipped.");
    },
    destroy: () => {
      unmount(component);
      shadow.detach();
      _dockMount = null;
      _lastProps = null;
    }
  };

  return _dockMount;
}

export function updateDockMount(partial: Partial<DockProps>): void {
  if (!_dockMount || !_lastProps) {
    if (partial.debugEnabled) {
      log.warn("[Dock] updateDockMount called before mount exists");
    }
    return;
  }
  _dockMount.update({ ..._lastProps, ...partial });
}

export function destroyDockMount(): void {
  if (_dockMount) {
    _dockMount.destroy();
  }
}

export function getDockMount(): DockMount | null {
  return _dockMount;
}
