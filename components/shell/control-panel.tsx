"use client";

import type {
  PreviewControl,
  PreviewValue,
  SliderUnit,
} from "@/lib/registry/types";

function formatSlider(value: number, unit?: SliderUnit): string {
  switch (unit) {
    case "percent":
      return `${Math.round(value * 100)}%`;
    case "px":
      return `${value}px`;
    case "cells":
      return value === 0 ? "off" : `${value} cells`;
    case "multiplier":
      return value === 0 ? "frozen" : `${value.toFixed(1)}×`;
    case "ms":
      return `${value}ms`;
    default:
      return String(value);
  }
}

/**
 * PREVIEW CONTROLS — only the parameters that genuinely matter for an
 * experiment are exposed, and every control is a real, labelled input.
 */
export function ControlPanel({
  controls,
  values,
  onChange,
  hint,
}: {
  controls: PreviewControl[];
  values: Record<string, PreviewValue>;
  onChange: (id: string, value: PreviewValue) => void;
  hint?: string;
}) {
  if (controls.length === 0 && !hint) return null;

  return (
    <div className="preview-controls">
      {controls.map((control) => {
        if (control.kind === "slider") {
          const value = Number(values[control.id] ?? control.min);
          return (
            <label className="control" key={control.id}>
              <span className="control-label">
                {control.label}
                <output>{formatSlider(value, control.unit)}</output>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={value}
                onChange={(event) =>
                  onChange(control.id, Number(event.currentTarget.value))
                }
              />
            </label>
          );
        }

        if (control.kind === "toggle") {
          const checked = Boolean(values[control.id]);
          return (
            <span className="control" key={control.id}>
              <span className="control-label">{control.label}</span>
              <label className="control-switch">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    onChange(control.id, event.currentTarget.checked)
                  }
                />
                <span className="control-switch-track" aria-hidden="true" />
                <span>{checked ? "On" : "Off"}</span>
              </label>
            </span>
          );
        }

        const value = String(values[control.id] ?? control.options[0]?.value);
        return (
          <span className="control" key={control.id}>
            <span className="control-label">{control.label}</span>
            <span className="control-seg" role="group" aria-label={control.label}>
              {control.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={value === option.value}
                  onClick={() => onChange(control.id, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </span>
          </span>
        );
      })}
      {hint ? <p className="preview-hint">{hint}</p> : null}
    </div>
  );
}
