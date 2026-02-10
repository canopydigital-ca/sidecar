<script lang="ts">
  import { toastState } from '../toast.svelte';

  // We rely on toastState to handle timing or we can observe it here.
  // Actually, let's just bind to it.
  // toastState manages the message and clearing it.
  
  let msg = $derived(toastState.msg);
  let visible = $derived(!!msg);
</script>

{#if msg}
  <div
    role="status"
    aria-live="polite"
    class="fixed bottom-[80px] left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-[13px] bg-black/80 backdrop-blur-[2px] border border-white/10 shadow-lg transition-opacity duration-300"
    style:opacity={visible ? 1 : 0}
  >
    {msg}
  </div>
{/if}

<style>
  :global(.cgpt-toast-host) {
    pointer-events: none;
  }
</style>
