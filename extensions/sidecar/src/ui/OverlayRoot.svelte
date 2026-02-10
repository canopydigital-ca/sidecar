<script lang="ts">
  import GlobalStyles from './GlobalStyles.svelte';
  import ToastHost from './components/ToastHost.svelte';
  import DemoPage from './components/DemoPage.svelte';
</script>

<div id="cgpt-overlay-root" class="relative w-full h-full text-white">
  <GlobalStyles />

  <div
    id="cgpt-portal"
    class="w-full h-full flex flex-col items-start pointer-events-none"
  ></div>

  <DemoPage />
  <ToastHost />
</div>

<style>
  :global(:host) {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      Arial,
      sans-serif;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.5;
  }
  #cgpt-overlay-root {
    pointer-events: none;
  }
  #cgpt-portal {
    pointer-events: none;
  }
  :global(#cgpt-portal > *) {
    pointer-events: auto;
  }
  #cgpt-overlay-root > :not(#cgpt-portal) {
    pointer-events: auto;
  }
</style>
