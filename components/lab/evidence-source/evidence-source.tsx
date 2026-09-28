"use client";

import { useId, useState } from "react";
import "./evidence-source.css";

export type EvidenceStatus = "verified" | "probable" | "unverified";

export type EvidenceSourceData = {
  id: string;
  title: string;
  publisher?: string;
  excerpt: string;
  location?: string;
  status?: EvidenceStatus;
  confidence?: number;
  date?: string;
  href?: string;
};

export type EvidenceSourceProps = {
  source: EvidenceSourceData;
  /** Start unfolded. */
  defaultOpen?: boolean;
  /** Controlled expansion. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Overrides source.status when provided. */
  status?: EvidenceStatus;
  /** 0–1; renders as a small meter when provided. */
  confidence?: number;
  /** Fired by the “Open source” action so hosts can route it. */
  onOpenSource?: (source: EvidenceSourceData) => void;
  className?: string;
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  verified: "Verified",
  probable: "Probable",
  unverified: "Unverified",
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * EXPANDABLE EVIDENCE SOURCE — a citation that unfolds in place.
 *
 * Collapsed it is one compact line: glyph, title, status word, chevron.
 * Unfolded it grows into an inspectable card — excerpt, location, date,
 * publisher, a confidence reading and the way out to the original.
 * The expansion is a grid-template-rows transition, so it opens in
 * flow without measuring anything; reduced motion makes it instant.
 */
export function EvidenceSource({
  source,
  defaultOpen = false,
  open,
  onOpenChange,
  status,
  confidence,
  onOpenSource,
  className,
}: EvidenceSourceProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const panelId = useId();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const effectiveStatus = status ?? source.status ?? "verified";
  const effectiveConfidence = confidence ?? source.confidence;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const meta = [
    source.location ? { label: "Location", value: source.location } : null,
    source.date ? { label: "Date", value: source.date } : null,
    source.publisher ? { label: "Publisher", value: source.publisher } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  const confidencePercent =
    typeof effectiveConfidence === "number"
      ? Math.round(clamp01(effectiveConfidence) * 100)
      : null;

  return (
    <div
      className={`es-root${className ? ` ${className}` : ""}`}
      data-open={isOpen ? "true" : "false"}
    >
      <button
        type="button"
        className="es-summary"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="es-glyph" aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 1.75h5.25L12.5 5v9.25h-8.5z" />
            <path d="M9.25 1.75V5h3.25" />
          </svg>
        </span>
        <span className="es-title">{source.title}</span>
        <span className="es-sep" aria-hidden="true">
          ·
        </span>
        <span className="es-status" data-status={effectiveStatus}>
          <span className="es-status-dot" aria-hidden="true" />
          {STATUS_LABEL[effectiveStatus]}
        </span>
        <span className="es-chevron" aria-hidden="true">
          <svg
            viewBox="0 0 12 12"
            width="11"
            height="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        className="es-panel"
        role="region"
        aria-label={`Source details: ${source.title}`}
        inert={!isOpen}
      >
        <div className="es-panel-inner">
          <div className="es-body">
            <p className="es-excerpt">{source.excerpt}</p>

            {meta.length > 0 ? (
              <dl className="es-meta">
                {meta.map((item) => (
                  <div className="es-meta-row" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {confidencePercent !== null ? (
              <div className="es-confidence">
                <span className="es-confidence-label">Confidence</span>
                <span className="es-meter" aria-hidden="true">
                  <span
                    className="es-meter-fill"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </span>
                <span className="es-confidence-value">
                  {confidencePercent}%
                </span>
              </div>
            ) : null}

            <div className="es-open-row">
              {source.href ? (
                <a
                  className="es-open"
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onOpenSource?.(source)}
                >
                  Open source <span aria-hidden="true">↗</span>
                  <span className="es-sr-only sr-only">
                    {" "}
                    (opens in a new tab)
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  className="es-open"
                  onClick={() => onOpenSource?.(source)}
                >
                  Open source <span aria-hidden="true">↗</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
