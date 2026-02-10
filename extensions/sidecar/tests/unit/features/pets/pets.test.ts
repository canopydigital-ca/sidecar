import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import PetsPopover from '../../../../src/ui/components/popovers/PetsPopover.svelte';

describe('PetsPopover', () => {
    let target: HTMLElement;
    let onClose: () => void;
    let app: any;

    beforeEach(() => {
        target = document.createElement('div');
        document.body.appendChild(target);
        onClose = vi.fn();
        
        // Mock chrome.runtime.getURL
        global.chrome = {
            runtime: {
                getURL: vi.fn().mockReturnValue('mock-pets-host.html')
            }
        } as any;

        (global as any).ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    });

    afterEach(() => {
        if (app) unmount(app);
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('should render iframe with correct URL', () => {
        app = mount(PetsPopover, { target, props: { onClose } });
        
        const iframe = target.querySelector('iframe');
        expect(iframe).toBeTruthy();
        expect(iframe?.src).toContain('mock-pets-host.html');
    });

    it('should send messages to iframe', async () => {
        app = mount(PetsPopover, { target, props: { onClose } });
        await tick();
        const iframe = target.querySelector('iframe')!;
        
        // Mock contentWindow.postMessage
        const postMessageSpy = vi.fn();
        Object.defineProperty(iframe, 'contentWindow', {
            value: {
                postMessage: postMessageSpy
            },
            writable: true
        });

        // Trigger spawn button
        const spawnBtn = Array.from(target.querySelectorAll('button')).find(b => b.textContent?.includes('Spawn Cat'));
        expect(spawnBtn).toBeTruthy();
        if (spawnBtn) {
             spawnBtn.click();
        }
        await tick();

        expect(postMessageSpy).toHaveBeenCalledWith({
            __dockToPets: {
                command: 'spawn-pet',
                type: 'cat',
                color: 'brown'
            }
        }, '*');
    });

    it('should handle incoming messages', async () => {
        const logSpy = vi.spyOn(console, 'log');
        
        app = mount(PetsPopover, { target, props: { onClose } });
        await tick();

        // Simulate message
        const event = new MessageEvent('message', {
            data: {
                __vscodePets: { event: 'pet-spawned' }
            }
        });
        window.dispatchEvent(event);
        await tick();

        expect(logSpy).toHaveBeenCalledWith('[Dock] Received pet event:', { event: 'pet-spawned' });
    });
});
