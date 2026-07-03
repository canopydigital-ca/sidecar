<script lang="ts">
  import InteractiveDemoSide from './InteractiveDemoSide.svelte';

  let { transparent = false } = $props<{ transparent?: boolean }>();
</script>

<div class={transparent ? 'bg-transparent' : ''}>
  <InteractiveDemoSide />
</div>

