# AFTERCLICK — privacy notes (v0.1.0)

## What is collected

With explicit consent, and only on the one tab where you press Start:

- clicks on the page, with safe target metadata and a short structural selector;
- keyboard shortcuts that include Ctrl, Meta, or Alt, plus Escape;
- focus changes between interactive controls;
- navigation and same-document route changes;
- observed DOM state changes such as disabled controls, `aria-busy`, loading indicators, dialogs, live-region/alert changes, and short labels;
- manual checkpoints you type.

## What is never collected

- form values, password values, or the content of text fields;
- individual character keystrokes;
- cookies, headers, network payloads, or authentication tokens;
- clipboard contents;
- screenshots (not implemented in this build);
- other tabs or browsing history.

## Storage and network

The extension makes no network requests. There is no analytics, account, backend, or upload. The active recording lives in `chrome.storage.session` and the last completed recording lives in `chrome.storage.local`. Clearing the recording in the popup removes that saved copy. Uninstalling the extension removes its storage.

## Exports

A JSON export can contain the page title, origin and path (query string and fragment removed), safe UI labels, event timings, and any annotations or optional feedback text. It is a local file you choose to share. Redaction is a last line of defence, not a guarantee: review the JSON, PNG, or HTML report before sending it to anyone.

## Optional feedback text

Off by default. When enabled, short text from live regions, alerts, and status messages is stored after obvious emails, phone-like numbers, card-like numbers, and token-like strings are redacted. This can still contain personal information. Leave it off for sensitive pages.

## Permissions

- `activeTab` — run only on the tab you explicitly start;
- `scripting` — inject the recorder into that tab;
- `storage` — keep the active and last completed recording locally.

The manifest has no `host_permissions`, no all-sites `content_scripts`, no `webRequest`, no `downloads`, and no `tabs` permission.

## Support

Reproducible bugs and privacy questions: <https://github.com/tanishkfr/tanishk-interface-lab/issues>.
