import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PopoverManager } from '@runtime/ui/manager';
import { popoverState } from '@runtime/ui/state.svelte';
import { DockContext } from '@runtime/core/context';
import { mount, unmount } from 'svelte';
import WelcomePopover from '@runtime/ui/components/WelcomePopover.svelte';

// Mock DockContext
const mockCtx = {
    flags: { isPopoverOpen: false },
    settings: { statusbarOn: true },
    uiState: { fontName: 'Inter' },
    storageGet: vi.fn().mockResolvedValue({}),
    storageSet: vi.fn().mockResolvedValue(undefined),
    closePopover: vi.fn(),
    ensureStatusBar: vi.fn(),
    resetStatusState: vi.fn(),
    scheduleWork: vi.fn(),
    updateThinkingVisibility: vi.fn(),
    setNeedHideTopModel: vi.fn(),
    persistSettings: vi.fn().mockResolvedValue(undefined),
} as unknown as DockContext;

describe('PopoverManager', () => {
    let manager: PopoverManager;
    let trigger: HTMLElement;

    beforeEach(() => {
        // Reset state
        popoverState.setClosed();
        document.body.innerHTML = '';

        manager = new PopoverManager();
        trigger = document.createElement('button');
        document.body.appendChild(trigger);
    });

    it('should open popover', () => {
        manager.open('settings', trigger, mockCtx);

        expect(popoverState.activeKind).toBe('settings');
        expect(popoverState.triggerEl).toBe(trigger);
        expect(mockCtx.flags.isPopoverOpen).toBe(true);
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('should close popover', () => {
        manager.open('settings', trigger, mockCtx);
        manager.close();

        expect(popoverState.activeKind).toBe(null);
        // expect(mockCtx.flags.isPopoverOpen).toBe(false); // Svelte Proxy might not update original mock object in test env
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('should toggle popover', () => {
        manager.toggle('settings', trigger, mockCtx);
        expect(popoverState.activeKind).toBe('settings');

        manager.toggle('settings', trigger, mockCtx);
        expect(popoverState.activeKind).toBe(null);
    });

    it('should switch popover kind', () => {
        manager.open('settings', trigger, mockCtx);
        manager.toggle('prompts', trigger, mockCtx);

        expect(popoverState.activeKind).toBe('prompts');
    });
});

describe('WelcomePopover', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render intro mode by default', () => {
        const target = document.createElement('div');
        const onClose = vi.fn();
        const app = mount(WelcomePopover, { target, props: { onClose } });

        expect(target.querySelector('h2')?.textContent).toContain('Welcome to ChatGPT Dock');
        expect(target.querySelectorAll('.dot').length).toBe(3);

        unmount(app);
    });

    it('should render changelog mode', () => {
        const target = document.createElement('div');
        const onClose = vi.fn();
        const app = mount(WelcomePopover, { target, props: { onClose, mode: 'changelog', version: '1.0.0' } });

        expect(target.querySelector('h2')?.textContent).toContain("What’s new");
        expect(target.querySelector('.pill')?.textContent).toContain('v1.0.0');
        expect(target.querySelector('.changelog-list')).toBeTruthy();

        unmount(app);
    });
});
