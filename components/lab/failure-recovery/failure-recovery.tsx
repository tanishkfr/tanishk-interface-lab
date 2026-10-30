"use client";

import { useRef, useState } from "react";
import "./failure-recovery.css";

export type RecoveryStepStatus = "pending" | "running" | "complete" | "failed" | "rolled-back";
export type RecoveryStep = { id: string; label: string; status: RecoveryStepStatus; detail?: string };
export type RecoveryPhase = "idle" | "running" | "failed" | "complete" | "rolled-back";
export type RetrySafety = "safe" | "confirm" | "unavailable";
export type FailureRecoveryProps = {
  title: string;
  phase: RecoveryPhase;
  steps: RecoveryStep[];
  /** Host-provided description of preserved work and whether it is usable. */
  preserved: string;
  retrySafety: RetrySafety;
  rollbackAvailable: boolean;
  onStart?: () => void;
  onRetry?: (stepId: string) => void;
  onRollback?: () => void;
};

const LABEL: Record<RecoveryStepStatus, string> = { pending: "Waiting", running: "In progress", complete: "Complete", failed: "Failed", "rolled-back": "Rolled back" };
const PHASE: Record<RecoveryPhase, string> = { idle: "Ready to export", running: "Export in progress", failed: "Export needs attention", complete: "Export complete", "rolled-back": "Rollback complete" };

/** Presents confirmed host state; the host executes and deduplicates operations. */
export function FailureRecoverySurface({ title, phase, steps, preserved, retrySafety, rollbackAvailable, onStart, onRetry, onRollback }: FailureRecoveryProps) {
  const [confirmRetry, setConfirmRetry] = useState(false);
  const root = useRef<HTMLElement>(null);
  const failed = steps.find((step) => step.status === "failed");
  const marker = `${phase}:${failed?.id ?? ""}:${retrySafety}`;
  const [lastMarker, setLastMarker] = useState(marker);
  if (marker !== lastMarker) { setLastMarker(marker); setConfirmRetry(false); }
  const requestRetry = () => {
    if (!failed || !onRetry || retrySafety === "unavailable") return;
    if (retrySafety === "confirm" && !confirmRetry) { setConfirmRetry(true); return; }
    setConfirmRetry(false);
    root.current?.focus();
    onRetry(failed.id);
  };
  return <section ref={root} tabIndex={-1} className="fr-root" aria-label={title}>
    <header className="fr-head"><div><p className="fr-eyebrow">WORKSPACE EXPORT</p><h3>{title}</h3></div><span className="fr-phase" data-phase={phase}>{PHASE[phase]}</span></header>
    <p className="fr-preserved" role="status" aria-live="polite">{preserved}</p>
    <ol className="fr-steps">{steps.map((step, index) => <li key={step.id} data-status={step.status}><span className="fr-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{step.label}</strong>{step.detail ? <p>{step.detail}</p> : null}</div><span className="fr-step-status">{LABEL[step.status]}</span></li>)}</ol>
    {phase === "idle" && onStart ? <div className="fr-actions"><button type="button" className="fr-primary" onClick={() => { root.current?.focus(); onStart(); }}>Start export</button></div> : null}
    {phase === "failed" ? <div className="fr-recovery"><h4>Choose a next step</h4><p>{retrySafety === "safe" ? "The host reports that retrying the failed step is safe." : retrySafety === "confirm" ? "Retry requires confirmation because the host cannot guarantee it is safe." : "Retry is not available for this operation."}</p>{confirmRetry && retrySafety === "confirm" ? <p className="fr-warning">Retrying may repeat work. Confirm with the host before proceeding.</p> : null}<div className="fr-actions">{failed && onRetry && retrySafety !== "unavailable" ? <button type="button" className="fr-primary" onClick={requestRetry}>{confirmRetry ? "Confirm retry" : `Retry ${failed.label}`}</button> : null}{confirmRetry ? <button type="button" onClick={() => setConfirmRetry(false)}>Cancel</button> : null}{rollbackAvailable && onRollback ? <button type="button" onClick={() => { root.current?.focus(); onRollback(); }}>Roll back</button> : <span>Rollback unavailable</span>}</div></div> : null}
    <p className="fr-foot">The host runs, deduplicates and confirms every operation.</p>
  </section>;
}
