<script lang="ts">
  let { children, class: className = '' } = $props<{
    children?: import('svelte').Snippet;
    class?: string;
  }>();
</script>

<div
  class="relative rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl shadow-black/50 {className}"
>
  <!-- Browser Chrome -->
  <div
    class="flex items-center gap-4 px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/50 backdrop-blur-sm"
  >
    <!-- Window Controls -->
    <div class="flex items-center gap-1.5">
      <div class="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
      <div class="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
      <div class="w-3 h-3 rounded-full bg-[#28C840]"></div>
    </div>

    <!-- Address Bar -->
    <div
      class="flex-1 max-w-xl mx-auto bg-zinc-900/50 rounded-md border border-zinc-700/30 px-3 py-1 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono"
    >
      <div class="w-3 h-3 rounded-full bg-zinc-700/50"></div>
      <span>chatgpt.com</span>
    </div>

    <!-- Right side spacer to balance -->
    <div class="w-14"></div>
  </div>

  <!-- Content -->
  <div class="relative w-full h-full bg-zinc-950 rounded-b-xl overflow-hidden">
    {@render children?.()}
  </div>
</div>
