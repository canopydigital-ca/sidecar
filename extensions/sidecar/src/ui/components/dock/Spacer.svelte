<script lang="ts">
  // Simple component for spacer that mimics the render function behavior
  import { onMount } from 'svelte';

  let element: HTMLDivElement;

  onMount(() => {
    if (element) {
      if (element.className !== 'cgpt-spacer')
        element.className = 'cgpt-spacer';
    }
  });
</script>

<div bind:this={element} class="cgpt-spacer"></div>
