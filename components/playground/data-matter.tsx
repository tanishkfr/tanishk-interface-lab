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
function DataFossil({
  data,
  relief,
  angle,
  wire,
}: {
  data: Datum[];
  relief: number;
  angle: number;
  wire: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const contours = Array.from({ length: 32 }, (_, layer) => {
    const radius = 42 + layer * 5.5;
    return (
      Array.from({ length: 161 }, (_, i) => {
        const a = (i / 160) * Math.PI * 2,
          position = (i / 160) * data.length,
          index = Math.floor(position) % data.length,
          t = position - Math.floor(position);
        const value =
          (data[index].value * (1 - t) +
            data[(index + 1) % data.length].value * t) /
          max;
        const r =
          radius +
          value * relief * 0.38 * Math.sin(((layer + 2) / 34) * Math.PI);
        return `${i ? "L" : "M"}${(450 + Math.cos(a) * r).toFixed(2)} ${(270 + Math.sin(a) * r * 0.77).toFixed(2)}`;
      }).join(" ") + "Z"
    );
  });
  return (
    <svg
      viewBox="0 0 900 560"
      role="img"
      aria-label={`Data fossil. ${data.length} values mapped clockwise into 32 nested contours.`}
    >
      <title>Data Matter — a record in contours</title>
      <g transform={`rotate(${angle} 450 270)`}>
        {[...contours].reverse().map((d, i) => (
          <path
            key={i}
            d={d}
            fill={wire ? "none" : `hsl(${34 + i * 0.6} 18% ${49 + i * 1.3}%)`}
            stroke="#514b3b"
            strokeOpacity={wire ? 0.65 : 0.5}
            strokeWidth=".8"
          />
        ))}
        <circle cx="450" cy="270" r="21" fill="#e7e8e4" stroke="#514b3b" />
      </g>
    </svg>
  );
}
export default function DataMatter() {
  const [data, setData] = useState<Datum[]>(SAMPLE_DATA);
  const [input, setInput] = useState(
    "label,value\n" +
      SAMPLE_DATA.map((d) => `${d.label},${d.value}`).join("\n"),
  );
  const [height, setHeight] = useState(170),
    [angle, setAngle] = useState(0),
    [material, setMaterial] = useState<"Paper" | "Wire">("Paper");
  const [formation, setFormation] = useState<"Terrain" | "Fossil">("Terrain");
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
              {formation === "Fossil" ? (
                <DataFossil
                  data={data}
                  relief={height}
                  angle={angle}
                  wire={material === "Wire"}
                />
              ) : (
                <DataSculpture
                  data={data}
                  height={height}
                  angle={angle}
                  wire={material === "Wire"}
                />
              )}
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
            <Segments
              label="Formation"
              options={["Terrain", "Fossil"]}
              value={formation}
              onChange={setFormation}
            />
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
                  JSON.stringify(
                    { data, height, angle, material, formation },
                    null,
                    2,
                  ),
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
            Fossil mode wraps the row order clockwise around 32 nested contours.
            Each value pushes its angular segment outward; the relief control
            scales that displacement. Contours repeat the same series, like an
            impression held in layers. This is a visual encoding, not a
            geological age estimate.
          </p>
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
