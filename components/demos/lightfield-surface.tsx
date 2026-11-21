"use client";

import { useState } from "react";
import { LightfieldSurface } from "@/components/lab/lightfield-surface/lightfield-surface";
import type { DemoProps } from "./demo-host";
import "./lightfield-surface-demo.css";

function VesselArt() {
  return (
    <svg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <radialGradient id="lf-vessel" cx="42%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#d9cbb4" />
          <stop offset="55%" stopColor="#a38d70" />
          <stop offset="100%" stopColor="#5e4e3c" />
        </radialGradient>
      </defs>
      <rect width="360" height="300" fill="#1c1b19" />
      <ellipse cx="180" cy="262" rx="88" ry="12" fill="#000" opacity="0.42" />
      <path d="M136 74h88l-9 52c36 30 38 100 4 128H141c-34-28-32-98 4-128l-9-52Z" fill="url(#lf-vessel)" />
      <ellipse cx="180" cy="74" rx="44" ry="10" fill="#cbbca3" />
      <path d="M144 112c-20 46-16 96 6 120" stroke="#f0e5d2" strokeWidth="2" opacity="0.4" fill="none" />
    </svg>
  );
}

function LampArt() {
  return (
    <svg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <radialGradient id="lf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e7b56c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#e7b56c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lf-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d9b273" />
          <stop offset="50%" stopColor="#8a5f2c" />
          <stop offset="100%" stopColor="#e3c48b" />
        </linearGradient>
      </defs>
      <rect width="360" height="300" fill="#191b1c" />
      <circle cx="180" cy="148" r="108" fill="url(#lf-glow)" opacity="0.5" />
      <path d="M138 66h84l-12 38h-60Z" fill="url(#lf-brass)" />
      <path d="M180 104v116" stroke="url(#lf-brass)" strokeWidth="4" />
      <path d="M142 232h76" stroke="url(#lf-brass)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="180" cy="126" r="5" fill="#f3ddb0" />
      <path d="M160 66c4-14 36-14 40 0" stroke="#f3ddb0" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}

function SpeakerArt() {
  return (
    <svg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="lf-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d9291" />
          <stop offset="100%" stopColor="#3b4140" />
        </linearGradient>
        <pattern id="lf-speck" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="0.7" fill="#d4d8d5" opacity="0.35" />
          <circle cx="9" cy="8" r="0.5" fill="#1e2322" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="360" height="300" fill="#181b1a" />
      <rect x="104" y="46" width="152" height="214" rx="18" fill="url(#lf-stone)" />
      <rect x="104" y="46" width="152" height="214" rx="18" fill="url(#lf-speck)" />
      <circle cx="180" cy="152" r="48" fill="none" stroke="#b9bfbb" strokeWidth="1" opacity="0.45" />
      <circle cx="180" cy="152" r="31" fill="#272c2b" />
      <circle cx="180" cy="152" r="31" fill="none" stroke="#aeb5b0" strokeWidth="1" opacity="0.4" />
      <circle cx="180" cy="152" r="7" fill="#c3c9c4" opacity="0.8" />
      <path d="M132 70h96" stroke="#c9ceca" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

const PRODUCTS = [
  { id: "vessel", name: "Vessel 04", family: "Ceramic", note: "Hand-thrown stoneware · matte glaze", art: <VesselArt />, finish: "Matte ceramic" },
  { id: "halo", name: "Halo lamp", family: "Lighting", note: "Brushed brass · warm 2700 K", art: <LampArt />, finish: "Brushed brass" },
  { id: "monolith", name: "Monolith", family: "Audio", note: "Cast stone · 12 hour battery", art: <SpeakerArt />, finish: "Honed stone" },
];

export default function LightfieldSurfaceDemo({ values }: DemoProps) {
  const intensity = Number(values.intensity ?? 0.5);
  const tilt = Number(values.tilt ?? 3);
  const highlight = Number(values.highlight ?? 52);
  const finish = String(values.finish ?? "satin") as "matte" | "satin" | "gloss";
  const disabled = Boolean(values.disabled);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <div className="dm-lf-root">
      <header className="dm-lf-head">
        <div>
          <p className="dm-lf-kicker">MATERIAL STUDIES / 2026</p>
          <h2>Objects under<br />a moving light.</h2>
        </div>
        <p className="dm-lf-intro">
          Three finishes, one small light. Move across a card to see the surface
          answer; leave and it settles.
        </p>
      </header>

      <div className="dm-lf-grid">
        {PRODUCTS.map((product) => (
          <LightfieldSurface
            key={product.id}
            className="dm-lf-card"
            intensity={intensity}
            tilt={tilt}
            highlight={highlight}
            finish={finish}
            disabled={disabled}
            style={{ borderRadius: 16 }}
          >
            <article>
              <div className="dm-lf-art">{product.art}</div>
              <div className="dm-lf-copy">
                <p className="dm-lf-family">{product.family}</p>
                <h3>{product.name}</h3>
                <p className="dm-lf-note">{product.note}</p>
                <div className="dm-lf-bottom">
                  <span>{product.finish}</span>
                  <button
                    type="button"
                    onClick={() => setSaved(product.name)}
                    aria-pressed={saved === product.name}
                  >
                    {saved === product.name ? "Selected" : "View object"}
                  </button>
                </div>
              </div>
            </article>
          </LightfieldSurface>
        ))}
      </div>

      <p className="dm-lf-status" role="status">
        {disabled
          ? "Lighting is disabled. The surfaces use their static finish."
          : saved
            ? `${saved} added to this sample viewing.`
            : "Move the pointer across a surface. Reduced-motion and touch devices keep the static finish."}
      </p>

      <div className="dm-lf-key" aria-hidden="true">
        <span>Finishes</span>
        <span data-dot="matte">Matte</span>
        <span data-dot="satin">Satin</span>
        <span data-dot="gloss">Gloss</span>
      </div>
    </div>
  );
}
