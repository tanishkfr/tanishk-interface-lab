# Release preparation

**Current status:** local development build, v0.1.0. No Figma plugin ID, no Community submission, no publication. Do not claim otherwise.

## Assets in this directory

- `icon.png` — 512×512 Community icon. Acid ground, ink `GC/` monogram.
- `cover.png` — 1600×900 Community cover. Ink ground, oversized Gulax wordmark and six real engine previews.
- `fonts/` — licensed Gulax and Apfel Grotezk files with OFL texts.

Additional product screenshots live at `public/products/grid-crimes/`:

- `ui-configure.png`
- `ui-results.png`
- `ui-crossbreed.png`
- `directions.png`

These are browser-rendered captures of the shipped interface and real engine plans. They are not native Figma screenshots.

## Community listing draft

**Name**

GRID CRIMES/

**Tagline (short)**

Break the grid. Keep the craft.

**Short description**

Turn an existing Figma composition into six radically different art directions. Four editable variations, seeded procedural layouts, and a real crossbreed engine.

**Long description**

GRID CRIMES/ is a composition instrument, not a random layout generator.

Select a frame, group, or a few sibling layers. GRID CRIMES/ reads the content as a composition, infers roles, then builds four new layouts from four different grammars inside the direction you choose. Text stays text. Images keep their fills. Instances stay instances. The source is never edited.

Six directions each have their own spatial logic:

- Brutalist: monumental type and hard divisions
- Swiss Editorial: asymmetric column grids and precise whitespace
- Radical Minimal: negative space as material
- Maximalist: layered colour with a protected hierarchy
- Anti-grid: coherent offsets and controlled tension
- Controlled Chaos: hybrid grammars and spatial fracture

Chaos, Density and Hierarchy change the result. Seeds make it reproducible. Crossbreed two directions to combine their grammars, spacing, scale and asymmetry into a new family.

Everything runs offline. No uploads, no accounts, no analytics.

**Tags**

`design`, `layout`, `composition`, `creative`, `procedural`, `generative`, `figma plugin`, `art direction`, `typography`, `experimental`

**Support**

https://github.com/tanishkfr/tanishk-interface-lab/issues

**Privacy**

See `PRIVACY.md`.

## Demo script (45–60 seconds)

1. Open a real hero composition. Show the detected role summary.
2. Choose **Brutalist**. Nudge Density from 68 to 40; show the frame previews changing only after generation.
3. Press **Generate 4 Variations**. Show the batch appearing beside the source, zoom into the four frames.
4. Open the layers panel and expand a variation. Point out that text is still text and the image fill is intact.
5. Select **Radical Minimal**, adjust Hierarchy, generate another four.
6. Open **Crossbreed**, choose the Brutalist and Minimal parents, set inheritance to 58%, generate offspring.
7. Undo once. The original is still untouched.

## Publication checklist

- [ ] Complete the native Figma manual QA checklist in `README.md`.
- [ ] If the local Figma build requires an explicit ID to import, create a blank development plugin and add its generated local `id` to `manifest.json`. Do not invent one.
- [ ] Add support URL and privacy statement to the Community listing.
- [ ] Test on a fresh Figma account with no local fonts installed.
- [ ] Test a file with missing fonts and a file with several pages.
- [ ] Verify batch removal and undo on a copy of a real document.
- [ ] Register the plugin through Figma's Community flow and add the assigned `id` to `manifest.json`.
- [ ] Replace the development status on the LAB/ product page with the real listing URL only after approval.
- [ ] Obtain explicit owner approval before submitting or publishing.
