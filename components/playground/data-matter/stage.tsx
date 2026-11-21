"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { DataMatterEngine } from "@/lib/playground/data-matter/engine";
import { VectorStudy } from "@/lib/playground/data-matter/vector-study";
import {
  DEFAULT_CAMERA,
  dataMaximum,
  formatValue,
  type CameraSnapshot,
  type Datum,
  type Formation,
  type Material,
} from "@/lib/playground/data-matter/model";
import type { CaptureMeta } from "@/lib/playground/data-matter/capture";
import { Icon } from "../icons";

export type StageHandle = {
  resetCamera: () => void;
  zoomBy: (factor: number) => void;
  getCamera: () => CameraSnapshot;
  capturePng: (meta: CaptureMeta) => Promise<Blob>;
  capturePoster: (meta: CaptureMeta) => Promise<Blob>;
};

type StageProps = {
  data: Datum[];
  relief: number;
  formation: Formation;
  material: Material;
  selected: number | null;
  highlight: number | null;
  activeIndex: number | null;
  sculptMode: boolean;
  captureMode: boolean;
  camera: CameraSnapshot;
  cameraRevision: number;
  datasetTitle: string;
  onHover: (index: number | null) => void;
  onSelect: (index: number | null) => void;
  onEditStart: (index: number) => void;
  onEditValue: (index: number, value: number) => void;
  onEditEnd: () => void;
  onCameraChange: (camera: CameraSnapshot) => void;
  onAdjust: (index: number, delta: number, coarse: boolean) => void;
  onToggleSculpt: () => void;
  onAvailability: (available: boolean, reason?: string) => void;
};

export const DataMatterStage = forwardRef<StageHandle, StageProps>(
  function DataMatterStage(props, ref) {
    const {
      data,
      relief,
      formation,
      material,
      selected,
      highlight,
      activeIndex,
      sculptMode,
      captureMode,
      camera,
      cameraRevision,
      datasetTitle,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<DataMatterEngine | null>(null);
    const callbacksRef = useRef(props);
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 780 ||
        (navigator.hardwareConcurrency ?? 8) <= 4);
    const latest = useRef({ props, reducedMotion, lowPower });

    useEffect(() => {
      callbacksRef.current = props;
      latest.current = { props, reducedMotion, lowPower };
    });

    const [status, setStatus] = useState<
      "loading" | "ready" | "fallback" | "restoring"
    >("loading");
    const [generation, setGeneration] = useState(0);
    const attempts = useRef(0);

    useEffect(() => {
      const host = containerRef.current;
      const overlay = overlayRef.current;
      if (!host || !overlay) return;

      const fail = (reason: string) => {
        queueMicrotask(() => {
          setStatus("fallback");
          callbacksRef.current.onAvailability(false, reason);
        });
      };

      if (attempts.current >= 2) {
        fail("context");
        return;
      }

      const config = latest.current.props;
      const settings = latest.current;
      let engine: DataMatterEngine | null = null;
      try {
        engine = new DataMatterEngine(
          host,
          overlay,
          {
            onHover: (index) => callbacksRef.current.onHover(index),
            onSelect: (index) => callbacksRef.current.onSelect(index),
            onEditStart: (index) => callbacksRef.current.onEditStart(index),
            onEditValue: (index, value) =>
              callbacksRef.current.onEditValue(index, value),
            onEditEnd: () => callbacksRef.current.onEditEnd(),
            onCameraChange: (next) =>
              callbacksRef.current.onCameraChange(next),
            onContextLost: () => {
              attempts.current += 1;
              if (attempts.current >= 2) {
                setStatus("fallback");
                callbacksRef.current.onAvailability(false, "context");
                return;
              }
              setStatus("restoring");
              window.setTimeout(() => {
                setGeneration((value) => value + 1);
              }, 700);
            },
            onReady: () => {
              setStatus("ready");
              callbacksRef.current.onAvailability(true);
            },
          },
          {
            data: config.data,
            relief: config.relief,
            formation: config.formation,
            material: config.material,
            camera: config.camera,
            selected: config.selected,
            sculptMode: config.sculptMode,
            reducedMotion: settings.reducedMotion,
            lowPower: settings.lowPower,
          },
        );
        engineRef.current = engine;
      } catch {
        fail("unsupported");
      }

      return () => {
        engineRef.current = null;
        engine?.dispose();
      };
    }, [generation]);

    useEffect(() => {
      engineRef.current?.setData(data);
    }, [data]);

    useEffect(() => {
      engineRef.current?.setRelief(relief);
    }, [relief]);

    useEffect(() => {
      engineRef.current?.setFormation(formation);
    }, [formation]);

    useEffect(() => {
      engineRef.current?.setMaterial(material);
    }, [material]);

    useEffect(() => {
      engineRef.current?.setSelected(selected);
    }, [selected]);

    useEffect(() => {
      engineRef.current?.setHighlight(highlight);
    }, [highlight]);

    useEffect(() => {
      engineRef.current?.setSculptMode(sculptMode);
    }, [sculptMode]);

    useEffect(() => {
      engineRef.current?.setCaptureMode(captureMode);
    }, [captureMode]);

    const lastCameraRevision = useRef(0);
    useEffect(() => {
      if (cameraRevision === lastCameraRevision.current) return;
      lastCameraRevision.current = cameraRevision;
      engineRef.current?.setCamera(camera);
    }, [camera, cameraRevision]);

    useImperativeHandle(
      ref,
      () => ({
        resetCamera() {
          engineRef.current?.resetCamera();
        },
        zoomBy(factor: number) {
          engineRef.current?.zoomBy(factor);
        },
        getCamera() {
          return engineRef.current?.getCamera() ?? DEFAULT_CAMERA;
        },
        capturePng(meta: CaptureMeta) {
          const engine = engineRef.current;
          if (!engine) {
            return Promise.reject(
              new Error("The 3D studio is not available for capture."),
            );
          }
          return engine.capturePng(meta);
        },
        capturePoster(meta: CaptureMeta) {
          const engine = engineRef.current;
          if (!engine) {
            return Promise.reject(
              new Error("The 3D studio is not available for capture."),
            );
          }
          return engine.capturePoster(meta);
        },
      }),
      [],
    );

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, input, textarea, select, a")) return;
      const c = callbacksRef.current;
      if (c.captureMode) {
        if (
          event.key.toLowerCase() === "r" &&
          !event.metaKey &&
          !event.ctrlKey
        ) {
          event.preventDefault();
          engineRef.current?.resetCamera();
        }
        return;
      }
      const count = c.data.length;
      if (!count) return;
      const current = c.selected;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next =
          current === null
            ? direction > 0
              ? 0
              : count - 1
            : (current + direction + count) % count;
        c.onSelect(next);
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const index = current ?? 0;
        if (current === null) c.onSelect(index);
        c.onAdjust(index, event.key === "ArrowUp" ? 1 : -1, event.shiftKey);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        c.onSelect(event.key === "Home" ? 0 : count - 1);
      } else if (event.key === "Escape") {
        if (current !== null) {
          event.preventDefault();
          c.onSelect(null);
        }
      } else if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        engineRef.current?.resetCamera();
      } else if (event.key.toLowerCase() === "s" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        c.onToggleSculpt();
      }
    }, []);

    const active =
      activeIndex !== null && activeIndex >= 0 && activeIndex < data.length
        ? data[activeIndex]
        : null;
    const maximum = dataMaximum(data);
    const fallback = status === "fallback";

    return (
      <section
        className={`dm-stage${captureMode ? " is-capturing" : ""}${
          fallback ? " has-fallback" : ""
        }`}
        aria-label="Interactive data sculpture"
        aria-describedby="dm-stage-instructions"
        role="group"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="dm-canvas-host" ref={containerRef} />
        {fallback && (
          <div className="dm-fallback">
            <VectorStudy
              data={data}
              relief={relief}
              formation={formation}
              material={material}
              className="dm-fallback-study"
            />
            <p className="dm-fallback-note">
              This browser could not start the 3D studio. The same data is shown
              as a two-dimensional vector study; editing and data exports still
              work.
            </p>
          </div>
        )}

        <div className="dm-stage-meta" aria-hidden="true">
          <span>
            {data.length} {data.length === 1 ? "value" : "values"} · max{" "}
            {formatValue(maximum)}
          </span>
          <span>
            {formation} / {material}
          </span>
        </div>

        <div className="dm-stage-tools" aria-label="Stage controls">
          <div className="dm-mode-switch" role="group" aria-label="Pointer mode">
            <button
              type="button"
              aria-pressed={!sculptMode}
              onClick={() => {
                if (sculptMode) props.onToggleSculpt();
              }}
            >
              <OrbitIcon />
              <span>Orbit</span>
            </button>
            <button
              type="button"
              aria-pressed={sculptMode}
              onClick={() => {
                if (!sculptMode) props.onToggleSculpt();
              }}
            >
              <SculptIcon />
              <span>Sculpt</span>
            </button>
          </div>
          <span className="dm-tool-divider" aria-hidden="true" />
          <button
            type="button"
            className="dm-icon-button"
            aria-label="Reset camera"
            title="Reset camera (R)"
            onClick={() => engineRef.current?.resetCamera()}
          >
            <Icon name="reset" />
          </button>
          <button
            type="button"
            className="dm-icon-button"
            aria-label="Zoom out"
            onClick={() => engineRef.current?.zoomBy(1.1)}
          >
            <MinusIcon />
          </button>
          <button
            type="button"
            className="dm-icon-button"
            aria-label="Zoom in"
            onClick={() => engineRef.current?.zoomBy(0.9)}
          >
            <PlusIcon />
          </button>
        </div>

        <p className="dm-stage-hint" aria-hidden="true">
          {sculptMode
            ? "Drag a ridge to reshape it. The value follows your hand."
            : "Drag to orbit. Select a ridge, then drag its pin to sculpt."}
        </p>

        <div
          className="dm-datum-pill"
          ref={overlayRef}
          data-visible="false"
          aria-hidden="true"
        >
          {active && (
            <>
              <span>{active.label}</span>
              <strong>{formatValue(active.value)}</strong>
              <em>{sculptMode ? "drag ↕" : "pin to sculpt"}</em>
            </>
          )}
        </div>

        {(status === "loading" || status === "restoring") && (
          <div className="dm-stage-status" role="status">
            {status === "loading" ? "Preparing the studio…" : "Restoring the 3D studio…"}
          </div>
        )}

        <p id="dm-stage-instructions" className="sr-only">
          {captureMode
            ? "Capture view. Drag to orbit the sculpture and use the capture controls to export. Press Escape to return to the studio."
            : fallback
              ? "A two-dimensional vector study of the data. Use the controls below to edit values or load a dataset. 3D capture is unavailable in this browser."
              : `A three-dimensional sculpture of ${data.length} values. Use left and right arrow keys to select a datum, up and down to change its value, R to reset the camera, and S to switch between orbiting and sculpting. Full controls and an accessible data table follow the sculpture.`}
        </p>
        <span className="sr-only">{datasetTitle}</span>
      </section>
    );
  },
);

function OrbitIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <ellipse cx="10" cy="10" rx="7" ry="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <path d="M14.8 4.6 17 5.2l-.7 2.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SculptIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3v14M6 6l4-3 4 3M6 14l4 3 4-3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
