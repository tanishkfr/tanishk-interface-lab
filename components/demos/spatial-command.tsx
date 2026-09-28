"use client";

import { useState } from "react";
import {
  CommandMenu,
  type CommandItem,
} from "@/components/lab/command-menu/command-menu";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — “Harbour”, a fictional document workspace.
 *
 * Sixteen plausible commands across five groups, with small rich
 * previews for the ones where the effect is worth seeing before it
 * runs. The item array is deliberately not in group order, so the
 * “Group headings” control visibly switches between a fixed order
 * and first-seen order.
 */

const GROUP_ORDER = ["Create", "Navigate", "Review", "Share", "Settings"];

const DOCUMENTS = [
  {
    title: "Coastline survey — appendix",
    meta: "Edited 2h ago · draft 3 · 4 contributors",
    active: true,
  },
  {
    title: "Q3 planning notes",
    meta: "Edited yesterday · only you",
    active: false,
  },
];

function TemplateCardPreview() {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-2.5">
      <span className="block h-7 rounded bg-[#4f27e0]/15" />
      <span className="mt-2 block h-1.5 w-4/5 rounded-full bg-black/25" />
      <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-black/10" />
      <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-black/10" />
      <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#8c8c94]">
        Field-note template
      </span>
    </div>
  );
}

function DiffPreview() {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-2.5 font-mono text-[10px] leading-relaxed">
      <p className="text-[#8c8c94]">draft 3 · copy pass</p>
      <p className="mt-1.5 rounded bg-[#e9f4ee] px-1.5 py-0.5 text-[#1f5b3c]">
        + 4 punctuation fixes
      </p>
      <p className="mt-1 rounded bg-[#fbecec] px-1.5 py-0.5 text-[#8a2f2f]">
        − 1 repeated sentence
      </p>
      <p className="mt-1 rounded bg-[#eef0f7] px-1.5 py-0.5 text-[#3d4667]">
        ± 2 word choices
      </p>
    </div>
  );
}

function BreadcrumbPreview() {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-2.5 text-[10px] text-[#5f5f68]">
      <p className="font-mono uppercase tracking-[0.12em] text-[#8c8c94]">
        Destination
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <span>Workspace</span>
        <span aria-hidden="true">›</span>
        <span>Surveys</span>
        <span aria-hidden="true">›</span>
        <span className="rounded bg-[#4f27e0]/10 px-1 py-0.5 font-medium text-[#32119c]">
          Coastline appendix
        </span>
      </div>
      <p className="mt-2 text-[#8c8c94]">Draft 3 · 12 pages</p>
    </div>
  );
}

function ShareLinkPreview() {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-2.5">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#2f7d52]" />
        <span className="truncate font-mono text-[10px] text-[#5f5f68]">
          harbour.app/s/coastline-8f2k
        </span>
      </div>
      <p className="mt-2 text-[10px] text-[#8c8c94]">
        Anyone with the link can read · expires in 14 days
      </p>
    </div>
  );
}

function ReviewersPreview() {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-2.5">
      <div className="flex items-center gap-1.5">
        {["MK", "JT", "AL"].map((initials) => (
          <span
            key={initials}
            className="grid h-6 w-6 place-items-center rounded-full bg-[#e6e2f8] text-[9px] font-semibold text-[#32119c]"
          >
            {initials}
          </span>
        ))}
        <span className="ml-1 text-[10px] text-[#5f5f68]">3 reviewers</span>
      </div>
      <p className="mt-2 text-[10px] text-[#8c8c94]">
        They will see this draft only, not the whole workspace.
      </p>
    </div>
  );
}

export default function SpatialCommandDemo({ values }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const previewPanel = values.preview === undefined ? true : Boolean(values.preview);
  const showGroups = values.groups === undefined ? true : Boolean(values.groups);
  const hotkey = values.hotkey === undefined ? true : Boolean(values.hotkey);
  const density: "compact" | "roomy" =
    values.density === "roomy" ? "roomy" : "compact";

  const items: CommandItem[] = [
    {
      id: "new-doc",
      label: "New document",
      group: "Create",
      keywords: ["blank", "page"],
      description: "Start a blank document in this workspace.",
      shortcut: "⌘N",
      preview: <TemplateCardPreview />,
    },
    {
      id: "copy-edits",
      label: "Apply copy edits",
      group: "Review",
      keywords: ["grammar", "proof", "style"],
      description: "Run the style pass over this draft.",
      preview: <DiffPreview />,
    },
    {
      id: "open-coastline",
      label: "Open Coastline survey — appendix",
      group: "Navigate",
      keywords: ["recent", "jump"],
      description: "Jump to the document you edited this morning.",
      shortcut: "⌘1",
      preview: <BreadcrumbPreview />,
    },
    {
      id: "share-link",
      label: "Copy share link",
      group: "Share",
      keywords: ["url", "read-only"],
      description: "Copy a read-only link to this document.",
      preview: <ShareLinkPreview />,
    },
    {
      id: "autosave",
      label: "Autosave every minute",
      group: "Settings",
      keywords: ["save", "draft"],
      description: "Keep drafts saved while you type.",
    },
    {
      id: "new-template",
      label: "New from template",
      group: "Create",
      keywords: ["starter", "layout"],
      description: "Begin with the field-note template.",
      preview: <TemplateCardPreview />,
    },
    {
      id: "search-docs",
      label: "Search all documents",
      group: "Navigate",
      keywords: ["find", "full text"],
      description: "Search titles and body text across Harbour.",
      shortcut: "⌘F",
    },
    {
      id: "compare",
      label: "Compare with previous draft",
      group: "Review",
      keywords: ["diff", "history"],
      description: "Open a side-by-side of draft 2 and draft 3.",
      preview: <DiffPreview />,
    },
    {
      id: "invite",
      label: "Invite reviewers",
      group: "Share",
      keywords: ["people", "team"],
      description: "Send this draft to three reviewers.",
      preview: <ReviewersPreview />,
    },
    {
      id: "back",
      label: "Back to workspace",
      group: "Navigate",
      keywords: ["home", "index"],
      description: "Leave the editor and return to the workspace list.",
      shortcut: "⌘[",
    },
    {
      id: "comments",
      label: "Show open comments",
      group: "Review",
      keywords: ["notes", "threads", "margin"],
      description: "Filter the margin to unresolved comments.",
    },
    {
      id: "publish-library",
      label: "Publish to team library",
      group: "Share",
      keywords: ["template", "library"],
      description: "Available once this draft has been reviewed.",
      disabled: true,
    },
    {
      id: "export-pdf",
      label: "Export as PDF",
      group: "Share",
      keywords: ["download", "print"],
      description: "Export the current draft with margins.",
    },
    {
      id: "reduce-motion",
      label: "Reduce interface motion",
      group: "Settings",
      keywords: ["animation", "accessibility"],
      description: "Turn off non-essential motion in Harbour.",
    },
    {
      id: "duplicate",
      label: "Duplicate current document",
      group: "Create",
      keywords: ["copy", "clone"],
      description: "Make a private copy of Coastline survey — appendix.",
    },
    {
      id: "sign-out",
      label: "Sign out of Harbour",
      group: "Settings",
      keywords: ["logout", "account"],
      description: "End this session on this device.",
    },
  ];

  return (
    <div className="flex h-full flex-col bg-[#fafaf9] text-[#141418]">
      <header className="flex flex-none items-center justify-between gap-3 border-b border-black/5 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[#4f27e0] text-[13px] font-semibold text-white">
            H
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em]">
              Harbour
            </p>
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-[#8c8c94]">
              Workspace · survey notes
            </p>
          </div>
        </div>
        <span className="hidden flex-none items-center rounded-md border border-black/10 px-2 py-1 font-mono text-[10px] text-[#5f5f68] sm:flex">
          {hotkey ? "⌘K" : "hotkey off"}
        </span>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8c8c94]">
          Open documents
        </p>
        <ul className="mt-3 space-y-2">
          {DOCUMENTS.map((document) => (
            <li
              key={document.title}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                document.active
                  ? "border-[#4f27e0]/30 bg-white shadow-[0_1px_2px_rgba(20,20,24,0.05)]"
                  : "border-black/10 bg-white/70"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-8 w-6 flex-none place-items-end rounded-[4px] border px-1 pb-1 ${
                  document.active
                    ? "border-[#4f27e0]/40 bg-[#4f27e0]/5"
                    : "border-black/15 bg-black/[0.03]"
                }`}
              >
                <span className="block h-3 w-full space-y-[2px]">
                  <span className="block h-[2px] w-full rounded bg-black/25" />
                  <span className="block h-[2px] w-2/3 rounded bg-black/20" />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">
                  {document.title}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[#8c8c94]">
                  {document.meta}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-xl border border-dashed border-black/10 px-4 py-3 text-[12px] leading-relaxed text-[#5f5f68]">
          Type to filter, move with the arrow keys, and watch the preview pane
          describe the highlighted command before it runs.
        </p>
      </main>

      <footer className="flex-none border-t border-black/5 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-[#4f27e0] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#4520c9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f27e0]"
          >
            Open command menu
          </button>
          <span className="text-[11px] text-[#8c8c94]">
            {hotkey
              ? "or press ⌘K / Ctrl+K"
              : "hotkey off in this preview — use the button"}
          </span>
        </div>
        <p
          aria-live="polite"
          className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[#8c8c94]"
        >
          {lastCommand ? `Last command — ${lastCommand}` : "No command run yet"}
        </p>
      </footer>

      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        items={items}
        hotkey={hotkey}
        previewPanel={previewPanel}
        groups={showGroups ? GROUP_ORDER : undefined}
        density={density}
        onRun={(item) => setLastCommand(item.label)}
      />
    </div>
  );
}
