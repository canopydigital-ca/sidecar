import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import PetsPopover from '@runtime/ui/components/popovers/PetsPopover.svelte';

const petsLayerMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  setSettings: vi.fn(),
  throwBall: vi.fn(),
}));

const settingsMock = vi.hoisted(() => {
  const defaultSettings = {
    version: 3,
    enabled: false,
    renderer: 'webview',
    placementMode: 'dock-overlay',
    scale: 1,
    opacity: 0.6,
    maxPets: 1,
    speed: 1,
    clickThrough: true,
    pauseWhenTyping: true,
    pauseOnInactivity: true,
    reducedMotionMode: 'auto',
    debug: false,
    vendorEnabled: false,
    petType: 'snake',
    petColor: 'green',
    backgroundMode: 'transparent',
    backgroundTheme: null,
    hideVendorUi: true,
  };

  return {
    defaultSettings,
    loadPetSettings: vi.fn(async () => defaultSettings),
    savePetSettings: vi.fn(async () => {}),
    savePetSettingsDebounced: vi.fn(),
    watchPetSettings: vi.fn(() => vi.fn()),
    resetPetSettings: vi.fn(async () => {}),
    migratePetSettings: vi.fn((raw) => ({ ...defaultSettings, ...(raw ?? {}) })),
  };
});

vi.mock('@runtime/pets/layer/PetsLayer', () => ({
  PetsLayer: {
    getInstance: () => petsLayerMock,
  },
}));

vi.mock('@runtime/pets/core/settings', () => ({
  BACKGROUND_MODE_NOTE: 'Background mode note',
  DEFAULT_PET_SETTINGS: settingsMock.defaultSettings,
  loadPetSettings: settingsMock.loadPetSettings,
  migratePetSettings: settingsMock.migratePetSettings,
  savePetSettings: settingsMock.savePetSettings,
  savePetSettingsDebounced: settingsMock.savePetSettingsDebounced,
  watchPetSettings: settingsMock.watchPetSettings,
  resetPetSettings: settingsMock.resetPetSettings,
}));

describe('PetsPopover', () => {
  let target: HTMLElement;
  let onClose: () => void;
  let app: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
    onClose = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (app) unmount(app);
    app = undefined;
    document.body.innerHTML = '';
  });

  async function mountPopover() {
    app = mount(PetsPopover, { target, props: { onClose } });
    await Promise.resolve();
    await tick();
  }

  it('renders the current pets settings panel', async () => {
    await mountPopover();

    expect(target.querySelector('h4')?.textContent).toContain('Pets Overlay');
    expect(target.textContent).toContain('Enabled');
    expect(target.textContent).toContain('Renderer');
    expect(target.querySelector('[data-action="throw-ball"]')).toBeTruthy();
  });

  it('loads settings and applies them to the pets layer', async () => {
    await mountPopover();

    expect(petsLayerMock.initialize).toHaveBeenCalled();
    expect(settingsMock.loadPetSettings).toHaveBeenCalled();
    expect(petsLayerMock.setSettings).toHaveBeenCalledWith(settingsMock.defaultSettings);
    expect(settingsMock.watchPetSettings).toHaveBeenCalled();
  });

  it('persists direct setting changes', async () => {
    await mountPopover();

    const enabledToggle = target.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(enabledToggle).toBeTruthy();

    enabledToggle!.checked = true;
    enabledToggle!.dispatchEvent(new Event('change', { bubbles: true }));
    await tick();

    expect(settingsMock.savePetSettings).toHaveBeenCalledWith({ enabled: true });
  });

  it('forwards throw-ball actions to the pets layer', async () => {
    await mountPopover();

    target
      .querySelector<HTMLButtonElement>('[data-action="throw-ball"]')!
      .click();

    expect(petsLayerMock.throwBall).toHaveBeenCalled();
  });
});
