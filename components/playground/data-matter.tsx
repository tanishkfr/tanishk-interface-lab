"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProjectHeading } from "./workbench";
import { DataMatterStage, type StageHandle } from "./data-matter/stage";
import { DataStrip } from "./data-matter/data-strip";
import { InstrumentPanel } from "./data-matter/instrument-panel";
import { useDatasetHistory } from "./data-matter/use-dataset";
import { vectorStudySvg } from "@/lib/playground/data-matter/vector-study";
import {
  DEFAULT_CAMERA,
  DEFAULT_DATASET,
  FORMATION_LABEL,
  MATERIAL_LABEL,
  PRESETS,
  RELIEF_DEFAULT,
  clampValue,
  dataMaximum,
  datasetCsv,
  editDataset,
  formatValue,
  isFormation,
  isMaterial,
  presetById,
  type CameraSnapshot,
  type Dataset,
  type Formation,
  type Material,
} from "@/lib/playground/data-matter/model";
import { parseData } from "@/lib/playground/math";
import { downloadBlob } from "@/lib/playground/data-matter/capture";
import { download } from "./workbench";

const MAX_FILE_BYTES = 65536;

function markEdited(dataset: Dataset): Dataset {
  if (dataset.note.startsWith("Illustrative")) {
    return { ...dataset, note: "Edited in the studio · illustrative values" };
  }
  return dataset;
}

function datasetFromCsv(csv: string): Dataset {
  const data = parseData(csv);
  return {
    title: "Your data",
    note: "Your numbers · processed only in this browser",
    data,
  };
}

export default function DataMatter() {
  const history = useDatasetHistory(DEFAULT_DATASET);
  const { dataset, canUndo, canRedo, beginGesture, live, commit } = history;

  const [formation, setFormation] = useState<Formation>("terrain");
  const [material, setMaterial] = useState<Material>("strata");
  const [relief, setRelief] = useState(RELIEF_DEFAULT);
  const [camera, setCamera] = useState<CameraSnapshot>(DEFAULT_CAMERA);
  const [cameraRevision, setCameraRevision] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [sculptMode, setSculptMode] = useState(false);
  const [csvDraft, setCsvDraft] = useState(() => datasetCsv(DEFAULT_DATASET.data));
  const [csvError, setCsvError] = useState("");
  const [exportError, setExportError] = useState("");
  const [captureMode, setCaptureMode] = useState(false);
  const [captureBusy, setCaptureBusy] = useState("");
  const [captureError, setCaptureError] = useState("");
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [availabilityReason, setAvailabilityReason] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [tableOpen, setTableOpen] = useState(false);

  const stageRef = useRef<StageHandle>(null);
  const editDebounce = useRef(0);
  const editIndexRef = useRef<number | null>(null);
  const datasetRef = useRef(dataset);
  const { undo, redo } = history;

  useEffect(() => {
    datasetRef.current = dataset;
  }, [dataset]);

  const presetId = useMemo(() => {
    const match = PRESETS.find(
      (preset) =>
        preset.title === dataset.title &&
        preset.note === dataset.note &&
        preset.data.length === dataset.data.length &&
        preset.data.every(
          (datum, index) =>
            datum.label === dataset.data[index]?.label &&
            datum.value === dataset.data[index]?.value,
        ),
    );
    return match?.id ?? "custom";
  }, [dataset]);

  const activeIndex = hover ?? selected;
  const maximum = dataMaximum(dataset.data);
  const activeDatum =
    activeIndex !== null && activeIndex < dataset.data.length
      ? dataset.data[activeIndex]
      : null;

  const commitDataset = useCallback(
    (next: Dataset, key?: string) => {
      commit(next, key);
      setCsvDraft(datasetCsv(next.data));
    },
    [commit],
  );

  const handleEditStart = useCallback(
    (index: number) => {
      editIndexRef.current = index;
      setSelected(index);
      setHover(null);
      beginGesture();
      setCaptureError("");
    },
    [beginGesture],
  );

  const handleEditValue = useCallback(
    (index: number, value: number) => {
      live(markEdited(editDataset(datasetRef.current, index, value)));
    },
    [live],
  );

  const handleEditEnd = useCallback(() => {
    const next = datasetRef.current;
    const index = editIndexRef.current;
    editIndexRef.current = null;
    setCsvDraft(datasetCsv(next.data));
    history.endGesture();
    if (index !== null && next.data[index]) {
      setAnnouncement(
        `${next.data[index].label} set to ${formatValue(next.data[index].value)}.`,
      );
    }
  }, [history]);

  const handleStripChange = useCallback(
    (index: number, value: number, continuous: boolean) => {
      if (continuous) {
        if (editDebounce.current === 0) {
          editIndexRef.current = index;
          beginGesture();
        }
        live(markEdited(editDataset(datasetRef.current, index, clampValue(value))));
        window.clearTimeout(editDebounce.current);
        editDebounce.current = window.setTimeout(() => {
          editDebounce.current = 0;
          history.endGesture();
          setCsvDraft(datasetCsv(datasetRef.current.data));
          const datum = datasetRef.current.data[index];
          if (datum) {
            setAnnouncement(
              `${datum.label} set to ${formatValue(datum.value)}.`,
            );
          }
        }, 620);
      } else {
        commitDataset(
          markEdited(editDataset(datasetRef.current, index, clampValue(value))),
        );
      }
    },
    [beginGesture, commitDataset, history, live],
  );

  const handleAdjust = useCallback(
    (index: number, delta: number, coarse: boolean) => {
      const datum = datasetRef.current.data[index];
      if (!datum) return;
      const step = coarse ? 10 : 1;
      const nextValue = clampValue(datum.value + delta * step);
      commitDataset(
        markEdited(editDataset(datasetRef.current, index, nextValue)),
      );
      setSelected(index);
      setAnnouncement(`${datum.label} ${formatValue(nextValue)}.`);
    },
    [commitDataset],
  );

  const handleSelect = useCallback((index: number | null) => {
    setSelected(index);
  }, []);

  const handleCameraChange = useCallback((next: CameraSnapshot) => {
    if (typeof document !== "undefined") {
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement &&
        active.type === "range" &&
        (active.getAttribute("aria-label") === "Turn" ||
          active.getAttribute("aria-label") === "Elevation")
      ) {
        return;
      }
    }
    setCamera(next);
  }, []);

  const handleCamera = useCallback((next: CameraSnapshot) => {
    setCamera(next);
    setCameraRevision((value) => value + 1);
  }, []);

  const resetCamera = useCallback(() => {
    stageRef.current?.resetCamera();
    setCamera(DEFAULT_CAMERA);
    setCameraRevision((value) => value + 1);
    setAnnouncement("Camera reset.");
  }, []);

  const handlePreset = useCallback(
    (id: string) => {
      if (id === "custom") return;
      const preset = presetById(id);
      if (!preset) return;
      const next: Dataset = {
        title: preset.title,
        note: preset.note,
        data: preset.data.map((datum) => ({ ...datum })),
      };
      commit(next);
      setCsvDraft(datasetCsv(next.data));
      setCsvError("");
      setSelected(null);
      setHover(null);
      setAnnouncement(`${preset.title} loaded. ${preset.note}.`);
    },
    [commit],
  );

  const handleCsvFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_BYTES) {
        setCsvError("Use a file smaller than 64 KB.");
        return;
      }
      try {
        const text = await file.text();
        setCsvDraft(text);
        setCsvError("");
      } catch {
        setCsvError("That file could not be read. Try a plain CSV or TSV.");
      }
    },
    [],
  );

  const handleApplyCsv = useCallback(() => {
    try {
      const next = datasetFromCsv(csvDraft);
      commitDataset(next);
      setCsvError("");
      setSelected(null);
      setHover(null);
      setAnnouncement(`${next.data.length} values built into a new sculpture.`);
    } catch (error) {
      setCsvError((error as Error).message);
    }
  }, [commitDataset, csvDraft]);

  const handleExportSvg = useCallback(() => {
    try {
      const svg = vectorStudySvg({
        data: dataset.data,
        relief,
        formation,
        material,
        caption: true,
      });
      download("data-matter-vector-study.svg", svg);
      setExportError("");
    } catch {
      setExportError("The vector study could not be exported.");
    }
  }, [dataset.data, formation, material, relief]);

  const handleExportJson = useCallback(() => {
    const exportCamera = stageRef.current?.getCamera() ?? camera;
    const payload = {
      project: "Data Matter",
      version: "0.2",
      encoding: {
        terrain:
          "Height = value / max * relief * (0.25 + 0.75 * sin(pi * depth)); " +
          "row order maps left to right.",
        fossil:
          "Row order wraps clockwise around 32 nested contours; radial " +
          "displacement = value / max * relief * 0.38 * sin(((layer + 2) / 34) * pi).",
        maximum: "max is the dataset maximum, floored at 1.",
      },
      data: dataset.data,
      title: dataset.title,
      note: dataset.note,
      height: relief,
      relief,
      formation: FORMATION_LABEL[formation],
      formationId: formation,
      material: MATERIAL_LABEL[material],
      materialId: material,
      camera: exportCamera,
      preset: presetId,
      exportedAt: new Date().toISOString(),
    };
    download(
      "data-matter.json",
      JSON.stringify(payload, null, 2),
      "application/json",
    );
  }, [camera, dataset, formation, material, presetId, relief]);

  const captureMeta = useMemo(
    () => ({
      title: dataset.title,
      note: dataset.note,
      formation,
      material,
      valueCount: dataset.data.length,
      maximum,
    }),
    [dataset.data.length, dataset.note, dataset.title, formation, material, maximum],
  );

  const enterCapture = useCallback(() => {
    setCaptureMode(true);
    setCaptureError("");
    setCaptureBusy("");
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(".dm-stage")?.focus();
    }, 0);
  }, []);

  const exitCapture = useCallback(() => {
    setCaptureMode(false);
    setCaptureBusy("");
    window.setTimeout(() => {
      document
        .querySelector<HTMLButtonElement>(".dm-capture-button")
        ?.focus();
    }, 0);
  }, []);

  const downloadCapture = useCallback(
    async (kind: "png" | "poster") => {
      if (!stageRef.current) return;
      setCaptureBusy(kind);
      setCaptureError("");
      try {
        const blob = await (kind === "png"
          ? stageRef.current.capturePng(captureMeta)
          : stageRef.current.capturePoster(captureMeta));
        const slug = dataset.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 48) || "data-matter";
        downloadBlob(
          kind === "png"
            ? `${slug}-${formation}-${material}.png`
            : `${slug}-${formation}-${material}-poster.png`,
          blob,
        );
        setAnnouncement(kind === "png" ? "PNG exported." : "Poster exported.");
      } catch (error) {
        setCaptureError((error as Error).message);
      } finally {
        setCaptureBusy("");
      }
    },
    [captureMeta, dataset.title, formation, material],
  );

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (event.key === "Escape" && captureMode) {
        event.preventDefault();
        exitCapture();
        return;
      }
      if (captureMode) return;
      if (typing) return;
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [captureMode, exitCapture, redo, undo]);

  useEffect(() => {
    if (!captureMode) return;
    const previousOverflow = document.body.style.overflow;
    const previousScroll = window.scrollY;
    document.documentElement.classList.add("dm-capture-open");
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(".world-data.is-capture")
        ?.scrollIntoView({ block: "start" });
    });
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("dm-capture-open");
      document.body.style.overflow = previousOverflow;
      window.scrollTo(0, previousScroll);
    };
  }, [captureMode]);

  useEffect(() => {
    return () => window.clearTimeout(editDebounce.current);
  }, []);

  const handleAvailability = useCallback(
    (available: boolean, reason?: string) => {
      setWebglAvailable(available);
      setAvailabilityReason(available ? null : (reason ?? "unsupported"));
    },
    [],
  );

  const toggleSculpt = useCallback(() => {
    setSculptMode((value) => {
      const next = !value;
      setAnnouncement(
        next
          ? "Sculpt mode. Drag any ridge to change its value."
          : "Orbit mode. Drag to turn the sculpture.",
      );
      return next;
    });
  }, []);

  return (
    <div className={`project-world world-data${captureMode ? " is-capture" : ""}`}>
      <div className="v2-wrap">
        <ProjectHeading slug="data-matter">
          <span className="project-stamp">A study in tangible information</span>
        </ProjectHeading>

        <div className="data-workspace">
          <div className="dm-left">
            <div
              className={`dm-stage-shell${captureMode ? " is-capture" : ""}`}
              aria-label={captureMode ? "Capture mode" : undefined}
            >
              {captureMode && (
                <header className="dm-capture-head">
                  <span>Capture mode</span>
                  <span>
                    Drag to orbit · exports use this framing
                  </span>
                </header>
              )}
              <DataMatterStage
                ref={stageRef}
                data={dataset.data}
                relief={relief}
                formation={formation}
                material={material}
                selected={selected}
                highlight={hover}
                activeIndex={activeIndex}
                sculptMode={sculptMode}
                captureMode={captureMode}
                camera={camera}
                cameraRevision={cameraRevision}
                datasetTitle={dataset.title}
                onHover={setHover}
                onSelect={handleSelect}
                onEditStart={handleEditStart}
                onEditValue={handleEditValue}
                onEditEnd={handleEditEnd}
                onCameraChange={handleCameraChange}
                onAdjust={handleAdjust}
                onToggleSculpt={toggleSculpt}
                onAvailability={handleAvailability}
              />
              {captureMode && (
                <footer className="dm-capture-foot">
                  <div className="dm-capture-meta">
                    <strong>{dataset.title}</strong>
                    <span>
                      {dataset.data.length} values · maximum{" "}
                      {formatValue(maximum)} · {formation} / {material}
                    </span>
                  </div>
                  <div className="dm-capture-actions">
                    <button
                      type="button"
                      className="dm-text-button"
                      onClick={() => stageRef.current?.zoomBy(1.12)}
                    >
                      Zoom out
                    </button>
                    <button
                      type="button"
                      className="dm-text-button"
                      onClick={() => stageRef.current?.zoomBy(0.88)}
                    >
                      Zoom in
                    </button>
                    <button
                      type="button"
                      className="dm-text-button"
                      onClick={resetCamera}
                    >
                      Reset view
                    </button>
                    <button
                      type="button"
                      className="lab-button"
                      onClick={() => void downloadCapture("png")}
                      disabled={captureBusy !== "" || !webglAvailable}
                    >
                      {captureBusy === "png" ? "Rendering…" : "Download PNG"}
                    </button>
                    <button
                      type="button"
                      className="lab-button secondary"
                      onClick={() => void downloadCapture("poster")}
                      disabled={captureBusy !== "" || !webglAvailable}
                    >
                      {captureBusy === "poster"
                        ? "Composing…"
                        : "Download poster"}
                    </button>
                    <button
                      type="button"
                      className="dm-text-button"
                      onClick={exitCapture}
                    >
                      Close
                    </button>
                  </div>
                  {captureError && (
                    <p className="instrument-error" role="alert">
                      {captureError}
                    </p>
                  )}
                  <p className="dm-capture-help">
                    The PNG and poster render from this live sculpture and this
                    camera. Press Esc to return to the studio.
                  </p>
                </footer>
              )}
            </div>
            {!captureMode && (
              <>
                <DataStrip
                  data={dataset.data}
                  selected={selected}
                  onSelect={handleSelect}
                  onHover={setHover}
                  onValueChange={handleStripChange}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={undo}
                  onRedo={redo}
                />
                {!webglAvailable && (
                  <p className="dm-availability" role="status">
                    {availabilityReason === "context"
                      ? "The 3D studio lost its graphics context. Reload the page to try again."
                      : "WebGL is unavailable, so the sculpture is shown as a 2D vector study."}
                  </p>
                )}
                {activeDatum && (
                  <p className="dm-live-reading" aria-live="polite">
                    <span>{activeDatum.label}</span>
                    <strong>{formatValue(activeDatum.value)}</strong>
                    <span>
                      of {formatValue(maximum)} maximum ·{" "}
                      {Math.round((activeDatum.value / maximum) * 100)}%
                    </span>
                  </p>
                )}
              </>
            )}
  <section className="dm-method">
            <div className="dm-method-lede">
              <h2>Reading the sculpture</h2>
              <p>
                Height and radius follow the numbers. Material and lighting are
                an interpretive finish; they never change what the data encodes.
              </p>
              <div className="dm-keyboard-note">
                <span>Keys</span>
                <p>
                  <span>
                    <kbd>←</kbd>
                    <kbd>→</kbd> select
                  </span>
                  <span>
                    <kbd>↑</kbd>
                    <kbd>↓</kbd> adjust
                  </span>
                  <span>
                    <kbd>R</kbd> reset view
                  </span>
                  <span>
                    <kbd>S</kbd> sculpt
                  </span>
                  <span>
                    <kbd>⌘Z</kbd> undo
                  </span>
                </p>
              </div>
            </div>
            <div className="dm-method-copy">
              <p>
                <b>Terrain.</b> Row order runs left to right across a height field.
                Terrain height is <code>value ÷ maximum × relief</code>, shaped by
                a smoothstep interpolation and a ridge envelope across depth. The
                47 Strata layers repeat one continuous surface, so a taller point
                always means a larger value.
              </p>
              <p>
                <b>Fossil.</b> Row order wraps clockwise around 32 nested contours.
                Each value pushes its angular segment outward by{" "}
                <code>value ÷ maximum × relief × 0.38 × sin(((layer + 2) / 34) × π)</code>
                , exactly as in v0.1. An inner contour never represents a later
                row; it repeats the same series as a layered impression.
              </p>
              <p>
                <b>Handling.</b> The scale uses the dataset maximum, floored at 1,
                so constant and all-zero series stay finite. Values are
                non-negative; the editor clamps at zero rather than silently
                reflecting. While a value is dragged, the working scale is held
                steady so the gesture stays 1:1; on release it settles to the
                exact dataset maximum. Presets are illustrative samples, not
                measurements.
              </p>
            </div>
          </section>

          <details
            className="dm-data-table-wrap"
            onToggle={(event) => setTableOpen(event.currentTarget.open)}
          >
            <summary>
              Accessible data table
              <span>{dataset.data.length} rows</span>
            </summary>
            {tableOpen && (
              <div className="dm-data-table-scroll">
                <table className="dm-data-table">
                <caption>
                  {dataset.title}. Values in row order. Illustrative samples are
                  labelled in the dataset panel.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Label</th>
                    <th scope="col">Value</th>
                    <th scope="col">Share of maximum</th>
                    <th scope="col">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.data.map((datum, index) => (
                    <tr
                      key={`${datum.label}-${index}`}
                      aria-selected={selected === index}
                    >
                      <td>{index + 1}</td>
                      <th scope="row">{datum.label}</th>
                      <td>{formatValue(datum.value)}</td>
                      <td>{Math.round((datum.value / maximum) * 100)}%</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={1_000_000}
                          step={datum.value % 1 === 0 ? 1 : 0.1}
                          value={datum.value}
                          aria-label={`Edit ${datum.label}`}
                          onFocus={() => setSelected(index)}
                          onChange={(event) => {
                            if (event.target.value.trim() === "") return;
                            handleStripChange(
                              index,
                              Number(event.target.value),
                              true,
                            );
                          }}
                          onBlur={() => history.endGesture()}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </details>

          </div>

          {!captureMode && (
            <InstrumentPanel
              dataset={dataset}
              presetId={presetId}
              formation={formation}
              material={material}
              relief={relief}
              camera={camera}
              csvDraft={csvDraft}
              csvError={csvError}
              captureMode={captureMode}
              captureBusy={captureBusy}
              webglAvailable={webglAvailable}
              onFormation={(next) => {
                if (!isFormation(next)) return;
                setFormation(next);
                setAnnouncement(`${next} formation.`);
              }}
              onMaterial={(next) => {
                if (!isMaterial(next)) return;
                setMaterial(next);
                setAnnouncement(`${next} material.`);
              }}
              onRelief={setRelief}
              onPreset={handlePreset}
              onCsvDraft={setCsvDraft}
              onCsvFile={handleCsvFile}
              onApplyCsv={handleApplyCsv}
              onCamera={handleCamera}
              onResetCamera={resetCamera}
              onEnterCapture={enterCapture}
              onExportSvg={handleExportSvg}
              onExportJson={handleExportJson}
              error={exportError}
            />
          )}
        </div>


        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  );
}
