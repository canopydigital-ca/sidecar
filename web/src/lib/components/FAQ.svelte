<script lang="ts">
  export let faqs: Array<{
    question: string;
    answer: string;
  }> = [];
</script>

<section class="py-32 bg-zinc-900 border-t border-zinc-800">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
      <p class="text-xl text-zinc-400 max-w-2xl mx-auto">
        Everything you need to know about Sidecar and browser extension compatibility
      </p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      {#each faqs as faq}
        <div class="border-b border-zinc-800 pb-8 last:border-b-0 last:pb-0">
          <h3 class="text-xl font-semibold text-white mb-4">{faq.question}</h3>
          <p class="text-zinc-400 leading-relaxed">{faq.answer}</p>
        </div>
      {/each}
    </div>
  </div>
</section>