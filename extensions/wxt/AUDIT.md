# Sidecar WXT Audit

This audit ignores tests on purpose and focuses on source alignment between the frozen legacy extension in `extensions/sidecar` and the WXT-native build in `extensions/wxt`.

## Current State

- `packages/runtime/src` is the functional runtime source for the WXT build and is largely a direct extraction of the original Sidecar source tree.
- `packages/host-chatgpt/src` now owns the active ChatGPT selector catalog and host adapter implementation used by WXT.
- `extensions/wxt/src/entrypoints/chatgpt-dock.content/index.ts` is the real ChatGPT boot path.
- `extensions/wxt/src/entrypoints/demo-dock.content/index.ts` is the local demo boot path for a controlled host page with a ChatGPT-shaped composer DOM.

## Local Demo Host

- `extensions/wxt/demo/index.html` is a repo-owned demo page with:
  - a ChatGPT-like sidebar shell
  - a thread history list with per-thread options buttons
  - a header model picker button
  - a conversation scroll surface
  - a composer with `#prompt-textarea`, `form.group/composer`, and `#thread-bottom-container`
- `extensions/wxt/scripts/demo-host.ts` serves that page for `/`, `/c/<thread>`, and `/project/<project>/c/<thread>`.
- `extensions/wxt/scripts/dev-demo.ts` starts the demo host, then starts the normal WXT Edge dev flow with `WXT_START_URL` pointed at the local demo conversation route.

## Source Alignment Notes

- WXT no longer depends on imports from `extensions/sidecar/src`.
- The demo host uses the same migrated runtime and ChatGPT host adapter seam instead of a second demo-only runtime.
- The frozen legacy extension remains untouched and is still the parity reference.

## Remaining Non-Test Gaps

- Some ChatGPT DOM knowledge still lives in `packages/runtime/src/core/registry.ts` and `packages/runtime/src/core/discovery.ts`.
- A few runtime features still rely on raw DOM patterns instead of a pure host-adapter API.
- The local demo host validates mounting and interactive flows, but it is still a controlled environment and not a replacement for live `chatgpt.com` validation.
