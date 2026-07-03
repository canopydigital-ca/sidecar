<script lang="ts">
  import DownloadBuilder from '$lib/downloads/DownloadBuilder.svelte';
  import type { Translation } from '$lib/i18n/types';

  let { data } = $props<{ data: { t: Translation['secondaryFeatures'] } }>();
</script>

<div class="container mx-auto px-6 py-16">
  <a class="text-zinc-400 hover:text-white" href="/downloads"
    >← Back to downloads</a
  >
  <div class="mt-6">
    <DownloadBuilder t={data.t} />
  </div>
</div>
