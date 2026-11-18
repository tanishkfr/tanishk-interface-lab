"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectHeading, Segments, useSceneLoop } from "./workbench";
type Plant = {
  x: number;
  height: number;
  grown: number;
  color: string;
};
type Creature = {
  x: number;
  y: number;
  vx: number;
  phase: number;
};
type Food = {
  x: number;
  life: number;
};
export default function BrowserTerrarium() {
  const [weather, setWeather] = useState<"Sun" | "Rain" | "Night">("Sun"),
    [action, setAction] = useState<"Plant" | "Feed">("Plant"),
    [paused, setPaused] = useState(false),
    [status, setStatus] = useState("A small world is waking up."),
    [plantCount, setPlantCount] = useState(7);
  const canvas = useRef<HTMLCanvasElement>(null),
    scene = useRef({
      plants: Array.from({ length: 7 }, (_, i) => ({
        x: 100 + i * 110,
        height: 70 + ((i * 37) % 130),
        grown: 0.85,
        color: i % 2 ? "#7354b6" : "#ee825e",
      })),
      creatures: Array.from(
        { length: 9 },
        (_, i) =>
          ({
            x: 60 + i * 91,
            y: 0,
            vx: (i % 2 ? 1 : -1) * (12 + i),
            phase: i * 2,
          }) as Creature,
      ),
      food: [] as Food[],
      pointer: { x: 450, y: 200 },
      time: 0,
      water: 0,
    });
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      if (c.width === 900 * dpr && c.height === 500 * dpr) return;
      c.width = 900 * dpr;
      c.height = 500 * dpr;
      c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(c);
    return () => observer.disconnect();
  }, []);
  const draw = useCallback(
    (dt: number) => {
      const c = canvas.current,
        ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const s = scene.current;
      s.time += dt;
      if (weather === "Rain") s.water += dt;
      const night = weather === "Night";
      ctx.clearRect(0, 0, 900, 500);
      ctx.fillStyle = night ? "#242e35" : "#dce9ae";
      ctx.fillRect(0, 0, 900, 500);
      ctx.fillStyle = night ? "#f2e8ad" : "#f6edb2";
      ctx.beginPath();
      ctx.arc(770, 85, weather === "Rain" ? 26 : 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = night ? "#9bbfa6" : "#a7be78";
      ctx.beginPath();
      ctx.moveTo(0, 440);
      ctx.bezierCurveTo(200, 398, 400, 465, 600, 423);
      ctx.bezierCurveTo(710, 407, 820, 437, 900, 423);
      ctx.lineTo(900, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      for (const p of s.plants) {
        if (dt)
          p.grown = Math.min(
            1.35,
            p.grown + dt * (weather === "Rain" ? 0.06 : 0.008),
          );
        const h = p.height * p.grown;
        const sway =
          Math.sin(s.time * 1.3 + p.x) * 3 + (s.pointer.x - p.x) / 250;
        ctx.save();
        ctx.translate(p.x, 449);
        ctx.strokeStyle = night ? "#9bbfa6" : "#607344";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(10 + sway, -h * 0.5, sway, -h);
        ctx.stroke();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(sway - h * 0.35, -h);
        ctx.bezierCurveTo(
          sway - h * 0.3,
          -h * 1.45,
          sway + h * 0.3,
          -h * 1.45,
          sway + h * 0.35,
          -h,
        );
        ctx.quadraticCurveTo(sway, -h * 0.8, sway - h * 0.35, -h);
        ctx.fill();
        ctx.fillStyle = "#f1e4b7";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.ellipse(
            sway + (i - 1.5) * h * 0.12,
            -h * (1.06 + (i % 2) * 0.1),
            h * 0.035,
            h * 0.02,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
      }
      for (const f of s.food) {
        if (dt) f.life -= dt;
        ctx.fillStyle = "#f4b356";
        ctx.beginPath();
        ctx.arc(f.x, 442, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      s.food = s.food.filter((f) => f.life > 0);
      for (const [i, b] of s.creatures.entries()) {
        const nearest = s.food.reduce<Food | null>(
          (a, f) => (!a || Math.abs(f.x - b.x) < Math.abs(a.x - b.x) ? f : a),
          null,
        );
        if (nearest && dt) {
          b.vx += (Math.sign(nearest.x - b.x) * 38 - b.vx) * dt * 2;
          if (Math.abs(nearest.x - b.x) < 12) {
            nearest.life = 0;
          }
        }
        if (dt) {
          b.x += b.vx * dt;
          if (b.x < 20 || b.x > 880) b.vx *= -1;
          b.x = Math.max(20, Math.min(880, b.x));
        }
        const dist = Math.hypot(s.pointer.x - b.x, s.pointer.y - 430);
        const hop =
          dist < 90
            ? Math.sin(s.time * 10 + i) * 10
            : Math.sin(s.time * 3 + b.phase) * 2;
        ctx.save();
        ctx.translate(b.x, 430 - Math.abs(hop));
        ctx.fillStyle = night ? "#bda0d4" : "#665077";
        ctx.beginPath();
        ctx.ellipse(0, 0, 13 + (i % 3) * 2, 17, 0, Math.PI, 0);
        ctx.lineTo(14 + (i % 3) * 2, 10);
        ctx.lineTo(-14 - (i % 3) * 2, 10);
        ctx.fill();
        ctx.strokeStyle = night ? "#bda0d4" : "#665077";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7, 10);
        ctx.lineTo(-10, 16);
        ctx.moveTo(7, 10);
        ctx.lineTo(10, 16);
        ctx.stroke();
        ctx.fillStyle = "#f8efcf";
        ctx.beginPath();
        ctx.arc(-5, -3, 2.6, 0, Math.PI * 2);
        ctx.arc(5, -3, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#252620";
        const look =
          (s.pointer.x - b.x) / Math.max(1, Math.abs(s.pointer.x - b.x));
        ctx.beginPath();
        ctx.arc(-5 + look, -3, 1.1, 0, Math.PI * 2);
        ctx.arc(5 + look, -3, 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (weather === "Rain") {
        ctx.strokeStyle = night ? "#adc5d0" : "#7b9c85";
        ctx.lineWidth = 1;
        for (let i = 0; i < 65; i++) {
          const x = (i * 137) % 900,
            y = (i * 71 + s.time * 190) % 450;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 3, y + 12);
          ctx.stroke();
        }
      }
      if (night) {
        ctx.fillStyle = "#f2e8ad";
        for (let i = 0; i < 24; i++) {
          ctx.globalAlpha = 0.35 + Math.sin(s.time * 2 + i) * 0.25;
          ctx.beginPath();
          ctx.arc((i * 173) % 900, 40 + ((i * 97) % 280), 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },
    [weather],
  );
  useSceneLoop(canvas, (dt) => draw(dt), paused);
  function add(x: number) {
    const s = scene.current;
    if (action === "Plant") {
      if (s.plants.length >= 28) {
        setStatus("The garden is full: 28 plants. Reset to begin a new world.");
        return;
      }
      const p: Plant = {
        x,
        height: 65 + Math.random() * 100,
        grown: 0.45,
        color: s.plants.length % 2 ? "#7354b6" : "#ee825e",
      };
      s.plants.push(p);
      setPlantCount(s.plants.length);
      setStatus("A new mushroom takes root. Rain helps it grow.");
    } else {
      s.food.push({ x, life: 25 });
      s.food = s.food.slice(-20);
      setStatus("A little food. Watch who gets there first.");
    }
    draw(0);
  }
  useEffect(() => {
    draw(0);
  }, [draw, plantCount, paused]); // Draw controls immediately, even when animation is paused.
  return (
    <div className="project-world world-terrarium">
      <div className="v2-wrap">
        <ProjectHeading slug="browser-terrarium">
          <button
            className="lab-button secondary"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Let it live" : "Pause the world"}
          </button>
        </ProjectHeading>
        <div className="terrarium-topbar">
          <Segments
            label="Weather"
            options={["Sun", "Rain", "Night"]}
            value={weather}
            onChange={setWeather}
          />
          <Segments
            label="When you tap"
            options={["Plant", "Feed"]}
            value={action}
            onChange={setAction}
          />
          <span>{plantCount} plants · 9 curious residents</span>
        </div>
        <div className="terrarium-scene">
          <canvas
            ref={canvas}
            role="img"
            aria-label={`Living terrarium with ${plantCount} mushrooms and nine creatures. Weather: ${weather}. Use the buttons below to plant or feed without a pointer.`}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              scene.current.pointer = {
                x: ((e.clientX - rect.left) / rect.width) * 900,
                y: ((e.clientY - rect.top) / rect.height) * 500,
              };
              if (
                paused ||
                matchMedia("(prefers-reduced-motion: reduce)").matches
              )
                draw(0);
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              add(((e.clientX - rect.left) / rect.width) * 900);
            }}
          />
          <span className="terrarium-scene-hint">
            {action === "Plant"
              ? "Tap anywhere to plant a possibility."
              : "Tap to leave a little something."}
          </span>
        </div>
        <div className="terrarium-bottom">
          <div>
            <button
              className="lab-button"
              onClick={() => add(70 + Math.random() * 760)}
            >
              {action === "Plant" ? "Plant a mushroom" : "Leave some food"}
            </button>
            <button
              className="quiet-button"
              onClick={() => {
                const s = scene.current;
                s.plants = s.plants
                  .slice(0, 7)
                  .map((p) => ({ ...p, grown: 0.85 }));
                s.food = [];
                s.creatures.forEach((c, i) => (c.x = 60 + i * 91));
                s.time = 0;
                setPlantCount(7);
                setStatus("A fresh start.");
                draw(0);
              }}
            >
              Begin again
            </button>
            <button
              className="quiet-button"
              onClick={() => {
                const c = canvas.current;
                if (!c) return;
                c.toBlob((blob) => {
                  if (!blob) {
                    setStatus("Snapshot could not be created.");
                    return;
                  }
                  const url = URL.createObjectURL(blob),
                    a = document.createElement("a");
                  a.href = url;
                  a.download = "browser-terrarium.png";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1500);
                });
              }}
            >
              Take a snapshot
            </button>
          </div>
          <p role="status">{status}</p>
        </div>
        <section className="project-notes">
          <h2>
            Very little to do.
            <br />
            Quite a lot to notice.
          </h2>
          <p>
            Residents wander until they find food. Move near them and they
            become restless. Rain accelerates growth; night reveals the
            fireflies. Your plants and residents remain here while this page is
            open. The ecosystem is an authored toy, not a biological model.
          </p>
          <p>
            The world rests when it leaves the screen, the tab is hidden, or
            reduced motion is enabled. Every action is also available through
            the buttons. Take a snapshot to keep this particular little world.
          </p>
        </section>
      </div>
    </div>
  );
}
