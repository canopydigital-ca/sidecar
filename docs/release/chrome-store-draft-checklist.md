# Chrome Store Draft Checklist

Target package: `B:\Dev\sidecar\extensions\wxt\release\artifacts\sidecar-v0.6.0-chrome-mv3-full.zip`

## Pre-Upload Checks

- Run `bun run package:release` from `B:\Dev\sidecar\extensions\wxt`.
- Confirm `B:\Dev\sidecar\extensions\wxt\release\manifest.json` lists Chrome MV3 `v0.6.0`.
- Confirm `B:\Dev\sidecar\extensions\wxt\release\SHA256SUMS.txt` includes the Chrome ZIP.
- Inspect the ZIP and confirm it contains only store entrypoints, not `demo-dock`.
- Confirm the manifest contains no `localhost` or `127.0.0.1` matches.
- Confirm no `.env.local`, store credential, or private token is present.

## Listing Assets

- Desktop screenshot: `B:\Dev\sidecar\output\playwright\sidecar-site-home-desktop.png`
- Mobile screenshot: `B:\Dev\sidecar\output\playwright\sidecar-site-home-mobile.png`
- Store demo screenshot: `B:\Dev\sidecar\output\playwright\sidecar-store-demo-1280x800.png`
- Social image: `B:\Dev\sidecar\web\static\images\social-preview.png`

## Permission Rationale

- `storage`: persists Sidecar dock settings, prompts, fonts, status bar preferences, Pets, and ProgressQuest state.
- `https://game-icons.net/*`: fetches release-surface icon assets used by Pets and ProgressQuest.

## Manual Smoke

- Load the unpacked Chrome MV3 build from `B:\Dev\sidecar\extensions\wxt\.output\chrome`.
- Open ChatGPT and verify the Sidecar dock mounts.
- Toggle open/close.
- Resize the sidebar and reload to confirm persistence.
- Toggle wide mode.
- Exercise model picker UX.
- Exercise prompt selection.
- Check font settings and status bar.
- Open Pets and ProgressQuest.
- Confirm there are no obvious console errors.

## Submit Gate

Do not submit automatically from this repo. Submission requires owner-approved Chrome Web Store access and a final review of listing copy, screenshots, permissions, and privacy answers.
