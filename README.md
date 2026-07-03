# Sidecar

Sidecar is a browser extension that adds a productivity dock to ChatGPT: popover tools (prompts library, settings, fonts, emoji, game icons), wide mode, an input resize handle, code-block enhancements, a token/cost status bar, model-picker UX improvements, and optional Pets + ProgressQuest addons.

Canonical site: <https://sidecar.canopydigital.ca>

## Repository layout

| Path | What it is |
|---|---|
| `extensions/wxt` | **The active extension** — WXT-native build (Chrome MV3, Edge MV3, Firefox MV2). Install and develop here. |
| `extensions/sidecar` | Frozen legacy single-browser build, kept as the canonical visual-parity reference and test harness. Do not develop here. |
| `packages/runtime` | Shared extension runtime (dock, popovers, features, UI) extracted from the legacy source. |
| `packages/host-chatgpt` | ChatGPT host adapter: selector catalog, composer-anchor resolution, DOM discovery. |
| `packages/ui`, `packages/addons`, `packages/icons` | Shared UI surface, addon seams (Pets/ProgressQuest), icon data. |
| `packages/php` | Static-PHP SvelteKit adapter used by the website build. |
| `web` | SvelteKit marketing site (i18n, SEO pages, interactive demo). |
| `docs/release` | Release handoff + store submission checklists. |
| `pixelagents` | Deferred experimental track (untracked); future WXT addon merge. |

## Quick start

```powershell
# Extension (bun)
cd extensions/wxt
bun install
bun run dev          # WXT manual-runner dev flow (see extensions/wxt/README.md)
bun run check        # svelte-check
bun run package:release  # build + validate + zip Chrome/Edge/Firefox artifacts

# Legacy parity tests
cd extensions/sidecar
bun run test:unit
bunx playwright test tests/e2e/wxt-parity.spec.ts

# Website (npm)
cd web
npm ci
npm run check && npm run build
```

Release artifacts land in `extensions/wxt/release/artifacts/` (gitignored) with checksums and a release manifest committed at `extensions/wxt/release/`. See `docs/release/sidecar-wxt-release-handoff.md` for the full release procedure and store submission gates.

## Architecture notes

- The content script uses `cssInjectionMode: 'manual'`: built CSS is fetched at runtime and split so only intentional page effects reach the ChatGPT document, while the Tailwind/Svelte UI stays inside shadow roots. `extensions/wxt/scripts/assert-style-parity.ts` gates this at build time.
- Tailwind v4 scans `packages/runtime/src` via an `@source` directive in `packages/runtime/src/ui/app.css` — without it, popover utility classes silently vanish from the build.
- Store builds include only the `background` and `chatgpt-dock` entrypoints; `demo-dock` and localhost matches are dev-only and asserted absent from release manifests.
