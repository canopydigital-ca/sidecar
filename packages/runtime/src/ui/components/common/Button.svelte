<script lang="ts">
  interface Props {
    onclick?: (e: MouseEvent) => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
    children?: import('svelte').Snippet;
    class?: string;
    ariaLabel?: string;
    pressed?: boolean;
    type?: 'button' | 'submit' | 'reset';
    dataAction?: string;
    dataEmoji?: string;
  }

  let {
    onclick,
    disabled = false,
    variant = 'secondary',
    size = 'md',
    children,
    class: className = '',
    ariaLabel,
    pressed = false,
    type = 'button',
    dataAction,
    dataEmoji,
  }: Props = $props();

  const base =
    'appearance-none border transition-all duration-200 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 select-none rounded-[10px] leading-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#10a37f] border-[#10a37f] text-white hover:not-disabled:bg-[#1a7f64]',
    secondary:
      'bg-white/8 border-white/14 text-white hover:not-disabled:bg-white/12 aria-pressed:bg-white/18 aria-pressed:border-white/24',
    danger:
      'bg-red-600/20 border-red-600/40 text-red-300 hover:not-disabled:bg-red-600/30',
    ghost:
      'bg-transparent border-transparent text-white hover:not-disabled:bg-white/5',
  } satisfies Record<NonNullable<Props['variant']>, string>;

  const sizes = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-2.5 py-1.5 text-xs',
  } satisfies Record<NonNullable<Props['size']>, string>;
</script>

<button
  {type}
  class="{base} {variants[variant]} {sizes[size]} {className}"
  {disabled}
  {onclick}
  aria-label={ariaLabel}
  aria-pressed={pressed}
  data-action={dataAction}
  data-emoji={dataEmoji}
>
  {@render children?.()}
</button>
