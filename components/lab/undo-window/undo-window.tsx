"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { canRequestUndo } from "./undo-policy";
import "./undo-window.css";

export type UndoStatus = "available" | "pending" | "restored" | "failed" | "expired";
export type UndoEntry = { id: string; label: string; expiresAt: number; status: UndoStatus };
export type UndoWindowProps = {
  /** A single host-owned action. Replace its id when a new action supersedes it. */
  entry: UndoEntry | null;
  /** Request reversal; the host must report success or failure in entry.status. */
  onUndo: (id: string) => void;
  /** The deadline passed. The host decides how and when to finalize. */
  onExpire: (id: string) => void;
};

export function UndoWindow({ entry, onUndo, onExpire }: UndoWindowProps) {
  const [now, setNow] = useState(() => Date.now());
  const requested = useRef<string | null>(null);
  const expired = useRef<string | null>(null);
  const expireRef = useRef(onExpire);
  const actionRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => { expireRef.current = onExpire; }, [onExpire]);
  const id = entry?.id;
  const deadline = entry?.expiresAt;
  const status = entry?.status;

  const preserveFocus = useCallback(() => {
    if (document.activeElement === actionRef.current) statusRef.current?.focus();
  }, []);

  useEffect(() => {
    requested.current = null;
    expired.current = null;
  }, [id]);

  useEffect(() => {
    if (!id || status !== "available" || deadline === undefined) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline && expired.current !== id) {
        expired.current = id;
        preserveFocus();
        expireRef.current(id);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, [id, status, deadline, preserveFocus]);

  if (!entry) return null;
  const remaining = Math.max(0, Math.ceil((entry.expiresAt - now) / 1000));
  const available = canRequestUndo(entry.status, entry.expiresAt, now);
  const request = () => {
    const current = Date.now();
    if (!canRequestUndo(entry.status, entry.expiresAt, current)) {
      if (entry.status === "available" && expired.current !== entry.id) {
        expired.current = entry.id;
        preserveFocus();
        onExpire(entry.id);
      }
      return;
    }
    if (requested.current === entry.id) return;
    requested.current = entry.id;
    preserveFocus();
    onUndo(entry.id);
  };
  const message = entry.status === "pending" ? "Restoring…" : entry.status === "restored" ? "Restored" : entry.status === "failed" ? "Could not restore" : entry.status === "expired" || !available ? "Undo window ended" : "Archived";
  return (
    <section className="uw-window" aria-label="Recent action">
      <div className="uw-copy" ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
        <strong>{message}</strong><span>{entry.label}</span>
        {entry.status === "failed" ? <span>Try restoring it from the archive.</span> : null}
      </div>
      {available ? <div className="uw-action"><span>{remaining}s to undo</span><button ref={actionRef} type="button" onClick={request}>Undo</button></div> : null}
    </section>
  );
}
