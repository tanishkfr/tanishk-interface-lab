"use client";

import { FocusStack, type StackItem } from "@/components/lab/focus-stack/focus-stack";
import type { DemoProps } from "./demo-host";

type KindKey = "review" | "inbox";

type Sample = {
  id: string;
  title: string;
  meta?: string;
  body: string;
  chips: string[];
};

const REVIEW: Sample[] = [
  {
    id: "r-1",
    title: "Q1 launch note",
    meta: "Needs review · 2 comments",
    body: "The public beta moves to April: the setup flow still drops first-time workspaces in two places, and the docs cannot fully cover for it yet.",
    chips: ["Product", "Due Apr 4"],
  },
  {
    id: "r-2",
    title: "Pricing experiment memo",
    meta: "In review · 1 comment",
    body: "The upsell test paid for itself in three weeks. Keeping the annual discount at 18% gives finance a cleaner story than the usage bands.",
    chips: ["Finance", "Evidence attached"],
  },
  {
    id: "r-3",
    title: "Partner brief — Northwind",
    meta: "Changes requested",
    body: "Northwind wants the integration listed as certified, which the contract does not allow until the audit closes. Flagged the exact paragraph.",
    chips: ["Legal", "Rewrite"],
  },
  {
    id: "r-4",
    title: "Release notes 3.8",
    meta: "Needs review · 4 comments",
    body: "The changelog is down from forty lines to twelve, grouped by surface. Everyone who touched a fix should check their line before Thursday.",
    chips: ["Docs", "12 lines"],
  },
  {
    id: "r-5",
    title: "Hiring plan, design",
    meta: "Approved · archived",
    body: "Two systems designers and one content designer for the second half. The roles are budgeted but not open — keep the draft off the job board.",
    chips: ["People", "H2"],
  },
];

const INBOX: Sample[] = [
  {
    id: "m-1",
    title: "Rem Kessler",
    meta: "Re: review queue ordering",
    body: "Pushed the reorder — drafts now sort by the last substantive edit instead of creation time. Tell me if the pinned ones feel wrong.",
    chips: ["Today, 09:12"],
  },
  {
    id: "m-2",
    title: "Pipeline bot",
    meta: "nightly-export passed",
    body: "Run 481 completed in 4m 12s. 18,204 records written to the bundle; two schema warnings were resolved by the loader.",
    chips: ["Today, 02:04"],
  },
  {
    id: "m-3",
    title: "Aiko Tan",
    meta: "Notes from the school visit",
    body: "The teachers all asked for a way to freeze a reading list mid-term. Worth a small feature note before we promise anything.",
    chips: ["Yesterday"],
  },
  {
    id: "m-4",
    title: "Doug Marek",
    meta: "Invoice 2026-031",
    body: "Attaching the corrected invoice; the purchase order number was transposed. No change to the total.",
    chips: ["Tuesday"],
  },
  {
    id: "m-5",
    title: "Nadia Kaur",
    meta: "Palette for the November covers",
    body: "Two directions attached — one warm, one closer to the June set. I lean warm, but the press proofs decide.",
    chips: ["Monday"],
  },
];

function asKind(value: unknown): KindKey {
  return String(value ?? "review") === "inbox" ? "inbox" : "review";
}

/**
 * SAMPLE — a review queue and an inbox as tactile stacks.
 *
 * Both modes carry five entries with real prose; the count control slices
 * the queue and the stack re-fans, keeping the selection inside range.
 */
export default function FocusStackDemo({ values }: DemoProps) {
  const kind = asKind(values.kind);
  const spread = Math.max(14, Math.min(54, Number(values.spread ?? 34)));
  const rotate = Boolean(values.rotate);
  const count = Math.max(3, Math.min(6, Math.round(Number(values.count ?? 5))));

  const samples = (kind === "inbox" ? INBOX : REVIEW).slice(0, count);
  const items: StackItem[] = samples.map((sample) => ({
    id: sample.id,
    title: sample.title,
    meta: sample.meta,
    content: (
      <div>
        <p className="m-0 text-[13px] leading-relaxed text-[#3f3f46]">
          {sample.body}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sample.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-black/10 bg-[#f4f4f2] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.07em] text-[#5f5f68]"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    ),
  }));

  return (
    <div className="flex h-full flex-col bg-[#f6f6f4] text-[#141418]">
      <header className="flex items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8c8c94]">
            {kind === "review" ? "Review queue" : "Inbox"}
          </p>
          <h2 className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.01em]">
            {kind === "review" ? "Drafts waiting on you" : "Messages, most recent"}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-black/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5f5f68]">
          {items.length} {kind === "review" ? "drafts" : "unread"}
        </span>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-white/70 px-4 py-1.5 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8c8c94]">
          {kind === "review" ? "Oldest first" : "All mail"}
        </span>
        <span className="font-mono text-[10px] text-[#8c8c94]">
          ← → to move
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 sm:px-5">
        <FocusStack
          key={kind}
          items={items}
          spread={spread}
          rotate={rotate}
          className="mx-auto w-full max-w-[520px]"
        />
      </div>
    </div>
  );
}
