<script lang="ts">
  // Simple component for modelSlot that mimics the render function behavior
  import { onMount } from 'svelte';
  import { MODEL_SLOT_ID } from '../../../core/constants';

  let element: HTMLDivElement;

  onMount(() => {
    if (element) {
      if (element.id !== MODEL_SLOT_ID) element.id = MODEL_SLOT_ID;
      element.setAttribute("title", "Model picker (moved)");
    }
  });
</script>

<div bind:this={element}></div>