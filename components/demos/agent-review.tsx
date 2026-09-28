"use client";

import { useState } from "react";
import {
  AgentReviewSurface,
  type ReviewChange,
  type ReviewDecision,
  type ReviewEvidence,
} from "@/components/lab/agent-review/agent-review";
import "./agent-review-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a review inbox with one proposal in full.
 *
 * Three proposals with real, self-consistent diffs: a schema rename,
 * a copy edit and a config change. The decision is local to the sample,
 * so pressing the buttons visibly moves the surface even before the
 * host's own state exists.
 */

type SampleId = "rename" | "copy" | "config";

const SAMPLES: Record<
  SampleId,
  { change: ReviewChange; evidence: ReviewEvidence[] }
> = {
  rename: {
    change: {
      id: "schema-rename",
      title: "Rename `total` columns to `amount` in orders.sql",
      rationale:
        "The billing service already reads amount_cents, so renaming here removes a translation layer three call sites work around.",
      files: [
        {
          path: "db/schema/orders.sql",
          hunks: [
            { kind: "context", text: "CREATE TABLE orders (", line: 12 },
            { kind: "remove", text: "  total_cents integer NOT NULL,", line: 14 },
            { kind: "add", text: "  amount_cents integer NOT NULL,", line: 14 },
            { kind: "context", text: "  currency char(3) NOT NULL,", line: 15 },
            { kind: "remove", text: "  total_updated_at timestamptz,", line: 16 },
            { kind: "add", text: "  amount_updated_at timestamptz,", line: 16 },
            { kind: "context", text: ");", line: 17 },
          ],
        },
      ],
    },
    evidence: [
      { label: "Call sites", value: "3 updated" },
      { label: "Schema", value: "v4 migration ready" },
      { label: "Tests", value: "12 passing" },
    ],
  },
  copy: {
    change: {
      id: "copy-edit",
      title: "Rewrite the first-sync instructions in getting-started.md",
      rationale:
        "The old copy implied a blocking wait and never named the control; the replacement names the button and the exact state that means success.",
      files: [
        {
          path: "docs/getting-started.md",
          hunks: [
            { kind: "context", text: "## Running the first sync", line: 24 },
            {
              kind: "remove",
              text: "Click the button and wait for the process to",
              line: 25,
            },
            {
              kind: "remove",
              text: "finish before moving on to the next step.",
              line: 26,
            },
            {
              kind: "add",
              text: "Select **Start sync**, then wait for the status line",
              line: 25,
            },
            {
              kind: "add",
              text: "to read **Synced** before moving on.",
              line: 26,
            },
            { kind: "context", text: "", line: 27 },
            {
              kind: "context",
              text: "If nothing happens after a minute, check the",
              line: 28,
            },
            { kind: "context", text: "connection log before retrying.", line: 29 },
          ],
        },
      ],
    },
    evidence: [
      { label: "Style guide", value: "2 rules applied" },
      { label: "Readability", value: "grade 8" },
      { label: "Screenshots", value: "unchanged" },
    ],
  },
  config: {
    change: {
      id: "config-scale",
      title: "Give the preview service a second replica and a real health check",
      rationale:
        "Preview builds queue behind a single replica, and /status returns 200 while the worker pool is stalled; /healthz checks the pool itself.",
      files: [
        {
          path: "deploy/preview.yaml",
          hunks: [
            { kind: "context", text: "services:", line: 4 },
            { kind: "context", text: "  web:", line: 5 },
            { kind: "remove", text: "    replicas: 1", line: 6 },
            { kind: "add", text: "    replicas: 2", line: 6 },
            { kind: "context", text: "    healthcheck:", line: 7 },
            { kind: "remove", text: "      path: /status", line: 8 },
            { kind: "remove", text: "      interval: 30s", line: 9 },
            { kind: "add", text: "      path: /healthz", line: 8 },
            { kind: "add", text: "      interval: 10s", line: 9 },
          ],
        },
      ],
    },
    evidence: [
      { label: "Queue time", value: "p95 · 41s" },
      { label: "Probe", value: "/healthz exists" },
      { label: "Rollback", value: "one command" },
    ],
  },
};

export default function AgentReviewDemo({ values }: DemoProps) {
  const sample = String(values.sample ?? "rename") as SampleId;
  const stateValue = String(values.state ?? "pending") as ReviewDecision;
  const showEvidence = Boolean(values.evidence ?? true);
  const shortcuts = Boolean(values.shortcuts ?? true);

  const active = SAMPLES[sample] ?? SAMPLES.rename;

  // Local decision: the buttons work in every state, and the "state"
  // control (or a different proposal) resets the surface.
  const [decision, setDecision] = useState<ReviewDecision>(stateValue);
  const [lastReset, setLastReset] = useState({ sample, state: stateValue });
  if (lastReset.sample !== sample || lastReset.state !== stateValue) {
    setLastReset({ sample, state: stateValue });
    setDecision(stateValue);
  }

  return (
    <div className="dm-ar-root">
      <header className="dm-ar-head">
        <div>
          <p className="dm-ar-eyebrow">Review inbox</p>
          <h2 className="dm-ar-title">Proposals awaiting a human</h2>
        </div>
        <span className="dm-ar-count">1 open</span>
      </header>

      <div className="dm-ar-body">
        <AgentReviewSurface
          key={active.change.id}
          change={active.change}
          evidence={showEvidence ? active.evidence : undefined}
          decision={decision}
          onDecision={(next) => setDecision(next)}
          shortcuts={shortcuts}
        />
      </div>

      <footer className="dm-ar-foot">
        Decisions in this preview are local to the sample — nothing is saved
        or sent.
      </footer>
    </div>
  );
}
