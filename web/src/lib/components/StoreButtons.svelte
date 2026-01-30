<script lang="ts">
  import { Chrome, Globe, BadgeCheck } from "lucide-svelte";
  export let variant: "hero" | "cta" = "hero";
  const base = "inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800/60 transition";
  const compact = variant === "hero" ? "" : "px-5 py-3 text-base rounded-full";
</script>

<div class="flex flex-col sm:flex-row items-center justify-center gap-3">
  <a href="#" class={`${base} ${compact}`} aria-label="Chrome Web Store (placeholder)"><Chrome class="w-4 h-4" />Chrome Web Store</a>
  <a href="#" class={`${base} ${compact}`} aria-label="Microsoft Edge Add-ons (placeholder)"><BadgeCheck class="w-4 h-4" />Edge Add-ons</a>
  <a href="#" class={`${base} ${compact}`} aria-label="Firefox Add-ons (placeholder)"><Globe class="w-4 h-4" />Firefox Add-ons</a>
</div>
