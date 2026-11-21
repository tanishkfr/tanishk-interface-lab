"use client";

import { SharedMomentGallery, type MomentItem } from "@/components/lab/shared-moment-gallery/shared-moment-gallery";
import type { DemoProps } from "./demo-host";
import "./shared-moment-gallery-demo.css";

function SaltFlat() {
  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="smg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2c9b8" />
          <stop offset="52%" stopColor="#e8a98f" />
          <stop offset="100%" stopColor="#9e5a47" />
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#smg-sky)" />
      <circle cx="388" cy="258" r="96" fill="#f8e3c8" opacity="0.92" />
      <path d="M0 478h600v272H0Z" fill="#6b3c32" />
      <path d="M0 478h600" stroke="#f8e3c8" strokeWidth="2" opacity="0.55" />
      {[0, 1, 2, 3, 4].map((line) => (
        <path key={line} d={`M0 ${540 + line * 38}h600`} stroke="#c98f74" strokeWidth="1" opacity={0.3 - line * 0.04} />
      ))}

    </svg>
  );
}

function NightOrchard() {
  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="750" fill="#0f241e" />
      <circle cx="286" cy="176" r="74" fill="#d8e4bd" />
      <circle cx="258" cy="164" r="70" fill="#0f241e" opacity="0.32" />
      {[92, 182, 270, 356, 448, 532].map((x, index) => (
        <g key={x}>
          <path d={`M${x} 750V${300 + (index % 3) * 36}`} stroke="#203b31" strokeWidth={14 + (index % 2) * 5} />
          <circle cx={x} cy={300 + (index % 3) * 36} r={28 + (index % 3) * 6} fill="#284c3c" opacity="0.8" />
        </g>
      ))}
      <path d="M0 640h600v110H0Z" fill="#0a1915" />

    </svg>
  );
}

function BlueHour() {
  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="smg-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2b52" />
          <stop offset="100%" stopColor="#6176a1" />
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#smg-blue)" />
      <rect x="72" y="112" width="456" height="526" fill="none" stroke="#d6dddf" strokeWidth="1.5" opacity="0.65" />
      <path d="M224 112v526M376 112v526M72 288h456M72 462h456" stroke="#d6dddf" strokeWidth="1" opacity="0.45" />
      <rect x="224" y="288" width="152" height="174" fill="#e8d9b7" opacity="0.18" />
      <circle cx="300" cy="374" r="46" fill="#f1e5c6" opacity="0.5" />

    </svg>
  );
}

function DuneStudy() {
  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="750" fill="#d9b98a" />
      <path d="M0 460c120-86 232-64 330-128 64-42 158-56 270-16v434H0Z" fill="#b88a57" />
      <path d="M0 590c128-58 236-36 330-88 80-44 174-42 270-8v256H0Z" fill="#8d6742" />
      <path d="M0 690c144-38 252-16 360-48 82-24 160-24 240 4v104H0Z" fill="#5f4630" />
      <path d="M0 460c120-86 232-64 330-128 64-42 158-56 270-16" fill="none" stroke="#f0ddbb" strokeWidth="1.5" opacity="0.6" />

    </svg>
  );
}

function SignalBloom() {
  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="750" fill="#281412" />
      {[0, 1, 2, 3, 4, 5, 6].map((ring) => (
        <circle
          key={ring}
          cx="300"
          cy="372"
          r={44 + ring * 46}
          fill="none"
          stroke={ring === 2 ? "#ff8a5e" : "#e2563f"}
          strokeWidth={ring === 2 ? 4 : 1.4}
          opacity={0.9 - ring * 0.1}
        />
      ))}
      <circle cx="300" cy="372" r="18" fill="#ffd3a8" />
      <path d="M0 372h600M300 0v750" stroke="#ff8a5e" strokeWidth="1" opacity="0.16" />

    </svg>
  );
}

function StillWater() {
  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="750" fill="#2f5553" />
      <rect y="420" width="600" height="330" fill="#204340" />
      <circle cx="300" cy="330" r="88" fill="#c6d9cc" opacity="0.8" />
      <path d="M212 420h176" stroke="#c6d9cc" strokeWidth="1" opacity="0.3" />
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <path
          key={line}
          d={`M${218 - line * 14} ${470 + line * 34}q${82 + line * 14} ${line % 2 ? -12 : 12} ${164 + line * 28} 0`}
          fill="none"
          stroke="#b8cdc0"
          strokeWidth="1"
          opacity={0.4 - line * 0.05}
        />
      ))}

    </svg>
  );
}

const ITEMS: MomentItem[] = [
  {
    id: "salt-flat",
    title: "Salt Flat",
    category: "Landscape",
    date: "March 2025",
    caption:
      "A salt basin at first light. The horizon holds for a moment, then the surface begins to disappear into the sky.",
    alt: "A pale orange sky above a dark salt flat, with a low sun and fine horizontal lines across the ground.",
    visual: <SaltFlat />,
    span: "wide",
  },
  {
    id: "night-orchard",
    title: "Night Orchard",
    category: "Place",
    date: "November 2024",
    caption:
      "Six trees at the edge of a field, photographed at the hour when the moon is brighter than the path.",
    alt: "A deep green night scene with a pale moon and dark tree trunks standing across the frame.",
    visual: <NightOrchard />,
    span: "tall",
  },
  {
    id: "blue-hour",
    title: "Blue Hour",
    category: "Architecture",
    date: "January 2025",
    caption:
      "A window grid just after sunset. The interior light has not yet caught up with the sky.",
    alt: "An indigo building facade divided into a grid of windows, with one warm square of interior light.",
    visual: <BlueHour />,
    span: "standard",
  },
  {
    id: "dune-study",
    title: "Dune Study",
    category: "Landscape",
    date: "April 2024",
    caption:
      "Three ridges, each one a little darker than the last. The wind does the drawing and the photograph only records it.",
    alt: "Layered sand dunes in warm brown tones, with soft curved ridges running across the frame.",
    visual: <DuneStudy />,
    span: "standard",
  },
  {
    id: "signal-bloom",
    title: "Signal Bloom",
    category: "Light",
    date: "September 2024",
    caption:
      "A long exposure of a rotating light source. The centre stays fixed; everything else insists on moving.",
    alt: "Concentric red and orange rings expanding from a small bright centre on a dark ground.",
    visual: <SignalBloom />,
    span: "wide",
  },
  {
    id: "still-water",
    title: "Still Water",
    category: "Place",
    date: "July 2025",
    caption:
      "A canal before the first boat. The reflection is more legible than the object it repeats.",
    alt: "A pale moon reflected in dark green water, with soft ripples spreading below.",
    visual: <StillWater />,
    span: "standard",
  },
];

export default function SharedMomentGalleryDemo({ values }: DemoProps) {
  const layout = String(values.layout ?? "editorial") === "uniform" ? "uniform" : "editorial";
  const captions = values.captions === undefined ? true : Boolean(values.captions);
  return (
    <div className="dm-smg-root">
      <header className="dm-smg-head">
        <div>
          <p className="dm-smg-kicker">FIELD STUDIES / VOL. 02</p>
          <h2>Six observations<br />of light.</h2>
        </div>
        <p className="dm-smg-intro">
          A small collection of places, surfaces and hours. Open any study to
          read the note that came back with it.
        </p>
      </header>

      <SharedMomentGallery
        items={ITEMS}
        layout={layout}
        captions={captions}
        label="Field studies"
      />

      <footer className="dm-smg-foot">
        <span>Photographed 2024—2025</span>
        <span>Arrow keys move between studies · Escape closes</span>
      </footer>
    </div>
  );
}
