<script lang="ts">
  import { Github, Twitter } from "lucide-svelte";
  import BrandMark from "$lib/components/BrandMark.svelte";
  import site from "$lib/content/site.json";
</script>

<footer class="bg-zinc-950 border-t border-zinc-900 pt-20 pb-10">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div class="col-span-1 md:col-span-2">
        <div class="flex items-center gap-2 text-white font-bold text-2xl mb-6">
          <BrandMark size="sm" />
          {site.brand}
        </div>

        <p class="text-zinc-400 max-w-sm mb-8">{site.tagline}</p>

        <div class="flex gap-4">
          <a href="#" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all" aria-label="Twitter">
            <Twitter class="w-5 h-5" />
          </a>
          <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all" aria-label="GitHub">
            <Github class="w-5 h-5" />
          </a>
        </div>
      </div>

      <div>
        <h4 class="text-white font-semibold mb-6">Product</h4>
        <ul class="space-y-4 text-zinc-400">
          <li><a href="/#features" class="hover:text-emerald-400 transition-colors">Features</a></li>
          <li><a href="/#macros" class="hover:text-emerald-400 transition-colors">Macros</a></li>
          <li><a href="/#roadmap" class="hover:text-emerald-400 transition-colors">Roadmap</a></li>
          <li>
            <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <Github class="w-4 h-4" />
              Source
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-white font-semibold mb-6">Legal</h4>
        <ul class="space-y-4 text-zinc-400">
          <li><a href="/privacy" class="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
          <li><a href="/license" class="hover:text-emerald-400 transition-colors">License</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-zinc-500 text-sm">© 2026 Sidecar. All rights reserved. {site.legalDisclaimer}</p>
      <div class="flex items-center gap-2 text-zinc-600 text-sm">
        <span class="w-2 h-2 rounded-full bg-emerald-500" />
        All systems operational
      </div>
    </div>
  </div>
</footer>
