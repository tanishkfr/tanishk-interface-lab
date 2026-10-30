"use client";

import { useState } from "react";
import { PermissionScopeInspector, type PermissionDecision, type PermissionRequest, type PermissionStatus } from "@/components/lab/permission-scope/permission-scope";
import type { DemoProps } from "./demo-host";
import "./permission-scope-demo.css";

export default function PermissionScopeDemo({ values }: DemoProps) {
  const scope = values.scope === "folder" ? "folder" : "selected";
  const operation = values.operation === "read" ? "read" : "read-write";
  const [sequence, setSequence] = useState(0);
  const [status, setStatus] = useState<PermissionStatus>("request");
  const [grant, setGrant] = useState<PermissionDecision | undefined>();
  const [lastConfig, setLastConfig] = useState(`${scope}:${operation}`);
  const config = `${scope}:${operation}`;
  if (config !== lastConfig) { setLastConfig(config); setStatus("request"); setGrant(undefined); }
  const request: PermissionRequest = {
    id: `${config}:${sequence}`,
    requester: "Mira · desktop assistant",
    purpose: "Organize the project notes into a review folder.",
    resource: scope === "folder" ? "All files in /Projects/Atlas" : "Three selected notes in /Projects/Atlas",
    requestedAccess: operation,
    denialEffect: "The assistant will stop and leave the files as they are.",
  };
  const restart = () => { setSequence((n) => n + 1); setStatus("request"); setGrant(undefined); };
  return <div className="pd-root" role="region" aria-label="Assistant permission demo" tabIndex={0}><header className="pd-header"><div><p>ATLAS / ASSISTANT</p><h2>Organize the review notes</h2></div><span>Local example</span></header><div className="pd-thread"><p className="pd-user">Please put the selected notes in a review folder.</p><p className="pd-assistant">I need access before I can inspect or move anything. Review the scope below.</p></div><PermissionScopeInspector request={request} status={status} grant={grant} onGrant={(decision) => { setGrant(decision); setStatus("granted"); }} onDeny={() => setStatus("denied")} onRevoke={() => setStatus("revoked")} /><div className="pd-actions">{status === "granted" ? <button type="button" onClick={() => setStatus("expired")}>Simulate expiry</button> : null}{status !== "request" ? <button type="button" onClick={restart}>New request</button> : null}</div><p className="pd-foot">Simulation only. No files are accessed or moved.</p></div>;
}
