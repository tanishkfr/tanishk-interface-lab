"use client";

import { useState } from "react";
import {
  EvidenceSource,
  type EvidenceSourceData,
  type EvidenceStatus,
} from "@/components/lab/evidence-source/evidence-source";
import "./evidence-source-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a research answer with three citations.
 *
 * The same short answer, sourced three ways: a book chapter, a field
 * study and a forum answer, so status and confidence have something
 * real to say. The first source's status and expansion follow the
 * preview controls; the others keep their own.
 */

const SOURCES: EvidenceSourceData[] = [
  {
    id: "book",
    title: "Designing Interfaces, 3rd ed.",
    publisher: "O'Reilly Media",
    excerpt:
      "Progressive disclosure defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone. The pattern assumes the primary view can stand on its own, with defaults that are sensible before any configuration happens.",
    location: "Ch. 4, p. 71",
    status: "verified",
    confidence: 0.86,
    date: "2020",
    href: "https://example.com/books/designing-interfaces",
  },
  {
    id: "study",
    title: "Staged settings: defaults and first-run setup",
    publisher: "Field Methods Workshop",
    excerpt:
      "Across a semester of first-run observations, participants rarely opened the advanced panel; those who did typically arrived after a failed first attempt, which suggests the primary path was quietly doing the work of the secondary one.",
    location: "§3.2",
    status: "probable",
    confidence: 0.61,
    date: "2021",
  },
  {
    id: "forum",
    title: "How do you hide advanced options without hiding them?",
    publisher: "UI Craft forum",
    excerpt:
      "One answer argues for keeping the advanced panel but dropping its link from the empty state, so the full set of options stays one deliberate step away instead of two screens deep.",
    status: "unverified",
    confidence: 0.28,
    date: "2023",
    href: "https://example.com/forum/advanced-options",
  },
];

export default function EvidenceSourceDemo({ values }: DemoProps) {
  const firstStatus = String(values.status ?? "verified") as EvidenceStatus;
  const startOpen = Boolean(values.open ?? false);
  const showConfidence = Boolean(values.confidence ?? true);
  const many = Boolean(values.many ?? true);

  // The first source is controlled so the "Expanded" control visibly
  // moves it; the other rows keep their own local state.
  const [firstOpen, setFirstOpen] = useState(startOpen);
  const [lastStartOpen, setLastStartOpen] = useState(startOpen);
  if (startOpen !== lastStartOpen) {
    setLastStartOpen(startOpen);
    setFirstOpen(startOpen);
  }

  const sources = (many ? SOURCES : SOURCES.slice(0, 1)).map((source) =>
    showConfidence ? source : { ...source, confidence: undefined },
  );

  return (
    <div className="dm-es-root">
      <div className="dm-es-scroll">
        <article className="dm-es-answer">
          <p className="dm-es-question">
            How is progressive disclosure described in the interface
            literature?
          </p>

          <header className="dm-es-answer-head">
            <p className="dm-es-label">Answer</p>
            <span className="dm-es-note">
              {sources.length === 1 ? "1 source" : `${sources.length} sources`}
            </span>
          </header>

          <p className="dm-es-text">
            Most descriptions of progressive disclosure keep the primary
            surface legible and defer rarely used options to a second step,
            with sensible defaults standing in until someone asks for more.
            The same accounts usually insist on a visible way back to the full
            set, so the deferred options never read as removed.
          </p>

          <p className="dm-es-sources-label">Sources</p>

          <div className="dm-es-sources">
            {sources.map((source, index) => (
              <EvidenceSource
                key={source.id}
                source={source}
                status={index === 0 ? firstStatus : undefined}
                open={index === 0 ? firstOpen : undefined}
                onOpenChange={index === 0 ? setFirstOpen : undefined}
              />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
