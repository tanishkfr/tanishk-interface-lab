"use client";
import { useEffect, useRef, useState } from "react";
import { ProjectHeading, Slider, ExportButton, download } from "./workbench";
import { springSamples, springCss } from "@/lib/playground/math";
export default function MotionFoundry() {
  const [k, setK] = useState(170),
    [d, setD] = useState(14),
    [mass, setMass] = useState(1),
    [duration, setDuration] = useState(1600),
    [stagger, setStagger] = useState(80),
    [comparison, setComparison] = useState(true),
    [copied, setCopied] = useState(""),
    [runs, setRuns] = useState(0);
  const root = useRef<HTMLDivElement>(null),
    animations = useRef<Animation[]>([]);
  useEffect(() => () => animations.current.forEach((a) => a.cancel()), []);
  const code = springCss(k, d, mass, duration, stagger);
  function play() {
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const samples = springSamples(k, d, mass, duration / 1000);
    root.current
      ?.querySelectorAll<HTMLElement>("[data-motion-sample]")
      .forEach((el) => {
        const lane = el.parentElement!;
        const sequenceIndex = Number(el.closest<HTMLElement>('[data-motion-index]')?.dataset.motionIndex ?? 0);
        const distance = Math.max(0, lane.clientWidth - el.offsetWidth - 24);
        const frames =
          el.dataset.motionSample === "reference"
            ? [
                { transform: "translateX(0)" },
                { transform: `translateX(${distance}px)` },
              ]
            : samples.map((x) => ({
                transform: `translateX(${x * distance}px)${el.classList.contains("motion-specimen-1") ? ` scale(${0.65 + 0.35 * x})` : el.classList.contains("motion-specimen-2") ? ` rotate(${45 + 135 * x}deg)` : ""}`,
              }));
        const a = el.animate(frames, {
          duration: reduced ? 1 : duration,
          delay: reduced ? 0 : sequenceIndex * stagger,
          easing:
            el.dataset.motionSample === "reference" ? "ease-in-out" : "linear",
          fill: "forwards",
        });
        animations.current.push(a);
      });
    setRuns((n) => n + 1);
  }
  return (
    <div className="project-world world-motion">
      <div className="v2-wrap">
        <ProjectHeading slug="motion-foundry">
          <button className="lab-button" onClick={play}>
            Run the sequence <span aria-hidden="true">↗</span>
          </button>
        </ProjectHeading>
        <div className="motion-workspace">
          <div ref={root} className="motion-preview">
            <div className="motion-preview-label">
              <h2>Find its character.</h2>
              <label>
                <input
                  type="checkbox"
                  checked={comparison}
                  onChange={(e) => setComparison(e.target.checked)}
                />{" "}
                Compare with ease-in-out
              </label>
            </div>
            <div className="motion-lanes">
              {["Move", "Scale & move", "Turn & move", "Follow"].map(
                (text, i) => (
                  <div className="motion-lane-group" data-motion-index={i} key={text}>
                    <span>{text}</span>
                    <div className="motion-lane">
                      <span
                        className={`motion-specimen motion-specimen-${i}`}
                        data-motion-sample="spring"
                      >
                        <i />
                      </span>
                    </div>
                    {comparison && (
                      <div className="motion-lane reference-lane">
                        <span
                          className="motion-reference"
                          data-motion-sample="reference"
                        />
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
            <div className="motion-ruler">
              <span>0 ms</span>
              <span>{Math.round(duration / 2)} ms</span>
              <span>{duration} ms + stagger</span>
            </div>
            <p className="instrument-note" aria-live="polite">
              {runs
                ? `Sequence ${runs}. Change a value and run again to compare.`
                : "Press Run the sequence. Spring samples use real mass, stiffness, and damping."}
            </p>
          </div>
          <aside className="instrument-panel">
            <h2>Spring behavior</h2>
            <Slider
              label="Stiffness"
              value={k}
              min={30}
              max={400}
              onChange={setK}
            />
            <Slider
              label="Damping"
              value={d}
              min={2}
              max={45}
              onChange={setD}
            />
            <Slider
              label="Mass"
              value={mass}
              min={0.3}
              max={3}
              step={0.1}
              onChange={setMass}
            />
            <Slider
              label="Duration"
              value={duration}
              min={600}
              max={3000}
              step={100}
              onChange={setDuration}
              unit="ms"
            />
            <Slider
              label="Stagger"
              value={stagger}
              min={0}
              max={300}
              step={10}
              onChange={setStagger}
              unit="ms"
            />
            <div className="preset-buttons">
              <button
                onClick={() => {
                  setK(170);
                  setD(14);
                  setMass(1);
                }}
              >
                Playful
              </button>
              <button
                onClick={() => {
                  setK(260);
                  setD(30);
                  setMass(0.8);
                }}
              >
                Precise
              </button>
              <button
                onClick={() => {
                  setK(70);
                  setD(8);
                  setMass(2);
                }}
              >
                Heavy
              </button>
            </div>
            <ExportButton
              onClick={() => download("motion-foundry.css", code, "text/css")}
            >
              Export CSS
            </ExportButton>
            <button
              className="quiet-button"
              onClick={() =>
                download(
                  "motion-foundry.json",
                  JSON.stringify(
                    {
                      type: "spring",
                      stiffness: k,
                      damping: d,
                      mass,
                      duration: duration / 1000,
                      stagger: stagger / 1000,
                    },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              Export spring settings
            </button>
          </aside>
        </div>
        <section className="motion-code">
          <div>
            <h2>Take the feeling with you.</h2>
            <button
              className="lab-button secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  setCopied("Copied CSS");
                } catch {
                  setCopied("Copy unavailable. Use Export CSS.");
                }
              }}
            >
              {copied || "Copy CSS"}
            </button>
          </div>
          <pre tabIndex={0}>
            <code>{code}</code>
          </pre>
          <p>
            CSS uses a sampled physical response in the native linear() easing
            function. Set --i on each element to stagger, then toggle
            data-moved. The illustration adapts its travel to the stage; the
            export uses 180px as an editable starting point. Spring settings are
            raw parameters for adaptation to your animation library.
          </p>
        </section>
      </div>
    </div>
  );
}
