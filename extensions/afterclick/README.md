# AFTERCLICK v0.1.0 — Chrome developer build

AFTERCLICK is a Manifest V3 browser extension that records meaningful interaction events on one tab. Export a `.json` recording, then open the AFTERCLICK Studio and import it to inspect states, transitions, timing, annotations, and reports.

## What is real in this build

- One-tab recording with explicit per-recording consent.
- Clicks, form submits, modifier shortcuts, focus, navigation, SPA route changes, and manual checkpoints.
- Mutation-based observation of disabled/enabled controls, loading indicators, dialogs, live-region feedback, label changes, and short feedback messages.
- Pause/resume, tab-close finalisation, partial exports after interruption.
- Active recording in `chrome.storage.session`; last completed recording in `chrome.storage.local`.
- Studio state map, keyboard timeline, inspector, annotations, JSON round-trip, PNG report, and self-contained HTML report.
- No screenshots, form values, character keystrokes, network requests, accounts, analytics, or backend.

## Install

1. Extract the ZIP to a folder you can keep.
2. Open `chrome://extensions` in Chrome or another Chromium browser.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the extracted folder that contains `manifest.json`.
5. Pin AFTERCLICK to the toolbar if you want the reliable start path.

## Record

1. Open a normal `http://` or `https://` page.
2. Click AFTERCLICK, read the scope, tick the consent box, and press **Start recording**.
3. Use the page. Pause, stop, or add a manual checkpoint from the popup.
4. Stop the recording, then **Export .json**.
5. Open `https://lab.tanishk.me/play/afterclick` and import the file.

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Run only on the tab you explicitly start. |
| `scripting` | Inject the recorder into that tab. |
| `storage` | Keep the active and last completed recording locally. |

There are no `host_permissions`, no all-sites `content_scripts`, no `webRequest`, no `tabs`, and no `downloads` permission.

## Limits

- Only the tab you explicitly start is observed.
- Full-page navigation is re-attached when `activeTab` still allows it. Crossing to another origin can end capture; the partial recording remains exportable.
- Iframe interiors, closed shadow DOM, canvas/WebGL pixels, and network activity are outside the observation.
- Browser settings pages, extension pages, and the new tab page are blocked.
- No screenshots are captured in v0.1.0.
- Feedback text is off by default. The recorder never reads form values, password fields, typed characters, cookies, or network payloads.
- UI labels and page titles can still contain personal information. Review every export before sharing it.

## Build from source

The build reuses the workspace esbuild installation from `plugins/grid-crimes`:

```bash
node extensions/afterclick/tools/build.mjs
node extensions/afterclick/tools/package.mjs
```

Then verify:

```bash
node --test tests/afterclick.test.ts
node scripts/afterclick-acceptance.mjs
node scripts/afterclick-studio-qa.mjs
```

## Privacy and support

No network requests, analytics, accounts, or uploads. The active recording is kept in `chrome.storage.session`; the last completed recording is kept in `chrome.storage.local` until you clear it. Read [PRIVACY.md](./PRIVACY.md).

Build notes, limitations, and source live at <https://lab.tanishk.me/software/afterclick>.
