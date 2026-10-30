"use client";

import { useEffect, useRef, useState } from "react";
import { UndoWindow, type UndoEntry } from "@/components/lab/undo-window/undo-window";
import type { DemoProps } from "./demo-host";
import "./undo-window-demo.css";

type Project = { id: string; name: string; detail: string };
const PROJECTS: Project[] = [
  { id: "atlas", name: "Atlas research", detail: "8 tasks · Edited today" },
  { id: "field", name: "Field notes", detail: "12 tasks · Edited yesterday" },
  { id: "launch", name: "Launch checklist", detail: "5 tasks · Edited Monday" },
];
const deadlineAfter = (duration: number) => Date.now() + duration;

export default function UndoWindowDemo({ values }: DemoProps) {
  const duration = Number(values.duration ?? 30) * 1000;
  const fail = Boolean(values.fail);
  const [active, setActive] = useState(PROJECTS);
  const [archive, setArchive] = useState<Project[]>([]);
  const [entry, setEntry] = useState<UndoEntry | null>(null);
  const [notice, setNotice] = useState("Archive a project to try recovery.");
  const counter = useRef(0);
  const timer = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const focusUndo = useRef(false);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (focusUndo.current && entry?.status === "available") {
      focusUndo.current = false;
      root.current?.querySelector<HTMLButtonElement>(".uw-action button")?.focus();
    }
  }, [entry]);
  const archiveProject = (project: Project, keyboard: boolean) => {
    if (entry?.status === "pending") return;
    focusUndo.current = keyboard;
    setActive((items) => items.filter((item) => item.id !== project.id));
    setArchive((items) => [...items, project]);
    setEntry({ id: `${project.id}:${++counter.current}`, label: project.name, expiresAt: deadlineAfter(duration), status: "available" });
    setNotice("A newer archive replaces the previous quick-undo opportunity.");
  };
  const restore = (project: Project) => {
    setArchive((items) => items.filter((item) => item.id !== project.id));
    setActive((items) => [...items, project]);
    setNotice(`${project.name} restored to active projects.`);
  };
  const requestUndo = (id: string) => {
    if (!entry || entry.id !== id || entry.status !== "available") return;
    const project = archive.find((item) => item.id === id.split(":")[0]);
    if (!project) return;
    setEntry({ ...entry, status: "pending" });
    timer.current = window.setTimeout(() => {
      timer.current = null;
      if (fail) { setEntry((current) => current?.id === id ? { ...current, status: "failed" } : current); return; }
      restore(project);
      setEntry((current) => current?.id === id ? { ...current, status: "restored" } : current);
    }, 350);
  };
  return (
    <div className="ud-root" ref={root} role="region" aria-label="Project archive demo" tabIndex={0}>
      <header className="ud-head"><div><p>WORKSPACE / PROJECTS</p><h2>Active projects</h2></div><span>{active.length} active</span></header>
      <p className="ud-intro">Archive a project to clear your workspace. This sample keeps an archive for later recovery.</p>
      <ul className="ud-list">{active.map((project) => <li key={project.id}><div><strong>{project.name}</strong><span>{project.detail}</span></div><button type="button" disabled={entry?.status === "pending"} onClick={(event) => archiveProject(project, event.detail === 0)}>Archive<span className="ud-sr"> {project.name}</span></button></li>)}</ul>
      {active.length === 0 ? <p className="ud-empty">No active projects. Restore one from the archive below.</p> : null}
      <UndoWindow entry={entry} onUndo={requestUndo} onExpire={(id) => setEntry((current) => current?.id === id && current.status === "available" ? { ...current, status: "expired" } : current)} />
      <p className="ud-notice" role="status">{notice}</p>
      <details className="ud-archive"><summary>Archive ({archive.length})</summary>{archive.length ? <ul>{archive.map((project) => <li key={project.id}><span>{project.name}</span><button type="button" disabled={entry?.status === "pending"} onClick={() => { restore(project); setEntry((current) => current?.id.startsWith(`${project.id}:`) ? null : current); }}>Restore</button></li>)}</ul> : <p>No archived projects.</p>}</details>
      <p className="ud-foot">Local simulation. No projects are changed outside this preview.</p>
    </div>
  );
}
