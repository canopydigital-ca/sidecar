import { DOCK_ID, INPUT_HANDLE_ID, INPUT_MIN, INPUT_MAX, FLAGS } from "../../core/constants";
import { clamp, safeInsertAdjacent } from "../../core/dom";
import { state } from "../../core/state";
import { PerfTracker } from "../composer/find";
import { updateSettings } from "../settings/storage";

export function ensureInputResizeHandle(
    findComposerAnchor: (track?: PerfTracker) => { anchor: Element; parent: Element } | null,
    findComposerResizeTarget: (track?: PerfTracker) => Element | null,
    track?: PerfTracker
) {
    const dock = document.getElementById(DOCK_ID);
    if (!dock || !dock.parentElement) return false;

    let handle = document.getElementById(INPUT_HANDLE_ID);

    // Reconciliation: handle should be strictly before dock
    if (handle && handle.nextElementSibling === dock) {
        return true;
    }

    if (!handle) {
        handle = document.createElement("div");
        handle.id = INPUT_HANDLE_ID;
        handle.innerHTML = `<div class="cgpt-dots" aria-hidden="true"><span></span><span></span><span></span></div>`;

        let startY = 0;
        let startH = 0;
        let currentHeight = 0;

        const onMove = (ev: PointerEvent) => {
            const el = findComposerResizeTarget(track);
            if (!el) return;
            const dy = startY - ev.clientY;
            currentHeight = clamp(startH + dy, INPUT_MIN, INPUT_MAX);

            // Apply directly for smoothness
            document.documentElement.classList.remove(FLAGS.inputCollapsed);
            (el as HTMLElement).style.setProperty("height", `${currentHeight}px`, "important");
            (el as HTMLElement).style.setProperty("min-height", `${INPUT_MIN}px`, "important");
            (el as HTMLElement).style.setProperty("max-height", "none", "important");
            (el as HTMLElement).style.resize = "none";

            // Sync pressed states locally
            const btn = document.querySelector(`#${DOCK_ID} button[data-action="inputToggle"]`);
            if (btn) btn.setAttribute("aria-pressed", "false");
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove as any, true);
            window.removeEventListener("pointerup", onUp, true);
            
            // Persist final state
            if (currentHeight > 0) {
                updateSettings({
                    ui: {
                        inputCollapsed: false,
                        inputHeight: currentHeight,
                        inputHeightExpanded: currentHeight
                    }
                });
            }
        };

        handle.addEventListener("pointerdown", (ev) => {
            const el = findComposerResizeTarget(track);
            if (!el) return;
            try {
                handle!.setPointerCapture(ev.pointerId);
            } catch { }
            startY = ev.clientY;
            startH = el.getBoundingClientRect().height || INPUT_MIN;
            currentHeight = startH;

            window.addEventListener("pointermove", onMove as any, true);
            window.addEventListener("pointerup", onUp, true);
        });
    }

    // Insert ABOVE the dock (before it)
    if (!safeInsertAdjacent(dock, "beforebegin", handle)) {
        return false;
    }

    return true;
}
