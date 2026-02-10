# UI Mount Pattern & Architecture

## 1. Bootstrap & Mount Logic
**Canonical Entry Point:** `src/ui/bootstrap.ts` -> `bootFullRuntime()`
**Global Overlay:** `src/ui/manager.ts` -> `ensureGlobalOverlay()`

The application uses a **hybrid mount strategy**:
1. **Global Overlay**: A single fixed-position Shadow Root (`#cgpt-ext-root`) injected into `<html>`.
   - **Manager**: `src/ui/manager.ts`
   - **Mounts**: `OverlayRoot.svelte` (via `mountOverlayRoot`) and `PopoverRoot.svelte` (via `popoverManager`).
   - **Purpose**: Hosts floating UI (popovers, toasts, modals) that sits above everything.

2. **In-Page Components**: Individual components injected into specific page locations.
   - **Mechanism**: `ShadowMount` class in `src/ui/index.ts`.
   - **Factory**: `src/ui/shadow.ts` -> `createShadowWrapper`.
   - **Pattern**:
     ```typescript
     // 1. Create Host (usually in a feature/ensure* function)
     const host = document.createElement('div');
     
     // 2. Mount Svelte Component with Shadow DOM
     const mount = new ShadowMount(host, Component, props, styles);
     ```

## 2. Svelte 5 Integration
**Mounting**: Uses `mount` and `unmount` from `svelte` package (Svelte 5 API).
**State Management**:
- **Runes**: `$state`, `$derived`, `$effect`, `$props` are standard.
- **Stores**: `src/ui/stores/settings.ts` wraps the legacy storage system.
- **Reactivity**: Components subscribe to stores or receive reactive state via props.

## 3. Settings & Cleanup
- **Settings**: `src/ui/stores/settings.ts` exposes `settingsStore`. Components can subscribe or use it directly.
- **Cleanup**:
  - `ShadowMount.destroy()` handles `unmount()` and shadow root detachment.
  - `bootFullRuntime` installs `installHostMutationHook` (MutationObserver) which triggers re-checks.
  - SPA navigation hooks (`pushState`, `popstate`) trigger `ensureAll`, which should handle re-mounting or re-parenting if the host is lost.

## 4. Architecture Recommendation for Dock
The Dock should transition from manual DOM manipulation (`dock.ts`) to a Svelte Component (`Dock.svelte`).

**Location**: `src/ui/components/dock/Dock.svelte` (New)
**Mount Strategy**:
1. **Container**: `dock.ts` -> `ensureDockHost()` continues to create/place the `<div id="cgpt-dock">` container in the DOM (ensuring correct position relative to composer).
2. **Rendering**: Instead of manual button creation, `dock.ts` should instantiate a `ShadowMount`.
   ```typescript
   // src/features/dock/dock.ts
   import { Dock } from '../../ui/components/dock/Dock.svelte';
   import { ShadowMount } from '../../ui/index';
   
   let dockMount: ShadowMount | null = null;
   
   export function renderDock(settings) {
     const host = ensureDockHost();
     if (!dockMount) {
        dockMount = new ShadowMount(host, Dock, { settings });
     } else {
        dockMount.updateProps({ settings });
     }
   }
   ```
3. **Styles**: Pass `dist/chatgpt-dock.css` content or rely on component-scoped styles + Tailwind injection (handled by `ShadowMount`/`createShadowWrapper`).

## 5. File References
- **Bootstrap**: [`src/ui/bootstrap.ts:116`](file:///b:/Dev/chatgpt-dock/chatgpt-dock/src/ui/bootstrap.ts#L116) (`bootFullRuntime`)
- **Overlay Manager**: [`src/ui/manager.ts:25`](file:///b:/Dev/chatgpt-dock/chatgpt-dock/src/ui/manager.ts#L25) (`ensureGlobalOverlay`)
- **Shadow Factory**: [`src/ui/shadow.ts:16`](file:///b:/Dev/chatgpt-dock/chatgpt-dock/src/ui/shadow.ts#L16) (`createShadowWrapper`)
- **Component Mounter**: [`src/ui/index.ts:31`](file:///b:/Dev/chatgpt-dock/chatgpt-dock/src/ui/index.ts#L31) (`ShadowMount`)
- **Settings Store**: [`src/ui/stores/settings.ts:6`](file:///b:/Dev/chatgpt-dock/chatgpt-dock/src/ui/stores/settings.ts#L6) (`SettingsStore`)
- **Svelte 5 Example**: [`src/ui/components/popovers/PromptsPopover.svelte:61`](file:///b:/Dev/chatgpt-dock/chatgpt-dock/src/ui/components/popovers/PromptsPopover.svelte#L61) (Runes usage)
