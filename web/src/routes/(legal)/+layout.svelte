<script lang="ts">
  import type { Snippet } from "svelte";
  import BrandMark from "$lib/components/BrandMark.svelte";
  import site from "$lib/content/site.json";

  let { children }: { children?: Snippet } = $props();
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
  <header class="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
    <div class="container mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 font-bold text-white">
        <BrandMark size="sm" /> {site.brand}
      </a>
      <nav class="flex items-center gap-6 text-sm text-zinc-400">
        <a href="/privacy" class="hover:text-white">Privacy</a>
        <a href="/terms" class="hover:text-white">Terms</a>
        <a href="/license" class="hover:text-white">License</a>
      </nav>
    </div>
  </header>

  <main class="container mx-auto px-6 py-16 max-w-3xl">
    {@render children?.()}
  </main>

  <footer class="border-t border-zinc-900 py-10 text-center text-zinc-600 text-sm">
    © 2026 {site.brand}. {site.legalDisclaimer}
  </footer>
</div>
