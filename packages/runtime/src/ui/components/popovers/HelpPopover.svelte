<script lang="ts">
  import Button from '../common/Button.svelte';

  let { onClose } = $props<{ onClose: () => void }>();
  function openSupport(e: MouseEvent) {
    e.preventDefault();
    const url = 'https://buymeacoffee.com/ryanspice';
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      'bmc_popup',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  }
</script>

<div class="flex justify-between items-center mb-3">
  <h4 class="m-0 text-sm font-semibold text-white">Help</h4>
  <Button onclick={onClose} size="sm" variant="ghost" ariaLabel="Close help"
    >Close</Button
  >
</div>

<div class="text-[13px] text-white/80 leading-relaxed flex flex-col gap-2">
  <div>
    <b class="text-white">Model picker</b>: moved into dock; any leftover header
    picker is hidden.
  </div>
  <div>
    <b class="text-white">Input resize</b>: drag the 3-dot handle above the
    composer.
  </div>
  <div>
    <b class="text-white">Input collapse</b>: the chevron button toggles
    collapsed vs last height.
  </div>
</div>

<div class="mt-4 pt-4 border-t border-white/10">
  <Button
    onclick={openSupport}
    class="w-full !bg-[#FFDD00] !text-black !border-[#FFDD00] !hover:bg-[#E6C700]"
  >
    <span class="text-base" aria-hidden="true">☕</span> Buy me a coffee
  </Button>
</div>
