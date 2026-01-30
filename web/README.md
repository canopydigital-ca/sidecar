# Sidecar Landing (SvelteKit) v0.1.3

- Stats + features are JSON-driven.
- Stats count up on first view (respects prefers-reduced-motion).
- Sections: Features, How it Works, Macros, Roadmap, Testimonials, Legal pages.

## Run
```bash
npm install
npm run dev -- --open
```

## Content knobs
- `src/lib/content/site.json` (GitHub URL + hero copy)
- `src/lib/content/stats.json` (numeric targets + suffix)
- `src/lib/content/macros.json` (macro/palette section)
- `src/lib/content/roadmap.json` (nice-to-have bullets)
