# Sidecar Extension Add-On Pages Pack (v0.1.0)

This pack gives you ready-to-drop **extension pages** + **store/github link wiring** for a Core + Fun Pack distribution.

## What you get
- `extension_pages/welcome.html` (+ css/js) - a "Welcome / Install" page with Core + Fun Pack CTAs
- `extension_pages/privacy.html` - template privacy policy page (edit to match reality)
- `extension_pages/permissions.html` - permissions rationale page (store-friendly)
- `extension_pages/changelog.html` - placeholder changelog page
- `extension_pages/links.json` - single source of truth for store/github/site URLs
- `background/onInstalledOpenWelcome.mv3.js` - MV3 service worker snippet to open Welcome on install
- `background/onInstalledOpenWelcome.mv2.js` - MV2 variant (optional)

## Integration checklist (MV3-first)
1) Copy these folders into your repo (or merge them):
   - `extension_pages/`
   - `background/`

2) Set real URLs in `extension_pages/links.json`:
   - chrome/edge store Core & Fun Pack
   - GitHub repo URL
   - site URL is preset to https://sidecar.canopydigital.ca/

3) Ensure your `manifest.json` includes the extension pages in the build output.
   - If you're bundling, you may need to copy `extension_pages/**` as static assets.

4) Add the MV3 snippet:
   - Import or paste `background/onInstalledOpenWelcome.mv3.js` into your service worker entry.

5) Optional: add a menu entry in your extension UI:
   - Open `chrome.runtime.getURL('extension_pages/welcome.html')`

## Notes
- The pages are self-contained and do not depend on any framework.
- The copy assumes Core is recommended and the Fun Pack is optional, as requested.
- Update privacy wording to match what your extension actually does.
