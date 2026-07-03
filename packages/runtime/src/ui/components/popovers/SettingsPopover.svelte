<script lang="ts">
  import { onMount } from 'svelte';
  import { FLAGS, DOCK_ID } from '../../../core/constants';
  import type { DockContext } from '../../../core/context';
  import { applyTextareaSizing } from '../../../features/input/sizing';
  import { findComposerResizeTarget } from '../../../features/composer/find';
  import {
    loadPetSettings,
    savePetSettings,
    DEFAULT_PET_SETTINGS,
    type PetSettings,
  } from '../../../pets/core/settings';

  // Common Components
  import Switch from '../common/Switch.svelte';
  import Select from '../common/Select.svelte';
  import Slider from '../common/Slider.svelte';
  import Button from '../common/Button.svelte';
  import Section from '../common/Section.svelte';

  let { ctx, onClose } = $props<{ ctx: DockContext; onClose: () => void }>();

  // Mirror settings for reactivity
  // svelte-ignore state_referenced_locally
  let settings = $state({ ...ctx.settings });
  let petSettings = $state<PetSettings>({ ...DEFAULT_PET_SETTINGS });

  onMount(async () => {
    petSettings = await loadPetSettings();
  });

  async function update(key: keyof typeof ctx.settings, value: any) {
    // Update local state (automatically done by binding/assignment if we used bind:checked,
    // but here we are using onchange so we manually update)
    (settings as any)[key] = value;

    // Update context
    (ctx.settings as any)[key] = value;
    await ctx.persistSettings();

    // Side effects
    if (key === 'statusbarOn') {
      document.documentElement.classList.toggle(FLAGS.statusbar, !!value);
      ctx.ensureStatusBar();
      if (value) {
        ctx.resetStatusState();
        ctx.scheduleWork('settings-statusbar-toggle');
      }
    } else if (
      ['statMessages', 'statWords', 'statTokens', 'statCost'].includes(
        key as string
      ) ||
      key === 'statusbarStatsAlign'
    ) {
      ctx.scheduleWork('settings-stats-change');
    } else if (key === 'hideThinking') {
      ctx.updateThinkingVisibility();
      ctx.scheduleWork('settings-hide-thinking');
    } else if (key === 'hideTopPicker') {
      ctx.setNeedHideTopModel(true);
      ctx.scheduleWork('settings-hide-top-picker');
    } else if (key === 'enableProjects') {
      const dock = document.getElementById(DOCK_ID);
      if (dock) dock.remove();
      ctx.flags.needDock = true;
      ctx.scheduleWork('settings-enable-projects');
    }
  }

  async function updatePet(key: keyof PetSettings, value: any) {
    (petSettings as any)[key] = value;
    await savePetSettings({ [key]: value });
  }

  function handleResetInput() {
    // Simulate state for sizing application
    const nextState = {
      ...ctx.uiState,
      inputCollapsed: false,
      inputHeight: undefined,
      inputHeightExpanded: undefined,
    };

    document.documentElement.classList.remove(FLAGS.inputCollapsed);
    applyTextareaSizing(
      nextState,
      findComposerResizeTarget,
      ctx.trackSelectorPerformance
    );

    // Persist via updateSettings
    ctx.updateSettings({
      ui: {
        inputCollapsed: false,
        inputHeight: undefined,
        inputHeightExpanded: undefined,
      },
    });

    const btn = document.querySelector(
      `#${DOCK_ID} button[data-action="inputToggle"]`
    );
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

  async function handleExport() {
    const data = await ctx.storageGet(null);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatgpt-dock-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = ev.target?.result as string;
        const data = JSON.parse(json);
        await ctx.storageSet(data);
        alert('Settings imported. Reloading...');
        window.location.reload();
      } catch (err) {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  }
</script>

<div class="flex justify-between items-center mb-1">
  <h4 class="m-0 text-sm font-semibold text-white/92">Settings</h4>
  <Button onclick={onClose} size="sm" variant="ghost" ariaLabel="Close settings"
    >Close</Button
  >
</div>

<Section>
  <div class="flex items-center gap-3 flex-wrap">
    <Switch
      label="Show status bar"
      checked={settings.statusbarOn}
      onchange={(v) => update('statusbarOn', v)}
    />
    <Select
      value={settings.statusbarStatsAlign}
      options={[
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
      ]}
      onchange={(v) => update('statusbarStatsAlign', v)}
      size="sm"
      width="100px"
    />
  </div>

  <div
    class="grid grid-cols-2 gap-x-4 gap-y-3 mt-2 justify-items-start max-[520px]:grid-cols-1"
  >
    <Switch
      label="Messages"
      checked={settings.statMessages}
      onchange={(v) => update('statMessages', v)}
    />
    <Switch
      label="Words"
      checked={settings.statWords}
      onchange={(v) => update('statWords', v)}
    />
    <Switch
      label="Tokens (≈)"
      checked={settings.statTokens}
      onchange={(v) => update('statTokens', v)}
    />
    <Switch
      label="Cost (est.)"
      checked={settings.statCost}
      onchange={(v) => update('statCost', v)}
    />
  </div>
</Section>

<Section title="Pets" borderTop>
  <div class="flex items-center gap-3 flex-wrap">
    <Switch
      label="Enabled"
      checked={petSettings.enabled}
      onchange={(v) => updatePet('enabled', v)}
    />
    <Select
      value={petSettings.petType}
      options={[
        { value: 'cat', label: 'Cat' },
        { value: 'dog', label: 'Dog' },
        { value: 'snake', label: 'Snake' },
        { value: 'clippy', label: 'Clippy' },
        { value: 'rubber-duck', label: 'Rubber Duck' },
        { value: 'zappy', label: 'Zappy' },
        { value: 'crab', label: 'Crab' },
        { value: 'totoro', label: 'Totoro' },
        { value: 'rocky', label: 'Rocky' },
        { value: 'cockatiel', label: 'Cockatiel' },
      ]}
      onchange={(v) => updatePet('petType', v)}
      disabled={!petSettings.enabled}
      width="120px"
    />
  </div>

  <div class="flex items-center gap-3 flex-wrap mt-2">
    <Select
      label="Color"
      value={petSettings.petColor}
      options={[
        { value: 'brown', label: 'Brown' },
        { value: 'black', label: 'Black' },
        { value: 'green', label: 'Green' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'gray', label: 'Gray' },
        { value: 'red', label: 'Red' },
        { value: 'white', label: 'White' },
      ]}
      onchange={(v) => updatePet('petColor', v)}
      disabled={!petSettings.enabled}
      width="100%"
    />
  </div>

  <div class="mt-3">
    <Slider
      label="Size"
      value={petSettings.scale}
      min={0.5}
      max={2.0}
      step={0.1}
      valueSuffix="x"
      onchange={(v) => updatePet('scale', v)}
      disabled={!petSettings.enabled}
    />
  </div>

  <div class="mt-3">
    <Select
      label="Background"
      value={petSettings.backgroundMode}
      options={[
        { value: 'transparent', label: 'Transparent' },
        { value: 'solid', label: 'Solid (Match GPT)' },
        { value: 'theme', label: 'Theme' },
      ]}
      onchange={(v) => updatePet('backgroundMode', v)}
      disabled={!petSettings.enabled}
      width="100%"
    />
  </div>

  {#if petSettings.backgroundMode === 'theme'}
    <div class="mt-2">
      <Select
        label="Theme"
        value={petSettings.backgroundTheme || 'forest'}
        options={[
          { value: 'forest', label: 'Forest' },
          { value: 'castle', label: 'Castle' },
          { value: 'beach', label: 'Beach' },
          { value: 'winter', label: 'Winter' },
          { value: 'autumn', label: 'Autumn' },
        ]}
        onchange={(v) => updatePet('backgroundTheme', v)}
        disabled={!petSettings.enabled}
        width="100%"
      />
    </div>
  {/if}

  <div
    class="grid grid-cols-2 gap-x-4 gap-y-3 mt-3 justify-items-start max-[520px]:grid-cols-1"
  >
    <Switch
      label="Debug Overlay"
      checked={petSettings.debug}
      onchange={(v) => updatePet('debug', v)}
    />
    <Switch
      label="Hide Vendor UI"
      checked={petSettings.hideVendorUi}
      onchange={(v) => updatePet('hideVendorUi', v)}
    />
  </div>
</Section>

<Section borderTop>
  <Switch
    label="Hide &quot;Extended thinking&quot;"
    checked={settings.hideThinking}
    onchange={(v) => update('hideThinking', v)}
  />
  <div class="mt-2">
    <Switch
      label="Hide top-left model picker"
      checked={settings.hideTopPicker}
      onchange={(v) => update('hideTopPicker', v)}
    />
  </div>
</Section>

<Section borderTop>
  <Switch
    label="Enable Projects button (experimental)"
    checked={settings.enableProjects}
    onchange={(v) => update('enableProjects', v)}
  />
</Section>

<Section title="Data Management" borderTop>
  <div class="flex gap-2">
    <Button onclick={handleExport} dataAction="export-data">Export JSON</Button>
    <Button
      onclick={() => document.getElementById('cgpt-import-file')?.click()}
      dataAction="import-data">Import JSON</Button
    >
  </div>
  <input
    type="file"
    id="cgpt-import-file"
    style="display:none"
    accept=".json"
    onchange={handleImport}
  />
</Section>

<Section borderTop>
  <Button onclick={handleResetInput} dataAction="reset-input"
    >Reset input size</Button
  >
  <div class="mt-2 text-xs text-white/55">
    Input can be resized using the 3-dot handle above it.
  </div>
</Section>
