<script lang="ts">
  type BackgroundShape =
    | 'square'
    | 'rounded'
    | 'circle'
    | 'hex'
    | 'diamond'
    | 'star';
  type BackgroundVariant = 'none' | 'solid' | 'gradient';
  type BorderStyle = 'none' | 'solid' | 'dashed';
  type BadgePosition =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  type LabelPosition = 'below' | 'inside';

  interface Props {
    svg?: string;
    size?: number;
    iconScale?: number;
    iconColor?: string;
    invert?: boolean;
    rotation?: number;
    flipX?: boolean;
    flipY?: boolean;
    scale?: number;
    backgroundShape?: BackgroundShape;
    backgroundVariant?: BackgroundVariant;
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    backgroundGradientAngle?: number;
    borderStyle?: BorderStyle;
    borderWidth?: number;
    borderColor?: string;
    glowColor?: string;
    glowOpacity?: number;
    glowOnHover?: boolean;
    badgeText?: string;
    badgeColor?: string;
    badgeTextColor?: string;
    badgePosition?: BadgePosition;
    label?: string;
    labelColor?: string;
    labelPosition?: LabelPosition;
    emptyLabel?: string;
    loading?: boolean;
    class?: string;
  }

  let {
    svg,
    size = 64,
    iconScale = 0.72,
    iconColor = '#ffffff',
    invert = false,
    rotation = 0,
    flipX = false,
    flipY = false,
    scale = 1,
    backgroundShape = 'rounded',
    backgroundVariant = 'solid',
    backgroundColor = '#0a0a0a',
    backgroundGradientFrom = '#111827',
    backgroundGradientTo = '#1f2937',
    backgroundGradientAngle = 140,
    borderStyle = 'solid',
    borderWidth = 1,
    borderColor = 'rgba(255,255,255,0.18)',
    glowColor,
    glowOpacity = 0.22,
    glowOnHover = false,
    badgeText,
    badgeColor = '#f59e0b',
    badgeTextColor = '#0a0a0a',
    badgePosition = 'top-right',
    label,
    labelColor = 'rgba(255,255,255,0.7)',
    labelPosition = 'below',
    emptyLabel = 'Empty',
    loading = false,
    class: className = '',
  }: Props = $props();

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const toSafeColor = (value: string | undefined, fallback: string) => {
    if (!value) return fallback;
    const v = value.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
    if (
      /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(\s*,\s*[\d.]+\s*)?\)$/.test(
        v
      )
    )
      return v;
    if (
      /^hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(\s*,\s*[\d.]+\s*)?\)$/.test(
        v
      )
    )
      return v;
    return fallback;
  };

  const sizePx = $derived(Math.max(32, Math.round(size)));
  const iconPx = $derived(
    Math.max(16, Math.round(sizePx * clamp(iconScale, 0.3, 0.95)))
  );

  const clipPath = $derived.by(() => {
    if (backgroundShape === 'hex')
      return 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)';
    if (backgroundShape === 'diamond')
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    if (backgroundShape === 'star')
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    return '';
  });

  const shapeClass = $derived.by(() => {
    if (backgroundShape === 'circle') return 'rounded-full';
    if (backgroundShape === 'rounded') return 'rounded-[14px]';
    return 'rounded-md';
  });

  const baseStyle = $derived.by(() => {
    const parts = [`width:${sizePx}px`, `height:${sizePx}px`];
    if (clipPath) parts.push(`clip-path:${clipPath}`);
    return parts.join(';');
  });

  const backgroundStyle = $derived.by(() => {
    if (backgroundVariant === 'none') return '';
    if (backgroundVariant === 'gradient') {
      return `background:linear-gradient(${backgroundGradientAngle}deg, ${toSafeColor(
        backgroundGradientFrom,
        '#111827'
      )} 0%, ${toSafeColor(backgroundGradientTo, '#1f2937')} 100%);`;
    }
    return `background:${toSafeColor(backgroundColor, '#0a0a0a')};`;
  });

  const borderStyleValue = $derived.by(() => {
    if (borderStyle === 'none' || borderWidth <= 0) return 'none';
    return `${Math.max(1, Math.round(borderWidth))}px ${borderStyle} ${toSafeColor(
      borderColor,
      'rgba(255,255,255,0.18)'
    )}`;
  });

  const iconStyle = $derived.by(() => {
    const transforms = [];
    if (rotation) transforms.push(`rotate(${rotation}deg)`);
    if (flipX) transforms.push('scaleX(-1)');
    if (flipY) transforms.push('scaleY(-1)');
    if (scale && scale !== 1) transforms.push(`scale(${scale})`);
    const parts = [
      `width:${iconPx}px`,
      `height:${iconPx}px`,
      `color:${toSafeColor(iconColor, '#ffffff')}`,
      `transform:${transforms.length ? transforms.join(' ') : 'none'}`,
    ];
    if (invert) parts.push('filter:invert(1)');
    return parts.join(';');
  });

  const badgePositionClass = $derived.by(() => {
    if (badgePosition === 'top-left') return 'top-1 left-1';
    if (badgePosition === 'bottom-left') return 'bottom-1 left-1';
    if (badgePosition === 'bottom-right') return 'bottom-1 right-1';
    return 'top-1 right-1';
  });

  const showLabelBelow = $derived(label && labelPosition === 'below');
  const showLabelInside = $derived(label && labelPosition === 'inside');
  const showBadge = $derived(!!badgeText);
  const showGlow = $derived(!!glowColor);
  const rootClass = $derived(
    `flex flex-col items-center ${showLabelBelow ? 'gap-1' : ''} ${className}`.trim()
  );
  const iconRootClass = $derived(
    `relative flex items-center justify-center overflow-hidden ${shapeClass} ${
      glowOnHover ? 'group' : ''
    }`
  );
</script>

<div class={rootClass}>
  <div class={iconRootClass} style={baseStyle}>
    {#if backgroundVariant !== 'none'}
      <div class="absolute inset-0" style={backgroundStyle}></div>
    {/if}
    <div
      class="absolute inset-0"
      style={`border:${borderStyleValue};${clipPath ? `clip-path:${clipPath};` : ''}`}
    ></div>
    {#if showGlow}
      <div
        class={`absolute inset-0 transition-opacity duration-200 ${
          glowOnHover ? 'opacity-0 group-hover:opacity-100' : ''
        }`}
        style={`background:radial-gradient(circle, ${toSafeColor(
          glowColor,
          '#ffffff'
        )} 0%, transparent 70%);opacity:${clamp(glowOpacity, 0, 1)};`}
      ></div>
    {/if}
    {#if svg}
      <div class="relative z-10" style={iconStyle}>
        {@html svg}
      </div>
    {:else if loading}
      <div class="relative z-10 text-[10px] text-white/30">Loading...</div>
    {:else}
      <div class="relative z-10 text-[10px] text-white/30 text-center px-1">
        {emptyLabel}
      </div>
    {/if}
    {#if showBadge}
      <div
        class={`absolute ${badgePositionClass} px-1.5 py-0.5 rounded-full text-[9px] leading-none font-semibold`}
        style={`background:${toSafeColor(
          badgeColor,
          '#f59e0b'
        )};color:${toSafeColor(badgeTextColor, '#0a0a0a')};`}
      >
        {badgeText}
      </div>
    {/if}
    {#if showLabelInside}
      <div class="absolute bottom-1 left-1 right-1 text-[9px] text-center">
        <span
          style={`color:${toSafeColor(labelColor, 'rgba(255,255,255,0.7)')};`}
        >
          {label}
        </span>
      </div>
    {/if}
  </div>
  {#if showLabelBelow}
    <div class="text-[10px] text-center max-w-[80px] truncate">
      <span
        style={`color:${toSafeColor(labelColor, 'rgba(255,255,255,0.7)')};`}
      >
        {label}
      </span>
    </div>
  {/if}
</div>
