"use client";

import { useState } from "react";
import {
  TraceTrail,
  type TraceStep,
} from "@/components/lab/trace-trail/trace-trail";
import "./trace-trail-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a writer's tool panel.
 *
 * The answer is on the page; underneath it, the activity card says
 * where the answer came from. Three runs — a clean summarise pass, an
 * export that trips a soft limit, and a retry that fails on a rate
 * limit — so the status dot has something to report.
 */

type Trace = {
  doc: string;
  ask: string;
  answer: string;
  steps: TraceStep[];
};

const TRACES: Record<string, Trace> = {
  summary: {
    doc: "Incident 412 — postmortem draft",
    ask: "Summarise incident 412 from my notes and keep the timeline.",
    answer:
      "Incident 412 started at 08:52 when the upload queue stalled, and cleared at 09:40 once the retry budget was raised. No data was lost; two exports ran about forty minutes late.",
    steps: [
      {
        id: "s1",
        actor: "You",
        action: "Asked for a summary",
        detail: "Scope: timeline and impact",
        at: "09:12",
      },
      {
        id: "s2",
        actor: "retriever",
        action: "Pulled 4 passages",
        detail: "Searched 22 notes in ops/incidents",
        source: {
          label: "notes/incident-412.md",
          href: "https://example.com/notes/incident-412.md",
        },
        at: "09:12",
      },
      {
        id: "s3",
        actor: "draft-1",
        action: "Wrote the summary",
        detail: "Three paragraphs, citing two of the four passages",
        status: "ok",
        at: "09:13",
      },
      {
        id: "s4",
        actor: "reviewer",
        action: "Approved the summary",
        detail: "One wording note, no further edits",
        status: "ok",
        at: "09:14",
      },
    ],
  },

  export: {
    doc: "Q3 archive export",
    ask: "Export the Q3 workspace to cold storage.",
    answer:
      "The Q3 export is in cold storage: four volumes, 1.2 GB, digest verified. It ran in twelve minutes and needed no retries.",
    steps: [
      {
        id: "x1",
        actor: "You",
        action: "Queued an export of Q3",
        detail: "18,204 records, cold storage target",
        at: "02:00",
      },
      {
        id: "x2",
        actor: "export-worker",
        action: "Built the archive",
        detail: "1.2 GB across four volumes — over the 1 GB soft limit",
        status: "warn",
        at: "02:04",
      },
      {
        id: "x3",
        actor: "checks",
        action: "Verified the digests",
        detail: "SHA-256 matched on all four volumes",
        status: "ok",
        at: "02:06",
      },
      {
        id: "x4",
        actor: "export-worker",
        action: "Uploaded to archive",
        detail: "archive/q3-2026, four volumes",
        source: {
          label: "archive/q3-2026",
          href: "https://example.com/archive/q3-2026",
        },
        at: "02:11",
      },
      {
        id: "x5",
        actor: "checks",
        action: "Confirmed the upload",
        status: "ok",
        at: "02:12",
      },
    ],
  },

  failed: {
    doc: "Q3 archive export — retry",
    ask: "Retry the Q3 export that failed overnight.",
    answer:
      "The retry rebuilt the archive in one pass, but the upload was rejected before anything was written. The export still needs a successful run.",
    steps: [
      {
        id: "r1",
        actor: "You",
        action: "Retried the failed export",
        detail: "Same scope as the 02:00 run",
        at: "14:31",
      },
      {
        id: "r2",
        actor: "export-worker",
        action: "Rebuilt the archive",
        detail: "Retry 1 of 3, reusing four cached volumes",
        at: "14:32",
      },
      {
        id: "r3",
        actor: "export-worker",
        action: "Uploaded to archive",
        detail:
          "Rate limited by the archive service — 429, retry after 60s. Nothing was written.",
        status: "failed",
        at: "14:33",
      },
    ],
  },
};

const FALLBACK = TRACES.summary;

export default function TraceTrailDemo({ values }: DemoProps) {
  const key = String(values.sample ?? "summary");
  const trace = TRACES[key] ?? FALLBACK;
  const showTimes = values.times !== false;
  const showSources = values.sources !== false;
  const startOpen = Boolean(values.open);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const steps = showSources
    ? trace.steps
    : trace.steps.map((step) => ({ ...step, source: undefined }));
  const selected = steps.find((step) => step.id === selectedId) ?? null;

  return (
    <div className="dm-tt-root">
      <header className="dm-tt-head">
        <div className="dm-tt-crumbs">
          <span>Docs</span>
          <span className="dm-tt-slash" aria-hidden="true">
            /
          </span>
          <strong>{trace.doc}</strong>
        </div>
        <span className="dm-tt-chip">Autosaved</span>
      </header>

      <div className="dm-tt-body">
        <article className="dm-tt-doc">
          <p className="dm-tt-ask">{trace.ask}</p>
          <p className="dm-tt-answer">{trace.answer}</p>
        </article>

        <section className="dm-tt-card" aria-label="This answer's provenance">
          <div className="dm-tt-card-head">
            <h3 className="dm-tt-card-title">This answer’s provenance</h3>
            <span className="dm-tt-card-meta">Activity</span>
          </div>

          <TraceTrail
            steps={steps}
            showTimes={showTimes}
            defaultOpen={startOpen}
            onStepSelect={(step) => setSelectedId(step.id)}
          />

          <p className="dm-tt-selected" aria-live="polite">
            {selected
              ? `Selected · ${selected.actor} — ${selected.action}`
              : "Pick a step to inspect the chain."}
          </p>
        </section>
      </div>
    </div>
  );
}
