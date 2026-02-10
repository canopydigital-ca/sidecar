<script lang="ts">
  import { page } from '$app/stores';
  import { seoData } from '$lib/config/seo';
  import { ChevronRight, Home } from 'lucide-svelte';

  let items = $derived.by(() => {
    const path = $page.url.pathname;
    const segments = path.split('/').filter(Boolean);

    const breadcrumbs = segments.map((segment, index) => {
      const url = `/${segments.slice(0, index + 1).join('/')}`;
      // Basic capitalization, can be enhanced with a map
      const name =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      return {
        name,
        url: `${seoData.baseUrl}${url}`,
        active: index === segments.length - 1,
      };
    });

    return [
      { name: 'Home', url: seoData.baseUrl, active: path === '/' },
      ...breadcrumbs,
    ];
  });

  const schema = $derived({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
</script>

<svelte:head>
  <script type="application/ld+json">
    {@html JSON.stringify(schema)}
  </script>
</svelte:head>

<nav aria-label="Breadcrumb" class="py-4 text-sm text-zinc-400">
  <ol class="flex items-center gap-2">
    {#each items as item, i}
      <li class="flex items-center gap-2">
        {#if i > 0}
          <ChevronRight class="w-4 h-4 text-zinc-600" />
        {/if}

        {#if item.active}
          <span class="text-emerald-400 font-medium" aria-current="page">
            {item.name}
          </span>
        {:else}
          <a
            href={item.url.replace(seoData.baseUrl, '') || '/'}
            class="hover:text-white transition-colors flex items-center gap-1"
          >
            {#if i === 0}
              <Home class="w-4 h-4" />
            {/if}
            {item.name}
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
