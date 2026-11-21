"use client";

import { useRef } from "react";
import {
  MATERIAL_LABEL,
  MATERIALS,
  PRESETS,
  RELIEF_MAX,
  RELIEF_MIN,
  FORMATION_LABEL,
  FORMATIONS,
  type CameraSnapshot,
  type Dataset,
  type Formation,
  type Material,
} from "@/lib/playground/data-matter/model";
import { Icon } from "../icons";

type PanelProps = {
  dataset: Dataset;
  presetId: string;
  formation: Formation;
  material: Material;
  relief: number;
  camera: CameraSnapshot;
  csvDraft: string;
  csvError: string;
  captureMode: boolean;
  captureBusy: string;
  webglAvailable: boolean;
  onFormation: (formation: Formation) => void;
  onMaterial: (material: Material) => void;
  onRelief: (relief: number) => void;
  onPreset: (id: string) => void;
  onCsvDraft: (text: string) => void;
  onCsvFile: (file: File) => void;
  onApplyCsv: () => void;
  onCamera: (camera: CameraSnapshot) => void;
  onResetCamera: () => void;
  onEnterCapture: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
  error: string;
};

export function InstrumentPanel({
  dataset,
  presetId,
  formation,
  material,
  relief,
  camera,
  csvDraft,
  csvError,
  captureMode,
  captureBusy,
  webglAvailable,
  onFormation,
  onMaterial,
  onRelief,
  onPreset,
  onCsvDraft,
  onCsvFile,
  onApplyCsv,
  onCamera,
  onResetCamera,
  onEnterCapture,
  onExportSvg,
  onExportJson,
  error,
}: PanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="instrument-panel dm-panel" aria-label="Sculpture controls">
      <header className="dm-panel-head">
        <h2>Shape the matter</h2>
        <p>
          Every ridge begins with a number. Choose how the data becomes
          material, then edit the sculpture directly or in the strip below.
        </p>
      </header>

      <fieldset className="dm-field">
        <legend>Formation</legend>
        <div className="dm-choice-row" role="group" aria-label="Formation">
          {FORMATIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={formation === option}
              onClick={() => onFormation(option)}
            >
              {FORMATION_LABEL[option]}
            </button>
          ))}
        </div>
        <p className="dm-field-note">
          {formation === "terrain"
            ? "A height field across the row order. 47 paper ribs make the surface."
            : "Row order wraps clockwise around 32 nested contours."}
        </p>
      </fieldset>

      <fieldset className="dm-field">
        <legend>Material</legend>
        <div className="dm-material-grid" role="group" aria-label="Material">
          {MATERIALS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={material === option}
              onClick={() => onMaterial(option)}
            >
              <span
                className={`dm-swatch dm-swatch--${option}`}
                aria-hidden="true"
              />
              {MATERIAL_LABEL[option]}
            </button>
          ))}
        </div>
        <p className="dm-field-note">
          {material === "strata"
            ? "Layered cardstock with visible edges and gaps."
            : material === "porcelain"
              ? "One continuous glazed ceramic surface."
              : "Technical contours over a minimal acid support grid."}
        </p>
      </fieldset>

      <label className="instrument-slider dm-range">
        <span>
          <span>Relief</span>
          <output>{relief}</output>
        </span>
        <input
          type="range"
          aria-label="Relief"
          min={RELIEF_MIN}
          max={RELIEF_MAX}
          step={1}
          value={relief}
          onChange={(event) => onRelief(Number(event.target.value))}
        />
      </label>
      <p className="dm-field-note dm-range-note">
        Height is value ÷ the dataset maximum × relief.
      </p>

      <div className="dm-section">
        <div className="dm-section-head">
          <h3>View</h3>
          <button
            type="button"
            className="dm-text-button"
            onClick={onResetCamera}
            title="Reset camera (R)"
          >
            <Icon name="reset" />
            Reset
          </button>
        </div>
        <div className="dm-view-grid">
          <label className="instrument-slider dm-range">
            <span>
              <span>Turn</span>
              <output>{Math.round(camera.azimuth)}°</output>
            </span>
            <input
              type="range"
              aria-label="Turn"
              min={-180}
              max={180}
              step={1}
              value={Math.round(camera.azimuth)}
              onChange={(event) =>
                onCamera({ ...camera, azimuth: Number(event.target.value) })
              }
            />
          </label>
          <label className="instrument-slider dm-range">
            <span>
              <span>Elevation</span>
              <output>{Math.round(camera.elevation)}°</output>
            </span>
            <input
              type="range"
              aria-label="Elevation"
              min={6}
              max={62}
              step={1}
              value={Math.round(camera.elevation)}
              onChange={(event) =>
                onCamera({ ...camera, elevation: Number(event.target.value) })
              }
            />
          </label>
        </div>
      </div>

      <div className="dm-section">
        <div className="dm-section-head">
          <h3>Dataset</h3>
          <span className="dm-count">{dataset.data.length} values</span>
        </div>
        <p className="dm-dataset-title">{dataset.title}</p>
        <p className="dm-field-note">{dataset.note}</p>
        <label className="dm-select">
          <span>Example sculpture</span>
          <select
            value={presetId}
            onChange={(event) => onPreset(event.target.value)}
          >
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title} — illustrative
              </option>
            ))}
            {presetId === "custom" && (
              <option value="custom">Your data</option>
            )}
          </select>
        </label>

        <details className="dm-csv">
          <summary>Edit data or load a CSV</summary>
          <div className="dm-csv-body">
            <label className="dm-csv-label">
              Your numbers
              <textarea
                rows={7}
                value={csvDraft}
                onChange={(event) => onCsvDraft(event.target.value)}
                spellCheck={false}
                aria-label="Your numbers"
              />
            </label>
            <p className="dm-field-note">
              Two columns: label,value. Two to 64 rows, non-negative values.
              Optional header. Nothing leaves this browser.
            </p>
            <div className="dm-csv-actions">
              <button
                type="button"
                className="lab-button"
                onClick={onApplyCsv}
              >
                Build this landscape
              </button>
              <label className="dm-file-button">
                Load a CSV
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.tsv,text/csv,text/plain"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onCsvFile(file);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />
              </label>
            </div>
            {csvError && (
              <p className="instrument-error" role="alert">
                {csvError}
              </p>
            )}
          </div>
        </details>
      </div>

      <div className="dm-section dm-export">
        <div className="dm-section-head">
          <h3>Capture</h3>
        </div>
        <button
          type="button"
          className="lab-button dm-capture-button"
          onClick={onEnterCapture}
          disabled={!webglAvailable || captureBusy !== "" || captureMode}
        >
          <span className="dm-aperture" aria-hidden="true" />
          Enter capture mode
        </button>
        <p className="dm-field-note">
          {webglAvailable
            ? "Compose a clean image, then export a high-resolution PNG or a printed poster."
            : "Capture needs WebGL. Data, presets and vector exports still work."}
        </p>
        <div className="dm-export-row">
          <button
            type="button"
            className="dm-text-button"
            aria-label="Export SVG"
            onClick={onExportSvg}
          >
            <Icon name="download" />
            Export 2D SVG
          </button>
          <button
            type="button"
            className="dm-text-button"
            aria-label="Export data + settings"
            onClick={onExportJson}
          >
            <Icon name="download" />
            Export JSON
          </button>
        </div>
        <p className="dm-field-note dm-export-truth">
          The SVG is a labelled orthographic study, not the interactive 3D
          camera. The JSON contains the rows, material, formation and camera.
        </p>
        {error && (
          <p className="instrument-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </aside>
  );
}
