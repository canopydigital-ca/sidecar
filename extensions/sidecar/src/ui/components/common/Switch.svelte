<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
    id?: string;
  }

  let {
    checked = $bindable(),
    label,
    disabled = false,
    onchange,
    id,
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label
  class="inline-flex items-center cursor-pointer text-[13px] text-white/92 gap-2.5 select-none max-w-full {disabled
    ? 'opacity-50 cursor-not-allowed'
    : ''}"
>
  <input
    {id}
    type="checkbox"
    bind:checked
    {disabled}
    onchange={handleChange}
    class="w-4 h-4 m-0 flex-none accent-[#10a37f] focus-visible:outline-2 focus-visible:outline-[#10a37f] focus-visible:outline-offset-2 focus-visible:rounded"
  />
  <span class="leading-[1.2]">{label}</span>
</label>
