"use client";
import { useRef, useState } from "react";
import { DataSculpture } from "./artwork";
import {
  ProjectHeading,
  Slider,
  ExportButton,
  exportSvg,
  download,
  Segments,
} from "./workbench";
import { SAMPLE_DATA, parseData, type Datum } from "@/lib/playground/math";
export default function DataMatter() {
  const [data, setData] = useState<Datum[]>(SAMPLE_DATA);
  const [input, setInput] = useState(
    "label,value\n" +
      SAMPLE_DATA.map((d) => `${d.label},${d.value}`).join("\n"),
  );
  const [height, setHeight] = useState(170),
    [angle, setAngle] = useState(0),
    [material, setMaterial] = useState<"Paper" | "Wire">("Paper");
  const [error, setError] = useState(""),
    [note, setNote] = useState("Illustrative sample · daily observations");
  const scene = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    angle: number;
  } | null>(null);
  function apply() {
    try {
      setData(parseData(input));
      setError("");
      setNote("Your data · processed only in this browser");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="project-world world-data">
      <div className="v2-wrap">
        <ProjectHeading slug="data-matter">
          <span className="project-stamp">A study in tangible information</span>
        </ProjectHeading>
        <div className="data-workspace">
          <div>
            <div
              className="data-scene"
              ref={scene}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse") {
                  drag.current = { x: e.clientX, angle };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }
              }}
              onPointerMove={(e) => {
                if (drag.current)
                  setAngle(
                    Math.max(
                      -30,
                      Math.min(
                        30,
                        drag.current.angle + (e.clientX - drag.current.x) * 0.1,
                      ),
                    ),
                  );
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
            >
              <div className="scene-topline">
                <span>
                  {data.length} values / {material.toLowerCase()} terrain
                </span>
                <span>Drag to turn</span>
              </div>
              <DataSculpture
                data={data}
                height={height}
                angle={angle}
                wire={material === "Wire"}
              />
              <span className="scene-bottomline">
                Every ridge begins with a number.
              </span>
            </div>
            <div className="data-values" aria-label="Data values">
              {data.map((d, i) => (
                <div key={i}>
                  <span>{d.label}</span>
                  <strong>{d.value.toLocaleString()}</strong>
                  <i
                    style={{
                      height: `${Math.max(2, (d.value / Math.max(...data.map((d) => d.value))) * 40)}px`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <aside className="instrument-panel">
            <h2>Shape the matter</h2>
            <p className="instrument-note">{note}</p>
            <Slider
              label="Relief"
              value={height}
              onChange={setHeight}
              min={40}
              max={230}
              unit="px"
            />
            <Slider
              label="Rotation"
              value={angle}
              onChange={setAngle}
              min={-30}
              max={30}
              unit="°"
            />
            <Segments
              label="Material"
              options={["Paper", "Wire"]}
              value={material}
              onChange={setMaterial}
            />
            <div className="instrument-divider" />
            <label className="instrument-field">
              Your numbers
              <textarea
                rows={7}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
              />
            </label>
            <p className="instrument-note">
              Two unquoted columns: label,value. 2–64 rows, non-negative values.
              Optional header.
            </p>
            <label className="file-button">
              Load a CSV
              <input
                type="file"
                accept=".csv,.tsv,text/csv,text/plain"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 65536) {
                    setError("Use a file smaller than 64 KB.");
                    return;
                  }
                  setInput(await f.text());
                  setError("");
                }}
              />
            </label>
            <button className="lab-button" onClick={apply}>
              Build this landscape
            </button>
            {error && (
              <p className="instrument-error" role="alert">
                {error}
              </p>
            )}
            <ExportButton
              onClick={() => {
                const svg = scene.current?.querySelector("svg");
                if (svg)
                  void exportSvg(svg, "data-matter.svg", {
                    background: "#e7e8e4",
                  });
              }}
            />
            <button
              className="quiet-button"
              onClick={() =>
                download(
                  "data-matter.json",
                  JSON.stringify({ data, height, angle, material }, null, 2),
                  "application/json",
                )
              }
            >
              Export data + settings
            </button>
          </aside>
        </div>
        <section className="project-notes">
          <h2>Reading the landscape</h2>
          <p>
            Left to right follows your row order. Height is value ÷ maximum ×
            relief. The 47 ribs repeat the same interpolated series; their depth
            envelope makes a continuous surface. Taller peaks always mean larger
            values. Rotation changes the view, never the values.
          </p>
          <p>
            This is an SVG sculpture with a fixed isometric projection, not a
            scientific surface model. Download an editable vector snapshot or
            your data and settings.
          </p>
        </section>
      </div>
    </div>
  );
}
