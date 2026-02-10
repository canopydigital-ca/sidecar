Goal: resilient/fast/non-invasive; survive React/Radix rerenders; no wrap/reparent; user-like events.
SemVer: bump PATCH (min) per prompt.
Build: Bun+TS -> dist/content.js (+map); __DEV define (guarded); no NODE_ENV; CI asserts no selftest strings.
DOM: Registry-only; prefer data-testid/#id/aria-label/href; avoid radix ids/Tailwind identity; fallbacks.
Observer: single debounced MutationObserver; waitFor(timeout); stop() cancels work.
Overlay: one Shadow root; root pointer-events:none; UI pointer-events:auto; popovers in-shadow, rect-pos.
Inject: IDs cgpt-*; insert siblings at stable anchors only. Dock order stable incl MODEL_SLOT+spacer; resize handle before dock.
Model menu: CSS-hide header selector (don't move/remove); dock/pill triggers click it.
Code: incremental enhance; collapse-all enhances first; keep native Copy code.
Recovery/perf/tests: on 'Extension context invalidated' -> dead flag, stop, dim, toast once; cap work; CI: typecheck+tests+build+verify.
