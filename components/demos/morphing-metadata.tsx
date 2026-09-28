"use client";

import { useState } from "react";
import {
  MorphingMetadata,
  type MetadataRecord,
} from "@/components/lab/morphing-metadata/morphing-metadata";
import type { DemoProps } from "./demo-host";

type KindKey = "file" | "person" | "run";

const ORDER: KindKey[] = ["file", "person", "run"];

const RECORDS: Record<KindKey, MetadataRecord> = {
  file: {
    id: "file-archive-q1",
    title: "archive.tar.gz",
    kind: "File · 248 MB",
    summary: { Size: "248 MB", Modified: "Mar 14, 2026", Owner: "R. Iyer" },
    detail: [
      { label: "Location", value: "/exports/2026/q1/archive.tar.gz" },
      { label: "Checksum", value: "sha256 9f2c…a41d" },
      { label: "Owner", value: "R. Iyer · Platform" },
      { label: "Retention", value: "90 days" },
    ],
  },
  person: {
    id: "person-maya-okonkwo",
    title: "Maya Okonkwo",
    kind: "Person · Foundations",
    summary: {
      Role: "Staff designer",
      Team: "Design systems",
      Location: "Lisbon",
    },
    detail: [
      { label: "Team", value: "Foundations · Design systems" },
      { label: "Started", value: "Aug 2021" },
      { label: "Timezone", value: "Europe/Lisbon · UTC+1" },
      { label: "Contact", value: "maya@meridian.tools" },
    ],
  },
  run: {
    id: "run-nightly-export-481",
    title: "nightly-export #481",
    kind: "Run · 4m 12s",
    summary: { Status: "Passed", Records: "18,204", Duration: "4m 12s" },
    detail: [
      { label: "Started", value: "02:00 UTC" },
      { label: "Trigger", value: "schedule · daily" },
      { label: "Runner", value: "ci-lg-07" },
      { label: "Status", value: "Passed · 2 schema warnings" },
      { label: "Artifact", value: "bundle-2026-03-14.tar.gz" },
    ],
  },
};

function asKind(value: unknown): KindKey {
  const raw = String(value ?? "file");
  return (ORDER as string[]).includes(raw) ? (raw as KindKey) : "file";
}

function asTransition(value: unknown): "auto" | "view-transition" | "none" {
  const raw = String(value ?? "auto");
  return raw === "view-transition" || raw === "none" ? raw : "auto";
}

/**
 * SAMPLE — a workspace record list.
 *
 * Three records of different shapes; the record chosen in the controls is
 * the active one and answers the expanded toggle. The other two stay in
 * the list and keep their own local state, so the pile never empties.
 */
export default function MorphingMetadataDemo({ values }: DemoProps) {
  const kind = asKind(values.kind);
  const transition = asTransition(values.transition);

  const [expanded, setExpanded] = useState(Boolean(values.expanded));
  const [lastExpanded, setLastExpanded] = useState(values.expanded);
  if (values.expanded !== lastExpanded) {
    setLastExpanded(values.expanded);
    setExpanded(Boolean(values.expanded));
  }

  const active = RECORDS[kind];
  const others = ORDER.filter((key) => key !== kind).map((key) => RECORDS[key]);
  const records = [active, ...others];

  return (
    <div className="flex h-full flex-col bg-[#f6f6f4] text-[#141418]">
      <header className="flex items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8c8c94]">
            Workspace
          </p>
          <h2 className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.01em]">
            Q1 export bundle
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-black/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5f5f68]">
          3 records
        </span>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-white/70 px-4 py-1.5 sm:px-5">
        <span className="flex items-center gap-2 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[#5f5f68]">
          All records
          <span className="text-[#c6c6cc]">/</span>
          <span className="text-[#8c8c94]">{active.kind}</span>
        </span>
        <span className="shrink-0 font-mono text-[10px] text-[#8c8c94]">
          values keep their place
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {records.map((record, i) => (
            <li key={record.id}>
              {i === 0 ? (
                <MorphingMetadata
                  record={record}
                  expanded={expanded}
                  transition={transition}
                  onExpandedChange={setExpanded}
                />
              ) : (
                <MorphingMetadata record={record} transition={transition} />
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-[#8c8c94]">
          Other records toggle independently — the list holds their own state.
        </p>
      </div>
    </div>
  );
}
