"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import sampleJson from "@/lib/afterclick/sample-recording.json";
import {
  MAX_FILE_BYTES,
  addAnnotation,
  buildStateMap,
  formatDuration,
  isActionKind,
  parseRecording,
  parseRecordingFile,
  removeAnnotation,
  serializeRecording,
  shortUrl,
  summarizeRecording,
  type Recording,
} from "@/lib/afterclick/schema";
import { buildHtmlReport, canvasToBlob, renderReportCanvas } from "./report";
import { StateMap } from "./state-map";
import { Timeline } from "./timeline";
import { Inspector } from "./inspector";

type SourceKind = "sample" | "imported";
type Notice = { tone: "info" | "warn" | "error"; text: string; lines?: string[] };
type ExportKind = "json" | "png" | "html" | null;

const SAMPLE_PARSED = parseRecording(sampleJson);
if (!SAMPLE_PARSED.ok) {
  throw new Error(`The bundled AFTERCLICK sample is invalid: ${SAMPLE_PARSED.error}`);
}
const SAMPLE_RECORDING = SAMPLE_PARSED.recording;

function copySample(): Recording {
  return structuredClone(SAMPLE_RECORDING);
}

function initialSelection(recording: Recording): string | null {
  const action = recording.events.find((event) => isActionKind(event.kind));
  return action?.id ?? recording.events[0]?.id ?? null;
}

function safeFilename(recording: Recording, extension: string): string {
  const slug =
    recording.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "recording";
  const stamp = recording.startedAt.slice(0, 19).replace(/[T:]/g, "-");
  return `afterclick-${slug}-${stamp}.${extension}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function Afterclick() {
  const [recording, setRecording] = useState<Recording>(copySample);
  const [source, setSource] = useState<SourceKind>("sample");
  const [fileName, setFileName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialSelection(SAMPLE_RECORDING),
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState<ExportKind>(null);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const exportMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutside(event: PointerEvent) {
      const menu = exportMenu.current;
      if (menu?.open && !menu.contains(event.target as Node)) {
        menu.removeAttribute("open");
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") exportMenu.current?.removeAttribute("open");
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const map = useMemo(() => buildStateMap(recording), [recording]);
  const summary = useMemo(() => summarizeRecording(recording), [recording]);
  const selectedEvent = useMemo(
    () => recording.events.find((event) => event.id === selectedId) ?? null,
    [recording.events, selectedId],
  );

  const selectEvent = useCallback((id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
      window.requestAnimationFrame(() => {
        document.getElementById("ac-inspector")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    }
  }, []);

  function useSample() {
    const next = copySample();
    setRecording(next);
    setSource("sample");
    setFileName("");
    setSelectedId(initialSelection(next));
    setNotice({
      tone: "info",
      text: "Sample recording loaded from the local Harbor & Pine fixture.",
    });
  }

  async function importFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".json")) {
      setNotice({
        tone: "error",
        text: "That file is not a .json recording.",
      });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setNotice({
        tone: "error",
        text: `That recording is too large. Limit: ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB.`,
      });
      return;
    }
    setImporting(true);
    try {
      const parsed = parseRecordingFile(await file.text());
      if (!parsed.ok) {
        setNotice({ tone: "error", text: parsed.error, lines: parsed.details });
        return;
      }
      setRecording(parsed.recording);
      setSource("imported");
      setFileName(file.name);
      setSelectedId(initialSelection(parsed.recording));
      setNotice(
        parsed.warnings.length
          ? {
              tone: "warn",
              text: `Imported with ${parsed.warnings.length} warning${parsed.warnings.length === 1 ? "" : "s"}.`,
              lines: parsed.warnings,
            }
          : { tone: "info", text: `Imported ${parsed.recording.events.length} events.` },
      );
    } catch (error) {
      setNotice({
        tone: "error",
        text: "The file could not be read.",
        lines: [error instanceof Error ? error.message : "The browser rejected the read."],
      });
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function addNote(eventId: string, text: string): boolean {
    const next = structuredClone(recording);
    if (!addAnnotation(next, eventId, text)) return false;
    setRecording(next);
    setNotice({ tone: "info", text: "Annotation added. Export to keep it." });
    return true;
  }

  function deleteNote(annotationId: string): void {
    const next = structuredClone(recording);
    if (!removeAnnotation(next, annotationId)) return;
    setRecording(next);
    setNotice({ tone: "info", text: "Annotation removed." });
  }

  async function exportRecording(kind: Exclude<ExportKind, null>) {
    exportMenu.current?.removeAttribute("open");
    setExporting(kind);
    setNotice(null);
    try {
      if (kind === "json") {
        downloadBlob(
          new Blob([serializeRecording(recording)], { type: "application/json" }),
          safeFilename(recording, "json"),
        );
        setNotice({ tone: "info", text: "Portable JSON exported." });
        return;
      }
      if (kind === "png") {
        const canvas = await renderReportCanvas(recording);
        downloadBlob(await canvasToBlob(canvas), safeFilename(recording, "png"));
        setNotice({ tone: "info", text: "PNG report exported." });
        return;
      }
      const html = buildHtmlReport(recording);
      downloadBlob(
        new Blob([html], { type: "text/html;charset=utf-8" }),
        safeFilename(recording, "html"),
      );
      setNotice({ tone: "info", text: "Self-contained HTML report exported." });
    } catch (error) {
      setNotice({
        tone: "error",
        text: "The report could not be rendered.",
        lines: [error instanceof Error ? error.message : "Canvas export failed."],
      });
    } finally {
      setExporting(null);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void importFile(file);
  }

  return (
    <div
      className="project-world world-afterclick"
      onDragEnter={(event) => {
        if (event.dataTransfer.types.includes("Files")) setDragging(true);
      }}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="v2-wrap ac-studio">
        <header className="ac-topbar">
          <div className="ac-topbar-brand">
            <Link href="/tools" className="ac-back" aria-label="Back to all tools">
              ←
            </Link>
            <span className="ac-brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="ac-brand-name">AFTERCLICK</span>
            <span className="ac-brand-suffix">Studio</span>
          </div>

          <div className="ac-file">
            <span className={`ac-source-badge ${source}`}>
              {source === "sample" ? "Sample" : "Imported"}
            </span>
            <h1 className="ac-recording-title">{recording.title}</h1>
            <p>
              {shortUrl(recording.source.url)}
              <span aria-hidden="true">·</span>
              {formatDuration(summary.durationMs)}
              <span aria-hidden="true">·</span>
              {summary.actions} actions
              {summary.lostActions > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  {summary.lostActions} without observed change
                </>
              ) : null}
              {fileName ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="ac-file-name" title={fileName}>
                    {fileName}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="ac-actions">
            <button
              type="button"
              className="ac-action"
              onClick={() => fileInput.current?.click()}
              disabled={importing}
            >
              {importing ? "Reading…" : "Import"}
            </button>
            <button type="button" className="ac-action" onClick={useSample}>
              Sample
            </button>
            <details className="ac-export" ref={exportMenu}>
              <summary className="ac-action ac-action-primary">
                {exporting ? "Rendering…" : "Export"}
                <span aria-hidden="true">↓</span>
              </summary>
              <div className="ac-export-menu">
                <button
                  type="button"
                  onClick={() => void exportRecording("json")}
                  disabled={exporting !== null}
                  aria-label="Export portable JSON recording"
                >
                  JSON recording <em>.json</em>
                </button>
                <button
                  type="button"
                  onClick={() => void exportRecording("png")}
                  disabled={exporting !== null}
                  aria-label="Export PNG report"
                >
                  PNG report <em>.png</em>
                </button>
                <button
                  type="button"
                  onClick={() => void exportRecording("html")}
                  disabled={exporting !== null}
                  aria-label="Export self-contained HTML report"
                >
                  HTML report <em>.html</em>
                </button>
              </div>
            </details>
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept=".json,application/json"
              aria-label="Import an AFTERCLICK JSON recording"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
              }}
            />
          </div>
        </header>

        {notice ? (
          <div
            className={`ac-notice tone-${notice.tone}`}
            role={notice.tone === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <div>
              <p>{notice.text}</p>
              {notice.lines?.length ? (
                <ul>
                  {notice.lines.slice(0, 6).map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">
              Close
            </button>
          </div>
        ) : null}

        <main className="ac-main">
          <StateMap
            recording={recording}
            map={map}
            selectedId={selectedId}
            onSelect={selectEvent}
          />
          <div className="ac-lower">
            <Timeline
              recording={recording}
              selectedId={selectedId}
              onSelect={selectEvent}
            />
            <Inspector
              key={selectedEvent?.id ?? "empty"}
              recording={recording}
              map={map}
              event={selectedEvent}
              onSelect={selectEvent}
              onAddAnnotation={addNote}
              onRemoveAnnotation={deleteNote}
            />
          </div>
        </main>

        <footer className="ac-studio-foot">
          <span>
            Delay is measured to an observed DOM/ARIA change, not network latency.
          </span>
          <span>
            Local only.{" "}
            <Link href="/software/afterclick">Build notes ↗</Link>
          </span>
        </footer>
      </div>

      {dragging ? (
        <div className="ac-drop-overlay" aria-hidden="true">
          <div>
            <strong>Drop the recording</strong>
            <p>JSON stays local.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
