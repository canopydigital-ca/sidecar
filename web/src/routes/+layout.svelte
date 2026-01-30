<script lang="ts">
  import "../app.css";
  import site from "$lib/content/site.json";
</script>

<svelte:head>
  <title>{site.storeTitle}</title>
  <meta name="description" content={site.tagline} />
</svelte:head>

<slot />
