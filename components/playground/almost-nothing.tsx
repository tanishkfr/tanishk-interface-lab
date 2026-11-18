"use client";
import { useRef, useState } from "react";
import { ProjectHeading, download, useSceneLoop } from "./workbench";
type Stroke = { points: [number, number][]; at: number; width: number };
function path(points: [number, number][]) {
  return points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
}
export default function AlmostNothing() {
  const [memory, setMemory] = useState<
      "A moment" | "A little longer" | "Forever"
    >("A moment"),
    [weight, setWeight] = useState(1),
    [hasInk, setHasInk] = useState(false),
    [status, setStatus] = useState("Make a mark. Wait for it.");
  const canvas = useRef<HTMLCanvasElement>(null),
    world = useRef({
      strokes: [] as Stroke[],
      now: 0,
      drawing: false,
      x: 450,
      y: 250,
    });
  const seconds =
    memory === "A moment" ? 4 : memory === "A little longer" ? 12 : Infinity;
  function opacity(s: Stroke) {
    return Math.max(0, 1 - (world.current.now - s.at) / seconds);
  }
  function draw(dt: number) {
    const c = canvas.current,
      ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const w = world.current;
    w.now += dt;
    ctx.clearRect(0, 0, 900, 500);
    ctx.fillStyle = "#f7f6f0";
    ctx.fillRect(0, 0, 900, 500);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let alive = false;
    for (const s of w.strokes) {
      const a = opacity(s);
      if (a > 0) alive = true;
      ctx.strokeStyle = `rgba(47,49,43,${a})`;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      s.points.forEach(([x, y], i) =>
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
      );
      ctx.stroke();
    }
    ctx.fillStyle = "#30322b";
    ctx.beginPath();
    ctx.arc(w.x, w.y, 2, 0, Math.PI * 2);
    ctx.fill();
    if (dt && !alive && !w.drawing) setHasInk(false);
  }
  useSceneLoop(canvas, draw, !hasInk || memory === "Forever");
  function start(x: number, y: number) {
    const w = world.current;
    w.x = x;
    w.y = y;
    w.drawing = true;
    w.strokes.push({ points: [[x, y]], at: w.now, width: weight });
    w.strokes = w.strokes.slice(-40);
    setHasInk(true);
    setStatus("It was here. For a moment.");
  }
  function move(x: number, y: number) {
    const w = world.current;
    w.x = x;
    w.y = y;
    if (w.drawing) {
      const s = w.strokes.at(-1)!;
      if (s.points.length < 1500) s.points.push([x, y]);
      s.at = w.now;
    }
    draw(0);
  }
  function point(e: React.PointerEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - r.left) / r.width) * 900,
      ((e.clientY - r.top) / r.height) * 500,
    ] as const;
  }
  function smallMark() {
    const w = world.current;
    w.strokes = w.strokes.slice(-39);
    w.strokes.push({
      points: Array.from(
        { length: 60 },
        (_, i) => [420 + i, 250 + Math.sin(i / 15) * 18] as [number, number],
      ),
      at: w.now,
      width: weight,
    });
    setHasInk(true);
    draw(0);
    setStatus("One small thing. Given enough room.");
  }
  function exportMark() {
    const w = world.current;
    download(
      "almost-nothing.svg",
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500"><title>Almost Nothing — the remaining ink</title><rect width="900" height="500" fill="#f7f6f0"/>${w.strokes
        .filter((s) => opacity(s) > 0)
        .map(
          (s) =>
            `<path d="${path(s.points)}" fill="none" stroke="#30322b" stroke-opacity="${opacity(s)}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join("")}</svg>`,
    );
    setStatus("The remaining ink, kept as a vector.");
  }
  return (
    <div className="project-world world-almost">
      <div className="v2-wrap">
        <ProjectHeading slug="almost-nothing" />
        <div className="almost-surface">
          <canvas
            ref={canvas}
            width="900"
            height="500"
            tabIndex={0}
            role="img"
            aria-label="Temporal drawing surface. Draw with a pointer. Use arrow keys to move the pen, and hold Space while moving to draw. A button below can create a mark without drawing."
            onPointerDown={(e) => {
              const [x, y] = point(e);
              e.currentTarget.setPointerCapture(e.pointerId);
              start(x, y);
            }}
            onPointerMove={(e) => {
              const [x, y] = point(e);
              move(x, y);
            }}
            onPointerUp={() => (world.current.drawing = false)}
            onPointerCancel={() => (world.current.drawing = false)}
            onKeyDown={(e) => {
              const w = world.current;
              if (e.code === "Space") {
                e.preventDefault();
                if (!e.repeat) start(w.x, w.y);
              }
              const directions: Record<string, [number, number]> = {
                ArrowLeft: [-8, 0],
                ArrowRight: [8, 0],
                ArrowUp: [0, -8],
                ArrowDown: [0, 8],
              };
              if (directions[e.key]) {
                e.preventDefault();
                const [x, y] = directions[e.key];
                move(
                  Math.max(10, Math.min(890, w.x + x)),
                  Math.max(10, Math.min(490, w.y + y)),
                );
              }
            }}
            onKeyUp={(e) => {
              if (e.code === "Space") world.current.drawing = false;
            }}
            onBlur={() => (world.current.drawing = false)}
          />
          <p role="status">{status}</p>
        </div>
        <div className="almost-controls">
          <label>
            Remember for
            <select
              value={memory}
              onChange={(e) => {
                setMemory(e.target.value as typeof memory);
                setHasInk(true);
              }}
            >
              {["A moment", "A little longer", "Forever"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            A line’s weight
            <input
              type="range"
              aria-label="Line weight"
              min="1"
              max="5"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>
          <button onClick={smallMark}>Make one small mark</button>
          <button
            onClick={() => {
              const s = world.current.strokes.at(-1);
              if (s) {
                s.at = world.current.now;
                setHasInk(true);
                draw(0);
                setStatus("Some things are worth recalling.");
              }
            }}
          >
            Recall the last mark
          </button>
          <button onClick={exportMark}>Keep what remains</button>
          <button
            onClick={() => {
              world.current.strokes = [];
              setHasInk(false);
              draw(0);
              setStatus("A little room, again.");
            }}
          >
            Clear
          </button>
        </div>
        <section className="project-notes">
          <h2>What remains is enough.</h2>
          <p>
            Ink fades over four or twelve seconds, or stays for as long as this
            page does. A small dot marks the pen. The surface keeps the last 40
            strokes so a faded mark can be recalled. Under reduced motion, time
            stays still and every control remains available.
          </p>
          <p>
            Draw slowly, move the pen with arrow keys and Space, or make a mark
            with the button. Export captures the ink that remains visible at
            that moment. There is no score, no feed, and no reason to hurry.
          </p>
        </section>
      </div>
    </div>
  );
}
