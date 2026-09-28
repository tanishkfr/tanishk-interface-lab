"use client";

import { useId, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import "./morphing-metadata.css";

export type MetadataRecord = {
  id: string;
  title: string;
  kind: string;
  summary: Record<string, string>;
  detail: { label: string; value: string }[];
};

export type MorphingMetadataProps = {
  /** The record to render. */
  record: MetadataRecord;
  /** Controlled expansion; omit to let the record toggle itself. */
  expanded?: boolean;
  /** Initial state in uncontrolled use. */
  defaultExpanded?: boolean;
  /**
   * `auto` morphs with the View Transitions API where it exists and
   * settles with a CSS row animation otherwise. `view-transition` asks
   * for the API only; `none` swaps states instantly.
   */
  transition?: "auto" | "view-transition" | "none";
  /** Notifies the host every time the record opens or closes. */
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
};

type Row = { key: string; label: string; value: string };

function slug(value: string): string {
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "x";
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Merge detail over summary, case-insensitively by label: every summary
 * pair keeps its place, but when a detail row shares its label the detail
 * row replaces the pair instead of duplicating it; the remaining detail
 * rows follow. Both states render the same values — expansion only adds.
 */
function buildRows(record: MetadataRecord): Row[] {
  const detailByLabel = new Map<string, { label: string; value: string }>();
  for (const row of record.detail) {
    const key = row.label.trim().toLowerCase();
    if (!detailByLabel.has(key)) detailByLabel.set(key, row);
  }

  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const [label, value] of Object.entries(record.summary)) {
    const key = label.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const match = detailByLabel.get(key);
    rows.push(
      match
        ? { key, label: match.label, value: match.value }
        : { key, label, value },
    );
  }
  for (const row of record.detail) {
    const key = row.label.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ key, label: row.label, value: row.value });
  }
  return rows;
}

/**
 * A view-transition-name may appear only once in a document per capture,
 * so names are computed from the labels present in the current state and
 * duplicates (two labels slugifying alike) are skipped silently.
 */
function namesFor(labels: string[], base: string): (string | undefined)[] {
  const seen = new Set<string>();
  return labels.map((label) => {
    const name = `${base}-${slug(label)}`;
    if (seen.has(name)) return undefined;
    seen.add(name);
    return name;
  });
}

function nameStyle(name: string | undefined): CSSProperties | undefined {
  return name ? { viewTransitionName: name } : undefined;
}

function RecordGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M3.6 1.9h5l3.8 3.8v8.1a.8.8 0 0 1-.8.8H3.6a.8.8 0 0 1-.8-.8V2.7a.8.8 0 0 1 .8-.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M8.6 2v3.7h3.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * MORPHING METADATA — one surface, two densities.
 *
 * Compact is a single row: glyph, title, kind and the summary pairs as
 * chips. Expanded keeps that row in place and turns the same values into
 * a definition list; values shared between summary and detail are named
 * with the same `view-transition-name`, so a supporting browser morphs
 * them from chip to row instead of opening a panel underneath. The
 * View Transition is skipped under prefers-reduced-motion or without the
 * API, where `auto` falls back to a short CSS settle on the new rows.
 */
export function MorphingMetadata({
  record,
  expanded,
  defaultExpanded = false,
  transition = "auto",
  onExpandedChange,
  className,
}: MorphingMetadataProps) {
  const uid = useId();
  const [internal, setInternal] = useState(defaultExpanded);
  const [cssMorph, setCssMorph] = useState(false);

  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internal;

  const rows = buildRows(record);
  const summaryEntries = Object.entries(record.summary);
  const namesOn = transition !== "none";
  const vtBase = `mm-${slug(record.id)}`;
  const compactNames = namesOn
    ? namesFor(
        summaryEntries.map(([label]) => label),
        vtBase,
      )
    : [];
  const detailNames = namesOn ? namesFor(rows.map((row) => row.label), vtBase) : [];

  const bodyId = `${uid}-body`;

  const commit = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onExpandedChange?.(next);
  };

  const handleToggle = () => {
    const next = !isExpanded;
    if (transition !== "none") {
      const reduced = prefersReducedMotion();
      if (
        !reduced &&
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function"
      ) {
        let updated = false;
        try {
          /* flushSync keeps the React commit inside the capture window,
             which is what makes the shared value names actually morph. */
          document.startViewTransition(() => {
            updated = true;
            flushSync(() => commit(next));
          });
          return;
        } catch {
          if (updated) return;
        }
      }
      if (transition === "auto" && !reduced) setCssMorph(true);
    }
    commit(next);
  };

  return (
    <div
      className={`mm-root${className ? ` ${className}` : ""}`}
      data-expanded={isExpanded ? "true" : "false"}
      data-transition={transition}
      data-css-morph={cssMorph ? "true" : undefined}
      style={namesOn ? { viewTransitionName: vtBase } : undefined}
    >
      <div className="mm-head">
        <span className="mm-glyph" aria-hidden="true">
          <RecordGlyph />
        </span>

        <span className="mm-heading">
          <span className="mm-title">{record.title}</span>
          <span className="mm-kind">{record.kind}</span>
        </span>

        {!isExpanded && (
          <div className="mm-chips" id={bodyId}>
            {summaryEntries.map(([label, value], index) => (
              <span className="mm-chip" key={`${label}-${index}`}>
                <span className="mm-chip-label">{label}</span>
                <span className="mm-chip-value" style={nameStyle(compactNames[index])}>
                  {value}
                </span>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          className="mm-toggle"
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          aria-label={`${isExpanded ? "Hide" : "Show"} details for ${record.title}`}
          onClick={handleToggle}
        >
          <span>{isExpanded ? "Hide details" : "Show details"}</span>
          <svg className="mm-caret" viewBox="0 0 10 10" width="9" height="9" aria-hidden="true" focusable="false">
            <path
              d="M1.7 3.4 5 6.7l3.3-3.3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <dl className="mm-detail" id={bodyId}>
          {rows.map((row, index) => (
            <div className="mm-row" key={row.key}>
              <dt className="mm-term">{row.label}</dt>
              <dd className="mm-value" style={nameStyle(detailNames[index])}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
