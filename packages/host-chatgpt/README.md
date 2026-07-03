# Sidecar Host Adapter

ChatGPT-specific host wiring for the WXT extension.

- This package is the WXT-facing entry to boot the shared runtime on ChatGPT hosts.
- Host-specific probing and DOM integration should move behind this surface as the migration continues.
- `src/selectors.ts` owns the ChatGPT selector catalog used by the adapter.
- `src/adapter.ts` is now the shared host seam for composer/model/scroll-container/sidebar/history/menu discovery used by the WXT runtime boot path.
