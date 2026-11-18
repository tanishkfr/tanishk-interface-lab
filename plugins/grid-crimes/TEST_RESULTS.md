# Test and QA results

Run date: 2026-11-18. Environment: Windows, Node v24.13.0, pnpm 11.24.0, Playwright Chromium 1.63.

## Automated

| Check | Command | Result |
|---|---|---|
| TypeScript | `pnpm run typecheck` | **PASS** |
| Engine + adapter tests | `pnpm run test` | **35 / 35 PASS** |
| Production build | `pnpm run build` | **PASS** — `dist/code.js` 220.9 kB, `dist/ui.html` 204.3 kB |
| Browser UI QA | `pnpm run qa` | **9 / 9 PASS** |
| Next.js typecheck | `pnpm run typecheck` at repo root | **PASS** |
| Next.js lint | `pnpm run lint` at repo root | **PASS** |
| Next.js production build | `pnpm run build` at repo root | **PASS** |
| Site axe + visual QA | `node qa/site-grid-crimes.mjs` | **4 / 4 PASS**, 0 serious/critical axe findings |

The 35 tests cover all six presets × eight fixtures, 24 grammars, deterministic seeds, four-variation diversity, aspect ratios, narrow portraits, long headlines, dense layouts, role overrides, controlled overlap, crossbreed inheritance/reproducibility/compatibility, request validation, metadata round-trips, placement, mock Figma selection analysis, mock cloning with original-preservation assertions, font-loading failure, and single-element compositions.

The 9 UI QA cases cover:

- results, configure, crossbreed and help at 440 px;
- light and dark colour schemes;
- 340 px and 680 px widths;
- reduced-motion mode;
- keyboard navigation between direction tiles;
- axe serious/critical checks;
- real image loading and horizontal-overflow checks.

Visual evidence is written to `qa/grid-crimes/` (ignored by git) and product-facing captures to `public/products/grid-crimes/`.

## Browser vs Figma

The UI QA runs the **shipped `dist/ui.html`** in Chromium against a small mock host and real engine plans. It verifies layout, interaction, contrast and accessibility in a browser. It does **not** verify Figma's native node rendering, font loading, instance cloning, image cropping or undo.

## Native Figma QA: PENDING

No Figma test environment is available in this workspace. The local development build has not been claimed as natively verified. Use the checklist in `README.md` before any publication. Record actual results and screenshots from Figma desktop.
