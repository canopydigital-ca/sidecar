<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';

  type Props = {
    value?: string;
    onSend?: () => void;
    isFocused?: boolean;
    isHovered?: boolean;
    height?: number;
  };

  let {
    value = $bindable(''),
    onSend = () => {},
    isFocused = $bindable(false),
    isHovered = $bindable(false),
    height = $bindable(44),
  }: Props = $props();

  let textarea: HTMLTextAreaElement;
  let composerContainer: HTMLElement;

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    // Auto-resize only if height is at min (collapsed) or logic allows
    // But since we have a manual resize handle, usually manual overrides auto
    // For this demo, let's say if height is manually set > min, we respect it.
    // Or we just update the bound height based on content if not dragging.
    if (height <= 44) {
      // Simple auto-expand for small texts if needed, but for now fixed height mode
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }
</script>

<div
  class="group/composer w-full max-w-3xl mx-auto"
  data-expanded={value.length > 0}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  role="form"
>
  <div
    class="relative bg-white dark:bg-[#303030] rounded-[26px] p-2.5 shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-black/5 dark:border-white/5 grid grid-cols-[auto_1fr_auto] gap-2 items-start transition-all duration-200 ease-in-out"
  >
    <!-- Leading Actions -->
    <div class="flex items-center justify-center h-[44px] w-[32px] mb-0.5">
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Add files"
      >
        <Icon name="Plus" class="w-5 h-5" />
      </button>
    </div>

    <!-- Primary Input Area -->
    <div
      class="flex flex-col py-2.5"
      style="height: {height}px; min-height: 44px;"
    >
      <textarea
        bind:this={textarea}
        bind:value
        oninput={handleInput}
        onkeydown={handleKeydown}
        onfocus={() => (isFocused = true)}
        onblur={() => (isFocused = false)}
        placeholder="Ask anything"
        rows="1"
        class="w-full h-full resize-none border-0 bg-transparent p-0 text-base text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:ring-0 overflow-y-auto"
      ></textarea>
    </div>

    <!-- Trailing Actions -->
    <div class="flex items-center gap-2 h-[44px] mb-0.5 self-end">
      <!-- Dictate -->
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dictate"
      >
        <Icon name="Mic" class="w-5 h-5" />
      </button>

      <!-- Send Button -->
      <button
        type="button"
        onclick={() => onSend()}
        disabled={!value}
        class="flex items-center justify-center w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        aria-label="Send"
      >
        <Icon name="ArrowUp" class="w-5 h-5" />
      </button>
    </div>

    <!-- Footer Area (e.g. pills) - Only show if needed or just placeholder structure -->
    <!-- This matches the grid-template-areas in the reference HTML somewhat -->
  </div>

  <!-- Footer Info / disclaimer -->
  <div class="text-center text-xs text-gray-400 mt-2">Sidecar Demo 2.</div>
</div>

<style>
  /* Scrollbar hiding for cleaner look */
  textarea::-webkit-scrollbar {
    display: none;
  }
  textarea {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
