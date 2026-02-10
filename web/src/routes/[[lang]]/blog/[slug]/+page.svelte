<script lang="ts">
  import { page } from '$app/stores';
  import { error } from '@sveltejs/kit';
  import Seo from '$lib/components/Seo.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import posts from '$lib/content/blog.json';

  const slug = $page.params.slug;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    error(404, 'Post not found');
  }
</script>

<Seo
  title={post.title}
  description={post.excerpt}
  type="article"
  publishedTime={post.date}
  keywords={post.keywords}
/>

<div class="container mx-auto px-6 py-12 max-w-4xl">
  <Breadcrumbs />

  <article class="mt-8">
    <header class="mb-10">
      <div class="text-emerald-400 font-medium mb-4">
        {new Date(post.date).toLocaleDateString()}
      </div>
      <h1 class="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
        {post.title}
      </h1>
    </header>

    <div class="prose prose-invert prose-lg max-w-none text-zinc-300">
      {@html post.content}
    </div>
  </article>
</div>
