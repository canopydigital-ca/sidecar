<script lang="ts">
  import { onMount } from 'svelte';
  import { popoverState } from '../../state.svelte';
  import { PetsLayer } from '../../../pets/layer/PetsLayer';
  import {
    BACKGROUND_MODE_NOTE,
    DEFAULT_PET_SETTINGS,
    loadPetSettings,
    migratePetSettings,
    savePetSettings,
    savePetSettingsDebounced,
    watchPetSettings,
    resetPetSettings,
    type PetPlacementMode,
    type PetRendererKind,
    type PetSettings,
  } from '../../../pets/core/settings';
  import { PetsWebviewRenderer } from '../../../pets/renderers/webview/PetsWebviewRenderer';
  import { PETS_CATALOG } from '../../../pets/core/catalog';

  // Common Components
  import Switch from '../common/Switch.svelte';
  import Select from '../common/Select.svelte';
  import Slider from '../common/Slider.svelte';
  import Button from '../common/Button.svelte';
  import Section from '../common/Section.svelte';

  let { onClose } = $props<{ onClose: () => void }>();

  let enabled = $state(false);
  let renderer = $state<PetRendererKind>('webview');
  let vendorEnabled = $state(false);
  let placementMode = $state<PetPlacementMode>('dock-overlay');
  let scale = $state(1);
  let opacity = $state(0.6);
  let maxPets = $state(1);
  let speed = $state(1);
  let clickThrough = $state(true);
  let debug = $state(false);
  let petType = $state('snake');
  let petColor = $state('green');

  let current: PetSettings | null = null;

  const placementOptions: { value: PetPlacementMode; label: string }[] = [
    { value: 'dock-overlay', label: 'Above Dock' },
    { value: 'composer', label: 'Near Composer' },
    { value: 'background', label: 'Background (Full View)' },
    { value: 'corner', label: 'Fixed Corner (Bottom-Right)' },
  ];

  const petTypes = Object.keys(PETS_CATALOG);
  const petColors = $derived(() => PETS_CATALOG[petType] ?? []);

  function applyIncomingSettings(settings: PetSettings) {
    current = settings;
    enabled = settings.enabled;
    renderer = settings.renderer;
    vendorEnabled = settings.vendorEnabled;
    placementMode = settings.placementMode;
    scale = settings.scale;
    opacity = settings.opacity;
    maxPets = settings.maxPets;
    speed = settings.speed;
    clickThrough = settings.clickThrough;
    debug = settings.debug;
    petType = settings.petType;
    petColor = settings.petColor;
    applyToLayer(settings);
  }

  function applyToLayer(settings: PetSettings) {
    const layer = PetsLayer.getInstance();
    layer.setSettings(settings);
  }

  function commitNow(partial: Partial<PetSettings>) {
    current = migratePetSettings({
      ...(current ?? DEFAULT_PET_SETTINGS),
      ...partial,
    });
    if (current) applyToLayer(current);
    void savePetSettings(partial);
  }

  function commitDebounced(partial: Partial<PetSettings>) {
    current = migratePetSettings({
      ...(current ?? DEFAULT_PET_SETTINGS),
      ...partial,
    });
    if (current) applyToLayer(current);
    savePetSettingsDebounced(partial);
  }

  onMount(() => {
    const layer = PetsLayer.getInstance();
    layer.initialize();

    let disposed = false;
    void (async () => {
      const settings = await loadPetSettings();
      if (disposed) return;
      applyIncomingSettings(settings);
    })();

    const unwatch = watchPetSettings((settings) => {
      if (disposed) return;
      applyIncomingSettings(settings);
    });

    return () => {
      disposed = true;
      unwatch();
    };
  });

  function throwBall() {
    const layer = PetsLayer.getInstance();
    (layer as any).throwBall?.();
  }

  function resetAll() {
    if (confirm('Reset all pet settings to default?')) {
      resetPetSettings().then(() => {
        applyIncomingSettings(DEFAULT_PET_SETTINGS);
      });
    }
  }

  function openInspector() {
    popoverState.activeKind = 'pets-inspector';
  }

  function exportSettings() {
    const json = JSON.stringify(current || DEFAULT_PET_SETTINGS, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatgpt-dock-pets.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSettings(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);
        const migrated = migratePetSettings(raw);
        applyIncomingSettings(migrated);
        savePetSettings(migrated);
        alert('Settings imported successfully!');
      } catch (err) {
        alert('Failed to import settings: Invalid JSON');
      }
    };
    reader.readAsText(file);
  }
</script>

<div class="flex flex-col min-w-[280px] pb-2">
  <div class="flex justify-between items-center mb-2">
    <h4 class="m-0 text-sm font-semibold text-white">Pets Overlay</h4>
    <div class="flex gap-2">
      <Button
        size="sm"
        variant="danger"
        onclick={resetAll}
        ariaLabel="Reset to defaults">Reset</Button
      >
      <Button
        size="sm"
        variant="ghost"
        onclick={onClose}
        ariaLabel="Close pets overlay">Close</Button
      >
    </div>
  </div>

  <Section>
    <Switch
      label="Enabled"
      checked={enabled}
      onchange={(v) => commitNow({ enabled: v })}
    />
  </Section>

  <Section>
    <Select
      label="Renderer"
      value={renderer}
      options={[
        { value: 'webview', label: 'Webview' },
        { value: 'canvas', label: 'Canvas' },
      ]}
      onchange={(v) => commitNow({ renderer: v as PetRendererKind })}
      width="100%"
    />
  </Section>

  <Section>
    <Switch
      label="Vendor assets"
      checked={vendorEnabled}
      onchange={(v) => commitNow({ vendorEnabled: v })}
    />
  </Section>

  <Section>
    <Select
      label="Placement"
      value={placementMode}
      options={placementOptions}
      onchange={(v) => commitNow({ placementMode: v as PetPlacementMode })}
      width="100%"
    />
  </Section>

  <Section>
    <div class="grid grid-cols-2 gap-3">
      <Select
        label="Pet Type"
        value={petType}
        options={petTypes.map((t) => ({ value: t, label: t }))}
        onchange={(v) => commitNow({ petType: v })}
        width="100%"
      />
      <Select
        label="Color"
        value={petColor}
        options={petColors().map((c) => ({ value: c, label: c }))}
        onchange={(v) => commitNow({ petColor: v })}
        width="100%"
      />
    </div>
  </Section>

  <Section>
    <Slider
      label="Max pets"
      value={maxPets}
      min={1}
      max={5}
      step={1}
      onchange={(v) => commitDebounced({ maxPets: v })}
    />
  </Section>

  <Section>
    <Slider
      label="Scale"
      value={scale}
      min={0.5}
      max={2}
      step={0.05}
      onchange={(v) => commitDebounced({ scale: v })}
    />
  </Section>

  <Section>
    <Slider
      label="Opacity"
      value={opacity}
      min={0.2}
      max={1}
      step={0.05}
      onchange={(v) => commitDebounced({ opacity: v })}
    />
  </Section>

  <Section>
    <Slider
      label="Speed"
      value={speed}
      min={0.25}
      max={2}
      step={0.05}
      onchange={(v) => commitDebounced({ speed: v })}
    />
  </Section>

  <Section>
    <Switch
      label="Click-through"
      checked={clickThrough}
      disabled={placementMode === 'background' || placementMode === 'composer'}
      onchange={(v) => commitNow({ clickThrough: v })}
    />
  </Section>

  <Section>
    <Button onclick={throwBall} class="w-full" dataAction="throw-ball"
      >Throw Ball 🎾</Button
    >
  </Section>

  <Section>
    <div class="flex justify-between items-center w-full">
      <Switch
        label="Debug overlay"
        checked={debug}
        onchange={(v) => commitNow({ debug: v })}
      />
      {#if debug}
        <Button size="sm" onclick={openInspector}>Inspector</Button>
      {/if}
    </div>
  </Section>

  <Section borderTop>
    <div class="flex gap-2">
      <Button
        size="sm"
        onclick={exportSettings}
        ariaLabel="Save settings to file">Export JSON</Button
      >
      <Button
        size="sm"
        onclick={() => document.getElementById('pet-import')?.click()}
        >Import JSON</Button
      >
      <input
        id="pet-import"
        type="file"
        accept=".json"
        onchange={importSettings}
        style="display: none;"
      />
    </div>
  </Section>

  <div class="text-[11px] text-white/55 mt-3 leading-[1.4]">
    Pets run in an isolated layer. Background/Near Composer are always
    click-through; Above Dock/Fixed Corner use the Click-through toggle.
    {#if placementMode === 'background'}
      ({BACKGROUND_MODE_NOTE})
    {/if}
  </div>
</div>
