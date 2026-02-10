import { clsMonitor } from "../core/cls";
import { ensureAll } from "../core/ensure";
import { ensureGlobalOverlay, getGlobalPortal } from "../ui/manager";
import { getSettings, resetSettingsCache } from "../features/settings/storage";
import { findComposerResizeTarget } from "../features/composer/find";
import { log } from "../core/log";
import { formatError } from "../core/errors";

export function legacyBoot() {
    // Start CLS monitoring
    clsMonitor.start();

    // Expose for debugging
    if (typeof window !== 'undefined') {
        (window as any).__cgpt_cls = clsMonitor;
    }

    function installSpaNavigationHooks() {
        const w = window as any;
        if (w.__cgpt_spa_nav_hooks_installed) return;
        w.__cgpt_spa_nav_hooks_installed = true;

        const fire = () => {
            void ensureAll("nav");
        };

        const patch = (method: "pushState" | "replaceState") => {
            const original = history[method];
            if (typeof original !== "function") return;
            history[method] = function (...args: any[]) {
                const res = original.apply(this, args as any);
                fire();
                return res;
            } as any;
        };

        patch("pushState");
        patch("replaceState");
        window.addEventListener("popstate", fire, true);
    }

    function installHostMutationHook() {
        const w = window as any;
        if (w.__cgpt_host_mutation_hook_installed) return;
        w.__cgpt_host_mutation_hook_installed = true;

        let lastHasComposer = !!findComposerResizeTarget();
        let scheduled = false;

        const tick = () => {
            scheduled = false;
            const hasComposer = !!findComposerResizeTarget();
            if (hasComposer !== lastHasComposer) {
                lastHasComposer = hasComposer;
                void ensureAll("mutation");
            }
        };

        const mo = new MutationObserver(() => {
            if (scheduled) return;
            scheduled = true;
            window.requestAnimationFrame(tick);
        });

        mo.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener("unload", () => mo.disconnect(), { once: true });
    }

    function installStorageChangeHook() {
        const w = window as any;
        if (w.__cgpt_storage_change_hook_installed) return;
        w.__cgpt_storage_change_hook_installed = true;

        if (!chrome?.storage?.onChanged?.addListener) return;

        const handler = (_changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
            if (areaName !== "sync" && areaName !== "local") return;
            resetSettingsCache();
            void getSettings();
            void ensureAll("storage_change");
        };

        chrome.storage.onChanged.addListener(handler);
        window.addEventListener("unload", () => chrome.storage.onChanged.removeListener(handler), { once: true });
    }

    async function safeStep(name: string, step: () => unknown | Promise<unknown>) {
        try {
            await step();
        } catch (err) {
            log.error(`Boot error in ${name}:`, formatError(err));
        }
    }

    async function boot() {
        await safeStep("getSettings", () => getSettings());
        await safeStep("ensureOverlay", () => ensureGlobalOverlay());
        await safeStep("mountOverlayRoot", () => {
            const { root } = ensureGlobalOverlay();
            const ui = (window as any).ChatGPTDockUI;
            if (ui?.mountOverlayRoot) ui.mountOverlayRoot(root);
        });
        await safeStep("popoverInit", () => (window as any).ChatGPTDockUI?.popoverManager?.init?.());
        await safeStep("ensureAll", () => ensureAll("startup"));
        await safeStep("installHooks", () => {
            installSpaNavigationHooks();
            installHostMutationHook();
            installStorageChangeHook();
        });
        await safeStep("bootRuntime", () => (window as any).ChatGPTDockUI?.bootRuntime?.());
    }

    void boot();
}
