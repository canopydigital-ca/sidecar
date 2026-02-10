<script lang="ts">
  import { inview } from "$lib/actions/inview";
  import "$lib/styles/reveal.css";
  import { Star } from "lucide-svelte";
  import type { Translation } from "$lib/i18n/types";

  let { testimonials } = $props<{ testimonials: Translation['testimonials'] }>();
  
  // Hardcode ratings for now since they aren't in translation
  // Or add them to translation type. For now assuming 5, 5, 4 order
  const ratings = [5, 5, 4];

  function initials(name: string) {
    const parts = name.split(" ").filter(Boolean);
    const a = parts[0]?.[0] ?? "S";
    const b = parts[1]?.[0] ?? "C";
    return (a + b).toUpperCase();
  }
</script>

<section id="testimonials" class="py-32 border-t border-zinc-900">
  <div class="container mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Testimonials</h2>
      <p class="text-zinc-400 text-lg">Placeholder quotes until your users do the review thing.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each testimonials as t, i}
        {@const rating = ratings[i] || 5}
        <div use:inview class="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 reveal" style={`transition-delay:${i * 120}ms`}>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400 font-bold">{initials(t.name)}</div>
            <div>
              <div class="text-white font-semibold">{t.name}</div>
              <div class="text-zinc-500 text-sm">{t.role}</div>
            </div>
          </div>

          <div class="flex items-center gap-1 text-emerald-400 mb-4" aria-label={`Rating ${rating} out of 5`}>
            {#each Array(rating) as _}
              <Star class="w-4 h-4 fill-current" />
            {/each}
            {#each Array(5 - rating) as _}
              <Star class="w-4 h-4 text-zinc-700" />
            {/each}
          </div>

          <p class="text-zinc-300 leading-relaxed">“{t.quote}”</p>
        </div>
      {/each}
    </div>
  </div>
</section>
