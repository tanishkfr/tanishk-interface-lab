"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ProjectHeading,
  Slider,
  Segments,
  ExportButton,
  download,
  useSceneLoop,
} from "./workbench";
type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  anchor: number;
  el: HTMLSpanElement;
  letter: string;
};
export default function TypeHasMass() {
  const [word, setWord] = useState("HEAVY"),
    [gravity, setGravity] = useState(420),
    [elasticity, setElasticity] = useState(0.65),
    [material, setMaterial] = useState<"Lead" | "Rubber">("Lead"),
    [paused, setPaused] = useState(false),
    [revision, setRevision] = useState(0),
    [status, setStatus] = useState("");
  const stage = useRef<HTMLDivElement>(null),
    bodies = useRef<Body[]>([]),
    drag = useRef<{
      i: number;
      dx: number;
      dy: number;
    } | null>(null);
  const letters = Array.from(word).slice(0, 12);
  const reset = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const spans = Array.from(
      el.querySelectorAll<HTMLSpanElement>("[data-body]"),
    );
    const total = spans.reduce((n, s) => n + s.offsetWidth, 0);
    const scale = Math.min(1, (el.clientWidth - 40) / Math.max(total, 1));
    el.style.setProperty("--letter-scale", String(scale));
    let x = 20;
    const widths = spans.map((s) => s.offsetWidth * scale);
    x = (el.clientWidth - widths.reduce((a, b) => a + b, 0)) / 2;
    bodies.current = spans.map((s, i) => {
      const b = {
        x,
        y: 35 + (i % 3) * 15,
        vx: 0,
        vy: 0,
        w: widths[i],
        h: s.offsetHeight * scale,
        anchor: x,
        el: s,
        letter: s.textContent || "",
      };
      x += widths[i];
      s.style.transform = `translate(${b.x}px,${b.y}px) scale(${scale})`;
      return b;
    });
  }, []);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(reset);
    observer.observe(el);
    reset();
    document.fonts.ready.then(reset);
    return () => observer.disconnect();
  }, [reset, word, revision]);
  useSceneLoop(
    stage,
    (dt) => {
      const el = stage.current;
      if (!el) return;
      const list = bodies.current;
      const scale = Number(el.style.getPropertyValue("--letter-scale")) || 1;
      for (const [i, b] of list.entries()) {
        if (drag.current?.i !== i && dt) {
          b.vy += gravity * dt;
          if (material === "Rubber") {
            b.vx += (b.anchor - b.x) * 30 * dt;
            b.vy += (45 - b.y) * 12 * dt;
            b.vx *= 0.98;
            b.vy *= 0.985;
          }
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          const floor = el.clientHeight - b.h - 22;
          if (b.y > floor) {
            b.y = floor;
            b.vy = -Math.abs(b.vy) * elasticity;
            b.vx *= 0.94;
          }
          if (b.y < 0) {
            b.y = 0;
            b.vy = Math.abs(b.vy) * 0.5;
          }
          if (b.x < 5) {
            b.x = 5;
            b.vx = Math.abs(b.vx) * elasticity;
          }
          if (b.x > el.clientWidth - b.w - 5) {
            b.x = el.clientWidth - b.w - 5;
            b.vx = -Math.abs(b.vx) * elasticity;
          }
        }
      }
      if (dt)
        for (let i = 0; i < list.length; i++)
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i],
              b = list[j];
            const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
              oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            if (ox > 0 && oy > 0) {
              if (ox < oy) {
                const direction = a.x < b.x ? -1 : 1;
                if (drag.current?.i !== i) a.x += direction * ox * 0.5;
                if (drag.current?.i !== j) b.x -= direction * ox * 0.5;
                const av = a.vx;
                a.vx = b.vx * 0.6;
                b.vx = av * 0.6;
              } else {
                const direction = a.y < b.y ? -1 : 1;
                if (drag.current?.i !== i) a.y += direction * oy * 0.5;
                if (drag.current?.i !== j) b.y -= direction * oy * 0.5;
                const av = a.vy;
                a.vy = b.vy * elasticity;
                b.vy = av * elasticity;
              }
            }
          }
      list.forEach((b) => {
        b.el.style.transform = `translate(${b.x}px,${b.y}px) scale(${scale})`;
      });
    },
    paused,
  );
  async function exportComposition() {
    try {
      const el = stage.current;
      if (!el) return;
      const buffer: ArrayBuffer = await (
        await fetch("/fonts/bricolage.ttf")
      ).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (const b of bytes) binary += String.fromCharCode(b);
      const fontSize =
        parseFloat(getComputedStyle(el).fontSize) *
        (Number(el.style.getPropertyValue("--letter-scale")) || 1);
      const escape = (v: string) =>
        v.replace(
          /[<>&"']/g,
          (c) =>
            ({
              "<": "&lt;",
              ">": "&gt;",
              "&": "&amp;",
              '"': "&quot;",
              "'": "&apos;",
            })[c]!,
        );
      const texts = bodies.current
        .map(
          (b) =>
            `<text x="${b.x}" y="${b.y}" dominant-baseline="text-before-edge" font-size="${fontSize}" font-weight="800">${escape(b.letter)}</text>`,
        )
        .join("");
      download(
        "type-has-mass.svg",
        `<svg xmlns="http://www.w3.org/2000/svg" width="${el.clientWidth}" height="${el.clientHeight}" viewBox="0 0 ${el.clientWidth} ${el.clientHeight}"><style>@font-face{font-family:LabMass;src:url(data:font/ttf;base64,${btoa(binary)})}text{font-family:LabMass,sans-serif;fill:#252620}</style><rect width="100%" height="100%" fill="#ff795b"/>${texts}</svg>`,
      );
      setStatus("Composition exported with its font embedded.");
    } catch {
      setStatus("Export could not be created. Please try again.");
    }
  }
  return (
    <div className="project-world world-mass">
      <div className="v2-wrap">
        <ProjectHeading slug="type-has-mass">
          <button
            className="lab-button secondary"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Resume gravity" : "Pause gravity"}
          </button>
        </ProjectHeading>
        <div className="mass-input-row">
          <label>
            <span>Your words</span>
            <input
              value={word}
              maxLength={24}
              aria-describedby="mass-input-help"
              onChange={(e) =>
                setWord(Array.from(e.target.value).slice(0, 12).join(""))
              }
            />
          </label>
          <span id="mass-input-help">12 characters. A lot of feeling.</span>
          <button
            className="lab-button secondary"
            onClick={() => {
              setRevision((n) => n + 1);
              setStatus("Letters reset.");
            }}
          >
            Start the fall again
          </button>
        </div>
        <div
          className="physics-stage"
          ref={stage}
          onPointerMove={(e) => {
            const held = drag.current;
            if (!held) return;
            const b = bodies.current[held.i];
            if (!b) return;
            const rect = e.currentTarget.getBoundingClientRect();
            b.x = Math.max(
              0,
              Math.min(rect.width - b.w, e.clientX - rect.left - held.dx),
            );
            b.y = Math.max(
              0,
              Math.min(rect.height - b.h, e.clientY - rect.top - held.dy),
            );
            b.vx = 0;
            b.vy = 0;
            b.el.style.transform = `translate(${b.x}px,${b.y}px) scale(${e.currentTarget.style.getPropertyValue("--letter-scale") || 1})`;
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {letters.map((letter, i) => (
            <span
              key={`${i}-${revision}`}
              data-body
              tabIndex={0}
              role="button"
              aria-label={`Letter ${letter}. Drag or use arrow keys. Enter lifts it.`}
              onPointerDown={(e) => {
                const b = bodies.current[i];
                if (!b) return;
                const rect = stage.current!.getBoundingClientRect();
                drag.current = {
                  i,
                  dx: e.clientX - rect.left - b.x,
                  dy: e.clientY - rect.top - b.y,
                };
                stage.current!.setPointerCapture(e.pointerId);
              }}
              onKeyDown={(e) => {
                const b = bodies.current[i];
                if (!b) return;
                const changes: Record<string, [number, number]> = {
                  ArrowLeft: [-20, 0],
                  ArrowRight: [20, 0],
                  ArrowUp: [0, -35],
                  ArrowDown: [0, 20],
                  Enter: [0, -90],
                  " ": [0, -90],
                };
                const change = changes[e.key];
                if (change) {
                  e.preventDefault();
                  b.x = Math.max(
                    0,
                    Math.min(stage.current!.clientWidth - b.w, b.x + change[0]),
                  );
                  b.y = Math.max(
                    0,
                    Math.min(
                      stage.current!.clientHeight - b.h - 22,
                      b.y + change[1],
                    ),
                  );
                  b.vy = 0;
                  b.el.style.transform = `translate(${b.x}px,${b.y}px) scale(${stage.current!.style.getPropertyValue("--letter-scale") || 1})`;
                }
              }}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
          <span className="physics-floor-label">Pull a letter. Let it go.</span>
        </div>
        <div className="mass-control-strip">
          <Slider
            label="Gravity"
            value={gravity}
            min={0}
            max={900}
            onChange={setGravity}
          />
          <Slider
            label="Elasticity"
            value={elasticity}
            min={0}
            max={0.95}
            step={0.05}
            onChange={setElasticity}
          />
          <Segments
            label="Material"
            options={["Lead", "Rubber"]}
            value={material}
            onChange={setMaterial}
          />
          <ExportButton onClick={() => void exportComposition()} />
        </div>
        <p className="mass-status" role="status">
          {status ||
            "Tab to a letter and use arrow keys. Reduced motion keeps the composition still; you can still move each letter."}
        </p>
        <section className="project-notes">
          <h2>A sentence, unsettled.</h2>
          <p>
            Lead falls and collides. Rubber tethers each glyph to its original
            position. Gravity adds acceleration; elasticity controls how much
            velocity survives a bounce. Collision boxes approximate glyph
            bounds, so this is a typographic toy rather than a precision
            material simulation.
          </p>
          <p>
            SVG export captures the current arrangement with an embedded
            open-source font. Animation export and deformable glyph outlines are
            not part of this version.
          </p>
        </section>
      </div>
    </div>
  );
}
