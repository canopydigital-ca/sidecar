import { mount, unmount } from "svelte";
import { createShadowWrapper } from "../../shadow";
import { log } from "../../../core/log";
import type { DockContext } from "../../../core/context";
import type { GlobalSettings } from "../../../features/settings/schema";
import { DOCK_ITEM_DEFS } from "../../../features/dock/icons";
import DockRoot from "./DockRoot.svelte";
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

  const styles = [];
  if (appCss) {
    styles.push(appCss);
  } else if (initialProps.debugEnabled) {
    log.warn("[Dock] app.css not loaded (inline import failed?)");
  }

  if (stylesCss) styles.push(stylesCss);

  styles.push(`
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
      height: 40px;
      color: var(--text-primary, currentColor);
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
  `);

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
