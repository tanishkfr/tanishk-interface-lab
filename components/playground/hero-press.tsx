"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSceneLoop } from "./workbench";
export function HeroPress() {
  const canvas = useRef<HTMLCanvasElement>(null),
    ink = useRef<HTMLCanvasElement | null>(null),
    [pressure, setPressure] = useState(18),
    [awake, setAwake] = useState(false),
    [status, setStatus] = useState(
      "Drag across the lettering. Make an impression.",
    );
  const physics = useRef({
    x: 0.5,
    y: 0.5,
    force: 0,
    velocity: 0,
    target: 0,
    pressed: false,
    pressure: 18,
  });
  const draw = useCallback((dt: number) => {
    const c = canvas.current,
      source = ink.current,
      ctx = c?.getContext("2d");
    if (!c || !ctx || !source) return;
    const p = physics.current;
    if (dt) {
      p.velocity += (p.target - p.force) * 110 * dt;
      p.velocity *= Math.exp(-16 * dt);
      p.force += p.velocity * dt;
      if (!p.pressed) p.target *= Math.exp(-5 * dt);
    }
    ctx.clearRect(0, 0, 1200, 440);
    ctx.fillStyle = "#e5e94b";
    ctx.fillRect(0, 0, 1200, 440);
    ctx.globalAlpha = 0.1;
    ctx.drawImage(source, 0, 0);
    ctx.globalAlpha = 1;
    const rows = 36,
      slice = 440 / rows;
    for (let i = 0; i < rows; i++) {
      const band = (i + 0.5) / rows,
        falloff = Math.exp(-Math.pow((band - p.y) * 3, 2));
      const shift = Math.sin(i * 0.32 + p.x * 5) * p.force * falloff;
      ctx.drawImage(
        source,
        0,
        i * slice,
        1200,
        slice,
        shift,
        i * slice,
        1200,
        slice + 1,
      );
    }
    if (
      dt &&
      !p.pressed &&
      Math.abs(p.force) < 0.1 &&
      Math.abs(p.velocity) < 0.1
    ) {
      p.force = 0;
      setAwake(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const c = canvas.current;
    if (!c) return;
    const family = getComputedStyle(c).fontFamily;
    document.fonts.load(`400 500px ${family.split(",")[0]}`).then(() => {
      if (!active) return;
      const source = document.createElement("canvas");
      source.width = 1200;
      source.height = 440;
      const ctx = source.getContext("2d")!;
      ctx.font = `400 600px ${family}`;
      let metrics = ctx.measureText("LAB/");
      const size =
        600 *
        Math.min(
          1120 / metrics.width,
          360 /
            Math.max(
              1,
              metrics.actualBoundingBoxAscent +
                metrics.actualBoundingBoxDescent,
            ),
        );
      ctx.font = `400 ${size}px ${family}`;
      metrics = ctx.measureText("LAB/");
      ctx.fillStyle = "#252620";
      ctx.fillText(
        "LAB/",
        (1200 - metrics.width) / 2,
        (440 +
          metrics.actualBoundingBoxAscent -
          metrics.actualBoundingBoxDescent) /
          2,
      );
      ink.current = source;
      draw(0);
    });
    return () => {
      active = false;
    };
  }, [draw]);
  useSceneLoop(canvas, (dt) => draw(dt), !awake);
  function excite(x: number, y: number) {
    const p = physics.current;
    p.x = x;
    p.y = y;
    p.target = (20 + p.pressure * 1.4) * (x > 0.5 ? 1 : -1);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      p.force = p.target;
      p.velocity = 0;
      draw(0);
      return;
    }
    setAwake(true);
    draw(0);
  }
  return (
    <div className="hero-press">
      <div className="press-canvas">
        <h1 className="sr-only">
          LAB/ — An internet playground. Interactive typographic printing press.
        </h1>
        <canvas
          ref={canvas}
          width="1200"
          height="440"
          role="img"
          aria-label="LAB lettering that can be pulled into a different impression. Use the Print pressure slider or Make an impression button for keyboard control."
          onPointerDown={(e) => {
            physics.current.pressed = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            excite(
              (e.clientX - r.left) / r.width,
              (e.clientY - r.top) / r.height,
            );
          }}
          onPointerMove={(e) => {
            if (!physics.current.pressed) return;
            const r = e.currentTarget.getBoundingClientRect();
            excite(
              (e.clientX - r.left) / r.width,
              (e.clientY - r.top) / r.height,
            );
          }}
          onPointerUp={() => {
            physics.current.pressed = false;
            setStatus("One impression. Never quite the same twice.");
          }}
          onPointerCancel={() => (physics.current.pressed = false)}
        />
        <span className="press-side-note">
          A QUESTIONABLE
          <br />
          USE OF THE INTERNET.
        </span>
      </div>
      <div className="press-controls">
        <p aria-live="polite">{status}</p>
        <label>
          Print pressure
          <input
            type="range"
            aria-label="Print pressure"
            min="0"
            max="100"
            value={pressure}
            onChange={(e) => {
              const n = Number(e.target.value);
              setPressure(n);
              physics.current.pressure = n;
              excite(0.7, 0.5);
            }}
          />
          <output>{pressure}</output>
        </label>
        <button
          onClick={() => {
            physics.current.pressed = false;
            excite(0.65 + Math.random() * 0.3, Math.random());
            setStatus("An original, slightly unreasonable impression.");
          }}
        >
          Make an impression <span aria-hidden="true">↗</span>
        </button>
        <button
          onClick={() => {
            canvas.current?.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob),
                a = document.createElement("a");
              a.href = url;
              a.download = "lab-impression.png";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1500);
            });
            setStatus("Your impression, printed as a PNG.");
          }}
        >
          Keep it <span aria-hidden="true">↓</span>
        </button>
        <button
          aria-label="Reset the lettering"
          onClick={() => {
            physics.current = {
              x: 0.5,
              y: 0.5,
              force: 0,
              velocity: 0,
              target: 0,
              pressed: false,
              pressure,
            };
            setAwake(false);
            draw(0);
            setStatus("A clean sheet. Go again.");
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
