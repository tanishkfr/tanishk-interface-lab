# LAB/ V2 — local implementation and verification

Implemented on `codex/lab-v2-playground`. Production has not been deployed, replaced, or pushed. Changes remain in the local working tree for review. Preview: http://localhost:3300.

## What is implemented

An original warm-paper identity, self-hosted expressive variable typography, a draggable and keyboard-operable LAB wordmark, procedural exhibit artwork, paced editorial discovery, a gallery/index switch, search across 26 entries, category filters, and surprise navigation. Desktop, tablet, and phone use distinct arrangements with explicit gutters and protected text/control areas.

All seven new creations are explicitly labeled **Prototype · v0.1**. Their functionality is real, but the larger ambitions in the brief are not all represented as finished features.

| Creation | Working behavior | Exports | Current boundary |
| --- | --- | --- | --- |
| Data Matter | CSV import and validation, normalized value-to-height mapping, relief, rotation, paper/wire materials, accessible values | SVG; data/settings JSON | Fixed isometric SVG projection, not a freely orbitable 3D renderer or physical material simulation |
| Interface Genome | Density, hierarchy, navigation and composition rules; working story navigation, expansion and saved shelf; mutation history; five selectable preserved variants and comparison | Rules JSON | Rule-based generation, not an evolutionary optimization system; preservation is session-only; no application source-code export |
| Type Has Mass | Editable text, gravity, collision boxes, elasticity, lead/rubber behavior, dragging, keyboard movement, pause and reset | SVG with font embedded | Rigid glyphs with approximate collision bounds; no deformable outlines, folds, or animation/video export |
| Browser Terrarium | Planting, growth, food-seeking creatures, pointer response, sun/rain/night, pause and reset | PNG snapshot | An authored toy, not biology; ecosystem state lasts while the page is open |
| The Cost of a Click | Three framed demonstrations; defaults, interruptions, uneven exit friction; observations and reveal | Visit observations JSON | Illustrative scenarios and session timings, not a participant study or causal research claim |
| Motion Foundry | Physical spring sampling; move, scale and turn specimens; matched ease comparison; presets, timing and per-row stagger | Sampled translation CSS; raw spring settings JSON | Four predefined specimens, not a full timeline editor; short duration windows may show an unsettled spring; scale/turn previews are not exported as ready-made framework components |
| Vector Kitchen | Orbit/ribbon/petal primitives, divergence, count, spread, color, variation, save/load recipes, input validation | Editable SVG; reloadable recipe JSON | Browser instrument; no published Figma plugin or standalone download |

The original **19 component implementations and registry payload builders are unchanged**. Their URLs remain `/experiments/<slug>` and `/r/<slug>.json`. `/components` now houses their searchable catalog, previews, controls, install commands, usage, props, accessibility notes, dependencies, and source. Separate Experiments, Tools, and Products sections connect the ecosystem. Products accurately identifies Vector Kitchen as a browser prototype and includes its version and initial release notes.

## Verification evidence

- `pnpm test`: **25 passed**, including four new data/spring/vector tests.
- `pnpm lint`: passed without warnings.
- `pnpm typecheck`: passed; the production build also completed its TypeScript check.
- `pnpm build --webpack`: passed; **57 static pages generated**. Native Windows worker instability required bounded worker configuration and the Webpack build path in this environment.
- `scripts/verify-v2.mjs`: **10/10 end-to-end checks**, with download contents inspected and no browser errors. Includes all 19 original route/registry payloads, mobile navigation, and reduced motion. Results: `output/lab-v2/verification.json`.
- `scripts/inspect-v2.mjs`: **30 rendered captures**, covering ten surfaces at **1440 / 820 / 390 px**; HTTP 200 throughout, no page errors or horizontal overflow. Results: `output/lab-v2/inspection.json`.
- `scripts/audit-v2.mjs`: **zero automated WCAG A/AA violations** across the ten audited phone surfaces after contrast and slider-name fixes. Results: `output/lab-v2/accessibility.json`. This is an automated check, not a claim of exhaustive accessibility certification.
- Original `scripts/qa.mjs` walkthrough: completed with **no console errors, overflows, or registry problems**. Captures and video: `output/lab-v2/legacy-final/`.
- Clean consumer test: **6/6 representative components** installed through the real shadcn CLI; the independent consumer type-checked and built. Tested Signal Field, Evidence Carousel, Agent Review, Spatial Command, Adaptive Composer, and Soft Snap. The temporary fixture was `C:/Users/User/AppData/Local/Temp/lab-fixture-uo8r6C`.

## Visual evidence

- [Homepage, first viewport](output/lab-v2/screenshots/home-hero-1440.png)
- [Full desktop homepage](output/lab-v2/screenshots/home-1440.png)
- [Full phone homepage](output/lab-v2/screenshots/home-390.png)
- [Searchable index](output/lab-v2/screenshots/index-1440.png)
- [Data Matter](output/lab-v2/screenshots/data-matter-1440.png)
- [Phone typography installation](output/lab-v2/screenshots/type-has-mass-390.png)
- [Browser Terrarium](output/lab-v2/screenshots/browser-terrarium-1440.png)
- [Motion Foundry](output/lab-v2/screenshots/motion-foundry-1440.png)
- [Essay completion](output/lab-v2/screenshots/essay-complete-1440.png)
- [Component walkthrough video](output/lab-v2/legacy-final/video/interface-lab-v1.webm)

## Remaining work and limits

This is a locally verified prototype release, not the full advanced-feature ceiling of the brief. The table names the major boundaries. Production deployment requires the user's explicit approval. Physical-device, Safari, Firefox, and assistive-technology testing remain outstanding; responsive checks used Chrome viewport emulation. No Lighthouse score, broad hardware frame-rate guarantee, or unobserved interaction quality is claimed.

Reference research and its access limitations are in `RESEARCH.md`. Bot checks prevented complete rendered inspection of Neal.fun and Codrops; other partial loads are recorded. No proprietary code, source artwork, or complete branded compositions were copied. Fonts ship their OFL licenses. No runtime dependency was added; axe-core is a pinned development-only audit dependency.
