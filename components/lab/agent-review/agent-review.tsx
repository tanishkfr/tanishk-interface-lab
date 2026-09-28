"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import "./agent-review.css";

export type DiffLineKind = "add" | "remove" | "context";

export type DiffLine = {
  kind: DiffLineKind;
  text: string;
  line?: number;
};

export type ReviewFile = {
  path: string;
  hunks: DiffLine[];
};

export type ReviewChange = {
  id: string;
  title: string;
  rationale: string;
  files: ReviewFile[];
};

export type ReviewDecision = "pending" | "accepted" | "rejected" | "revise";

export type ReviewEvidence = { label: string; value: string };

export type AgentReviewSurfaceProps = {
  /** The proposal: title, rationale, and one or more files of diff rows. */
  change: ReviewChange;
  /** Short evidence rows shown with the proposal. */
  evidence?: ReviewEvidence[];
  /** Controlled decision; omit to let the surface own the state. */
  decision?: ReviewDecision;
  /** Called with the reviewer's choice. */
  onDecision?: (decision: ReviewDecision, note?: string) => void;
  /** A / R / E key bindings, shown as hints. */
  shortcuts?: boolean;
  className?: string;
};

const SIGNS: Record<DiffLineKind, string> = {
  add: "+",
  remove: "−",
  context: " ",
};

const RESOLVED_TITLE: Record<Exclude<ReviewDecision, "pending">, string> = {
  accepted: "Change accepted",
  rejected: "Change rejected",
  revise: "Revision requested",
};

const RESOLVED_NOTE: Record<Exclude<ReviewDecision, "pending">, string> = {
  accepted: "The diff stays in view, locked with this decision.",
  rejected: "No changes are applied to the files above.",
  revise: "The proposal goes back to its author with the note.",
};

/**
 * AGENT REVIEW SURFACE — the step between a proposed change and a person.
 *
 * A titled proposal, a structured diff, the evidence the process used,
 * and three honest actions: accept, reject, revise. The diff is data,
 * so it works for code, documents and configuration alike, and the
 * decision is announced politely instead of moved into a modal.
 */
export function AgentReviewSurface({
  change,
  evidence,
  decision,
  onDecision,
  shortcuts = true,
  className,
}: AgentReviewSurfaceProps) {
  const [internal, setInternal] = useState<ReviewDecision>(decision ?? "pending");
  const [lastDecision, setLastDecision] = useState(decision);
  const [revising, setRevising] = useState(false);
  const [note, setNote] = useState("");
  const [noteFor, setNoteFor] = useState<{
    decision: ReviewDecision;
    note: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reviseRef = useRef<HTMLButtonElement>(null);
  const noteId = useId();

  // Keep the uncontrolled state following a controlled prop, per contract.
  if (decision !== lastDecision) {
    setLastDecision(decision);
    if (decision !== undefined) {
      setInternal(decision);
      // A host that resolves the decision externally also closes the note.
      if (decision !== "pending") {
        setRevising(false);
        setNote("");
      }
    }
  }

  const current = decision ?? internal;
  const resolved = current !== "pending";

  // Revise opens a note field: move focus in, and back on cancel.
  useEffect(() => {
    if (revising) textareaRef.current?.focus();
  }, [revising]);

  const decide = (next: ReviewDecision, withNote?: string) => {
    const trimmed = withNote?.trim();
    if (decision === undefined) setInternal(next);
    setRevising(false);
    setNote("");
    setNoteFor(trimmed ? { decision: next, note: trimmed } : null);
    onDecision?.(next, trimmed || undefined);
  };

  const cancelRevise = () => {
    setRevising(false);
    setNote("");
    reviseRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Shortcuts stay out of the way while the note is being written.
    if (!shortcuts || resolved || revising) return;
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    ) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (
      target &&
      target.closest("textarea, input, select, [contenteditable='true']")
    ) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === "a") {
      event.preventDefault();
      decide("accepted");
    } else if (key === "r") {
      event.preventDefault();
      decide("rejected");
    } else if (key === "e") {
      event.preventDefault();
      setRevising(true);
    }
  };

  const statusTitle = current === "pending" ? null : RESOLVED_TITLE[current];
  const bannerNote =
    noteFor && noteFor.decision === current ? noteFor.note : null;
  const resolvedSub =
    current === "pending" ? null : bannerNote ?? RESOLVED_NOTE[current];

  return (
    <div
      className={`ar-root${className ? ` ${className}` : ""}`}
      data-decision={current}
      onKeyDown={handleKeyDown}
    >
      <span className="ar-sr-only sr-only" role="status" aria-live="polite">
        {statusTitle ?? ""}
      </span>

      <header className="ar-head">
        <p className="ar-eyebrow">Proposed change</p>
        <h3 className="ar-title">{change.title}</h3>
        <p className="ar-rationale">{change.rationale}</p>
      </header>

      <div className="ar-files" data-locked={resolved ? "true" : "false"}>
        {change.files.map((file, fileIndex) => (
          <div
            key={`${file.path}:${fileIndex}`}
            className="ar-file"
            role="group"
            aria-label={file.path}
          >
            <div className="ar-file-head">
              <span className="ar-file-path">{file.path}</span>
              <span className="ar-file-count">
                {file.hunks.length} {file.hunks.length === 1 ? "line" : "lines"}
              </span>
            </div>
            <ul className="ar-diff">
              {file.hunks.map((line, index) => (
                <li
                  key={`${file.path}:${index}`}
                  className="ar-diff-row"
                  data-kind={line.kind}
                >
                  <span className="ar-sign" aria-hidden="true">
                    {SIGNS[line.kind]}
                  </span>
                  <span className="ar-lineno" aria-hidden="true">
                    {line.line ?? ""}
                  </span>
                  <span className="ar-text">
                    {line.kind === "add" ? (
                      <span className="ar-sr-only sr-only">added: </span>
                    ) : null}
                    {line.kind === "remove" ? (
                      <span className="ar-sr-only sr-only">removed: </span>
                    ) : null}
                    {line.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {evidence && evidence.length > 0 ? (
        <ul className="ar-evidence" aria-label="Evidence">
          {evidence.map((item) => (
            <li key={`${item.label}:${item.value}`} className="ar-chip">
              <span className="ar-chip-label">{item.label}</span>
              <span className="ar-chip-value">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {resolved ? (
        <div className="ar-resolved">
          <div className="ar-banner" data-state={current}>
            <span className="ar-banner-dot" aria-hidden="true" />
            <div className="ar-banner-copy">
              <p className="ar-banner-text">{statusTitle}</p>
              <p className="ar-banner-note">{resolvedSub}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="ar-actions">
          <div className="ar-action-row">
            <button
              type="button"
              className="ar-btn ar-btn--primary"
              onClick={() => decide("accepted")}
            >
              Accept change
              {shortcuts ? (
                <kbd className="ar-key" aria-hidden="true">
                  A
                </kbd>
              ) : null}
            </button>
            <button
              type="button"
              className="ar-btn"
              onClick={() => decide("rejected")}
            >
              Reject
              {shortcuts ? (
                <kbd className="ar-key" aria-hidden="true">
                  R
                </kbd>
              ) : null}
            </button>
            <button
              type="button"
              className="ar-btn"
              ref={reviseRef}
              aria-expanded={revising}
              aria-controls={revising ? noteId : undefined}
              onClick={() => (revising ? cancelRevise() : setRevising(true))}
            >
              Revise
              {shortcuts ? (
                <kbd className="ar-key" aria-hidden="true">
                  E
                </kbd>
              ) : null}
            </button>
          </div>

          {revising ? (
            <div className="ar-revise">
              <label className="ar-note-label" htmlFor={noteId}>
                What should change?
              </label>
              <textarea
                id={noteId}
                ref={textareaRef}
                className="ar-note"
                rows={3}
                value={note}
                placeholder="Name the adjustment — the author receives this note."
                onChange={(event) => setNote(event.target.value)}
              />
              <div className="ar-revise-actions">
                <button
                  type="button"
                  className="ar-btn ar-btn--primary"
                  onClick={() => decide("revise", note)}
                >
                  Send revision
                </button>
                <button type="button" className="ar-btn" onClick={cancelRevise}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
