# Privacy

GRID CRIMES/ is a local Figma plugin. It does not operate a server.

## What it reads

Only the current Figma selection. It reads visible layer bounds, types, names, solid/gradient/image fill presence, text content for role heuristics, text font references, and whether a font is missing.

## What it writes

- New generated frames and decoration nodes on the current Figma page.
- Plugin-private metadata on generated frames and the batch container: preset, seed, settings, grammar, design DNA, source fingerprint, batch/variation ids, revision, kept/locked state.
- Figma client storage: last batch reference, a batch counter, and the last settings used.

## What it does not do

- No network requests. The manifest declares `networkAccess.allowedDomains: ["none"]`.
- No uploads of text, images, fonts, or documents.
- No analytics, crash reporting, accounts, telemetry, or remote configuration.
- No source modification. Generated output is cloned into new frames.
- No silent deletion. Batch removal deletes tracked generated nodes only; the source and any user-added layers are left intact.

## Data retention

Metadata remains in the Figma document until the generated frames are deleted. Client storage is local to the Figma plugin and can be cleared by removing the development plugin. Nothing is retained by the author.

## Fonts

Font files are bundled into the local UI for interface rendering. They are not uploaded. License texts are included in `assets/fonts/`.

## Contact

Use the repository issue tracker: https://github.com/tanishkfr/tanishk-interface-lab/issues
