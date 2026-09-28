"use client";

import { useId, useState } from "react";
import "./trace-trail.css";

export type TraceStatus = "ok" | "warn" | "failed";

export type TraceStep = {
  id: string;
  actor: string;
  action: string;
  detail?: string;
  at?: string;
  source?: { label: string; href?: string };
  status?: TraceStatus;
};

type TraceTrailProps = {
  /** The ordered chain: who did what, in order. */
  steps: TraceStep[];
  /**
   * One-line collapsed text. Without it the step actions are joined
   * with a quiet arrow, which is the honest default for a trail.
   */
  summary?: string;
  /** Start expanded. */
  defaultOpen?: boolean;
  /** Show each step's timestamp. */
  showTimes?: boolean;
  /** Called when a step's actor + action are activated. */
  onStepSelect?: (step: TraceStep) => void;
  className?: string;
};

const STATUS_WORD: Record<TraceStatus, string> = {
  ok: "ok",
  warn: "warning",
  failed: "failed",
};

/** failed beats warn beats ok; a missing status counts as ok. */
function worstStatus(steps: TraceStep[]): TraceStatus {
  let worst: TraceStatus = "ok";
  for (const step of steps) {
    const status = step.status ?? "ok";
    if (status === "failed") return "failed";
    if (status === "warn") worst = "warn";
  }
  return worst;
}

/**
 * TRACE TRAIL — one line of provenance that opens into the chain.
 *
 * Collapsed it is a single button: a status dot derived from the worst
 * step, the actions joined by arrows, a step count and a chevron.
 * Expanded it is the ordered list itself — actor, action, detail, time
 * and the source each step used. Automated work should be able to say
 * where it came from without leaving the sentence being read.
 *
 * Expansion animates grid-template-rows and is instant under
 * prefers-reduced-motion. The closed panel is inert, so its links and
 * buttons never take focus while collapsed.
 */
export function TraceTrail({
  steps,
  summary,
  defaultOpen = false,
  showTimes = true,
  onStepSelect,
  className,
}: TraceTrailProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [lastDefaultOpen, setLastDefaultOpen] = useState(defaultOpen);
  const panelId = useId();

  // Uncontrolled, but a host that changes defaultOpen (a preview
  // control, a reset to defaults) should see the trail follow.
  if (defaultOpen !== lastDefaultOpen) {
    setLastDefaultOpen(defaultOpen);
    setOpen(defaultOpen);
  }

  if (steps.length === 0) {
    return (
      <div className={`tt-trail tt-trail-empty${className ? ` ${className}` : ""}`}>
        No recorded steps.
      </div>
    );
  }

  const worst = worstStatus(steps);
  const breadcrumb =
    summary ?? steps.map((step) => step.action).join(" → ");

  return (
    <div className={`tt-trail${className ? ` ${className}` : ""}`} data-open={open}>
      <button
        type="button"
        className="tt-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="tt-dot" data-status={worst} aria-hidden="true" />
        <span className="tt-sr">Status: {STATUS_WORD[worst]}.</span>
        <span className="tt-summary" title={breadcrumb}>
          {breadcrumb}
        </span>
        <span className="tt-count">
          {steps.length} {steps.length === 1 ? "step" : "steps"}
        </span>
        <svg
          className="tt-chevron"
          viewBox="0 0 16 16"
          width="12"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 6.25 8 10.25 12 6.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className="tt-panel"
        id={panelId}
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="tt-panel-inner">
          <ol className="tt-steps">
            {steps.map((step) => {
              const status = step.status ?? null;
              const statusWord =
                status === "failed" || status === "warn"
                  ? STATUS_WORD[status]
                  : null;
              const hasMeta = (showTimes && Boolean(step.at)) || Boolean(step.source);

              const text = (
                <>
                  <span className="tt-actor">{step.actor}</span>
                  <span className="tt-action">{step.action}</span>
                </>
              );

              return (
                <li className="tt-step" key={step.id} data-status={status ?? "none"}>
                  <span className="tt-marker" aria-hidden="true" />
                  <div className="tt-step-body">
                    <div className="tt-step-line">
                      {statusWord ? (
                        <span className="tt-status" data-status={status}>
                          {statusWord}
                        </span>
                      ) : null}
                      {onStepSelect ? (
                        <button
                          type="button"
                          className="tt-step-button"
                          onClick={() => onStepSelect(step)}
                        >
                          {text}
                        </button>
                      ) : (
                        <span className="tt-step-text">{text}</span>
                      )}
                    </div>

                    {step.detail ? <p className="tt-detail">{step.detail}</p> : null}

                    {hasMeta ? (
                      <p className="tt-meta">
                        {showTimes && step.at ? (
                          <span className="tt-time" title={step.at}>
                            {step.at}
                          </span>
                        ) : null}
                        {step.source ? (
                          step.source.href ? (
                            <a
                              className="tt-source"
                              href={step.source.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {step.source.label}
                            </a>
                          ) : (
                            <span className="tt-source tt-source-static">
                              {step.source.label}
                            </span>
                          )
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
