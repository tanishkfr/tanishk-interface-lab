"use client";
import { useRef } from "react";
import "./scrub-number.css";
export type ScrubNumberProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
};
/** A controlled numeric field with pointer scrubbing and keyboard equivalents. */
export function ScrubNumber({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 1,
}: ScrubNumberProps) {
  const drag = useRef<{ x: number; value: number } | null>(null);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const commit = (n: number) => {
    if (Number.isFinite(n))
      onChange(
        Math.max(
          min,
          Math.min(
            max,
            Number((Math.round(n / increment) * increment).toFixed(8)),
          ),
        ),
      );
  };
  return (
    <div className="lab-scrub-number">
      <span className="lab-scrub-label">{label}</span>
      <div className="lab-scrub-field">
        <button
          type="button"
          className="lab-scrub-handle"
          aria-label={`Drag to adjust ${label}; use arrow keys for small steps, Shift for ten steps, Home or End for limits`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = { x: e.clientX, value };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current)
              commit(
                drag.current.value +
                  ((e.clientX - drag.current.x) / 6) *
                    increment *
                    (e.shiftKey ? 0.1 : 1),
              );
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onLostPointerCapture={() => (drag.current = null)}
          onKeyDown={(e) => {
            const direction =
              e.key === "ArrowRight" || e.key === "ArrowUp"
                ? 1
                : e.key === "ArrowLeft" || e.key === "ArrowDown"
                  ? -1
                  : 0;
            if (direction) {
              e.preventDefault();
              commit(value + direction * increment * (e.shiftKey ? 10 : 1));
            }
            if (e.key === "Home" || e.key === "End") {
              e.preventDefault();
              commit(e.key === "Home" ? min : max);
            }
          }}
        >
          <span aria-hidden="true">↔</span>
        </button>
        <input
          type="number"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={increment}
          onChange={(e) => commit(e.currentTarget.valueAsNumber)}
          onBlur={(e) => {
            e.currentTarget.value = String(value);
          }}
        />
      </div>
    </div>
  );
}
