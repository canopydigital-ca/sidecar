<script lang="ts">
  import ChromeStoreButton from './ChromeStoreButton.svelte';
  import EdgeStoreButton from './EdgeStoreButton.svelte';
  import FirefoxStoreButton from './FirefoxStoreButton.svelte';

  let { variant = 'hero' }: { variant?: 'hero' | 'cta' } = $props();

  const compactClass = $derived(variant === 'hero' ? '' : 'scale-95');
</script>

<div
  class="flex flex-col sm:flex-row items-center justify-center gap-4 {compactClass}"
>
  <ChromeStoreButton {variant} />
  <EdgeStoreButton {variant} />
  <FirefoxStoreButton {variant} />
</div>
