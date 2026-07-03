<script lang="ts">
  interface Props {
    title?: string;
    children: import('svelte').Snippet;
    borderTop?: boolean;
    collapsible?: boolean; // Future proofing
    class?: string;
  }

  let {
    title,
    children,
    borderTop = false,
    class: className = '',
  }: Props = $props();
</script>

<div
  class="mt-3 pt-3 {borderTop ? 'border-t border-white/10' : ''} {className}"
>
  {#if title}
    <h5
      class="m-0 mb-2 text-xs font-semibold text-white/90 uppercase tracking-[0.5px]"
    >
      {title}
    </h5>
  {/if}
  <div class="flex flex-col gap-2">
    {@render children()}
  </div>
</div>
