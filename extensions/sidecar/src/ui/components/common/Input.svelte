<script lang="ts">
  interface Props {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    oninput?: (value: string) => void;
    onchange?: (value: string) => void;
    type?: 'text' | 'search' | 'number' | 'password';
    class?: string;
    ariaLabel?: string;
  }

  let {
    value = $bindable(),
    placeholder = '',
    disabled = false,
    oninput,
    onchange,
    type = 'text',
    class: className = '',
    ariaLabel,
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    value = target.value;
    oninput?.(target.value);
  }

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    value = target.value;
    onchange?.(target.value);
  }
</script>

<input
  {type}
  {placeholder}
  bind:value
  {disabled}
  oninput={handleInput}
  onchange={handleChange}
  aria-label={ariaLabel}
  class="w-full bg-[#2a2a2a] border border-[#444] rounded-md px-2.5 py-2 text-[#ececec] text-[13px] leading-[1.4] outline-none transition-all duration-200 shadow-none appearance-none placeholder-[#a1a1a1] focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] disabled:opacity-50 disabled:cursor-not-allowed {className}"
/>
