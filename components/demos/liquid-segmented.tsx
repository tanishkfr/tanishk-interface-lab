"use client";

import { useState } from "react";
import {
  LiquidSegmented,
  type SegmentedOption,
} from "@/components/lab/liquid-segmented/liquid-segmented";
import type { DemoProps } from "./demo-host";
import "./liquid-segmented-demo.css";

type Density = "compact" | "comfortable" | "spacious";

const ROWS = [
  { title: "The shape of a pause", author: "Mira Chen", kind: "Essay", minutes: 18, status: "Reading", tone: "A", note: "On attention, quiet software and the interval between two actions." },
  { title: "A field guide to rooms", author: "Jon Bell", kind: "Photo essay", minutes: 11, status: "Queued", tone: "B", note: "Twelve interiors photographed at the same hour of the morning." },
  { title: "Notes on notation", author: "Ari Soto", kind: "Interview", minutes: 24, status: "Reading", tone: "C", note: "A conversation about drawing systems before building them." },
  { title: "The repair reader", author: "Fallow Press", kind: "Book", minutes: 46, status: "Finished", tone: "D", note: "A collection of repair manuals treated as literature." },
  { title: "Weather for interiors", author: "Lena Park", kind: "Essay", minutes: 9, status: "Queued", tone: "E", note: "Light, dust and the small climates inside a building." },
  { title: "An index of edges", author: "Common Form", kind: "Catalogue", minutes: 32, status: "Reading", tone: "F", note: "Objects photographed where they meet the table." },
];

export default function LiquidSegmentedDemo({ values }: DemoProps) {
  const size = String(values.size ?? "md") === "sm" ? "sm" : "md";
  const stretch = values.stretch === undefined ? true : Boolean(values.stretch);
  const disableSpacious = Boolean(values.disable);
  const [density, setDensity] = useState<Density>("comfortable");
  const activeDensity: Density =
    disableSpacious && density === "spacious" ? "comfortable" : density;

  const options: SegmentedOption[] = [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious", disabled: disableSpacious },
  ];

  return (
    <div className="dm-ls-root" data-density={activeDensity}>
      <header className="dm-ls-head">
        <div>
          <p className="dm-ls-kicker">FIELDNOTES / READING ROOM</p>
          <h2>Six things to read next.</h2>
        </div>
        <span className="dm-ls-mark" aria-hidden="true">
          06
        </span>
      </header>

      <div className="dm-ls-toolbar">
        <div>
          <span className="dm-ls-label">Layout density</span>
          <LiquidSegmented
            options={options}
            value={activeDensity}
            onChange={(next) => setDensity(next as Density)}
            label="Layout density"
            size={size}
            stretch={stretch}
          />
        </div>
        <p className="dm-ls-hint" aria-live="polite">
          {activeDensity === "compact"
            ? "Titles only. Six entries fit without a scroll."
            : activeDensity === "spacious"
              ? "Notes, tags and reading time have room to breathe."
              : "A balanced row: enough context, no clutter."}
        </p>
      </div>

      <section className="dm-ls-shelf" aria-label="Reading list">
        <div className="dm-ls-shelf-head">
          <span>Reading list</span>
          <span>{ROWS.filter((row) => row.status === "Reading").length} in progress</span>
        </div>
        <ul className="dm-ls-list">
          {ROWS.map((row, index) => (
            <li key={row.title}>
              <span className="dm-ls-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="dm-ls-avatar" data-tone={row.tone} aria-hidden="true">
                {row.tone}
              </span>
              <div className="dm-ls-copy">
                <div className="dm-ls-title-line">
                  <h3>{row.title}</h3>
                  <span className="dm-ls-status" data-status={row.status.toLowerCase()}>
                    {row.status}
                  </span>
                </div>
                <p className="dm-ls-byline">
                  {row.author} <span aria-hidden="true">·</span> {row.kind}{" "}
                  <span aria-hidden="true">·</span> {row.minutes} min
                </p>
                <p className="dm-ls-note">{row.note}</p>
              </div>
              <span className="dm-ls-minutes" aria-hidden="true">
                {row.minutes}′
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="dm-ls-foot">
        The setting is real state. The control keeps its selection surface on
        the chosen option while the shelf changes density around it.
      </p>
    </div>
  );
}
