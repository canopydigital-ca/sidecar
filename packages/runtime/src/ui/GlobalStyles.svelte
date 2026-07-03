<script lang="ts">
  import { onMount } from 'svelte';
  import { getHostAdapter } from '../core/host';
  import { settingsStore } from './stores/settings';

  let hideTop = $state(false);
  let sheetEl: HTMLStyleElement | null = null;
  const HIDDEN_TOP_MODEL_CLASS = 'cgpt-hidden-top-model';

  onMount(() => {
    let mounted = true;
    let stop: (() => void) | null = null;

    void (async () => {
      const s = await settingsStore.init();
      if (!mounted) return;
      hideTop = !!s.ui.hideTopPicker;

      stop = settingsStore.subscribe((next) => {
        hideTop = !!next.ui.hideTopPicker;
        apply();
      });

      apply();
    })();

    return () => {
      mounted = false;
      stop?.();
      if (sheetEl && sheetEl.isConnected) sheetEl.remove();
      sheetEl = null;
    };
  });

  function apply() {
    if (!sheetEl) {
      sheetEl = document.createElement('style');
      sheetEl.id = 'cgpt-hide-top-model';
      sheetEl.textContent = `
        .${HIDDEN_TOP_MODEL_CLASS} {
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
        }
      `;
    }

    const picker = getHostAdapter().findModelPicker() as HTMLElement | null;

    if (hideTop) {
      if (!sheetEl.isConnected) document.head.appendChild(sheetEl);
      picker?.classList.add(HIDDEN_TOP_MODEL_CLASS);
    } else {
      if (sheetEl.isConnected) sheetEl.remove();
      picker?.classList.remove(HIDDEN_TOP_MODEL_CLASS);
    }
  }
</script>

<div class="hidden" aria-hidden="true"></div>
