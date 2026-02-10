<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import { seoData } from '$lib/config/seo';
</script>

<Seo
  title="Page Not Found | Sidecar"
  description="The page you are looking for does not exist."
  noindex={true}
/>

<div
  class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
>
  <div class="mb-8 relative">
    <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
    <h1 class="relative text-9xl font-bold text-white mb-2">404</h1>
  </div>

  <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">Page Not Found</h2>
  <p class="text-zinc-400 max-w-md mb-8">
    The page you are looking for seems to have gone on a side quest. Let's get
    you back to the main mission.
  </p>

  <a
    href="/"
    class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
  >
    Return Home
  </a>
</div>
