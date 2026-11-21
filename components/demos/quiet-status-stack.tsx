"use client";

import { useMemo, useState } from "react";
import {
  QuietStatusStack,
  type StatusItem,
} from "@/components/lab/quiet-status-stack/quiet-status-stack";
import type { DemoProps } from "./demo-host";
import "./quiet-status-stack-demo.css";

type JobStatus = "pending" | "processing" | "success" | "error";

type Job = {
  id: string;
  name: string;
  size: string;
  status: JobStatus;
  progress: number;
  note: string;
};

const INITIAL: Job[] = [
  { id: "brand", name: "brand-guidelines.pdf", size: "12.4 MB", status: "processing", progress: 0.38, note: "Compressing 42 pages" },
  { id: "tokens", name: "color-tokens.zip", size: "1.2 MB", status: "success", progress: 1, note: "Ready to download" },
  { id: "hero", name: "hero-shoot.zip", size: "84 MB", status: "pending", progress: 0, note: "Waiting for upload" },
  { id: "archive", name: "archive-notes.txt", size: "0.4 MB", status: "error", progress: 0, note: "Checksum did not match" },
];

const NEW_NAMES = ["type-specimens.zip", "press-kit.pdf", "studio-map.svg", "contact-sheet.zip"];

export default function QuietStatusStackDemo({ values }: DemoProps) {
  const max = Number(values.max ?? 3);
  const auto = values.auto === undefined ? true : Boolean(values.auto);
  const [jobs, setJobs] = useState<Job[]>(INITIAL);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("Four jobs in this local batch.");
  const [counter, setCounter] = useState(0);

  const update = (id: string, patch: Partial<Job>) => {
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, ...patch } : job)),
    );
    setHidden((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  const advance = (job: Job) => {
    if (job.status === "pending") {
      update(job.id, { status: "processing", progress: 0.08, note: "Reading file" });
      setNotice(`${job.name} started.`);
      return;
    }
    if (job.status !== "processing") return;
    const progress = Math.min(1, job.progress + 0.24);
    if (progress >= 1) {
      update(job.id, { status: "success", progress: 1, note: "Ready to download" });
      setNotice(`${job.name} finished. The job row and the note agree.`);
    } else {
      update(job.id, { progress, note: `Compressing · ${Math.round(progress * 100)}%` });
      setNotice(`${job.name} at ${Math.round(progress * 100)}%.`);
    }
  };

  const fail = (job: Job) => {
    update(job.id, { status: "error", progress: 0, note: "Network dropped mid-transfer" });
    setNotice(`${job.name} failed. Its note stays until you retry or dismiss it.`);
  };

  const retry = (id: string) => {
    update(id, { status: "processing", progress: 0.12, note: "Retrying with a fresh connection" });
    setNotice("Retry started. Progress is being tracked on the job, not faked in the stack.");
  };

  const addJob = () => {
    const name = NEW_NAMES[counter % NEW_NAMES.length];
    const id = `${name}-${counter}`;
    setCounter((current) => current + 1);
    setJobs((current) => [
      ...current,
      { id, name, size: "3.8 MB", status: "pending", progress: 0, note: "Queued just now" },
    ]);
    setNotice(`${name} queued.`);
  };

  const dismiss = (id: string) => {
    setHidden((current) => new Set(current).add(id));
  };

  const notifications = useMemo<StatusItem[]>(() => {
    const priority: Record<JobStatus, number> = {
      error: 0,
      processing: 1,
      pending: 2,
      success: 3,
    };
    return jobs
      .filter((job) => !hidden.has(job.id))
      .slice()
      .sort((a, b) => priority[a.status] - priority[b.status])
      .map((job) => ({
          id: job.id,
          title: job.name,
          detail: job.note,
          status: job.status,
          progress: job.status === "processing" ? job.progress : undefined,
          dismissible: job.status !== "processing",
          autoDismissMs:
            auto && job.status === "success" ? 6000 : undefined,
          action:
            job.status === "error"
              ? { label: "Retry", onClick: () => retry(job.id) }
              : job.status === "success"
                ? {
                    label: "Open",
                    onClick: () => setNotice(`${job.name} opened in the sample folder.`),
                  }
                : undefined,
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, hidden, auto]);

  return (
    <div className="dm-qs-root">
      <header className="dm-qs-head">
        <div>
          <p className="dm-qs-kicker">FIELD OFFICE / PROCESSING DESK</p>
          <h2>Background work, at a glance.</h2>
          <p className="dm-qs-intro">
            Four local jobs. Each note reflects its job; progress comes from the
            row, not a decorative timer.
          </p>
        </div>
        <div className="dm-qs-tools">
          <button type="button" className="dm-qs-add" onClick={addJob}>
            + Add job
          </button>
          <button
            type="button"
            className="dm-qs-restore"
            onClick={() => {
              setHidden(new Set());
              setNotice("Every job note restored.");
            }}
          >
            Restore notes
          </button>
        </div>
      </header>

      <p className="dm-qs-notice" role="status">{notice}</p>

      <div className="dm-qs-layout">
        <section className="dm-qs-desk" aria-label="Upload jobs">
        <div className="dm-qs-desk-head">
          <span>Batch · Brand refresh</span>
          <span>{jobs.filter((job) => job.status === "processing").length} processing</span>
        </div>
        <ul className="dm-qs-jobs">
          {jobs.map((job) => (
            <li key={job.id} data-status={job.status}>
              <span className="dm-qs-file" aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="M5 2.8h6l4 4v10.4H5Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M11 2.8v4h4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="dm-qs-job-copy">
                <strong>{job.name}</strong>
                <small>{job.size} · {job.note}</small>
                {job.status === "processing" ? (
                  <span className="dm-qs-mini-bar" aria-hidden="true">
                    <i style={{ transform: `scaleX(${job.progress})` }} />
                  </span>
                ) : null}
              </div>
              <span className="dm-qs-status" data-status={job.status}>
                {job.status === "success"
                  ? "Done"
                  : job.status === "error"
                    ? "Failed"
                    : job.status === "processing"
                      ? `${Math.round(job.progress * 100)}%`
                      : "Queued"}
              </span>
              <div className="dm-qs-actions">
                {(job.status === "pending" || job.status === "processing") ? (
                  <button type="button" onClick={() => advance(job)}>
                    {job.status === "pending" ? "Start" : "Advance"}
                  </button>
                ) : null}
                {job.status === "processing" ? (
                  <button type="button" onClick={() => fail(job)}>Fail</button>
                ) : null}
                {job.status === "error" ? (
                  <button type="button" onClick={() => retry(job.id)}>Retry</button>
                ) : null}
                {job.status === "success" ? (
                  <button type="button" onClick={() => setNotice(`${job.name} opened in the sample folder.`)}>
                    Open
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <p className="dm-qs-desk-foot">
          Local simulation. Files are never read, uploaded or changed.
        </p>
        </section>

        <div className="dm-qs-dock">
          <p className="dm-qs-dock-label">
            Activity
            <span>
              {Math.min(notifications.length, max)} of {notifications.length} notes
            </span>
          </p>
          <QuietStatusStack
            items={notifications}
            onDismiss={dismiss}
            max={max}
            label="File processing activity"
          />
          {notifications.length === 0 ? (
            <p className="dm-qs-empty">All notes dismissed. Restore them above.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
