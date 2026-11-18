# LAB/ — an internet playground

V2 expands the preserved component library into eleven individually art-directed browser prototypes. The unreasonable pass and its verification are documented in `UNREASONABLE_PASS.md`; creative direction is in `DESIGN.md` and product constraints in `PRODUCT.md`.

- `/`: kinetic wordmark, editorial gallery, searchable index, filters, and surprise navigation.
- `/experiments`: larger experiments and the interactive essay.
- `/tools`: Motion Foundry and Vector Kitchen.
- `/components`: the original 19 components with live previews and documentation.
- `/products`: accurately labeled product prototypes and release information.
- `/play/<slug>`: eleven browser experiences, loaded independently.
- `/experiments/<component>` and `/r/<component>.json`: all original URLs preserved.

New prototype state and uploaded data remain in the browser. Data Matter exports SVG and JSON; Type Has Mass exports SVG with its font embedded; Browser Terrarium exports PNG; Interface Genome exports rules; Motion Foundry exports CSS and spring settings; Vector Kitchen exports editable SVG and reloadable JSON recipes; the essay exports visit observations. These are functioning prototypes, not published plugins or completed versions of every ambitious feature in the brief.

## V2 verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build --webpack
pnpm start --port 3300
node scripts/verify-v2.mjs
node scripts/inspect-v2.mjs
node scripts/audit-v2.mjs
node scripts/fixture-install.mjs --base-url=http://127.0.0.1:3300
```

The refinement adds `scripts/verify-unreasonable.mjs` for the new experience flows and actual downloads, and `scripts/verify-preview-pass.mjs` for all 19 component workbenches. Both accept `LAB_QA_URL`; their reports live in `output/unreasonable/`.

The V2 browser scripts use installed Chrome and default to port 3300. `verify-v2.mjs` accepts `LAB_QA_URL` to change the origin. Captures, checks, and verified downloads are written under `output/lab-v2/`. The axe script uses the installed axe-core copy. Native Windows build-worker instability required the documented Webpack build path with bounded workers in this environment; no runtime library was added.

Typography pairs [Gulax](https://gitlab.com/velvetyne/Gulax) from Velvetyne with [Apfel Grotezk](https://www.collletttivo.it/typefaces/apfel-grotezk) from Collletttivo. IBM Plex Mono is retained for code and measurements. Fonts are self-hosted, and OFL licenses ship in `public/fonts/`. Earlier Google Fonts assets remain for the checkpoint but are no longer loaded by the layout. Research retrievals and screenshots record partial loads rather than claiming full inspection.

## Original component library

A small collection of reusable interaction experiments — behaviours, not just
components. Each experiment solves one interaction problem properly: keyboard
included, reduced motion respected, dependency-light, and installable on its
own into any React project.

The component catalog lives at `/components`; every component has its own page under
`/experiments/<slug>` with a live preview, controls, install command, usage,
props, accessibility notes and source.

## Development

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm test           # pure-logic tests (node:test)
pnpm build          # production build
```

## Install model

Every experiment is published as a shadcn-compatible registry item:

- `/r/registry.json` — the index of all experiments.
- `/r/<slug>.json` — one item, with the shipped source inlined.

Install one into any project that has a `components.json`:

```bash
npx shadcn@latest add https://lab.tanishk.me/r/signal-field.json
```

The CLI writes the component folder (component + stylesheet + any logic file)
and installs npm dependencies when an experiment declares them. Nothing is
hosted for you; the source is the artifact.

Experiments can also be registered as a named registry in `components.json`:

```json
{
  "registries": {
    "@lab": "https://lab.tanishk.me/r/{name}.json"
  }
}
```

### Verifying installs

```bash
pnpm build && pnpm start            # serve the Lab
node scripts/fixture-install.mjs --base-url=http://localhost:3000
```

The script copies a throwaway Vite + React consumer from
`scripts/fixture/template` into a temp directory, installs a representative
set of experiments from the running registry through the shadcn CLI, lists the
files it received, and then type-checks and builds the fixture. It is how the
install path is kept honest — nothing is assumed.

## Architecture

```
app/                     routes: catalog, experiment detail, about, /r registry
components/lab/<slug>/   the installable experiments (self-contained folders)
components/demos/        the sample scenes each detail page mounts
components/home/         catalog cards + lightweight card previews
lib/registry/            the source of truth: types, records, registry builder
lib/code.ts              server-only syntax highlighting
scripts/qa.mjs           Playwright QA: screenshots, video, smoke checks
```

`lib/registry/experiments.ts` is the single source of truth for an experiment:
name, tagline, summary, category, tags, status, tech, dependencies, shipped
files, preview controls, props, accessibility notes, usage and demo note. The
catalog, the detail page and the registry endpoint all read from it.

## Adding an experiment

1. Add the component folder under `components/lab/<slug>/` with the component,
   its stylesheet and any logic files. Keep it self-contained: relative imports
   only inside the folder, scoped CSS classes, no Lab tokens.
2. Add a record to `lib/registry/experiments.ts` listing the files, props,
   preview controls and accessibility notes.
3. Add a demo under `components/demos/<slug>.tsx` (default export, receives
   `values`) and register it in `components/demos/demo-host.tsx`.
4. Add a catalog preview under `components/home/previews/<slug>.tsx` and
   register it in `components/home/previews/registry.ts`.
5. `pnpm typecheck && pnpm build`, then check `/r/<slug>.json`.

The registry builder refuses any component file that imports through the `@/`
alias — that check is what keeps the installed folders portable.

## Accessibility principles

- Motion is an enhancement. `prefers-reduced-motion` removes easing, magnetism
  and settling — never information.
- Every custom interaction has a keyboard path, or is documented as
  pointer-first and renders safely without one.
- Colour is never the only signal; statuses are written as words too.
- Render loops pause offscreen, when the tab is hidden and under reduced
  motion.
- Previews use fictional sample content; nothing implies a real product,
  person or result. The Evidence Carousel demo is built on real
  public-domain photography from Wikimedia Commons — credits in
  `public/archive/credits.json`.

## License

MIT. Some experiments adapt ideas from Tanishk Salagame's own portfolio
(Signal Field, the Inverted Cursor lifecycle and the Soft Snap gating); those
adaptations are generalised and relicensed under the same MIT terms by the
copyright holder. See `LICENSE`.
