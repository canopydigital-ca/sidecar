<script lang="ts">
  export let variant: 'hero' | 'cta' = 'hero';

  import ChromeStoreButton from './ChromeStoreButton.svelte';
  import EdgeStoreButton from './EdgeStoreButton.svelte';
  import FirefoxStoreButton from './FirefoxStoreButton.svelte';

  const compactClass = variant === 'hero' ? '' : 'scale-95';
</script>

<div
  class="flex flex-col sm:flex-row items-center justify-center gap-4 {compactClass}"
>
  <ChromeStoreButton {variant} />
  <EdgeStoreButton {variant} />
  <FirefoxStoreButton {variant} />
</div>
