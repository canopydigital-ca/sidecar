<script lang="ts">
  import '../../app.css';
  import Seo from '$lib/components/Seo.svelte';
  import { seoData } from '$lib/config/seo';

  let { children } = $props();
</script>

<Seo
  title={seoData.routes.home.title}
  description={seoData.routes.home.description}
  keywords={seoData.routes.home.keywords}
/>

{@render children()}
