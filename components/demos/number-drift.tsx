"use client";

import { useState } from "react";
import { NumberDrift } from "@/components/lab/number-drift/number-drift";
import type { DemoProps } from "./demo-host";
import "./number-drift-demo.css";

type MetricId = "revenue" | "studios" | "session" | "net";

type Values = Record<MetricId, number>;

const START: Values = {
  revenue: 128400,
  studios: 2841,
  session: 18.6,
  net: -3740,
};

const BASELINE: Values = {
  revenue: 114200,
  studios: 2628,
  session: 17.4,
  net: -2900,
};

function deltaFor(id: MetricId, value: number) {
  const base = BASELINE[id];
  if (id === "session") {
    const diff = Math.round((value - base) * 10) / 10;
    return `${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)} min`;
  }
  if (id === "net") {
    const diff = Math.round(value - base);
    return `${diff >= 0 ? "+" : "−"}£${Math.abs(diff).toLocaleString("en-GB")}`;
  }
  const percent = ((value - base) / Math.abs(base)) * 100;
  return `${percent >= 0 ? "+" : "−"}${Math.abs(percent).toFixed(1)}%`;
}

const META: Array<{
  id: MetricId;
  label: string;
  note: string;
  step: number;
  prefix?: string;
  suffix?: string;
  decimals: number;
  delta: string;
  spark: number[];
}> = [
  { id: "revenue", label: "Monthly revenue", note: "Recurring, net of refunds", step: 2500, prefix: "£", decimals: 0, delta: "+12.4%", spark: [24, 32, 29, 38, 44, 41, 52, 58, 55, 63, 68, 74] },
  { id: "studios", label: "Active studios", note: "Weekly active, 28-day window", step: 12, decimals: 0, delta: "+8.1%", spark: [42, 46, 44, 51, 49, 56, 61, 58, 66, 69, 72, 78] },
  { id: "session", label: "Median session", note: "Minutes in the editor", step: 0.4, suffix: " min", decimals: 1, delta: "+1.2 min", spark: [14, 16, 15, 17, 16, 18, 17, 19, 18, 20, 19, 21] },
  { id: "net", label: "Net change", note: "Credits, refunds and adjustments", step: 500, prefix: "£", decimals: 0, delta: "−£840", spark: [30, 28, 33, 27, 31, 26, 29, 24, 27, 22, 25, 21] },
];

export default function NumberDriftDemo({ values }: DemoProps) {
  const [data, setData] = useState<Values>(START);
  const decimals = String(values.precision ?? "natural") as
    | "natural"
    | "one"
    | "two";
  const compact = Boolean(values.compact);
  const showDeltas = values.deltas === undefined ? true : Boolean(values.deltas);

  const change = (id: MetricId, direction: 1 | -1) => {
    const meta = META.find((entry) => entry.id === id)!;
    setData((current) => ({
      ...current,
      [id]:
        id === "session"
          ? Math.max(1, Math.round((current[id] + meta.step * direction) * 10) / 10)
          : current[id] + meta.step * direction,
    }));
  };

  const bumpAll = (direction: 1 | -1) => {
    setData((current) =>
      Object.fromEntries(
        META.map((meta) => [
          meta.id,
          meta.id === "session"
            ? Math.max(1, Math.round((current[meta.id] + meta.step * direction) * 10) / 10)
            : current[meta.id] + meta.step * direction,
        ]),
      ) as Values,
    );
  };

  const randomize = () => {
    setData({
      revenue: 86000 + Math.round(Math.random() * 90000),
      studios: 1200 + Math.round(Math.random() * 3200),
      session: Math.round((8 + Math.random() * 22) * 10) / 10,
      net: Math.round((Math.random() * 12000 - 6000) / 10) * 10,
    });
  };

  return (
    <div className="dm-nd-root">
      <header className="dm-nd-head">
        <div>
          <p className="dm-nd-kicker">ANNUAL REVIEW / 2026</p>
          <h2>The year in numbers.</h2>
          <p className="dm-nd-deck">
            Four measures from a fictional studio. Change one and watch only the
            digits that need to move.
          </p>
        </div>
        <div className="dm-nd-controls">
          <div className="dm-nd-buttons">
            <button type="button" onClick={() => bumpAll(1)}>Increase all</button>
            <button type="button" onClick={() => bumpAll(-1)}>Decrease all</button>
            <button type="button" onClick={randomize}>Randomize</button>
            <button type="button" onClick={() => setData(START)}>Reset</button>
          </div>
          <p className="dm-nd-precision-note">
            Precision · {decimals === "natural" ? "Natural" : decimals === "one" ? "1 decimal" : "2 decimals"}
          </p>
        </div>
      </header>

      <div className="dm-nd-board">
        {META.map((meta) => {
          const precision =
            decimals === "natural"
              ? meta.decimals
              : decimals === "one"
                ? Math.max(1, meta.decimals)
                : Math.max(2, meta.decimals);
          const format: Intl.NumberFormatOptions = {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
            notation: compact && (meta.id === "revenue" || meta.id === "studios") ? "compact" : "standard",
          };
          const delta = deltaFor(meta.id, data[meta.id]);
          return (
            <article className="dm-nd-metric" key={meta.id} data-negative={data[meta.id] < 0 ? "true" : "false"}>
              <div className="dm-nd-metric-top">
                <div>
                  <p className="dm-nd-label">{meta.label}</p>
                  <p className="dm-nd-note">{meta.note}</p>
                </div>
                {showDeltas ? (
                  <span className="dm-nd-delta" data-down={delta.startsWith("−") ? "true" : "false"}>
                    {delta}
                  </span>
                ) : null}
              </div>

              <div className="dm-nd-value-row">
                <p className="dm-nd-value">
                  <NumberDrift
                    value={data[meta.id]}
                    prefix={meta.prefix}
                    suffix={meta.suffix}
                    format={format}
                    locale="en-GB"
                  />
                </p>
                <div className="dm-nd-stepper" aria-label={`Adjust ${meta.label}`}>
                  <button
                    type="button"
                    aria-label={`Decrease ${meta.label}`}
                    onClick={() => change(meta.id, -1)}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`Increase ${meta.label}`}
                    onClick={() => change(meta.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="dm-nd-spark" aria-hidden="true">
                {meta.spark.map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="dm-nd-foot">
        <span>Figures are simulated. No analytics are read.</span>
        <span>Tabular figures · rolling digits · one accessible value</span>
      </footer>
    </div>
  );
}
