<script lang="ts">
  import icons from '../../../../packages/icons/icons.json';
  import newIcons from '../../../../packages/icons/icons.new.json';
  import { iconMap } from '../../../../packages/icons/iconMap';

  let {
    name,
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    class: className = undefined,
    ...rest
  }: {
    name: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    class?: string;
  } & Record<string, unknown> = $props();

  const allIcons = { ...icons, ...newIcons };

  // Resolve hash from name (pure derivations of props)
  const hash = $derived(iconMap[name as keyof typeof iconMap] || name);
  const iconData = $derived((allIcons as any)[hash]);
  const svgContent = $derived(iconData?.svg || '');

  // Extract viewBox if possible or default to 20 20
  const viewBox = $derived(iconData?.meta?.viewBox || '0 0 20 20');

  // If the SVG string contains the <svg> tag, we need to strip it or render it differently.
  // The icons.json contains full <svg ...>...</svg> strings.
  // We want to apply our own size/class/color.
  // So we should probably strip the <svg> wrapper and render the inner content in our own <svg>.

  function getInnerSvg(svg: string) {
    const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    return match ? match[1] : svg;
  }

  const innerContent = $derived(getInnerSvg(svgContent));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  {viewBox}
  fill="none"
  stroke={color}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  {...rest}
>
  {@html innerContent}
</svg>
