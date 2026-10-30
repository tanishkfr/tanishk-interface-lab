"use client";

import { useRef, useState } from "react";
import "./permission-scope.css";

export type PermissionAccess = "read" | "read-write";
export type PermissionDuration = "once" | "session";
export type PermissionStatus = "request" | "granted" | "denied" | "revoked" | "expired" | "superseded";
export type PermissionRequest = { id: string; requester: string; purpose: string; resource: string; requestedAccess: PermissionAccess; denialEffect: string };
export type PermissionDecision = { requestId: string; access: PermissionAccess; duration: PermissionDuration };
export type PermissionScopeProps = {
  request: PermissionRequest;
  /** Status and grant details must be confirmed by the host. */
  status: PermissionStatus;
  grant?: PermissionDecision;
  onGrant: (decision: PermissionDecision) => void;
  onDeny: (requestId: string) => void;
  onRevoke?: (requestId: string) => void;
};

/** Presentation only. Authorization and expiry enforcement belong to the host. */
export function PermissionScopeInspector(props: PermissionScopeProps) {
  const scopeKey = JSON.stringify([props.request.id, props.request.resource, props.request.requestedAccess]);
  return <ScopePanel key={scopeKey} {...props} />;
}

function ScopePanel({ request, status, grant, onGrant, onDeny, onRevoke }: PermissionScopeProps) {
  const root = useRef<HTMLElement>(null);
  const [access, setAccess] = useState<PermissionAccess>("read");
  const [duration, setDuration] = useState<PermissionDuration>("once");
  const [sent, setSent] = useState(false);
  const [lastStatus, setLastStatus] = useState(status);
  if (status !== lastStatus) { setLastStatus(status); setSent(false); }
  const effectiveAccess = request.requestedAccess === "read" ? "read" : access;
  const active = status === "request";
  const statusText: Record<PermissionStatus, string> = { request: "Permission requested", granted: "Grant active", denied: "Request denied", revoked: "Grant revoked", expired: "Grant expired", superseded: "Request superseded" };
  const decide = (kind: "grant" | "deny") => {
    if (!active || sent) return;
    setSent(true);
    root.current?.focus();
    if (kind === "deny") onDeny(request.id);
    else onGrant({ requestId: request.id, access: effectiveAccess, duration });
  };
  return (
    <section ref={root} tabIndex={-1} className="ps-root" aria-label="Permission request">
      <header className="ps-head"><div><p className="ps-eyebrow">{statusText[status]}</p><h3>{request.requester}</h3></div><span className="ps-badge">{status === "request" ? "Review" : statusText[status]}</span></header>
      <p className="ps-purpose">{request.purpose}</p>
      <dl className="ps-summary"><div><dt>Resource</dt><dd>{request.resource}</dd></div><div><dt>Requested access</dt><dd>{request.requestedAccess === "read-write" ? "Read and move files" : "Read files"}</dd></div></dl>
      {active ? <>
        <details className="ps-details"><summary>Inspect access and consequences</summary><p>Read allows inspection of the listed resource. Move allows changes to files within that scope. The host must enforce these limits.</p><p>If denied: {request.denialEffect}</p></details>
        <fieldset className="ps-field"><legend>Access to grant</legend><label><input type="radio" name={`access-${request.id}`} checked={effectiveAccess === "read"} onChange={() => setAccess("read")} /> Read only</label>{request.requestedAccess === "read-write" ? <label><input type="radio" name={`access-${request.id}`} checked={effectiveAccess === "read-write"} onChange={() => setAccess("read-write")} /> Read and move</label> : null}</fieldset>
        <fieldset className="ps-field"><legend>Duration</legend><label><input type="radio" name={`duration-${request.id}`} checked={duration === "once"} onChange={() => setDuration("once")} /> Once</label><label><input type="radio" name={`duration-${request.id}`} checked={duration === "session"} onChange={() => setDuration("session")} /> This session</label></fieldset>
        <div className="ps-actions"><button type="button" onClick={() => decide("deny")} disabled={sent}>Deny</button><button type="button" className="ps-primary" onClick={() => decide("grant")} disabled={sent}>Allow selected access</button></div>
        {sent ? <p className="ps-note" role="status">Waiting for the host to confirm the decision.</p> : null}
      </> : <div className="ps-result" role="status"><strong>{statusText[status]}</strong>{status === "granted" && grant && grant.requestId === request.id ? <p>{grant.access === "read-write" ? "Read and move" : "Read only"} · {grant.duration === "once" ? "Once" : "This session"}</p> : null}{status === "denied" ? <p>{request.denialEffect}</p> : null}{status === "granted" && onRevoke ? <button type="button" onClick={() => { if (!sent) { setSent(true); root.current?.focus(); onRevoke(request.id); } }} disabled={sent}>Request revocation</button> : null}{sent ? <p>Waiting for the host to confirm.</p> : null}</div>}
      <p className="ps-foot">This interface communicates a decision. The host enforces access and expiry.</p>
    </section>
  );
}
