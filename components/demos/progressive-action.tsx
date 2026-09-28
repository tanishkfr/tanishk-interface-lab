"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProgressiveAction } from "@/components/lab/progressive-action/progressive-action";
import type { ActionPhase } from "@/components/lab/progressive-action/progressive-action";
import "./progressive-action-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a document tool's summarise / upload / analyse pipeline.
 *
 * One control walks ready → running → review → done in place. The
 * pipeline is a local fiction (interval ticks to 0.7, then a pause),
 * and every interval and timeout is cleared on phase changes, on
 * control changes and on unmount.
 */

const TICK_MS = 60;
const TICK_STEP = 0.045;
const REVIEW_AT = 0.7;

type ActionKey = "generate" | "upload" | "analyze";

type ActionSpec = {
  labels: {
    ready: string;
    running: string;
    review: string;
    done: string;
    error: string;
  };
  summary: string;
  log: string;
};

const ACTIONS: Record<ActionKey, ActionSpec> = {
  generate: {
    labels: {
      ready: "Generate summary",
      running: "Summarising…",
      review: "Summary ready to check",
      done: "Summary ready",
      error: "Summary failed",
    },
    summary: "12 pages · 3 min read",
    log: "Summary generated",
  },
  upload: {
    labels: {
      ready: "Upload to archive",
      running: "Uploading 24 files…",
      review: "Upload ready to check",
      done: "Upload complete",
      error: "Upload failed",
    },
    summary: "24 files · 180 MB",
    log: "Upload finished",
  },
  analyze: {
    labels: {
      ready: "Analyse figures",
      running: "Analysing charts…",
      review: "Analysis ready to check",
      done: "Analysis ready",
      error: "Analysis failed",
    },
    summary: "4 charts · 2 anomalies",
    log: "Analysis finished",
  },
};

function stamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isActionKey(value: string): value is ActionKey {
  return value === "generate" || value === "upload" || value === "analyze";
}

export default function ProgressiveActionDemo({ values }: DemoProps) {
  const rawAction = String(values.action ?? "generate");
  const actionKey: ActionKey = isActionKey(rawAction) ? rawAction : "generate";
  const reviewOn = values.review === undefined ? true : Boolean(values.review);
  const autoplay = Boolean(values.autoplay ?? false);
  const fixedWidth = String(values.width ?? "auto") === "fixed" ? 280 : undefined;

  const [phase, setPhase] = useState<ActionPhase>("ready");
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("Nothing has run yet.");
  const [failNext, setFailNext] = useState(false);

  const actionRef = useRef<ActionKey>(actionKey);
  const reviewRef = useRef(reviewOn);
  const failRef = useRef(failNext);
  const tokenRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    reviewRef.current = reviewOn;
  }, [reviewOn]);

  useEffect(() => {
    failRef.current = failNext;
  }, [failNext]);

  /* A different action is a different pipeline — start it over. */
  const [lastActionKey, setLastActionKey] = useState(actionKey);
  if (actionKey !== lastActionKey) {
    setLastActionKey(actionKey);
    setPhase("ready");
    setProgress(undefined);
  }

  useEffect(() => {
    actionRef.current = actionKey;
    clearTimers();
    tokenRef.current += 1;
  }, [actionKey, clearTimers]);

  /* Leaving the review step behind if the control asks for it. */
  const [lastReview, setLastReview] = useState({ reviewOn, phase });
  if (lastReview.reviewOn !== reviewOn || lastReview.phase !== phase) {
    setLastReview({ reviewOn, phase });
    if (!reviewOn && phase === "review") {
      setProgress(1);
      setPhase("done");
      setStatus(`${ACTIONS[actionKey].log} at ${stamp()}`);
    }
  }

  useEffect(() => {
    if (!reviewOn && phase === "done") {
      clearTimers();
      tokenRef.current += 1;
    }
  }, [reviewOn, phase, clearTimers]);

  /* Unmount: drop every interval and timeout. */
  useEffect(() => clearTimers, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    tokenRef.current += 1;
    setProgress(1);
    setPhase("done");
    setStatus(`${ACTIONS[actionRef.current].log} at ${stamp()}`);
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    tokenRef.current += 1;
    setPhase("ready");
    setProgress(undefined);
  }, [clearTimers]);

  const run = useCallback(
    (auto: boolean) => {
      clearTimers();
      const token = ++tokenRef.current;
      const spec = ACTIONS[actionRef.current];
      const shouldFail = failRef.current;
      if (shouldFail) setFailNext(false);

      setPhase("running");
      setProgress(0);

      const settle = (next: ActionPhase, delay: number, finished: boolean) => {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          if (tokenRef.current !== token) return;
          if (finished) setProgress(1);
          setPhase(next);
          if (next === "done") setStatus(`${spec.log} at ${stamp()}`);
          if (next === "review" && auto) {
            timeoutRef.current = window.setTimeout(() => {
              timeoutRef.current = null;
              if (tokenRef.current !== token) return;
              setProgress(1);
              setPhase("done");
              setStatus(`${spec.log} at ${stamp()}`);
            }, 900);
          }
        }, delay);
      };

      let value = 0;
      timerRef.current = window.setInterval(() => {
        if (tokenRef.current !== token) {
          clearTimers();
          return;
        }
        value = Math.min(REVIEW_AT, value + TICK_STEP);
        setProgress(value);
        if (value < REVIEW_AT) return;
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (shouldFail) settle("error", 400, false);
        else if (reviewRef.current) settle("review", 260, false);
        else settle("done", 320, true);
      }, TICK_MS);
    },
    [clearTimers],
  );

  /* Auto-run: one full cycle, accepting the review step on the way. */
  const prevAutoRef = useRef(false);
  useEffect(() => {
    const was = prevAutoRef.current;
    prevAutoRef.current = autoplay;
    if (autoplay && !was) {
      reset();
      run(true);
    }
  }, [autoplay, reset, run]);

  const spec = ACTIONS[actionKey];

  return (
    <div className="dm-pa-root">
      <article className="dm-pa-doc">
        <header className="dm-pa-head">
          <p className="dm-pa-eyebrow">Documents · shared workspace</p>
          <h2 className="dm-pa-title">Quarterly review — draft</h2>
          <p className="dm-pa-meta">Last edited 12 minutes ago · 12 pages</p>
        </header>

        <p className="dm-pa-copy">
          Revenue held steady through the quarter while support volume fell for
          the second time this year. The appendix lists every change to the
          pricing table; two passages are still waiting on legal review.
        </p>

        <div className="dm-pa-facts">
          <span>4 charts</span>
          <span aria-hidden="true">·</span>
          <span>2 open comments</span>
          <span aria-hidden="true">·</span>
          <span>Draft v0.9</span>
        </div>

        <div className="dm-pa-action">
          <ProgressiveAction
            phase={phase}
            progress={progress}
            labels={spec.labels}
            reviewSummary={<span className="dm-pa-summary">{spec.summary}</span>}
            fixedWidth={fixedWidth}
            onRun={() => run(false)}
            onAccept={complete}
            onRetry={() => run(false)}
            onReset={reset}
          />
          <p className="dm-pa-status">{status}</p>
        </div>

        <label className="dm-pa-simulate">
          <input
            type="checkbox"
            checked={failNext}
            onChange={(event) => setFailNext(event.target.checked)}
          />
          <span>Simulate a failure on the next run</span>
        </label>
      </article>
    </div>
  );
}
