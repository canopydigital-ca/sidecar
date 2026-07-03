<script lang="ts">
  interface Props {
    value: number;
    min: number;
    max: number;
    step?: number;
    label?: string;
    disabled?: boolean;
    onchange?: (value: number) => void;
    showValue?: boolean;
    valueSuffix?: string;
    width?: string;
    id?: string;
  }

  let {
    value = $bindable(),
    min,
    max,
    step = 1,
    label,
    disabled = false,
    onchange,
    showValue = true,
    valueSuffix = '',
    width,
    id = `slider-${Math.random().toString(36).slice(2)}`,
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    value = parseFloat(target.value);
    onchange?.(value);
  }
</script>

<div class="flex items-center gap-2 text-xs text-white/80">
  {#if label}
    <label for={id} class="whitespace-nowrap">{label}</label>
  {/if}

  <input
    {id}
    type="range"
    {min}
    {max}
    {step}
    bind:value
    {disabled}
    oninput={handleInput}
    class="flex-1 h-1 rounded-sm bg-white/20 outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/10 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100
      [&::-webkit-slider-thumb]:hover:scale-110
      focus-visible:[&::-webkit-slider-thumb]:outline-2 focus-visible:[&::-webkit-slider-thumb]:outline-[#10a37f] focus-visible:[&::-webkit-slider-thumb]:outline-offset-2"
    style:width
  />

  {#if showValue}
    <span class="min-w-[30px] text-right tabular-nums"
      >{value}{valueSuffix}</span
    >
  {/if}
</div>
