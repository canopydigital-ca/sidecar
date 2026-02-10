<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PetsLayer } from '../../../pets/layer/PetsLayer';
  import { clsMonitor } from '../../../core/cls';
  import { loadPetSettings } from '../../../pets/core/settings';

  // Common Components
  import Button from '../common/Button.svelte';

  let { onClose } = $props<{ onClose: () => void }>();

  let debugState = $state<any>(null);
  let clsSummary = $state<any>(null);
  let interval: number;

  function update() {
    const layer = PetsLayer.getInstance();
    debugState = (layer as any).getDebugState?.();
    clsSummary = clsMonitor.getSummary();
  }

  onMount(() => {
    update();
    interval = window.setInterval(update, 500);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  function copyDiagnostics() {
    const diag = {
      timestamp: new Date().toISOString(),
      debugState,
      clsSummary,
      userAgent: navigator.userAgent,
    };
    navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
    alert('Diagnostics copied!');
  }
</script>

<div class="flex flex-col gap-3 min-w-[360px] max-h-[400px] overflow-y-auto">
  <div class="flex justify-between items-center border-b border-white/12 pb-2">
    <h4 class="m-0 text-white">Pets Inspector</h4>
    <div class="flex gap-2">
      <Button
        size="sm"
        onclick={copyDiagnostics}
        ariaLabel="Copy diagnostics JSON">Copy JSON</Button
      >
      <Button
        size="sm"
        variant="ghost"
        onclick={onClose}
        ariaLabel="Close inspector">Close</Button
      >
    </div>
  </div>

  {#if debugState}
    <div class="bg-white/5 p-2 rounded-md">
      <h5 class="m-0 text-[13px] text-[#10a37f] mb-1">Runtime</h5>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Elevated:</span> <span>{debugState.isElevated}</span>
      </div>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Activation Timer:</span>
        <span>{debugState.activationTimerActive}</span>
      </div>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Stillness Timer:</span>
        <span>{debugState.stillnessTimerActive}</span>
      </div>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Renderer:</span> <span>{debugState.rendererKind}</span>
      </div>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Mouse:</span>
        <span>{debugState.lastMousePos?.x}, {debugState.lastMousePos?.y}</span>
      </div>
    </div>

    <div class="bg-white/5 p-2 rounded-md">
      <h5 class="m-0 text-[13px] text-[#10a37f] mb-1">Settings Snapshot</h5>
      <pre
        class="text-[10px] max-h-[100px] overflow-auto bg-black/30 p-1 whitespace-pre-wrap">{JSON.stringify(
          debugState.settings,
          null,
          2
        )}</pre>
    </div>
  {/if}

  {#if clsSummary}
    <div class="bg-white/5 p-2 rounded-md">
      <h5 class="m-0 text-[13px] text-[#10a37f] mb-1">Layout Shift (CLS)</h5>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Total Score:</span>
        <span>{clsSummary.totalShiftScore.toFixed(4)}</span>
      </div>
      <div class="flex justify-between text-xs font-mono text-white/55">
        <span>Count:</span> <span>{clsSummary.count}</span>
      </div>
      <h6 class="m-0 text-xs mt-1 text-white">Top Sources:</h6>
      <ul class="pl-4 my-1 text-[11px]">
        {#each clsSummary.topSources as src}
          <li>{src.source}: {src.score.toFixed(4)}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
