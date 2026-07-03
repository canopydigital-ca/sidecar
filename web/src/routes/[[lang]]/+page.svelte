<script lang="ts">
  import { Menu, X, Github } from 'lucide-svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Stats from '$lib/components/Stats.svelte';
  import Features from '$lib/components/Features.svelte';
  import HowItWorks from '$lib/components/HowItWorks.svelte';
  import Macros from '$lib/components/Macros.svelte';
  import Roadmap from '$lib/components/Roadmap.svelte';
  // import Testimonials from '$lib/components/Testimonials.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import BrandMark from '$lib/components/BrandMark.svelte';
  import type { PageData } from './$types';
  import Seo from '$lib/components/Seo.svelte';
  import SecondaryFeatures from '$lib/components/SecondaryFeatures.svelte';
  import StoreButtons from '$lib/components/store-buttons/StoreButtons.svelte';
  import site from '$lib/content/site.json';

  let { data } = $props<{ data: PageData }>();

  let isMenuOpen = $state(false);
  const toggleMenu = () => (isMenuOpen = !isMenuOpen);
  const closeMenu = () => (isMenuOpen = false);

  const t = $derived(data.t);
</script>

<Seo
  title={t.seo.defaultTitle}
  description={t.seo.defaultDescription}
  type="website"
/>

<div
  class="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30"
>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800"
  >
    <div class="container mx-auto px-6 h-16 flex items-center justify-between">
      <a
        href={`/${data.lang}`}
        class="flex items-center gap-2 text-white font-bold text-xl"
      >
        <BrandMark size="sm" />
        {t.site.brand}
      </a>

      <div class="hidden md:flex items-center gap-8">
        <a
          href="#features"
          class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >{t.nav.features}</a
        >
        <a
          href="#macros"
          class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >{t.nav.macros}</a
        >
        <a
          href="#roadmap"
          class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >{t.nav.roadmap}</a
        >
        <!-- <a
          href="#testimonials"
          class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >{t.nav.testimonials}</a
        > -->

        {#if site.githubUrl}
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
          >
            <Github class="w-4 h-4" />
            {t.nav.github}
          </a>
        {:else}
          <span
            class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-bold border border-zinc-700"
          >
            <Github class="w-4 h-4" />
            Source pending
          </span>
        {/if}
      </div>

      <button
        type="button"
        class="md:hidden text-zinc-400 hover:text-white"
        onclick={toggleMenu}
        aria-label="Toggle menu"
      >
        {#if isMenuOpen}<X />{:else}<Menu />{/if}
      </button>
    </div>
  </nav>

  {#if isMenuOpen}
    <div class="fixed inset-0 z-40 bg-zinc-950 pt-20 px-6 md:hidden">
      <div class="flex flex-col gap-6 text-lg font-medium">
        <a
          href="#features"
          onclick={closeMenu}
          class="text-zinc-400 hover:text-white">{t.nav.features}</a
        >
        <a
          href="#macros"
          onclick={closeMenu}
          class="text-zinc-400 hover:text-white">{t.nav.macros}</a
        >
        <a
          href="#roadmap"
          onclick={closeMenu}
          class="text-zinc-400 hover:text-white">{t.nav.roadmap}</a
        >
        <!-- <a
          href="#testimonials"
          onclick={closeMenu}
          class="text-zinc-400 hover:text-white">{t.nav.testimonials}</a
        > -->
        {#if site.githubUrl}
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-center inline-flex items-center justify-center gap-2"
          >
            <Github class="w-5 h-5" />
            {t.nav.github}
          </a>
        {:else}
          <span
            class="w-full py-4 bg-zinc-800 text-zinc-500 rounded-xl font-bold text-center inline-flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Github class="w-5 h-5" />
            Source pending
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <main>
    <Hero t={t.site} />

    <div class="container mx-auto px-6 -mt-20 relative z-20 mb-32">
      <div
        class="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-emerald-900/20 bg-zinc-900 aspect-video relative group"
      >
        <div class="absolute inset-0 bg-zinc-900">
          <img
            src="/Screenshot 2026-02-07 060040.png"
            alt="Sidecar interface preview"
            loading="lazy"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none"
        ></div>
      </div>
    </div>
    <Stats t={t.stats} />
    <SecondaryFeatures t={t.secondaryFeatures} />
    <Features features={t.features} />
    <HowItWorks />
    <Macros />
    <Roadmap />
    <!-- <Testimonials testimonials={t.testimonials} /> -->

    <section
      class="py-32 bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-zinc-900"
    >
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-8">
          Ready to upgrade your workflow?
        </h2>
        <p class="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Build it in public, ship it fast, and let your users bully it into
          greatness.
        </p>

        <div class="mb-10">
          <StoreButtons />
        </div>

        {#if site.githubUrl}
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-zinc-950 rounded-full text-lg font-bold hover:bg-emerald-400 hover:text-zinc-950 transition-all shadow-xl shadow-white/5"
          >
            <Github class="w-5 h-5" /> View GitHub / Source
          </a>
        {:else}
          <span
            class="inline-flex items-center justify-center gap-2 px-10 py-5 bg-zinc-800 text-zinc-500 rounded-full text-lg font-bold border border-zinc-700"
          >
            <Github class="w-5 h-5" /> Source pending
          </span>
        {/if}

        <p class="mt-6 text-zinc-600 text-sm">
          Available on all major browsers
        </p>
      </div>
    </section>

    <FAQ faqs={t.faqs} />
  </main>

  <Footer />
</div>
