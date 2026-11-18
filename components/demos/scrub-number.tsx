"use client";
import { useState } from "react";
import { ScrubNumber } from "@/components/lab/scrub-number/scrub-number";
import type { DemoProps } from "./demo-host";
export default function ScrubNumberDemo({ values }: DemoProps) {
  const [size, setSize] = useState(48),
    [radius, setRadius] = useState(18),
    [rotation, setRotation] = useState(0);
  return (
    <div className="scrub-demo">
      <header>
        <h2>A little adjustment.</h2>
        <p>Drag a handle or type an exact number.</p>
      </header>
      <div className="scrub-specimen">
        <div
          style={{
            width: size + 80,
            height: size + 80,
            borderRadius: radius,
            transform: `rotate(${rotation}deg)`,
          }}
        />
      </div>
      <div className="scrub-demo-controls">
        <ScrubNumber
          label="Size"
          value={size}
          onChange={setSize}
          min={12}
          max={120}
          step={Number(values.step ?? 1)}
        />
        <ScrubNumber
          label="Corners"
          value={radius}
          onChange={setRadius}
          min={0}
          max={100}
        />
        <ScrubNumber
          label="Rotation"
          value={rotation}
          onChange={setRotation}
          min={-180}
          max={180}
        />
      </div>
      <p className="scrub-demo-hint">
        Arrow keys for small steps. Shift + arrows for ten steps. Shift + drag
        for precision.
      </p>
      <button
        className="lab-button secondary"
        onClick={() => {
          setSize(48);
          setRadius(18);
          setRotation(0);
        }}
      >
        Reset specimen
      </button>
    </div>
  );
}
