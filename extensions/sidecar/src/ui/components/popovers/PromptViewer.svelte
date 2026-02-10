<script lang="ts">
  import { tick } from 'svelte';
  import Button from '../common/Button.svelte';

  type Props = {
    open: boolean;
    title?: string;
    meta?: string;
    text: string;
    tokens?: number;
    busy?: boolean;
    onClose: () => void;
    onInsert: (text: string) => void;
    onCopy: (text: string) => void;
    onCopyAndClose: (text: string) => void;
    onInsertAndClose: (text: string) => void;
  };

  let {
    open = false,
    title = '',
    meta = '',
    text,
    tokens = 0,
    busy = false,
    onClose,
    onInsert,
    onCopy,
    onCopyAndClose,
    onInsertAndClose,
  }: Props = $props();

  // ESC closes viewer
  $effect(() => {
    if (!open || busy) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Prevent background scroll when viewer is open
  $effect(() => {
    if (!open) return;

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  });

  async function handleContentClick() {
    if (busy) return;
    await onCopyAndClose(text);
  }

  async function handleCopy() {
    if (busy) return;
    await onCopy(text);
  }

  async function handleInsert() {
    if (busy) return;
    await onInsertAndClose(text);
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center p-3"
    role="dialog"
    aria-modal="true"
    aria-label="Prompt viewer"
    tabindex="-1"
    onclick={onClose}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    }}
  >
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- flex-col so header is always present; only content scrolls -->
    <div
      class="relative w-full max-w-[740px] max-h-[85vh] rounded-2xl border border-white/10
             bg-[#111] shadow-xl overflow-hidden flex flex-col"
      role="presentation"
      onclick={(e) => e.stopPropagation()}
      onmouseleave={onClose}
      onblur={(e) => {
        // Close when focus leaves the modal (but not when moving to child elements)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onClose();
        }
      }}
      tabindex="-1"
    >
      <!-- Header: sticky and always visible -->
      <div
        class="shrink-0 p-4 border-b border-white/10 sticky top-0 bg-[#111] z-10"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-white/92 truncate">
              {title || 'Prompt'}
            </div>
            <div class="text-[11px] text-white/55">
              {meta}
              <span class="text-white/35"> • click content to copy</span>
            </div>
          </div>

          <div class="flex gap-2 shrink-0">
            <Button
              size="sm"
              onclick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              dataAction="viewer-copy"
              disabled={busy}
            >
              {busy ? '...' : 'Copy'}
            </Button>

            <Button
              size="sm"
              onclick={(e) => {
                e.stopPropagation();
                handleInsert();
              }}
              dataAction="viewer-insert"
              disabled={busy}
            >
              {busy ? '...' : 'Insert'}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onclick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              dataAction="viewer-close"
              disabled={busy}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      <!-- Content: scrolls, padded top, clicking copies + dismisses popover -->
      <div
        class="flex-1 overflow-auto p-4 pt-5 cursor-copy select-text"
        role="button"
        tabindex="0"
        aria-label="Click to copy prompt and close"
        title="Click to copy and close"
        onclick={(e) => {
          e.stopPropagation();
          handleContentClick();
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleContentClick();
          }
        }}
      >
        <pre
          class="m-0 whitespace-pre-wrap break-words text-white/86 text-xs leading-[1.35]">
{text}
        </pre>
      </div>
    </div>
  </div>
{/if}
