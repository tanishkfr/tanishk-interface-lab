"use client";

import { useState } from "react";
import { EdgeReveal } from "@/components/lab/edge-reveal/edge-reveal";
import type { DemoProps } from "./demo-host";
import "./edge-reveal-demo.css";

function LumenArt() {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="400" height="500" fill="#131a2b" />
      <circle cx="268" cy="178" r="112" fill="#ff7a45" />
      <circle cx="268" cy="178" r="68" fill="#ffd2a1" opacity="0.55" />
      {[0, 1, 2, 3, 4].map((line) => (
        <path key={line} d={`M0 ${330 + line * 26}h400`} stroke="#47506b" strokeWidth="1" opacity="0.6" />
      ))}


    </svg>
  );
}

function TideArt() {
  return (
    <svg viewBox="0 0 600 375" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="375" fill="#c5d9dc" />
      <circle cx="480" cy="86" r="38" fill="#f5efe0" opacity="0.9" />
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <path
          key={line}
          d={`M-20 ${180 + line * 28}c90 ${line % 2 ? 22 : -22} 210 ${line % 2 ? -24 : 24} 300 0s210 ${line % 2 ? 18 : -18} 340 0`}
          fill="none"
          stroke="#446b73"
          strokeWidth={line === 2 ? 3 : 1}
          opacity={0.7 - line * 0.07}
        />
      ))}


    </svg>
  );
}

function StrataArt() {
  return (
    <svg viewBox="0 0 440 440" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="440" height="440" fill="#e4d6c4" />
      <rect x="72" y="228" width="296" height="58" fill="#9d4f35" />
      <rect x="104" y="170" width="232" height="58" fill="#c07a54" />
      <rect x="138" y="112" width="164" height="58" fill="#d9a97f" />
      <rect x="178" y="54" width="84" height="58" fill="#ede0ce" />
      <path d="M72 286h296M120 54v286" stroke="#4a2b21" strokeWidth="1" opacity="0.4" />


    </svg>
  );
}

function MonoArt() {
  return (
    <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="360" height="480" fill="#f2eee3" />

      <rect x="24" y="54" width="112" height="9" fill="#c93c2a" />


    </svg>
  );
}

function HearthArt() {
  return (
    <svg viewBox="0 0 600 375" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="375" fill="#e4c9a2" />
      <rect x="330" y="74" width="190" height="230" fill="#f6ead6" stroke="#5f4630" strokeWidth="1.5" />
      <path d="M330 74h190M330 304h190M425 74v230" stroke="#5f4630" strokeWidth="1" opacity="0.5" />
      <circle cx="425" cy="189" r="58" fill="#b5522f" />
      <circle cx="425" cy="189" r="34" fill="#e79a62" />


      <path d="M42 270h210" stroke="#6e523a" strokeWidth="1" />

    </svg>
  );
}

function SignalArt() {
  return (
    <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="360" height="480" fill="#161b14" />
      {[0, 1, 2, 3, 4, 5].map((ring) => (
        <circle key={ring} cx="180" cy="220" r={34 + ring * 32} fill="none" stroke="#c9e24b" strokeWidth={ring === 1 ? 3 : 1} opacity={0.85 - ring * 0.12} />
      ))}
      <path d="M180 40v360M40 220h280" stroke="#c9e24b" strokeWidth="1" opacity="0.18" />


    </svg>
  );
}

const PROJECTS = [
  { id: "lumen", title: "Lumen", category: "Brand systems", detail: "A low-light identity for a repertory cinema, built from one warm aperture.", ratio: "4 / 5", visual: <LumenArt /> },
  { id: "tidewater", title: "Tidewater", category: "Editorial", detail: "A quarterly on coastal change. The grid follows the tide rather than the page.", ratio: "16 / 10", visual: <TideArt /> },
  { id: "strata", title: "Strata", category: "Spatial", detail: "Wayfinding for a stone archive. The layers are the map.", ratio: "1 / 1", visual: <StrataArt /> },
  { id: "mono", title: "Mono", category: "Type", detail: "A grotesque with one good idea and a great deal of restraint.", ratio: "3 / 4", visual: <MonoArt /> },
  { id: "hearth", title: "Hearth", category: "Packaging", detail: "A tea box that opens like a book, printed on uncoated board.", ratio: "16 / 10", visual: <HearthArt /> },
  { id: "signal", title: "Signal", category: "Motion", detail: "Titles for a late-night music programme, made from concentric light.", ratio: "3 / 4", visual: <SignalArt /> },
];

export default function EdgeRevealDemo({ values }: DemoProps) {
  const tone = String(values.tone ?? "dark") === "light" ? "light" : "dark";
  const showAction = values.action === undefined ? true : Boolean(values.action);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="dm-er-root">
      <header className="dm-er-head">
        <div>
          <p className="dm-er-kicker">SELECTED WORK / 2021—2025</p>
          <h2>Six studies in light,<br />type and material.</h2>
        </div>
        <div className="dm-er-count">
          <span>{String(saved.size).padStart(2, "0")}</span>
          on shortlist
        </div>
      </header>

      <div className="dm-er-grid">
        {PROJECTS.map((project) => (
          <div className="dm-er-item" key={project.id}>
            <EdgeReveal
              title={project.title}
              category={project.category}
              detail={project.detail}
              media={project.visual}
              ratio={project.ratio}
              tone={tone}
              action={
                showAction ? (
                  <button
                    type="button"
                    aria-pressed={saved.has(project.id)}
                    onClick={() => toggle(project.id)}
                  >
                    <span>{saved.has(project.id) ? "Saved to shortlist" : "Save study"}</span>
                  </button>
                ) : undefined
              }
            />
          </div>
        ))}
      </div>

      <p className="dm-er-foot">
        Move the pointer to the edge you want the detail to enter from. On a
        keyboard, focus a card to open the same layer; Escape closes it.
      </p>
    </div>
  );
}
