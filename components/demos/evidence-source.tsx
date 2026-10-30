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
  { id: "guide", title: "Sample interface guide", publisher: "Fictional Design Archive", excerpt: "A primary view can present common choices first and place less frequent options in a secondary panel.", location: "Sample chapter 4", status: "verified", confidence: 0.86 },
  { id: "study", title: "Sample settings observation", publisher: "Fictional Research Studio", excerpt: "This invented observation illustrates how a source excerpt might appear in the component.", location: "Sample section 3", status: "probable", confidence: 0.61 },
  { id: "forum", title: "Sample discussion of advanced options", publisher: "Fictional Interface Forum", excerpt: "This invented discussion illustrates a different source and confidence value.", status: "unverified", confidence: 0.28 },
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
            How might progressive disclosure be described?
          </p>

          <header className="dm-es-answer-head">
            <p className="dm-es-label">Answer</p>
            <span className="dm-es-note">
              {sources.length === 1 ? "1 source" : `${sources.length} sources`}
            </span>
          </header>

          <p className="dm-es-text">
            In this fictional answer, common options appear first and less
            frequent choices are available in a secondary panel.
          </p>

          <p className="dm-es-sources-label">Fictional sample sources</p>
          <p className="dm-es-note">Status and confidence are illustrative values, not verification or relevance scores.</p>

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
