<script lang="ts">
  import { seoData as globalSeoData } from '$lib/config/seo';
  import { locales, defaultLocale } from '$lib/i18n/config';
  import { page } from '$app/stores';

  interface Props {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    noindex?: boolean;
    publishedTime?: string;
    modifiedTime?: string;
    twitterHandle?: string;
    jsonLd?: Record<string, unknown>;
  }

  let {
    title: providedTitle,
    description: providedDescription,
    keywords: providedKeywords,
    image: providedImage,
    url: providedUrl,
    type = 'website',
    noindex = false,
    publishedTime,
    modifiedTime,
    twitterHandle: providedTwitterHandle,
    jsonLd: providedJsonLd,
  } = $props<Props>();

  // Derived values
  const _title = $derived(providedTitle || globalSeoData.defaultTitle);
  const _description = $derived(
    providedDescription || globalSeoData.defaultDescription
  );
  const _siteName = globalSeoData.siteName;
  const _url = $derived(providedUrl || globalSeoData.baseUrl);
  const _image = $derived(providedImage || globalSeoData.defaultImage);

  const _keywords = $derived.by(() => {
    const specific = providedKeywords || [];
    const defaults = globalSeoData.defaultKeywords || [];
    return [...new Set([...specific, ...defaults])].join(', ');
  });

  const _robots = $derived(noindex ? 'noindex, nofollow' : 'index, follow');
  const _twitterHandle = $derived(
    providedTwitterHandle || globalSeoData.twitterHandle
  );

  // Helper for absolute URLs
  const toAbsoluteUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${globalSeoData.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  };

  const absoluteImage = $derived(toAbsoluteUrl(_image));
  const absoluteUrl = $derived(toAbsoluteUrl(_url));

  // Hreflang Generation
  // Assumes current path structure matches [[lang]]/...
  const hreflangs = $derived.by(() => {
    const currentPath = $page.url.pathname;
    // Strip existing lang prefix if present
    let purePath = currentPath;
    for (const code of Object.keys(locales)) {
      if (currentPath.startsWith(`/${code}/`) || currentPath === `/${code}`) {
        purePath = currentPath.replace(`/${code}`, '');
        break;
      }
    }
    if (purePath === '') purePath = '/';

    return Object.keys(locales).map((code) => {
      const href =
        code === defaultLocale
          ? `${globalSeoData.baseUrl}${purePath}`
          : `${globalSeoData.baseUrl}/${code}${purePath === '/' ? '' : purePath}`;
      return {
        rel: 'alternate',
        hreflang: code,
        href,
      };
    });
  });

  // SoftwareApplication Schema
  const applicationSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: globalSeoData.product.name,
    operatingSystem: globalSeoData.product.operatingSystem,
    applicationCategory: globalSeoData.product.applicationCategory,
    offers: {
      '@type': 'Offer',
      price: globalSeoData.product.offers.price,
      priceCurrency: globalSeoData.product.offers.priceCurrency,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: globalSeoData.product.rating.ratingValue,
      ratingCount: globalSeoData.product.rating.ratingCount,
    },
    image: absoluteImage,
    description: _description,
  });

  // WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: _siteName,
    url: globalSeoData.baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${globalSeoData.baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // Combine Schemas
  const jsonLdScript = $derived.by(() => {
    const schemas = [websiteSchema, applicationSchema];
    if (providedJsonLd) schemas.push(providedJsonLd);
    return JSON.stringify(schemas);
  });
</script>

<svelte:head>
  <!-- Basic Meta -->
  <title>{_title}</title>
  <meta name="description" content={_description} />
  <meta name="keywords" content={_keywords} />
  <meta name="robots" content={_robots} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8" />
  <link rel="canonical" href={absoluteUrl} />

  <!-- Hreflang Tags -->
  {#each hreflangs as link}
    <link rel={link.rel} hreflang={link.hreflang} href={link.href} />
  {/each}

  <!-- Open Graph -->
  <meta property="og:site_name" content={_siteName} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={_title} />
  <meta property="og:description" content={_description} />
  <meta property="og:url" content={absoluteUrl} />
  <meta property="og:image" content={absoluteImage} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={_twitterHandle} />
  <meta name="twitter:title" content={_title} />
  <meta name="twitter:description" content={_description} />
  <meta name="twitter:image" content={absoluteImage} />

  <!-- Structured Data -->
  <script type="application/ld+json">
    {@html jsonLdScript}
  </script>
</svelte:head>
