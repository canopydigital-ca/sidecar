<script lang="ts">
  // Simple component for pqChip that mimics the render function behavior
  import { onMount } from 'svelte';

  let element: HTMLDivElement;

  onMount(() => {
    if (element) {
      if (element.id !== 'cgpt-pq-chip-root') element.id = 'cgpt-pq-chip-root';
      if (element.className !== 'ml-1 mr-1') element.className = 'ml-1 mr-1';
    }
  });
</script>

<div bind:this={element} class="ml-1 mr-1"></div>
