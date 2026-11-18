"use client";
import { useRef, useState } from "react";
import {
  ProjectHeading,
  Slider,
  Segments,
  ExportButton,
  download,
} from "./workbench";
type Rules = {
  balance: number;
  tension: number;
  density: number;
  mode: "Order" | "Disobedience" | "Collision";
  seed: number;
};
const BASE: Rules = {
  balance: 55,
  tension: 12,
  density: 35,
  mode: "Order",
  seed: 1,
};
function css(r: Rules) {
  return `.composition{display:grid;grid-template-columns:${r.balance}fr ${100 - r.balance}fr;gap:${Math.round(48 - r.density * 0.35)}px;background:#f4eee1;color:#252620;padding:40px;font-family:LabPoster,sans-serif}.composition h2{font-size:clamp(54px,10vw,120px);font-weight:900;line-height:.85;letter-spacing:-.04em;margin:0;grid-column:1/-1;transform:rotate(${r.mode === "Order" ? 0 : -r.tension * 0.06}deg)}.composition .visual{min-height:260px;background:#ee674c;display:grid;place-items:center;transform:rotate(${r.mode === "Order" ? 0 : r.tension * 0.08}deg)}.composition .visual span{width:65%;aspect-ratio:1;border:1px solid;border-radius:${r.seed % 2 ? "50%" : "0"};transform:rotate(${r.tension * 2}deg);background:#cddc79}.composition .story{font-size:16px;line-height:1.6;align-self:${r.mode === "Order" ? "start" : "end"};transform:translateY(${r.mode === "Collision" ? -r.tension * 0.65 : 0}px)}.composition .foot{grid-column:1/-1;border-top:1px solid;padding-top:20px;display:flex;justify-content:space-between;font-size:12px}@media(max-width:520px){.composition{padding:24px;gap:20px;grid-template-columns:1fr}.composition .visual{min-height:220px}.composition .story{transform:none}.composition h2{font-size:64px}}`;
}
export default function GridCrimes() {
  const [r, setR] = useState<Rules>(BASE),
    [headline, setHeadline] = useState("GOOD THINGS\nHAPPEN OFF-GRID."),
    [showGrid, setShowGrid] = useState(true),
    [history, setHistory] = useState<Rules[]>([]),
    [status, setStatus] = useState("The grid is a starting point. Not a law.");
  const poster = useRef<HTMLDivElement>(null);
  function update<K extends keyof Rules>(k: K, v: Rules[K]) {
    setR((s) => ({ ...s, [k]: v }));
  }
  function mutate() {
    setHistory((h) => [...h.slice(-19), r]);
    setR((s) => ({
      balance: 25 + ((s.seed * 23) % 50),
      tension: 30 + ((s.seed * 37) % 65),
      density: 20 + ((s.seed * 19) % 70),
      mode:
        s.mode === "Order"
          ? "Disobedience"
          : s.mode === "Disobedience"
            ? "Collision"
            : "Order",
      seed: s.seed + 1,
    }));
    setStatus(
      "A new set of consequences. Try the controls, then keep the one you like.",
    );
  }
  async function exportPoster() {
    const html = poster.current?.innerHTML;
    if (!html) return;
    const faces = await Promise.all(
      (
        [
          ["regular", 400],
          ["fett", 700],
          ["satt", 900],
        ] as const
      ).map(async ([name, weight]) => {
        const bytes = new Uint8Array(
          await (await fetch(`/fonts/apfel-${name}.woff2`)).arrayBuffer(),
        );
        let binary = "";
        for (const b of bytes) binary += String.fromCharCode(b);
        return `@font-face{font-family:LabPoster;src:url(data:font/woff2;base64,${btoa(binary)});font-weight:${weight}}`;
      }),
    );
    download(
      "grid-crimes.html",
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grid Crimes composition</title><style>${faces.join("")}*{box-sizing:border-box}body{margin:0}${css(r)}</style><div class="composition">${html}</div></html>`,
      "text/html",
    );
    setStatus(
      "A real responsive HTML composition, with its display font embedded.",
    );
  }
  return (
    <div className="project-world world-grid">
      <div className="v2-wrap">
        <ProjectHeading slug="grid-crimes">
          <button className="lab-button" onClick={mutate}>
            Break a rule
          </button>
        </ProjectHeading>
        <div className="grid-crimes-workspace">
          <aside className="instrument-panel">
            <h2>Rules, temporarily.</h2>
            <Segments
              label="Attitude"
              options={["Order", "Disobedience", "Collision"]}
              value={r.mode}
              onChange={(v) => update("mode", v)}
            />
            <Slider
              label="Column balance"
              value={r.balance}
              min={25}
              max={75}
              unit="%"
              onChange={(v) => update("balance", v)}
            />
            <Slider
              label="Tension"
              value={r.tension}
              min={0}
              max={100}
              onChange={(v) => update("tension", v)}
            />
            <Slider
              label="Density"
              value={r.density}
              min={0}
              max={100}
              onChange={(v) => update("density", v)}
            />
            <label className="instrument-field">
              The headline
              <textarea
                rows={3}
                maxLength={90}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </label>
            <label className="compare-label">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />{" "}
              Show the underlying grid
            </label>
            <button
              className="lab-button secondary"
              disabled={!history.length}
              onClick={() => {
                setR(history.at(-1)!);
                setHistory((h) => h.slice(0, -1));
              }}
            >
              Before that happened
            </button>
            <ExportButton onClick={() => void exportPoster()}>
              Export the composition
            </ExportButton>
            <button
              className="quiet-button"
              onClick={() => download("grid-crimes.css", css(r), "text/css")}
            >
              Export layout CSS
            </button>
            <p className="instrument-note" role="status">
              {status}
            </p>
          </aside>
          <div
            className={`crime-preview${showGrid ? " show-grid" : ""}`}
            style={
              {
                "--crime-cols": `${r.balance}fr ${100 - r.balance}fr`,
                "--crime-gap": `${Math.round(48 - r.density * 0.35)}px`,
                "--crime-turn": `${r.mode === "Order" ? 0 : r.tension * 0.08}deg`,
                "--crime-tension": `${r.mode === "Collision" ? -r.tension * 0.65 : 0}px`,
              } as React.CSSProperties
            }
          >
            <div
              className={`crime-paper crime-mode-${r.mode.toLowerCase()}`}
              ref={poster}
            >
              <h2
                className="crime-headline"
                style={{
                  transform: `rotate(${r.mode === "Order" ? 0 : -r.tension * 0.06}deg)`,
                }}
              >
                {headline.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </h2>
              <div className="visual crime-visual">
                <span
                  style={{
                    borderRadius: r.seed % 2 ? "50%" : "0",
                    transform: `rotate(${r.tension * 2}deg)`,
                  }}
                />
              </div>
              <div className="story crime-story">
                <h3>
                  Somewhere between
                  <br />a system and a surprise.
                </h3>
                <p>
                  This is a live editorial composition. Its columns, space,
                  alignment, and tension follow the rules you set.
                </p>
                <p>
                  Change one thing. Watch the relationships move. A grid can
                  hold the page together without holding it still.
                </p>
              </div>
              <div className="foot crime-foot">
                <span>LAB / AN OPEN COMPOSITION</span>
                <span>Edition {String(r.seed).padStart(3, "0")}</span>
              </div>
            </div>
            <span className="crime-grid-caption">
              {r.balance} / {100 - r.balance} · {r.mode.toLowerCase()}
            </span>
          </div>
        </div>
        <section className="project-notes">
          <h2>Commit a considered crime.</h2>
          <p>
            Column balance changes the actual CSS grid tracks. Density changes
            the space between elements. Tension rotates the visual and headline;
            Collision lets the story cross a baseline. The overlay makes the
            underlying rule visible instead of hiding it behind an effect.
          </p>
          <p>
            Break a rule generates a new, coherent composition and records up to
            20 prior generations. Export produces editable, responsive HTML or
            the actual layout CSS. Decorative grid guides are excluded.
          </p>
        </section>
      </div>
    </div>
  );
}
