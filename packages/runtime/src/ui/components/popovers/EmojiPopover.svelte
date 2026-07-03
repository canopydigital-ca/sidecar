<script lang="ts">
  import { DEFAULT_EMOJIS } from '../../../core/constants';
  import { getHostAdapter } from '../../../core/host';
  import { insertAtCursor } from '../../../features/composer/insert';

  // Common Components
  import Input from '../common/Input.svelte';
  import Button from '../common/Button.svelte';

  let { onClose } = $props<{ onClose: () => void }>();
  let filter = $state('');

  let filteredEmojis = $derived(
    filter ? DEFAULT_EMOJIS.filter((e) => e.includes(filter)) : DEFAULT_EMOJIS
  );

  function insert(emoji: string) {
    const target = getHostAdapter().findComposerEditor();
    if (target) {
      insertAtCursor(target as HTMLElement, emoji);
    }
  }
</script>

<div class="flex justify-between items-center mb-2">
  <h4 class="m-0 text-sm font-semibold text-white">Emoji</h4>
  <Button
    onclick={onClose}
    size="sm"
    variant="ghost"
    ariaLabel="Close emoji picker">Close</Button
  >
</div>

<div class="mb-3">
  <Input
    placeholder="Filter (decorative)"
    bind:value={filter}
    ariaLabel="Filter emojis"
  />
</div>

<div class="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
  {#each filteredEmojis as emoji}
    <Button
      onclick={() => insert(emoji)}
      dataAction={`emoji-${emoji}`}
      dataEmoji={emoji}
      class="!px-2 !text-base"
    >
      {emoji}
    </Button>
  {/each}
</div>

<div class="mt-3 text-xs text-white/55">
  OS picker: Windows <b class="text-white">Win + .</b>, macOS
  <b class="text-white">Ctrl + Cmd + Space</b>.
</div>
