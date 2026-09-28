import { SignalField } from "@/components/lab/signal-field/signal-field";
import type { SignalFieldMode } from "@/components/lab/signal-field/signal-field";
import "./signal-field-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — an editorial hero for a slow-data product.
 *
 * The field is the page's material, not a decoration: it is already
 * running behind the headline, and the pointer quiets it as you read.
 */
export default function SignalFieldDemo({ values }: DemoProps) {
  const density = Number(values.density ?? 0.45);
  const intensity = Number(values.intensity ?? 0.55);
  const pointerRadius = Number(values.pointerRadius ?? 10);
  const speed = Number(values.speed ?? 1);
  const mode = String(values.mode ?? "glyph") as SignalFieldMode;

  return (
    <div className="dm-sf-root">
      <SignalField
        className="dm-sf-canvas"
        density={density}
        intensity={intensity}
        pointerRadius={pointerRadius}
        speed={speed}
        mode={mode}
        accent="#4f27e0"
        cell={13}
        seed={3}
      />

      <div className="dm-sf-content">
        <div className="dm-sf-panel">
          <p className="dm-sf-eyebrow">
            <span className="dm-sf-pulse" aria-hidden="true" />
            Meridian · field notes
          </p>
          <h2 className="dm-sf-headline">
            Read the instrumentation, not the dashboard.
          </h2>
          <p className="dm-sf-lede">
            Meridian keeps long-running systems legible: one field per
            service, sampled slowly, quiet by default.
          </p>
          <div className="dm-sf-actions">
            <span className="dm-sf-btn dm-sf-btn--primary">Open a field</span>
            <span className="dm-sf-btn">Read the method</span>
          </div>
        </div>
      </div>

      <footer className="dm-sf-foot">
        <span>{mode === "glyph" ? "glyph field" : mode === "dither" ? "halftone field" : "pixel field"}</span>
        <span aria-hidden="true">·</span>
        <span>sampled at 24hz</span>
        <span aria-hidden="true">·</span>
        <span>pointer quiets</span>
      </footer>
    </div>
  );
}
