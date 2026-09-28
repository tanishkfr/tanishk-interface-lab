"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./progressive-action.css";

export type ActionPhase = "ready" | "running" | "review" | "done" | "error";

export type ProgressiveActionLabels = Partial<Record<ActionPhase, string>>;

export type ProgressiveActionProps = {
  /** Controlled phase — the host owns the workflow. */
  phase: ActionPhase;
  /** 0–1 while running; omit for an indeterminate bar. */
  progress?: number;
  onRun?: () => void;
  onAccept?: () => void;
  onRetry?: () => void;
  onReset?: () => void;
  /** Short summary shown in the review phase. */
  reviewSummary?: ReactNode;
  /** Override any phase's label. */
  labels?: ProgressiveActionLabels;
  /** Pins the control width so phase changes never resize it. */
  fixedWidth?: number;
  className?: string;
};

const DEFAULT_LABELS: Record<ActionPhase, string> = {
  ready: "Run",
  running: "Running…",
  review: "Ready for review",
  done: "Done",
  error: "Something went wrong",
};

const ANNOUNCEMENTS: Record<ActionPhase, string> = {
  ready: "Ready",
  running: "Running",
  review: "Ready for review",
  done: "Done",
  error: "Failed",
};

function CheckIcon() {
  return (
    <svg
      className="pa-icon"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 8.5 6.2 11.6 13 4.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="pa-icon"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 4.7v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
    </svg>
  );
}

/**
 * PROGRESSIVE ACTION — one control that walks a small workflow in
 * place: ready, running with real progress, an optional review beat,
 * then done or error. No modal, no toast; the host owns the work and
 * this button owns the honesty. Phase changes are announced politely.
 */
export function ProgressiveAction({
  phase,
  progress,
  onRun,
  onAccept,
  onRetry,
  onReset,
  reviewSummary,
  labels,
  fixedWidth,
  className,
}: ProgressiveActionProps) {
  const [announcement, setAnnouncement] = useState("");
  const lastPhaseRef = useRef<ActionPhase | null>(null);

  useEffect(() => {
    if (lastPhaseRef.current === null) {
      lastPhaseRef.current = phase;
      return;
    }
    if (lastPhaseRef.current === phase) return;
    lastPhaseRef.current = phase;
    setAnnouncement(ANNOUNCEMENTS[phase]);
  }, [phase]);

  const labelFor = (key: ActionPhase) => labels?.[key] ?? DEFAULT_LABELS[key];

  const raw =
    typeof progress === "number" && Number.isFinite(progress) ? progress : undefined;
  const clamped = raw === undefined ? undefined : Math.min(1, Math.max(0, raw));
  const pct = clamped === undefined ? undefined : Math.round(clamped * 100);
  const valueText = pct === undefined ? "In progress" : `${pct}%`;

  return (
    <div
      className={`pa-root${className ? ` ${className}` : ""}`}
      data-phase={phase}
      style={fixedWidth ? { inlineSize: `${fixedWidth}px` } : undefined}
    >
      <div className="pa-row">
        <span className="pa-slot">
          <button
            type="button"
            className="pa-main"
            data-state={phase}
            aria-disabled={phase !== "ready"}
            onClick={phase === "ready" ? onRun : undefined}
          >
            <span className="pa-face">
              {phase === "done" ? <CheckIcon /> : null}
              {phase === "error" ? <AlertIcon /> : null}
              <span className="pa-face-label">{labelFor(phase)}</span>
            </span>
          </button>

          {phase === "running" ? (
            <span
              className="pa-rail"
              role="progressbar"
              aria-label="Action progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={valueText}
              data-indeterminate={clamped === undefined ? "true" : "false"}
            >
              <span
                className="pa-rail-fill"
                style={
                  clamped !== undefined
                    ? { transform: `scaleX(${clamped})` }
                    : undefined
                }
              />
            </span>
          ) : null}
        </span>

        {phase === "running" ? (
          <button type="button" className="pa-action" onClick={onReset}>
            Cancel
          </button>
        ) : null}
        {phase === "done" ? (
          <button type="button" className="pa-action pa-action--go" onClick={onReset}>
            Run again
          </button>
        ) : null}
        {phase === "error" ? (
          <button type="button" className="pa-action pa-action--go" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>

      {phase === "review" ? (
        <div className="pa-review">
          <div className="pa-review-summary">
            {reviewSummary ?? (
              <p className="pa-review-default">
                The step finished. Check the result before accepting.
              </p>
            )}
          </div>
          <div className="pa-review-actions">
            <button
              type="button"
              className="pa-action pa-action--go"
              onClick={onAccept}
            >
              Accept
            </button>
            <button type="button" className="pa-action" onClick={onReset}>
              Run again
            </button>
          </div>
        </div>
      ) : null}

      <span className="pa-sr" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
