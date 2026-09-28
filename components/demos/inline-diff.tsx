"use client";

import { useState } from "react";
import {
  InlineDiffText,
  type InlineDiffChange,
} from "@/components/lab/inline-diff/inline-diff";
import "./inline-diff-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — an editor's version history.
 *
 * Three passages, each carrying the chain of revisions that got it
 * there. The newest revision on each passage is still awaiting
 * review, so it has an Accept button; the older ones are history.
 * Each entry's before-text is the previous entry's after-text, so
 * the list reads as one document evolving.
 */

type Revision = InlineDiffChange & {
  rev: string;
  label: string;
  pending?: boolean;
};

type Scene = {
  doc: string;
  draft: string;
  revisions: Revision[];
};

const SCENES: Record<string, Scene> = {
  tighten: {
    doc: "Onboarding — one-pager",
    draft: "Onboarding needs a shorter path to first success.",
    revisions: [
      {
        id: "tighten-r2",
        rev: "Rev 2",
        label: "Cut the hedging",
        before: "We should probably try to improve the onboarding soon.",
        after: "Onboarding should improve soon.",
        reason: "Removed both hedges; kept the claim broad until the numbers land.",
        author: "you",
        at: "10:40",
      },
      {
        id: "tighten-r3",
        rev: "Rev 3",
        label: "Named the outcome",
        before: "Onboarding should improve soon.",
        after: "Onboarding needs a shorter path to first success.",
        reason: "Replaced the vague verb with the outcome the reader cares about.",
        author: "editor",
        at: "11:15",
      },
      {
        id: "tighten-r4",
        rev: "Rev 4",
        label: "Said what success is",
        before: "Onboarding needs a shorter path to first success.",
        after: "Onboarding needs a shorter path to the first saved project.",
        reason: "Named the first success so the claim can be measured.",
        author: "editor",
        at: "14:02",
        pending: true,
      },
    ],
  },

  tone: {
    doc: "Release notes — 4.2",
    draft: "Large exports now fail loudly instead of silently.",
    revisions: [
      {
        id: "tone-r2",
        rev: "Rev 2",
        label: "Led with the behaviour",
        before:
          "The new export flow fixes the bug where large archives failed silently.",
        after: "The export flow no longer fails silently on large archives.",
        reason: "Opened with what changed for the reader, not with the bug.",
        author: "you",
        at: "09:20",
      },
      {
        id: "tone-r3",
        rev: "Rev 3",
        label: "The reader's words",
        before: "The export flow no longer fails silently on large archives.",
        after: "Large exports now fail loudly instead of silently.",
        reason: "Tone pass: the note speaks in the reader's words now.",
        author: "editor",
        at: "09:48",
      },
      {
        id: "tone-r4",
        rev: "Rev 4",
        label: "What the reader gets",
        before: "Large exports now fail loudly instead of silently.",
        after: "Large exports now fail loudly, with the reason attached.",
        reason: "Said what the reader gets — a reason, not just a failure.",
        author: "editor",
        at: "10:05",
        pending: true,
      },
    ],
  },

  correct: {
    doc: "Ops handbook — retries",
    draft: "The retry window is 10 minutes; failures are kept for 24 hours.",
    revisions: [
      {
        id: "correct-r2",
        rev: "Rev 2",
        label: "Window corrected",
        before:
          "The retry window is 30 minutes, so overnight failures are dropped.",
        after:
          "The retry window is 10 minutes, so overnight failures are dropped.",
        reason: "Correction: the window was cut to 10 minutes in the last release.",
        author: "you",
        at: "16:31",
      },
      {
        id: "correct-r3",
        rev: "Rev 3",
        label: "Second clause fixed",
        before:
          "The retry window is 10 minutes, so overnight failures are dropped.",
        after: "The retry window is 10 minutes; failures are kept for 24 hours.",
        reason:
          "Failures are retained for a day, not dropped — the second clause was wrong.",
        author: "checks",
        at: "16:44",
      },
      {
        id: "correct-r4",
        rev: "Rev 4",
        label: "Kept, then archived",
        before: "The retry window is 10 minutes; failures are kept for 24 hours.",
        after:
          "The retry window is 10 minutes; failures are kept for 24 hours, then archived.",
        reason: "Said what happens after the 24 hours, per the scheduler's docs.",
        author: "checks",
        at: "17:02",
        pending: true,
      },
    ],
  },
};

const FALLBACK = SCENES.tighten;

export default function InlineDiffDemo({ values }: DemoProps) {
  const sample = String(values.sample ?? "tighten");
  const scene = SCENES[sample] ?? FALLBACK;
  const startOpen = Boolean(values.open);
  const emphasis = values.density === "quiet" ? "quiet" : "marked";

  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const pending = scene.revisions.find((revision) => revision.pending) ?? null;
  const draft = pending && accepted[pending.id] ? pending.after : scene.draft;

  return (
    <div className="dm-id-root">
      <header className="dm-id-head">
        <div className="dm-id-heading">
          <p className="dm-id-eyebrow">Editor</p>
          <h2 className="dm-id-title">{scene.doc}</h2>
        </div>
        <span className="dm-id-chip">Version history</span>
      </header>

      <div className="dm-id-body">
        <div className="dm-id-sheet">
          <p className="dm-id-label">Current draft</p>
          <p className="dm-id-draft">{draft}</p>

          <section className="dm-id-history" aria-label="Version history">
            <p className="dm-id-label">Version history</p>
            <ol className="dm-id-list">
              {scene.revisions.map((revision) => {
                const decided = Boolean(accepted[revision.id]);
                const state = decided
                  ? "accepted"
                  : revision.pending
                    ? "review"
                    : "recorded";
                const stateLabel =
                  state === "accepted"
                    ? "accepted"
                    : state === "review"
                      ? "awaiting review"
                      : "recorded";

                return (
                  <li className="dm-id-entry" key={revision.id}>
                    <div className="dm-id-entry-head">
                      <div className="dm-id-entry-id">
                        <p className="dm-id-rev">
                          {revision.rev}
                          <span aria-hidden="true"> · </span>
                          {revision.label}
                        </p>
                        <p className="dm-id-byline">
                          {revision.author}
                          <span aria-hidden="true"> · </span>
                          {revision.at}
                        </p>
                      </div>
                      <span className="dm-id-flag" data-state={state}>
                        {stateLabel}
                      </span>
                    </div>

                    <div className="dm-id-change">
                      <InlineDiffText
                        change={revision}
                        defaultOpen={startOpen}
                        emphasis={emphasis}
                        onAccept={
                          revision.pending
                            ? () =>
                                setAccepted((current) => ({
                                  ...current,
                                  [revision.id]: true,
                                }))
                            : undefined
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
