<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { getGameIconUrl } from '../../../core/game-icons';
  import Button from '../common/Button.svelte';
  import GameIcon from '../common/GameIcon.svelte';
  import pqIconMap from '../../../../src/vendor/game-icons.net/ffffff/pq-icon-map-v2.json';

  const svgCache = new Map<string, string>();
  const inFlight = new Set<string>();

  type SlotId =
    | 'head'
    | 'neck'
    | 'mainhand'
    | 'chest'
    | 'offhand'
    | 'hands'
    | 'feet'
    | 'finger';

  type EquipmentItem = {
    id: string;
    name: string;
    author: string;
    label: string;
    path: string;
    rarityHex: string;
    stats: string[];
    description: string;
    type: string;
  };

  type SlotDef = {
    id: SlotId;
    label: string;
    icon?: EquipmentItem;
  };

  type BackgroundShape =
    | 'square'
    | 'rounded'
    | 'circle'
    | 'hex'
    | 'diamond'
    | 'star';
  type BackgroundVariant = 'none' | 'solid' | 'gradient';
  type BorderVariant = 'none' | 'soft' | 'bold';
  type PresetTheme =
    | 'gold'
    | 'arcane'
    | 'emerald'
    | 'crimson'
    | 'cyber'
    | 'retro';

  let { onClose } = $props<{ onClose: () => void }>();

  // Deterministic Equipment Configuration
  const SLOT_CONFIG: {
    id: SlotId;
    label: string;
    find: (n: any) => boolean;
  }[] = [
    {
      id: 'head',
      label: 'Head',
      find: (n: any) => n.id.includes('helm') || n.tags.includes('helm'),
    },
    {
      id: 'neck',
      label: 'Neck',
      find: (n: any) => n.id.includes('necklace') || n.tags.includes('amulet'),
    },
    {
      id: 'mainhand',
      label: 'Main Hand',
      find: (n: any) => n.visualGroup === 'weapons_swords',
    },
    {
      id: 'chest',
      label: 'Torso',
      find: (n: any) => n.visualGroup === 'armor_chest',
    },
    {
      id: 'offhand',
      label: 'Off Hand',
      find: (n: any) => n.visualGroup === 'armor_shields',
    },
    {
      id: 'hands',
      label: 'Hands',
      find: (n: any) => n.id.includes('glove') || n.tags.includes('glove'),
    },
    {
      id: 'feet',
      label: 'Feet',
      find: (n: any) => n.id.includes('boot') || n.tags.includes('boot'),
    },
    {
      id: 'finger',
      label: 'Finger',
      find: (n: any) => n.path.includes('ring.svg'),
    },
  ];

  let slots = $state<SlotDef[]>(
    SLOT_CONFIG.map((s) => ({ id: s.id, label: s.label }))
  );
  let hoveredSlotId = $state<SlotId | null>(null);
  let svgByUrl = $state(new Map<string, string>());
  let failed = $state(new Set<string>());
  let randomSeed = $state(0);

  const PRESETS: Record<
    PresetTheme,
    {
      background: string;
      gradientFrom: string;
      gradientTo: string;
      border: string;
      badge: string;
      badgeText: string;
      shape: BackgroundShape;
      borderVariant: BorderVariant;
      bgVariant: BackgroundVariant;
      glow: boolean;
    }
  > = {
    gold: {
      background: '#1f1a0a',
      gradientFrom: '#3a2a0f',
      gradientTo: '#0f0a04',
      border: 'rgba(212,175,55,0.45)',
      badge: '#d4af37',
      badgeText: '#0a0a0a',
      shape: 'rounded',
      borderVariant: 'soft',
      bgVariant: 'solid',
      glow: true,
    },
    arcane: {
      background: '#17132b',
      gradientFrom: '#39235f',
      gradientTo: '#0d0b1e',
      border: 'rgba(140,110,255,0.5)',
      badge: '#8c6eff',
      badgeText: '#0a0a0a',
      shape: 'hex',
      borderVariant: 'soft',
      bgVariant: 'gradient',
      glow: true,
    },
    emerald: {
      background: '#0b1e14',
      gradientFrom: '#0d3a24',
      gradientTo: '#07160f',
      border: 'rgba(16,163,127,0.5)',
      badge: '#10a37f',
      badgeText: '#07160f',
      shape: 'square',
      borderVariant: 'bold',
      bgVariant: 'solid',
      glow: false,
    },
    crimson: {
      background: '#210a0e',
      gradientFrom: '#4a1016',
      gradientTo: '#0d0507',
      border: 'rgba(244,63,94,0.55)',
      badge: '#f43f5e',
      badgeText: '#0a0a0a',
      shape: 'diamond',
      borderVariant: 'soft',
      bgVariant: 'gradient',
      glow: true,
    },
    cyber: {
      background: '#000000',
      gradientFrom: '#001100',
      gradientTo: '#000000',
      border: 'rgba(0, 255, 65, 0.8)',
      badge: '#00ff41',
      badgeText: '#000000',
      shape: 'hex',
      borderVariant: 'bold',
      bgVariant: 'solid',
      glow: true,
    },
    retro: {
      background: '#2d2d2d',
      gradientFrom: '#2d2d2d',
      gradientTo: '#2d2d2d',
      border: 'rgba(255, 255, 255, 1)',
      badge: '#ffffff',
      badgeText: '#000000',
      shape: 'square',
      borderVariant: 'bold',
      bgVariant: 'none',
      glow: false,
    },
  };

  let backgroundShape = $state<BackgroundShape>('rounded');
  let backgroundVariant = $state<BackgroundVariant>('solid');
  let borderVariant = $state<BorderVariant>('soft');
  let currentPreset = $state<PresetTheme>('gold');

  // Effect states
  let invert = $state(false);
  let rotate = $state(false);
  let flipX = $state(false);
  let flipY = $state(false);
  let showBadge = $state(true);
  let showLabel = $state(false);
  let showGlow = $state(true);

  const activeTheme = $derived(PRESETS[currentPreset]);
  const iconRotation = $derived(rotate ? 18 : 0);
  const borderStyle = $derived(borderVariant === 'none' ? 'none' : 'solid');
  const borderWidth = $derived(borderVariant === 'bold' ? 2 : 1);

  function applyPreset(name: PresetTheme) {
    currentPreset = name;
    const p = PRESETS[name];
    backgroundShape = p.shape;
    backgroundVariant = p.bgVariant;
    borderVariant = p.borderVariant;
    showGlow = p.glow;
  }

  function randomizeEquipment() {
    randomSeed = Date.now();
  }

  function sanitizeSvg(svgText: string): string | null {
    try {
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return null;

      for (const el of Array.from(
        svg.querySelectorAll('script, foreignObject')
      )) {
        el.remove();
      }

      // Remove background rect if present
      const firstPath = svg.querySelector('path');
      if (firstPath) {
        const d = firstPath.getAttribute('d') || '';
        if (d.includes('0 0h512v512') || d.includes('M0 0h512v512H0z')) {
          firstPath.remove();
        }
      }

      const all = [svg, ...Array.from(svg.querySelectorAll('*'))];
      for (const el of all) {
        el.removeAttribute('fill');
        if (el.hasAttribute('style')) {
          const style = el.getAttribute('style') || '';
          if (style.includes('fill')) {
            el.setAttribute('style', style.replace(/fill\s*:[^;]+;?/gi, ''));
          }
        }
        // Security cleanup
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          const value = attr.value ?? '';
          if (name.startsWith('on')) el.removeAttribute(attr.name);
          if (name === 'href' || name === 'xlink:href') {
            const v = String(value).trim().toLowerCase();
            if (v.startsWith('javascript:') || v.startsWith('data:text/html')) {
              el.removeAttribute(attr.name);
            }
          }
        }
      }

      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('fill', 'currentColor');

      return new XMLSerializer().serializeToString(svg);
    } catch {
      return null;
    }
  }

  function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('timeout')), ms);
      p.then(
        (v) => {
          clearTimeout(t);
          resolve(v);
        },
        (e) => {
          clearTimeout(t);
          reject(e);
        }
      );
    });
  }

  async function fetchSvg(url: string): Promise<string | null> {
    const cached = svgCache.get(url);
    if (cached) return cached;
    try {
      const fullUrl = chrome.runtime.getURL(url);
      const res = await withTimeout(fetch(fullUrl, { method: 'GET' }), 6000);
      if (!res.ok) return null;
      const text = await res.text();
      const sanitized = sanitizeSvg(text);
      if (!sanitized) return null;
      svgCache.set(url, sanitized);
      return sanitized;
    } catch {
      return null;
    }
  }

  function generateStats(node: any): string[] {
    const tier = node.attributes?.tier || 1;
    const stats = [
      `Level ${node.levelRange?.min || 1} - ${node.levelRange?.max || 5}`,
      `Durability: ${10 + tier * 5}/${10 + tier * 5}`,
    ];

    if (node.visualGroup?.includes('weapon')) {
      stats.push(`${tier * 2}-${tier * 4} Damage`);
      stats.push(`+${tier} Strength`);
    } else if (node.visualGroup?.includes('armor')) {
      stats.push(`${tier * 10} Armor`);
      stats.push(`+${tier} Vitality`);
    } else {
      stats.push(`+${tier} Intelligence`);
    }

    return stats;
  }

  function loadEquipment() {
    const newSlots = slots.map((slot) => {
      const config = SLOT_CONFIG.find((c) => c.id === slot.id)!;
      let candidate;

      if (randomSeed > 0) {
        // Find all matches then pick random
        const allMatches = pqIconMap.nodes.filter(config.find);
        if (allMatches.length > 0) {
          // Use a simple pseudo-random based on seed + slot id
          const idx = (randomSeed + slot.id.length) % allMatches.length;
          candidate = allMatches[Math.floor(Math.random() * allMatches.length)];
        }
      } else {
        // Deterministic default
        candidate = pqIconMap.nodes.find(config.find);
      }

      if (candidate) {
        const [author, filename] = candidate.path.split('/');
        return {
          ...slot,
          icon: {
            id: candidate.id,
            name: filename.replace('.svg', ''),
            author,
            label: candidate.id
              .split('_')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            path: candidate.path,
            rarityHex: candidate.rarityHex || '#ffffff',
            stats: generateStats(candidate),
            description: candidate.itemTypes?.[0] || 'Unknown Item',
            type: config.label,
          },
        };
      }
      return slot;
    });
    slots = newSlots;
  }

  async function loadAllSvgs() {
    const urls = slots
      .filter((s) => s.icon)
      .map((s) => getGameIconUrl(s.icon!.name, s.icon!.author));

    const uniqueUrls = [...new Set(urls)];

    for (const url of uniqueUrls) {
      if (svgByUrl.has(url) || failed.has(url) || inFlight.has(url)) continue;
      inFlight.add(url);
      const svg = await fetchSvg(url);
      inFlight.delete(url);

      if (svg) {
        const next = new Map(svgByUrl);
        next.set(url, svg);
        svgByUrl = next;
      } else {
        const nextFailed = new Set(failed);
        nextFailed.add(url);
        failed = nextFailed;
      }
    }
  }

  $effect(() => {
    // Re-run when randomSeed changes
    void randomSeed;
    untrack(() => {
      loadEquipment();
    });
  });

  $effect(() => {
    // Re-run when slots change, but don't track internal state updates (svgByUrl, failed)
    void slots;
    untrack(() => {
      void loadAllSvgs();
    });
  });

  function getSlot(id: SlotId) {
    return slots.find((s) => s.id === id);
  }
</script>

<div
  class="bg-[#121212] border border-white/10 rounded-lg shadow-xl overflow-hidden flex flex-col w-[340px] select-none"
>
  <!-- Header -->
  <div
    class="flex items-center justify-between p-3 border-b border-white/10 bg-[#1a1a1a]"
  >
    <div class="flex items-center gap-2">
      <h3 class="text-sm font-semibold text-[#d4af37] m-0">Inventory</h3>
      <Button
        size="sm"
        variant="secondary"
        onclick={randomizeEquipment}
        ariaLabel="Randomize"
      >
        🎲 Random
      </Button>
    </div>
    <Button size="sm" variant="ghost" onclick={onClose} ariaLabel="Close"
      >✕</Button
    >
  </div>

  <div
    class="p-3 border-b border-white/10 bg-[#121212] flex flex-col gap-2 max-h-[300px] overflow-y-auto"
  >
    <!-- Presets -->
    <details class="group" open>
      <summary
        class="text-[10px] uppercase tracking-wide text-white/40 cursor-pointer list-none flex items-center gap-2 group-open:mb-2 hover:text-white/60"
      >
        <span class="rotate-0 group-open:rotate-90 transition-transform"
          >▶</span
        >
        Presets
      </summary>
      <div class="flex flex-wrap items-center gap-1.5 pl-4">
        {#each Object.keys(PRESETS) as preset}
          <Button
            size="sm"
            variant="secondary"
            pressed={currentPreset === preset}
            onclick={() => applyPreset(preset as PresetTheme)}
            class="capitalize"
          >
            {preset}
          </Button>
        {/each}
      </div>
    </details>

    <!-- Background -->
    <details class="group">
      <summary
        class="text-[10px] uppercase tracking-wide text-white/40 cursor-pointer list-none flex items-center gap-2 group-open:mb-2 hover:text-white/60"
      >
        <span class="rotate-0 group-open:rotate-90 transition-transform"
          >▶</span
        >
        Background
      </summary>
      <div class="flex flex-col gap-2 pl-4">
        <div class="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundVariant === 'none'}
            onclick={() => (backgroundVariant = 'none')}>None</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundVariant === 'solid'}
            onclick={() => (backgroundVariant = 'solid')}>Solid</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundVariant === 'gradient'}
            onclick={() => (backgroundVariant = 'gradient')}>Gradient</Button
          >
        </div>
        <div class="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundShape === 'square'}
            onclick={() => (backgroundShape = 'square')}>Square</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundShape === 'rounded'}
            onclick={() => (backgroundShape = 'rounded')}>Rounded</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundShape === 'circle'}
            onclick={() => (backgroundShape = 'circle')}>Circle</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundShape === 'hex'}
            onclick={() => (backgroundShape = 'hex')}>Hex</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundShape === 'diamond'}
            onclick={() => (backgroundShape = 'diamond')}>Diamond</Button
          >
          <Button
            size="sm"
            variant="secondary"
            pressed={backgroundShape === 'star'}
            onclick={() => (backgroundShape = 'star')}>Star</Button
          >
        </div>
      </div>
    </details>

    <!-- Frame -->
    <details class="group">
      <summary
        class="text-[10px] uppercase tracking-wide text-white/40 cursor-pointer list-none flex items-center gap-2 group-open:mb-2 hover:text-white/60"
      >
        <span class="rotate-0 group-open:rotate-90 transition-transform"
          >▶</span
        >
        Frame
      </summary>
      <div class="flex flex-wrap gap-1.5 pl-4">
        <Button
          size="sm"
          variant="secondary"
          pressed={borderVariant === 'none'}
          onclick={() => (borderVariant = 'none')}>None</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={borderVariant === 'soft'}
          onclick={() => (borderVariant = 'soft')}>Soft</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={borderVariant === 'bold'}
          onclick={() => (borderVariant = 'bold')}>Bold</Button
        >
      </div>
    </details>

    <!-- Effects -->
    <details class="group">
      <summary
        class="text-[10px] uppercase tracking-wide text-white/40 cursor-pointer list-none flex items-center gap-2 group-open:mb-2 hover:text-white/60"
      >
        <span class="rotate-0 group-open:rotate-90 transition-transform"
          >▶</span
        >
        Effects
      </summary>
      <div class="flex flex-wrap gap-1.5 pl-4">
        <Button
          size="sm"
          variant="secondary"
          pressed={invert}
          onclick={() => (invert = !invert)}>Invert</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={rotate}
          onclick={() => (rotate = !rotate)}>Rotate</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={flipX}
          onclick={() => (flipX = !flipX)}>Flip X</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={flipY}
          onclick={() => (flipY = !flipY)}>Flip Y</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={showGlow}
          onclick={() => (showGlow = !showGlow)}>Glow</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={showBadge}
          onclick={() => (showBadge = !showBadge)}>Badge</Button
        >
        <Button
          size="sm"
          variant="secondary"
          pressed={showLabel}
          onclick={() => (showLabel = !showLabel)}>Label</Button
        >
      </div>
    </details>
  </div>

  <!-- Character Sheet -->
  <div
    class="p-4 relative min-h-[300px] flex flex-col items-center gap-4 bg-[#0a0a0a]"
  >
    <!-- Row 1: Head / Neck -->
    <div class="flex gap-4">
      {@render EquipmentSlot(getSlot('head'))}
      <div class="w-8"></div>
      <!-- Spacer for visual balance -->
      {@render EquipmentSlot(getSlot('neck'))}
    </div>

    <!-- Row 2: Main / Chest / Off -->
    <div class="flex gap-4">
      {@render EquipmentSlot(getSlot('mainhand'))}
      {@render EquipmentSlot(getSlot('chest'))}
      {@render EquipmentSlot(getSlot('offhand'))}
    </div>

    <!-- Row 3: Hands / Feet / Finger -->
    <div class="flex gap-4">
      {@render EquipmentSlot(getSlot('hands'))}
      {@render EquipmentSlot(getSlot('feet'))}
      {@render EquipmentSlot(getSlot('finger'))}
    </div>

    <!-- Tooltip Overlay -->
    {#if hoveredSlotId}
      {@const hoveredSlot = slots.find((s) => s.id === hoveredSlotId)}
      {#if hoveredSlot?.icon}
        <div
          class="absolute bottom-4 left-4 right-4 bg-[#1a1a1a] border border-[#333] p-3 rounded shadow-2xl z-10 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div
            class="text-sm font-bold mb-1"
            style="color: {hoveredSlot.icon.rarityHex}"
          >
            {hoveredSlot.icon.description}
          </div>
          <div class="text-xs text-white/60 mb-2">{hoveredSlot.icon.label}</div>

          <div class="space-y-1">
            {#each hoveredSlot.icon.stats as stat}
              <div class="text-xs text-[#8888ff]">{stat}</div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

{#snippet EquipmentSlot(slot?: SlotDef)}
  <div
    class="relative group"
    onmouseenter={() => slot && (hoveredSlotId = slot.id)}
    onmouseleave={() => slot && (hoveredSlotId = null)}
    role="button"
    tabindex="0"
  >
    {#if slot?.icon}
      {@const url = getGameIconUrl(slot.icon.name, slot.icon.author)}
      {@const svg = svgByUrl.get(url)}
      <GameIcon
        {svg}
        size={64}
        iconColor={slot.icon.rarityHex}
        {backgroundShape}
        {backgroundVariant}
        backgroundColor={activeTheme.background}
        backgroundGradientFrom={activeTheme.gradientFrom}
        backgroundGradientTo={activeTheme.gradientTo}
        {borderStyle}
        {borderWidth}
        borderColor={activeTheme.border}
        glowColor={showGlow ? slot.icon.rarityHex : undefined}
        glowOnHover={true}
        {invert}
        rotation={iconRotation}
        {flipX}
        {flipY}
        badgeText={showBadge ? '1' : undefined}
        badgeColor={activeTheme.badge}
        badgeTextColor={activeTheme.badgeText}
        label={showLabel ? slot.icon.name : undefined}
        labelColor="rgba(255,255,255,0.7)"
        loading={!svg}
        emptyLabel="Loading"
      />
    {:else}
      <GameIcon
        size={64}
        {backgroundShape}
        {backgroundVariant}
        backgroundColor={activeTheme.background}
        backgroundGradientFrom={activeTheme.gradientFrom}
        backgroundGradientTo={activeTheme.gradientTo}
        {borderStyle}
        {borderWidth}
        borderColor={activeTheme.border}
        emptyLabel={slot?.label ?? 'Empty'}
      />
    {/if}
  </div>
{/snippet}
