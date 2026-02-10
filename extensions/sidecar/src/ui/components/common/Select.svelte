<script lang="ts">
  interface Option {
    value: string | number;
    label: string;
  }

  interface Props {
    value: string | number;
    options: Option[];
    label?: string;
    disabled?: boolean;
    onchange?: (value: string) => void;
    size?: 'sm' | 'md';
    width?: string;
    id?: string;
  }

  let {
    value = $bindable(),
    options,
    label,
    disabled = false,
    onchange,
    size = 'sm',
    width,
    id = `select-${Math.random().toString(36).slice(2)}`,
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLSelectElement;
    value = target.value;
    onchange?.(target.value);
  }

  const base =
    'w-full bg-white/10 border border-white/20 rounded-md text-[#ececec] outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:border-[#10a37f] focus-visible:ring-1 focus-visible:ring-[#10a37f]';
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px] h-6',
    md: 'px-2.5 py-2 text-[13px] h-9',
  } satisfies Record<NonNullable<Props['size']>, string>;
</script>

<div class="flex items-center gap-2" style:width>
  {#if label}
    <label for={id} class="text-xs text-white/80 whitespace-nowrap"
      >{label}</label
    >
  {/if}
  <div class="relative flex-1 min-w-0">
    <select
      {id}
      bind:value
      {disabled}
      onchange={handleChange}
      class="{base} {sizes[size]}"
    >
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
</div>
