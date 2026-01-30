<script lang="ts">
  import { Menu, X, Github } from "lucide-svelte";
  import Hero from "$lib/components/Hero.svelte";
  import Stats from "$lib/components/Stats.svelte";
  import Features from "$lib/components/Features.svelte";
  import HowItWorks from "$lib/components/HowItWorks.svelte";
  import Macros from "$lib/components/Macros.svelte";
  import Roadmap from "$lib/components/Roadmap.svelte";
  import Testimonials from "$lib/components/Testimonials.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import BrandMark from "$lib/components/BrandMark.svelte";
  import site from "$lib/content/site.json";

  let isMenuOpen = $state(false);
  const toggleMenu = () => (isMenuOpen = !isMenuOpen);
  const closeMenu = () => (isMenuOpen = false);
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
  <nav class="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
    <div class="container mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-white font-bold text-xl">
        <BrandMark size="sm" /> {site.brand}
      </a>

      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
        <a href="#macros" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Macros</a>
        <a href="#roadmap" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Roadmap</a>
        <a href="#testimonials" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Testimonials</a>

        <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
          <Github class="w-4 h-4" /> GitHub / Source
        </a>
      </div>

      <button type="button" class="md:hidden text-zinc-400 hover:text-white" on:click={toggleMenu} aria-label="Toggle menu">
        {#if isMenuOpen}<X />{:else}<Menu />{/if}
      </button>
    </div>
  </nav>

  {#if isMenuOpen}
    <div class="fixed inset-0 z-40 bg-zinc-950 pt-20 px-6 md:hidden">
      <div class="flex flex-col gap-6 text-lg font-medium">
        <a href="#features" on:click={closeMenu} class="text-zinc-400 hover:text-white">Features</a>
        <a href="#macros" on:click={closeMenu} class="text-zinc-400 hover:text-white">Macros</a>
        <a href="#roadmap" on:click={closeMenu} class="text-zinc-400 hover:text-white">Roadmap</a>
        <a href="#testimonials" on:click={closeMenu} class="text-zinc-400 hover:text-white">Testimonials</a>
        <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" class="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-center inline-flex items-center justify-center gap-2">
          <Github class="w-5 h-5" /> GitHub / Source
        </a>
      </div>
    </div>
  {/if}

  <main>
    <Hero />

    <div class="container mx-auto px-6 -mt-20 relative z-20 mb-32">
      <div class="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-emerald-900/20 bg-zinc-900 aspect-video relative group">
        <div class="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <img src="/hero-interface.svg" alt="Sidecar interface preview" class="w-full h-full object-cover" loading="lazy" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none" />
      </div>

      <div class="mt-4 text-center text-zinc-600 text-sm">
        Placeholder image. Replace <code class="text-zinc-400">/static/hero-interface.svg</code> with a 16:9 screenshot (recommended: <span class="text-zinc-400 font-semibold">1920×1080</span>).
      </div>
    </div>

    <Stats />
    <Features />
    <HowItWorks />
    <Macros />
    <Roadmap />
    <Testimonials />

    <section class="py-32 bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-zinc-900">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-8">Ready to upgrade your workflow?</h2>
        <p class="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">Build it in public, ship it fast, and let your users bully it into greatness.</p>

        <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-zinc-950 rounded-full text-lg font-bold hover:bg-emerald-400 hover:text-zinc-950 transition-all shadow-xl shadow-white/5">
          <Github class="w-5 h-5" /> View GitHub / Source
        </a>

        <p class="mt-6 text-zinc-600 text-sm">Store listings coming soon.</p>
      </div>
    </section>
  </main>

  <Footer />
</div>
