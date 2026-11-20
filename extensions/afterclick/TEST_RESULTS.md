# AFTERCLICK v0.1.0 — test results

Recorded 20–21 November 2026. This file reports what was actually executed in this workspace.

## Passing

| Check | Result | Command / source |
|---|---|---|
| Root TypeScript | Pass | `tsc --noEmit` |
| Extension TypeScript | Pass | `tsc -p extensions/afterclick/tsconfig.json --noEmit` |
| ESLint | Pass | `eslint . --quiet` |
| Repository tests | 76 / 76 | `node --test` |
| AFTERCLICK unit tests | 15 / 15 | `node --test tests/afterclick.test.ts` |
| Next production build | Pass | `next build` (87 static pages) |
| Extension build | Pass | `node extensions/afterclick/tools/build.mjs` |
| Extension ZIP | Pass | `node extensions/afterclick/tools/package.mjs` |
| Studio browser QA | 30 / 30 | `node scripts/afterclick-studio-qa.mjs --base-url=http://localhost:3300` |
| Listing + build-notes QA | 36 / 36 | `node scripts/afterclick-product-qa.mjs --base-url=http://localhost:3300` |
| Extension acceptance | 35 / 35 | `node scripts/afterclick-acceptance.mjs` |

## What the automated runs cover

- Recording start, pause/resume, stop, manual checkpoint, tab-close finalisation, and interrupted-session state transitions in pure tests.
- Event normalization, deduplication, sequence assignment, action-relative delay, bounds, unknown kinds, and schema-version rejection.
- Import/export round-trip with annotations; malformed JSON, empty recordings, orphan annotations, and future schema versions.
- Redaction and privacy checks against deliberately fake fixture values (`mira@example.com`, `hunter2-not-recorded`, `SPRING24`, `14 Harbour Walk`).
- Real Chromium extension capture against the local Harbor & Pine fixture: clicks, focus, disabled, loading, success/error feedback, SPA route change, checkpoint, JSON export.
- Manifest validation: MV3, version, minimal permissions, no host permissions, no all-sites content scripts, popup without inline script, expected dist files.
- Zoom out: the Studio timeline keyboard navigation, annotation add, malformed/future imports, JSON/PNG/HTML downloads, mobile reachability, no horizontal overflow, and no serious axe violations.
- The Software listing order (Vector Kitchen → Grid Crimes → AFTERCLICK → More Coming Soon), three CTAs, cover loading, internal links, ZIP integrity, build-notes images, responsive mobile, and regression smoke tests for Vector Kitchen, Grid Crimes, and the existing Software page.
- The home collection remains free of AFTERCLICK; the Studio is reachable only through the Software listing and its direct `/play/afterclick` route.

## Limits of the automated evidence

- Chromium does not expose its toolbar to Playwright. The extension acceptance harness loads a **copy of the build with a localhost-only host permission** so it can inject the recorder. The shipped manifest remains `activeTab`, `scripting`, and `storage` only. The physical toolbar click and a human Load unpacked pass were **not automated**.
- Automated capture used Playwright's bundled Chromium on Windows. Chrome stable, Edge, Brave, Arc, Firefox, and Safari were not tested.
- Popup screenshots and axe checks use the built popup in a recording state on the test extension page.
- No performance benchmark, network-latency claim, user study, store review, or cross-browser approval is implied.
- The Studio's PNG and HTML reports were generated and downloaded in Chromium; they were not verified in other browsers or office suites.
- The sample was captured from a local HTTP fixture. Its source URL is `127.0.0.1`; the UI labels and feedback text are fixture copy, not production-site content.

## Manual acceptance still needed

1. Install the shipped ZIP through `chrome://extensions → Developer mode → Load unpacked` in current Chrome.
2. Start on a real https page from the actual toolbar popup, confirm consent, pause/resume, checkpoint, stop, export.
3. Import in the deployed Studio, annotate, and open the exported PNG/HTML in a second browser.
4. Check a cross-origin navigation and a tab close for the documented partial-recording behaviour.
5. Confirm no store publication, signing, or Chrome Web Store submission until the owner approves it.
