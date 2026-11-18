"use client";
import { useRef, useState } from "react";
import {
  ProjectHeading,
  ExportButton,
  Slider,
  Segments,
  exportSvg,
  download,
} from "./workbench";
type Kind = "burst" | "ticket" | "disc" | "tape" | "eyes";
type Sticker = {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  kind: Kind;
  text: string;
  ink: string;
  paper: string;
  foil: boolean;
};
const INITIAL: Sticker[] = [
  {
    id: 1,
    x: 250,
    y: 230,
    angle: -15,
    scale: 1.5,
    kind: "burst",
    text: "MAKE A MESS",
    ink: "#252620",
    paper: "#d9f459",
    foil: false,
  },
  {
    id: 2,
    x: 620,
    y: 220,
    angle: 12,
    scale: 1.3,
    kind: "ticket",
    text: "NO PLAN / ALL PLAY",
    ink: "#f1efe5",
    paper: "#5834d7",
    foil: false,
  },
  {
    id: 3,
    x: 440,
    y: 420,
    angle: -6,
    scale: 1.3,
    kind: "disc",
    text: "STAY CURIOUS",
    ink: "#252620",
    paper: "#ff7859",
    foil: false,
  },
  {
    id: 4,
    x: 710,
    y: 440,
    angle: 8,
    scale: 1,
    kind: "eyes",
    text: "LOOK AGAIN",
    ink: "#252620",
    paper: "#f1efe5",
    foil: false,
  },
];
const COLORS = [
  ["#d9f459", "#252620"],
  ["#5834d7", "#f1efe5"],
  ["#ff7859", "#252620"],
  ["#a9d9f2", "#252620"],
  ["#f1efe5", "#252620"],
];
export function StickerGlyph({
  kind,
  text,
  ink,
  paper,
  foil = false,
}: {
  kind: Kind;
  text: string;
  ink: string;
  paper: string;
  foil?: boolean;
}) {
  const fill = foil ? "url(#city-foil)" : paper;
  const labelSize = text.length > 18 ? 17 : text.length > 12 ? 21 : 28;
  const labelWidth = kind === "ticket" ? 230 : kind === "tape" ? 260 : 160;
  const burst = Array.from({ length: 24 }, (_, i) => {
    const a = (i * Math.PI) / 12,
      r = i % 2 ? 77 : 110;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  return (
    <g fill={fill} stroke={ink} strokeWidth="1.5">
      {kind === "burst" ? (
        <polygon points={burst} />
      ) : kind === "ticket" ? (
        <path d="M-140-63H140V-30Q120-20 140-10V10Q120 20 140 30V63H-140V30Q-120 20-140 10V-10Q-120-20-140-30Z" />
      ) : kind === "disc" ? (
        <circle r="100" />
      ) : kind === "tape" ? (
        <path d="M-150-36-137-45-125-36-115-45H150L140-30 150-17 140-3 150 10 140 23 150 38H-150L-140 22-150 8-140-7-150-21Z" />
      ) : (
        <rect x="-110" y="-75" width="220" height="150" rx="70" />
      )}
      {kind === "eyes" ? (
        <g>
          <ellipse cx="-40" cy="-10" rx="28" ry="36" fill="#f1efe5" />
          <ellipse cx="40" cy="-10" rx="28" ry="36" fill="#f1efe5" />
          <ellipse cx="-32" cy="-7" rx="11" ry="19" fill={ink} />
          <ellipse cx="48" cy="-7" rx="11" ry="19" fill={ink} />
          <text
            y="49"
            textAnchor="middle"
            fill={ink}
            stroke="none"
            fontSize="16"
            fontWeight="900"
            data-sticker-message="true"
            textLength={Math.max(1, Math.min(180, text.length * 16 * 0.65))}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </text>
        </g>
      ) : (
        <g fill={ink} stroke="none" textAnchor="middle" fontWeight="900">
          <text
            y={kind === "disc" ? 0 : 8}
            fontSize={labelSize}
            data-sticker-message="true"
            textLength={Math.max(
              1,
              Math.min(labelWidth, text.length * labelSize * 0.65),
            )}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </text>
          {kind === "disc" && (
            <>
              <text y="35" fontSize="10" letterSpacing="3">
                LAB / OPEN EDITION
              </text>
              <circle r="76" fill="none" stroke={ink} strokeWidth="1" />
            </>
          )}
          {kind === "ticket" && (
            <>
              <path d="M-110-40H110M-110 40H110" stroke={ink} />
              <text y="51" fontSize="7" letterSpacing="2">
                ADMIT ONE GOOD ACCIDENT
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
}
export default function StickerCity() {
  const [items, setItems] = useState<Sticker[]>(INITIAL),
    [selected, setSelected] = useState(1),
    [kind, setKind] = useState<Kind>("burst"),
    [text, setText] = useState("WHY NOT?"),
    [paper, setPaper] = useState("#c4c3b8"),
    [history, setHistory] = useState<Sticker[][]>([]),
    [future, setFuture] = useState<Sticker[][]>([]),
    [status, setStatus] = useState(
      "Select a sticker. Peel it off. Put it somewhere better.",
    );
  const svg = useRef<SVGSVGElement>(null),
    drag = useRef<{
      id: number;
      x: number;
      y: number;
      startX: number;
      startY: number;
      el: SVGGElement;
    } | null>(null),
    nextId = useRef(5);
  const current = items.find((s) => s.id === selected);
  function commit(next: Sticker[]) {
    setHistory((h) => [...h.slice(-24), items]);
    setFuture([]);
    setItems(next);
  }
  function point(e: React.PointerEvent) {
    const p = new DOMPoint(e.clientX, e.clientY);
    return p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
  }
  function edit(change: Partial<Sticker>) {
    if (!current) return;
    commit(items.map((s) => (s.id === selected ? { ...s, ...change } : s)));
  }
  function add() {
    if (items.length >= 36) {
      setStatus(
        "36 stickers is a good kind of crowded. Remove one to make room.",
      );
      return;
    }
    const id = nextId.current++,
      color = COLORS[(id - 1) % COLORS.length];
    commit([
      ...items,
      {
        id,
        x: 200 + ((id * 137) % 520),
        y: 130 + ((id * 73) % 370),
        angle: ((id * 17) % 40) - 20,
        scale: 1,
        kind,
        text: text || "WHY NOT?",
        paper: color[0],
        ink: color[1],
        foil: false,
      },
    ]);
    setSelected(id);
    setStatus("Fresh ink. Your wall, your rules.");
  }
  return (
    <div className="project-world world-stickers">
      <div className="v2-wrap">
        <ProjectHeading slug="sticker-city">
          <span className="project-stamp">
            A wall for wonderfully bad decisions.
          </span>
        </ProjectHeading>
        <div className="sticker-workspace">
          <div className="sticker-wall">
            <svg
              ref={svg}
              viewBox="0 0 900 650"
              role="img"
              aria-label={`Editable sticker composition with ${items.length} stickers. Select objects with the list and use the controls to move, rotate, or reorder them.`}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                const p = point(e),
                  s = items.find((s) => s.id === d.id)!;
                const x = Math.max(70, Math.min(830, d.startX + p.x - d.x)),
                  y = Math.max(70, Math.min(580, d.startY + p.y - d.y));
                d.el.dataset.x = String(x);
                d.el.dataset.y = String(y);
                d.el.setAttribute(
                  "transform",
                  `translate(${x} ${y}) rotate(${s.angle - 3}) scale(${s.scale * 1.04})`,
                );
              }}
              onPointerUp={() => {
                const d = drag.current;
                if (!d) return;
                commit(
                  items.map((s) =>
                    s.id === d.id
                      ? {
                          ...s,
                          x: Number(d.el.dataset.x || s.x),
                          y: Number(d.el.dataset.y || s.y),
                        }
                      : s,
                  ),
                );
                drag.current = null;
                setStatus("Stuck. Until the next good idea.");
              }}
              onPointerCancel={() => {
                const d = drag.current,
                  s = items.find((s) => s.id === d?.id);
                if (d && s)
                  d.el.setAttribute(
                    "transform",
                    `translate(${s.x} ${s.y}) rotate(${s.angle}) scale(${s.scale})`,
                  );
                drag.current = null;
              }}
            >
              <defs>
                <linearGradient id="city-foil" x2="1" y2="1">
                  <stop stopColor="#bce6e9" />
                  <stop offset=".3" stopColor="#f9d4ed" />
                  <stop offset=".65" stopColor="#eeefba" />
                  <stop offset="1" stopColor="#b5a9f7" />
                </linearGradient>
                <pattern
                  id="city-grid"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M30 0H0V30"
                    stroke="#252620"
                    strokeOpacity=".08"
                    fill="none"
                  />
                </pattern>
              </defs>
              <rect width="900" height="650" fill={paper} />
              <rect width="900" height="650" fill="url(#city-grid)" />
              {items.map((s) => (
                <g
                  key={s.id}
                  className="city-sticker"
                  data-sticker-id={s.id}
                  transform={`translate(${s.x} ${s.y}) rotate(${s.angle}) scale(${s.scale})`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelected(s.id);
                    const p = point(e);
                    e.currentTarget.dataset.x = String(s.x);
                    e.currentTarget.dataset.y = String(s.y);
                    drag.current = {
                      id: s.id,
                      x: p.x,
                      y: p.y,
                      startX: s.x,
                      startY: s.y,
                      el: e.currentTarget,
                    };
                    svg.current!.setPointerCapture(e.pointerId);
                  }}
                  style={{ filter: "drop-shadow(1px 3px 2px #25262028)" }}
                >
                  <StickerGlyph {...s} />
                  {selected === s.id && (
                    <g
                      data-editor-only="true"
                      fill="none"
                      stroke="#252620"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    >
                      <rect x="-155" y="-115" width="310" height="230" />
                      <path
                        d="M130-115H155V-90Z"
                        fill="#f1efe5"
                        strokeDasharray="none"
                      />
                    </g>
                  )}
                </g>
              ))}
            </svg>
            <div className="sticker-wall-toolbar">
              <button
                onClick={() => {
                  if (!history.length) return;
                  setFuture((f) => [items, ...f]);
                  setItems(history.at(-1)!);
                  setHistory((h) => h.slice(0, -1));
                }}
                disabled={!history.length}
              >
                Undo
              </button>
              <button
                onClick={() => {
                  if (!future.length) return;
                  setHistory((h) => [...h, items]);
                  setItems(future[0]);
                  setFuture((f) => f.slice(1));
                }}
                disabled={!future.length}
              >
                Redo
              </button>
              <span>{items.length} / 36 stickers</span>
              <label>
                Wall
                <input
                  type="color"
                  value={paper}
                  onChange={(e) => setPaper(e.target.value)}
                />
              </label>
            </div>
          </div>
          <aside className="instrument-panel">
            <h2>Fresh off the press.</h2>
            <label className="instrument-field">
              Your message
              <input
                value={text}
                maxLength={24}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <label className="instrument-field">
              Cut
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as Kind)}
              >
                {["burst", "ticket", "disc", "tape", "eyes"].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <button className="lab-button" onClick={add}>
              Print a sticker
            </button>
            <div className="instrument-divider" />
            <label className="instrument-field">
              Selected object
              <select
                value={current?.id ?? ""}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                <option value="" disabled>
                  Choose a sticker
                </option>
                {items.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}. {s.text}
                  </option>
                ))}
              </select>
            </label>
            {current && (
              <>
                <Slider
                  label="Horizontal position"
                  value={Math.round(current.x)}
                  min={70}
                  max={830}
                  onChange={(x) => edit({ x })}
                />
                <Slider
                  label="Vertical position"
                  value={Math.round(current.y)}
                  min={70}
                  max={580}
                  onChange={(y) => edit({ y })}
                />
                <Slider
                  label="Rotation"
                  value={current.angle}
                  min={-180}
                  max={180}
                  unit="°"
                  onChange={(angle) => edit({ angle })}
                />
                <Slider
                  label="Size"
                  value={current.scale}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(scale) => edit({ scale })}
                />
                <Segments
                  label="Material"
                  options={["Paper", "Foil"]}
                  value={current.foil ? "Foil" : "Paper"}
                  onChange={(v) => edit({ foil: v === "Foil" })}
                />
                <div className="city-object-actions">
                  <button
                    onClick={() =>
                      commit([
                        ...items.filter((s) => s.id !== selected),
                        current,
                      ])
                    }
                  >
                    To front
                  </button>
                  <button
                    onClick={() =>
                      commit([
                        current,
                        ...items.filter((s) => s.id !== selected),
                      ])
                    }
                  >
                    To back
                  </button>
                  <button
                    onClick={() => {
                      commit(items.filter((s) => s.id !== selected));
                      setSelected(
                        items.find((s) => s.id !== selected)?.id ?? 0,
                      );
                    }}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
            <ExportButton
              onClick={() => {
                if (svg.current)
                  void exportSvg(svg.current, "sticker-city.svg", {
                    font: true,
                    background: paper,
                  });
              }}
            />
            <button
              className="quiet-button"
              onClick={() =>
                download(
                  "sticker-city.json",
                  JSON.stringify({ version: 1, paper, items }, null, 2),
                  "application/json",
                )
              }
            >
              Export the arrangement
            </button>
            <p className="instrument-note" role="status">
              {status}
            </p>
          </aside>
        </div>
        <section className="project-notes">
          <h2>Print. Peel. Repeat.</h2>
          <p>
            Every sticker is original vector geometry. Dragging lifts and twists
            it; the folded corner marks the selected object. Print new messages,
            change materials, reorder the layers, or move precisely with the
            keyboard-accessible position controls.
          </p>
          <p>
            Undo and redo preserve the last 25 edits. SVG export removes the
            selection frame and embeds the real typeface. Foil is a vector color
            treatment, not a material simulation. Your wall lives in this page
            until you export it.
          </p>
        </section>
      </div>
    </div>
  );
}
