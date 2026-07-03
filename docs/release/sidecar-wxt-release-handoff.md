# Sidecar WXT Release Handoff

Release target: Sidecar `v0.6.0` full WXT build for Chrome, Edge, and Firefox.

Canonical site: `https://sidecar.canopydigital.ca`

Status: draft-ready artifact lane. Git push, website deploy, Chrome Web Store upload, and store submission are intentionally gated until credentials and owner approval are present.

## Scope

This pass ships only the full WXT build:

- Chrome MV3 full build
- Edge MV3 full build
- Firefox MV2 full build

Deferred tracks:

- light variants, because Pets and ProgressQuest are currently included in the full release surface
- Pixel Agents, because it needs a separate WXT addon merge plus permission and privacy review
- automatic `wxt submit` / Chrome Web Store publishing

## Recovered Artifact Lineage

Use the recovered ChatGPT dock archive as Sidecar evidence, not the Pixel Agents overlay archive:

- relevant recovered Sidecar seed: `B:\Temp\@Browser\sidecar-chatgpt-dock-v0.2.6-recovered.zip`
- extracted inspection copy: `B:\Temp\@Browser\sidecar-zip-inspect\v0.2.6-recovered`
- older repo-history naming may include `pixel-agents-chatgpt-dock-v0.2.5.zip`, but the product target is the Sidecar ChatGPT dock / WXT extension line
- `pixel-agents-ai-overlay-v0.6.21.zip` is a Pixel Agents overlay artifact and should stay on the separate experimental addon merge track

The v0.2.6 recovered archive is explicitly not byte-identical to a prior sandbox download. Its root `content.css` describes a fixed side-panel UI (`#sidecar-dock`) rather than the compact horizontal dock shown in the canonical February screenshot at `B:\Dev\sidecar\web\static\Screenshot 2026-02-07 060040.png`.

For the WXT `v0.6.0` release, keep the compact horizontal dock as the visual baseline. Use the v0.2.6 recovered archive as a feature checklist for prompt capture/staging, macros, history, code tools, title stripping, cross-tab presence, and optional bridge behavior.

## Release Commands

Run from `B:\Dev\sidecar\extensions\wxt`:

```powershell
bun run check
bunx wxt build -b chrome -e background -e chatgpt-dock
bunx wxt build -b edge -e background -e chatgpt-dock
bunx wxt build -b firefox -e background -e chatgpt-dock
bun run package:release
```

`bun run package:release` runs deterministic release packaging for all target browsers. It builds explicit entrypoints, validates store manifests, writes ZIP files, and updates checksum/proof files.

Run from `B:\Dev\sidecar\extensions\wxt`:

```powershell
bun run test:unit    # vitest unit tests against packages/runtime
bun run test:e2e     # Playwright: demo-host + parity harness
```

If the harness port is already occupied, override it with `SIDECAR_HARNESS_PORT`.

Run from `B:\Dev\sidecar\web`:

```powershell
npm run check
npm run build
npm run preview
```

Screenshot capture commands, from `B:\Dev\sidecar\web` while preview is running:

```powershell
npx playwright screenshot --browser chromium --viewport-size "1440,1100" --wait-for-timeout 1200 http://127.0.0.1:4173 ..\output\playwright\sidecar-site-home-desktop.png
npx playwright screenshot --browser chromium --viewport-size "390,844" --wait-for-timeout 1200 http://127.0.0.1:4173 ..\output\playwright\sidecar-site-home-mobile.png
npx playwright screenshot --browser chromium --viewport-size "1440,1100" --wait-for-timeout 1200 http://127.0.0.1:4173/downloads ..\output\playwright\sidecar-downloads-desktop.png
npx playwright screenshot --browser chromium --viewport-size "1280,800" --wait-for-timeout 4000 http://127.0.0.1:4173/demo ..\output\playwright\sidecar-store-demo-1280x800.png
npx playwright screenshot --browser chromium --viewport-size "1200,630" --wait-for-timeout 1200 http://127.0.0.1:4173 static\images\social-preview.png
```

## Artifact List

WXT release proof:

- `B:\Dev\sidecar\extensions\wxt\release\manifest.json`
- `B:\Dev\sidecar\extensions\wxt\release\SHA256SUMS.txt`

Generated ZIPs:

- `B:\Dev\sidecar\extensions\wxt\release\artifacts\sidecar-v0.6.0-chrome-mv3-full.zip`
- `B:\Dev\sidecar\extensions\wxt\release\artifacts\sidecar-v0.6.0-edge-mv3-full.zip`
- `B:\Dev\sidecar\extensions\wxt\release\artifacts\sidecar-v0.6.0-firefox-mv2-full.zip`

Latest SHA-256 proof from this pass:

```text
4cf9db36839a912b2d2710022a1ecf192e8ea89ff8db995541cfdcb965f23f2d  artifacts/sidecar-v0.6.0-chrome-mv3-full.zip
4cf9db36839a912b2d2710022a1ecf192e8ea89ff8db995541cfdcb965f23f2d  artifacts/sidecar-v0.6.0-edge-mv3-full.zip
28a5dea5d3d0ba086ae5acaca50cddb295b357d197dc145ce033c7837eb083e3  artifacts/sidecar-v0.6.0-firefox-mv2-full.zip
```

Screenshot proof:

- `B:\Dev\sidecar\output\playwright\sidecar-site-home-desktop.png`
- `B:\Dev\sidecar\output\playwright\sidecar-site-home-mobile.png`
- `B:\Dev\sidecar\output\playwright\sidecar-downloads-desktop.png`
- `B:\Dev\sidecar\output\playwright\sidecar-store-demo-1280x800.png`
- `B:\Dev\sidecar\web\static\images\social-preview.png`

## Verification Results

Current proof run: July 2, 2026.

- `B:\Dev\sidecar\extensions\wxt`: `bun run check` passed with 0 Svelte diagnostics.
- `B:\Dev\sidecar\extensions\wxt`: `bun run package:release` passed and rebuilt Chrome, Edge, and Firefox ZIPs. The `demo-dock` skipped warning is expected because store packages filter to `background` and `chatgpt-dock`.
- `B:\Dev\sidecar\extensions\wxt`: `bun run test:unit` (vitest) and `bun run test:e2e` (Playwright: demo-host + parity harness) passed.
- `B:\Dev\sidecar\web`: `npm run check` passed with 0 Svelte diagnostics.
- `B:\Dev\sidecar\web`: `npm run build` passed. Remaining warnings are stale Browserslist data and `lottie-web` eval usage.
- Playwright screenshots were captured for desktop home, mobile home, downloads, store demo, and social preview. The store demo screenshot was visually inspected after the demo dock icon fix.

Visual parity follow-up:

- `B:\Dev\sidecar\extensions\wxt`: `bun run check` passed with 0 Svelte diagnostics after removing the local dock fallback styles that overrode canonical bordered button visuals.
- `B:\Dev\sidecar\extensions\wxt`: `bunx wxt build -b edge -e background -e chatgpt-dock` passed. The `demo-dock` skipped warning is expected for explicit store entrypoints.
- `B:\Dev\sidecar\extensions\wxt`: `bun ./scripts/assert-style-parity.ts --browser edge` passed, including a guard against reintroducing transparent/borderless local dock button overrides.
- `B:\Dev\sidecar\extensions\wxt`: unit + parity/demo-host e2e suites passed (migrated in from the retired legacy build).

## Manifest Assertions

The release packager checks each built manifest before ZIP creation:

- version matches `extensions/wxt/package.json`
- Chrome and Edge are MV3
- Firefox is MV2
- only `background` and `chatgpt-dock` entrypoints are built for store packages
- no `demo-dock` entrypoint is present
- no `localhost` or `127.0.0.1` production match is present
- Chrome and Edge permissions are `storage`
- Chrome and Edge host permissions are `https://game-icons.net/*`
- Firefox permissions include `storage` and `https://game-icons.net/*`

## Chrome Store Draft Checklist

- ZIP: `B:\Dev\sidecar\extensions\wxt\release\artifacts\sidecar-v0.6.0-chrome-mv3-full.zip`
- Version: `0.6.0`
- Store listing screenshots:
  - `B:\Dev\sidecar\output\playwright\sidecar-site-home-desktop.png`
  - `B:\Dev\sidecar\output\playwright\sidecar-site-home-mobile.png`
  - `B:\Dev\sidecar\output\playwright\sidecar-store-demo-1280x800.png`
- Social preview source: `B:\Dev\sidecar\web\static\images\social-preview.png`
- Permission rationale:
  - `storage`: persists dock width, display settings, prompt settings, Pets, and ProgressQuest state
  - `https://game-icons.net/*`: loads icon assets used by the ProgressQuest/Pets release surface
- Privacy notes:
  - no secrets or store credentials are committed
  - no automatic publishing is configured in this repo
  - store URLs stay disabled/coming-soon until confirmed production listing URLs exist
- Rollback:
  - remove draft upload from Chrome Web Store dashboard if not submitted
  - rebuild from the previous tagged release if a submitted package needs rollback

## Website Notes

The website now reads the extension version from `extensions/wxt/package.json` at build time. Download copy is aligned to full WXT artifacts and placeholder source/store links are disabled rather than pointing to fake URLs.

Only wired locales ship for this release:

- `en`
- `es`

The public demo uses a local website-only dock mock, so the SvelteKit site does not compile extension-only Chrome APIs.

## Known Limitations

- No git remote is configured in this checkout, so push and PR creation are blocked until a remote is added.
- Chrome Web Store upload/submission is not attempted; credentials are intentionally outside the repo.
- Website deployment is not attempted; deployment target credentials are intentionally outside the repo.
- `lucide-svelte` is deprecated upstream and should be migrated to `@lucide/svelte` in a dependency cleanup pass.
- The website build reports a `lottie-web` eval warning and stale Browserslist data. These do not block the current draft package but should be handled before a long-lived public release.
- Dependency audit remediation is still a follow-up; do not run broad audit fixes inside release packaging without reviewing SvelteKit/Vite compatibility.

## Next Plan Prompts

Use these as follow-on handoff prompts after this draft lane is accepted:

1. "Implement the Pixel Agents WXT addon merge as an experimental module, preserve OBS/INF/SIM evidence semantics, and produce a separate permission/privacy review before store inclusion."
2. "Implement Sidecar light variants in WXT by gating Pets and ProgressQuest assets, then add package-release coverage for full and light artifact families."
3. "Prepare the Chrome Web Store draft upload from the v0.6.0 full Chrome ZIP, using the release screenshots and permission rationale, without committing credentials."
4. "Wire the confirmed GitHub release URL and Chrome/Edge/Firefox store URLs into the website, then run check/build and screenshot verification."
5. "Audit `B:\Temp\@Browser\sidecar-chatgpt-dock-v0.2.6-recovered.zip` against WXT behavior and port only missing Sidecar features: prompt macro registry, cross-tab presence count, optional read-only local bridge polling, and ArrowUp recent-prompt staging."
