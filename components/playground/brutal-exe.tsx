"use client";
import { useRef, useState } from "react";
import { ProjectHeading, download } from "./workbench";
const ROOMS = [
  { name: "MAKE NOISE", x: 0, y: 0, color: "#ff684f" },
  { name: "LEAVE A TRACE", x: 1, y: 0, color: "#d4ee54" },
  { name: "CHANGE THE ORDER", x: 0, y: 1, color: "#a9baf1" },
  { name: "TAKE THE RECEIPT", x: 1, y: 1, color: "#f0ece2" },
];
export default function BrutalExe() {
  const [room, setRoom] = useState(0),
    [word, setWord] = useState("MAKE\nSOMETHING"),
    [stamps, setStamps] = useState<{ x: number; y: number; n: number }[]>([]),
    [order, setOrder] = useState(["QUESTION", "BREAK", "MAKE", "REPEAT"]),
    [invert, setInvert] = useState(false),
    [status, setStatus] = useState(
      "The map is the navigation. So are the arrow keys.",
    );
  const viewport = useRef<HTMLDivElement>(null),
    drag = useRef<{ x: number; y: number } | null>(null);
  const current = ROOMS[room];
  function navigate(i: number) {
    setRoom(i);
    setStatus(`${ROOMS[i].name}. Room ${i + 1} of four.`);
  }
  function arrow(key: string) {
    const x = current.x,
      y = current.y;
    if (key === "ArrowLeft") navigate(y * 2);
    if (key === "ArrowRight") navigate(y * 2 + 1);
    if (key === "ArrowUp") navigate(x);
    if (key === "ArrowDown") navigate(2 + x);
  }
  const receipt = { word, stamps, order, invert, visiting: current.name };
  return (
    <div
      className={`project-world world-brutal${invert ? " brutal-inverted" : ""}`}
    >
      <div className="v2-wrap">
        <ProjectHeading slug="brutal-exe">
          <button className="lab-button" onClick={() => setInvert(!invert)}>
            INVERT THE WHOLE THING
          </button>
        </ProjectHeading>
        <div className="brutal-navigation">
          <div className="brutal-map" aria-label="Spatial room navigation">
            {ROOMS.map((r, i) => (
              <button
                key={r.name}
                aria-pressed={room === i}
                onClick={() => navigate(i)}
              >
                {String(i + 1).padStart(2, "0")}
                <span>{r.name}</span>
              </button>
            ))}
          </div>
          <p>
            NO SMOOTHING.
            <br />
            NO QUIET CORNERS.
            <br />
            FOUR ROOMS. ONE WEBSITE.
          </p>
        </div>
        <div
          ref={viewport}
          className="brutal-viewport"
          tabIndex={0}
          aria-label="Spatial website. Use arrow keys to change rooms, or swipe. The numbered room buttons provide the same navigation."
          onKeyDown={(e) => {
            if ((e.target as HTMLElement).matches("input,textarea")) return;
            if (e.key.startsWith("Arrow")) {
              e.preventDefault();
              arrow(e.key);
            }
          }}
          onPointerDown={(e) => {
            if (
              e.target === e.currentTarget ||
              !(e.target as HTMLElement).closest("button,input,textarea")
            )
              drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            drag.current = null;
            if (!d) return;
            const dx = e.clientX - d.x,
              dy = e.clientY - d.y;
            if (Math.abs(dx) > 70 || Math.abs(dy) > 70)
              arrow(
                Math.abs(dx) > Math.abs(dy)
                  ? dx < 0
                    ? "ArrowRight"
                    : "ArrowLeft"
                  : dy < 0
                    ? "ArrowDown"
                    : "ArrowUp",
              );
          }}
        >
          <div
            className="brutal-world"
            style={{
              transform: `translate(${-current.x * 50}%,${-current.y * 50}%)`,
            }}
          >
            {ROOMS.map((r, i) => (
              <section
                key={r.name}
                className="brutal-room"
                style={{ background: r.color }}
                inert={i !== room}
              >
                <div className="brutal-room-heading">
                  <span>
                    {String(i + 1).padStart(2, "0")} / {r.name}
                  </span>
                  <span>900 × 560 UNITS</span>
                </div>
                {i === 0 ? (
                  <>
                    <h2>
                      {word.split("\n").map((s, j) => (
                        <span key={j}>
                          {s}
                          <br />
                        </span>
                      ))}
                    </h2>
                    <label>
                      THE WALL IS EDITABLE
                      <textarea
                        value={word}
                        maxLength={35}
                        rows={2}
                        onChange={(e) => setWord(e.target.value)}
                      />
                    </label>
                  </>
                ) : i === 1 ? (
                  <>
                    <h2>
                      PROOF
                      <br />
                      YOU WERE
                      <br />
                      HERE.
                    </h2>
                    <div className="brutal-stamps" aria-hidden="true">
                      {stamps.map((s) => (
                        <span
                          key={s.n}
                          style={{
                            left: `${s.x}%`,
                            top: `${s.y}%`,
                            transform: `rotate(${s.n % 2 ? 12 : -12}deg)`,
                          }}
                        >
                          I WAS HERE / {s.n}
                        </span>
                      ))}
                    </div>
                    <button
                      className="brutal-action"
                      onClick={() => {
                        if (stamps.length >= 24) {
                          setStatus(
                            "The wall has 24 traces. Clear it for another run.",
                          );
                          return;
                        }
                        setStamps((s) => [
                          ...s,
                          {
                            x: 8 + ((s.length * 29) % 65),
                            y: 20 + ((s.length * 19) % 50),
                            n: s.length + 1,
                          },
                        ]);
                      }}
                    >
                      LEAVE YOUR MARK
                    </button>
                    <button
                      className="brutal-quiet"
                      onClick={() => setStamps([])}
                    >
                      CLEAR THE WALL
                    </button>
                  </>
                ) : i === 2 ? (
                  <>
                    <h2>
                      A SYSTEM
                      <br />
                      IS A CHOICE.
                    </h2>
                    <div className="brutal-order">
                      {order.map((s, j) => (
                        <button
                          key={s}
                          onClick={() => {
                            const next = [...order];
                            [next[j], next[(j + 1) % next.length]] = [
                              next[(j + 1) % next.length],
                              next[j],
                            ];
                            setOrder(next);
                          }}
                        >
                          {s}
                          <span aria-hidden="true">↕</span>
                        </button>
                      ))}
                    </div>
                    <p>
                      CLICK A WORD. IT SWAPS WITH THE NEXT.
                      <br />
                      THE SENTENCE IS YOURS TO REASSEMBLE.
                    </p>
                  </>
                ) : (
                  <>
                    <h2>
                      YOU MADE
                      <br />
                      THE RULES.
                    </h2>
                    <div className="brutal-receipt">
                      <span>{stamps.length} TRACES LEFT</span>
                      <span>{order.join(" / ")}</span>
                      <span>
                        {invert ? "INVERTED" : "ORIGINAL"} COLOR STATE
                      </span>
                    </div>
                    <button
                      className="brutal-action"
                      onClick={() => {
                        download(
                          "brutal-exe-receipt.json",
                          JSON.stringify(receipt, null, 2),
                          "application/json",
                        );
                        setStatus(
                          "The actual state of your visit, saved as JSON.",
                        );
                      }}
                    >
                      PRINT THE RECEIPT
                    </button>
                  </>
                )}
              </section>
            ))}
          </div>
        </div>
        <div className="brutal-directions">
          <button
            onClick={() => arrow("ArrowLeft")}
            aria-label="Room to the left"
          >
            ←
          </button>
          <button onClick={() => arrow("ArrowUp")} aria-label="Room above">
            ↑
          </button>
          <button onClick={() => arrow("ArrowDown")} aria-label="Room below">
            ↓
          </button>
          <button
            onClick={() => arrow("ArrowRight")}
            aria-label="Room to the right"
          >
            →
          </button>
          <p role="status">{status}</p>
        </div>
        <section className="project-notes">
          <h2>The interface has no velvet ropes.</h2>
          <p>
            A four-room website occupies one continuous surface. Its navigation
            is the floor plan: move horizontally or vertically with the map,
            arrow keys, directional controls, or a swipe. Inactive rooms are
            removed from the keyboard path.
          </p>
          <p>
            Edit the wall, stamp a trace, rearrange the sequence, and export the
            actual state of the room. The structure is exposed. The transitions
            are deliberately severe. Every room remains reachable without
            dragging.
          </p>
        </section>
      </div>
    </div>
  );
}
