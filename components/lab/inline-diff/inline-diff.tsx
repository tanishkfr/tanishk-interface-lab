"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { diffWords, type DiffSegment } from "./word-diff";
import "./inline-diff.css";

export type InlineDiffChange = {
  id: string;
  before: string;
  after: string;
  reason: string;
  author?: string;
  at?: string;
  segments?: DiffSegment[];
};

type InlineDiffTextProps = {
  change: InlineDiffChange;
  /**
   * Pre-computed word segments. Takes precedence over `change.segments`
   * and over diffing `before` / `after` with the bundled LCS.
   */
  segments?: DiffSegment[];
  /** Show the reason on first render. */
  defaultOpen?: boolean;
  /** When provided, an accept control appears next to the reason. */
  onAccept?: () => void;
  /** How strongly the change is tinted. */
  emphasis?: "quiet" | "marked";
  className?: string;
};

/**
 * INLINE DIFF TEXT — a sentence that changed, shown as a sentence.
 *
 * The removed words stay in place with a strikethrough and a muted
 * wash, the revision sits beside them, and the reason is one button
 * away. Removed and added runs carry screen-reader-only "removed:" /
 * "added:" prefixes, so the change is never carried by colour alone.
 *
 * Accepting is the host's call: pressing Accept reports through
 * onAccept and settles the local view on the revision — the reason
 * is kept, not discarded.
 */
export function InlineDiffText({
  change,
  segments,
  defaultOpen = false,
  onAccept,
  emphasis = "marked",
  className,
}: InlineDiffTextProps) {
  const [reasonOpen, setReasonOpen] = useState(defaultOpen);
  const [lastDefaultOpen, setLastDefaultOpen] = useState(defaultOpen);
  const [accepted, setAccepted] = useState(false);
  const panelId = useId();

  // Uncontrolled, but a host that changes defaultOpen (a preview
  // control, a reset to defaults) should see the reason follow.
  if (defaultOpen !== lastDefaultOpen) {
    setLastDefaultOpen(defaultOpen);
    setReasonOpen(defaultOpen);
  }

  const diff = useMemo(
    () => segments ?? change.segments ?? diffWords(change.before, change.after),
    [segments, change.segments, change.before, change.after],
  );

  const accept = () => {
    setAccepted(true);
    onAccept?.();
  };

  return (
    <section
      className={`id-root${className ? ` ${className}` : ""}`}
      data-emphasis={emphasis}
      data-settled={accepted}
      data-reason-open={reasonOpen}
    >
      <p className="id-sentence">
        {accepted ? change.after : renderSegments(diff)}
      </p>

      <div className="id-row">
        {accepted ? (
          <span className="id-accepted">
            <svg
              viewBox="0 0 16 16"
              width="11"
              height="11"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 8.5 6.4 12 13 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Accepted · reason kept
          </span>
        ) : null}

        <button
          type="button"
          className="id-reason"
          aria-expanded={reasonOpen}
          aria-controls={panelId}
          onClick={() => setReasonOpen((current) => !current)}
        >
          Reason
          <svg
            className="id-chevron"
            viewBox="0 0 16 16"
            width="11"
            height="11"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 6.25 8 10.25 12 6.25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {onAccept && !accepted ? (
          <button type="button" className="id-accept" onClick={accept}>
            Accept
          </button>
        ) : null}
      </div>

      <div
        className="id-panel"
        id={panelId}
        data-open={reasonOpen}
        aria-hidden={!reasonOpen}
        inert={!reasonOpen}
      >
        <div className="id-panel-inner">
          <p className="id-reason-text">{change.reason}</p>
          {change.author || change.at ? (
            <p className="id-byline">
              {change.author ? <span>{change.author}</span> : null}
              {change.author && change.at ? (
                <span aria-hidden="true">·</span>
              ) : null}
              {change.at ? <span title={change.at}>{change.at}</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      <p className="id-sr" role="status">
        {accepted ? "Revision accepted." : ""}
      </p>
    </section>
  );
}

/**
 * Removed and added runs are announced with their kind in a hidden
 * prefix. Tokens keep their trailing whitespace, so a final token
 * without one gets a shown space to stay legible against its
 * neighbour.
 */
function renderSegments(segments: DiffSegment[]): ReactNode {
  return segments.map((segment, index) => {
    if (segment.kind === "same") {
      return <span key={index}>{segment.text}</span>;
    }

    const gap = /\s$/.test(segment.text) ? "" : " ";

    if (segment.kind === "removed") {
      return (
        <del className="id-removed" key={index}>
          <span className="id-sr">{"removed: "}</span>
          {segment.text}
          {gap}
        </del>
      );
    }

    return (
      <ins className="id-added" key={index}>
        <span className="id-sr">{"added: "}</span>
        {segment.text}
        {gap}
      </ins>
    );
  });
}
