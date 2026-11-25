<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What's new strip

`lib/whats-new.ts` is the only source for the release strip above the masthead. Announce a release by editing that ledger; never edit `components/shell/new-bar.tsx` to announce something.

- Add one entry per thing shipped: today's `added` date, the correct `kind` (`Component`, `Tool`, `Experiment`, `Software`), its `name`, `href` and `cta`. Add `version` and a one-line `note` when it ships alone.
- Entries that share an `added` date are one announcement. A single entry is named; two or more of one kind are counted (`5 new components`), two kinds are counted per kind (`2 components + 1 tool`), and three or more kinds collapse to a total (`9 new things`). The strip links to the strongest kind's section. Never list batch members one by one.
- Run `pnpm test`; it checks ids, dates, kinds, grouping, and that every link resolves.
