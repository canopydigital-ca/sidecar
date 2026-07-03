<script lang="ts">
  import Dock from './Dock.svelte';
  import type { DockProps } from './mountDock';

  let {
    ctx,
    settings,
    defs,
    defaultOrder,
    debugEnabled,
  }: DockProps = $props();
  type BoundaryInfo = { message: string; stack?: string };
  let lastKey = '';

  function toInfo(err: unknown): BoundaryInfo {
    if (err instanceof Error)
      return { message: err.message || err.name, stack: err.stack };
    if (typeof err === 'string') return { message: err };
    try {
      return { message: JSON.stringify(err) };
    } catch {
      return { message: String(err) };
    }
  }

  function report(err: unknown): BoundaryInfo {
    const info = toInfo(err);
    const key = `${info.message}\n${info.stack ?? ''}`;
    if (key !== lastKey) {
      lastKey = key;
      console.error('[Dock] boundary error', err);
    }
    (window as any).__dockBoundaryError = err;
    (window as any).__dockBoundaryErrorInfo = info;
    return info;
  }

  export function update(newProps: DockProps) {
    ({ ctx, settings, defs, defaultOrder, debugEnabled } = newProps);
  }
</script>

<svelte:boundary
  onerror={(err) => {
    report(err);
  }}
>
  <Dock {ctx} {settings} {defs} {defaultOrder} {debugEnabled} />
  {#snippet failed(error, reset)}
    {@const info = report(error)}
    <div class="cgpt-dock-boundary">
      <div class="cgpt-dock-boundary-head">
        <strong>Dock Error (see console)</strong>
        <button class="cgpt-btn cgpt-btn-sm" type="button" onclick={reset}
          >Retry</button
        >
      </div>
      <div class="cgpt-dock-boundary-msg">{info.message}</div>
      {#if info.stack}
        <details class="cgpt-dock-boundary-details">
          <summary>Details</summary>
          <pre class="cgpt-dock-boundary-stack">{info.stack}</pre>
        </details>
      {/if}
    </div>
  {/snippet}
</svelte:boundary>

<style>
  .cgpt-dock-boundary {
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    background: rgba(18, 18, 18, 0.94);
    color: rgba(255, 255, 255, 0.92);
    font-size: 12px;
  }
  .cgpt-dock-boundary-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }
  .cgpt-dock-boundary-msg {
    opacity: 0.85;
    word-break: break-word;
  }
  .cgpt-dock-boundary-details {
    margin-top: 6px;
    opacity: 0.9;
  }
  .cgpt-dock-boundary-stack {
    margin-top: 6px;
    padding: 8px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    overflow: auto;
    max-height: 220px;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 11px;
  }
</style>
