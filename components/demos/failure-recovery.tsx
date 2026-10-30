"use client";

import { useEffect, useRef, useState } from "react";
import { FailureRecoverySurface, type RecoveryPhase, type RecoveryStep } from "@/components/lab/failure-recovery/failure-recovery";
import type { DemoProps } from "./demo-host";
import "./failure-recovery-demo.css";

const TEMPLATE: RecoveryStep[] = [
  { id: "prepare", label: "Prepare archive" },
  { id: "collect", label: "Collect files" },
  { id: "package", label: "Package archive" },
  { id: "upload", label: "Upload archive" },
  { id: "verify", label: "Verify completion" },
].map((step) => ({ ...step, status: "pending" }));

export default function FailureRecoveryDemo({ values }: DemoProps) {
  const failure = values.failure === "package" ? "package" : values.failure === "none" ? "none" : "upload";
  const failRetry = Boolean(values.retryFail);
  const confirmRetry = Boolean(values.confirmRetry);
  const rollback = values.rollback === undefined ? true : Boolean(values.rollback);
  const [phase, setPhase] = useState<RecoveryPhase>("idle");
  const [steps, setSteps] = useState<RecoveryStep[]>(TEMPLATE);
  const [preserved, setPreserved] = useState("No export has started. The original workspace is unchanged.");
  const timer = useRef<number | null>(null);
  const token = useRef(0);
  const busy = useRef(false);
  useEffect(() => () => { token.current++; if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  const run = (startIndex: number, isRetry: boolean) => {
    if (busy.current) return;
    busy.current = true;
    const runId = ++token.current;
    setPhase("running");
    setPreserved(isRetry ? "Retrying the failed step. Previously completed steps are retained." : "Preparing a local sample export. No files are sent.");
    const runStep = (index: number) => {
      if (token.current !== runId) return;
      if (index >= TEMPLATE.length) { busy.current = false; setPhase("complete"); setPreserved("All sample steps completed. The simulated archive is ready."); return; }
      setSteps((current) => current.map((step, i) => i === index ? { ...step, status: "running", detail: undefined } : step));
      timer.current = window.setTimeout(() => {
        if (token.current !== runId) return;
        const shouldFail = isRetry ? (index === startIndex && failRetry) : TEMPLATE[index].id === failure;
        if (shouldFail) {
          busy.current = false;
          setSteps((current) => current.map((step, i) => i === index ? { ...step, status: "failed", detail: "The sample operation did not complete this step." } : step));
          setPhase("failed");
          setPreserved(index > 0 ? "Earlier steps remain complete. The failed step and later steps are unfinished; no completed export is available." : "No steps completed. The original workspace is unchanged.");
          return;
        }
        setSteps((current) => current.map((step, i) => i === index ? { ...step, status: "complete", detail: undefined } : step));
        runStep(index + 1);
      }, 320);
    };
    runStep(startIndex);
  };
  const retry = (id: string) => {
    const index = TEMPLATE.findIndex((step) => step.id === id);
    if (phase === "failed" && index >= 0) run(index, true);
  };
  const rollBack = () => {
    if (busy.current || phase !== "failed") return;
    token.current++;
    setSteps((current) => current.map((step) => step.status === "complete" ? { ...step, status: "rolled-back" } : step));
    setPhase("rolled-back");
    setPreserved("The sample's completed work was rolled back. The original workspace remains unchanged.");
  };
  const reset = () => { token.current++; if (timer.current !== null) window.clearTimeout(timer.current); busy.current = false; setSteps(TEMPLATE); setPhase("idle"); setPreserved("No export has started. The original workspace is unchanged."); };
  return <div className="fd-root" role="region" aria-label="Export recovery demo" tabIndex={0}><header className="fd-header"><div><p>ARCHIVE / EXPORTS</p><h2>Workspace archive</h2></div><span>Local example</span></header><p className="fd-intro">Export a fictional workspace and inspect what remains after a partial failure.</p><FailureRecoverySurface title="Export Atlas workspace" phase={phase} steps={steps} preserved={preserved} retrySafety={confirmRetry ? "confirm" : "safe"} rollbackAvailable={rollback} onStart={() => run(0, false)} onRetry={retry} onRollback={rollBack} /><div className="fd-footer">{phase === "complete" || phase === "rolled-back" ? <button type="button" onClick={reset}>Start another sample</button> : null}<p>Simulation only. No archive is created or uploaded.</p></div></div>;
}
