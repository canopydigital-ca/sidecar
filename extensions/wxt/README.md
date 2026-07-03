# Sidecar WXT

WXT-native Sidecar build for ChatGPT.

## Status

- `extensions/wxt` is the build you should install and use.
- `extensions/sidecar` is the frozen legacy build kept as a parity reference.

## Features (Parity Target)

- Dock UI with configurable items
- Sidebar toggle + sidebar width persistence
- Wide mode
- Input resize handle + input collapse/restore
- Code block enhancements (collapse + HTML previews)
- Prompts library + recent prompts history
- Status bar (token/word count + cost estimate)
- Model picker UX (pill trigger + top model picker suppression)
- Fonts picker (system + Google Fonts)
- Optional: Pets + ProgressQuest addons

## Dev Workflow

`bun run dev` uses WXT's manual runner on purpose. In this workspace, Chromium drops the CDP session during `Extensions.loadUnpacked`, so the built-in `web-ext-run` launch path is not reliable enough to be the default.

Default flow:

```powershell
bun run dev
```

That command:

- starts the Edge-targeted WXT dev watcher
- waits for the first unpacked build
- opens Edge with the unpacked extension loaded
- boots through a short local redirect page before navigating to ChatGPT, which gives WXT dev mode time to register its runtime content scripts before the ChatGPT tab loads

By default the launcher picks the profile mode automatically:

- if Edge is not already running, it reuses your normal Edge profile so your existing ChatGPT login is available
- if Edge is already running, it falls back to `extensions/wxt/.wxt/manual-profiles/edge` so the unpacked extension still loads reliably

If ChatGPT opens without the dock while using the isolated Sidecar profile, the usual reason is that this dev profile is not signed into ChatGPT yet.

If you only want the watcher without opening Edge, use:

```powershell
bun run dev:watch
```

If you want to validate the migrated runtime on a local HTML page with a ChatGPT-like composer instead of the live host, use:

```powershell
bun run dev:demo
```

That command:

- starts a local demo host at `http://localhost:4173/c/demo-thread`
- serves one HTML shell for `/`, `/c/<thread>`, and `/project/<project>/c/<thread>`
- starts the normal WXT Edge watcher
- opens Edge directly to the local demo route so the real extension content script mounts against the demo DOM

If you only want the demo page without starting WXT, use:

```powershell
bun run demo:host
```

If you need to reopen the browser against the current build without restarting WXT, use:

```powershell
bun run open:edge
```

If you want to reuse your normal Edge login instead of the dedicated Sidecar dev profile, opt into the system-profile mode:

```powershell
$env:WXT_EDGE_PROFILE_MODE = "system"
bun run dev
```

You can also target a non-default Edge profile in that mode:

```powershell
$env:WXT_EDGE_PROFILE_MODE = "system"
$env:WXT_EDGE_PROFILE_DIRECTORY = "Profile 2"
bun run open:edge
```

If you want to force the dedicated Sidecar dev profile, use:

```powershell
$env:WXT_EDGE_PROFILE_MODE = "isolated"
bun run dev
```

You can also disable the startup redirect delay if you need raw startup behavior:

```powershell
$env:WXT_EDGE_NAVIGATION_DELAY_MS = "0"
bun run open:edge
```

The unpacked dev build lives in `extensions/wxt/.output/edge`.

The local demo page lives in `extensions/wxt/demo/index.html`, and the current source audit summary lives in `extensions/wxt/AUDIT.md`.

If you need to re-check the upstream browser runner, use:

```powershell
bun run dev:web-ext
```

That opt-in path sets `WXT_USE_WEB_EXT=1` and uses WXT's normal web-ext-backed browser launch.

## Install (Build + Load Unpacked)

Build the extension:

```powershell
cd B:\Dev\sidecar\extensions\wxt
bun install
bun run build
```

Then load the appropriate output folder in your browser:

- Edge: `B:\Dev\sidecar\extensions\wxt\.output\edge`
- Chrome: `B:\Dev\sidecar\extensions\wxt\.output\chrome`
- Firefox: `B:\Dev\sidecar\extensions\wxt\.output\firefox`
