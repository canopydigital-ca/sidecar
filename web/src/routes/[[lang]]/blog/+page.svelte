<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import posts from '$lib/content/blog.json';
  import { seoData } from '$lib/config/seo';

  // Sort by date desc
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
</script>

<Seo
  title="Sidecar Blog | ChatGPT Tips & Updates"
  description="Latest news, tutorials, and productivity tips for ChatGPT power users."
  keywords={['blog', 'ChatGPT tutorials', 'updates']}
/>

<div class="container mx-auto px-6 py-12">
  <Breadcrumbs />

  <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 mt-8">
    Sidecar Blog
  </h1>
  <p class="text-zinc-400 text-lg mb-12 max-w-2xl">
    Tips, tricks, and release notes to help you get the most out of your AI
    workflow.
  </p>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each sortedPosts as post}
      <a
        href={`/blog/${post.slug}`}
        class="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors"
      >
        <div class="aspect-video bg-zinc-800 relative">
          <!-- Placeholder for blog image -->
          <div
            class="absolute inset-0 flex items-center justify-center text-zinc-600"
          >
            Image
          </div>
        </div>
        <div class="p-6">
          <div class="text-emerald-400 text-sm font-medium mb-2">
            {new Date(post.date).toLocaleDateString()}
          </div>
          <h2
            class="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors"
          >
            {post.title}
          </h2>
          <p class="text-zinc-400 text-sm line-clamp-2">{post.excerpt}</p>
        </div>
      </a>
    {/each}
  </div>
</div>
