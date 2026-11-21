"use client";

import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  dataMaximum,
  formatValue,
  valueStep,
  type Datum,
} from "@/lib/playground/data-matter/model";

type DataStripProps = {
  data: Datum[];
  selected: number | null;
  onSelect: (index: number | null) => void;
  onHover: (index: number | null) => void;
  onValueChange: (index: number, value: number, continuous: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

export function DataStrip({
  data,
  selected,
  onSelect,
  onHover,
  onValueChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DataStripProps) {
  const maximum = dataMaximum(data);
  const active = selected !== null && selected < data.length ? data[selected] : null;

  return (
    <div className="dm-dataset">
      <div className="dm-inspector">
        {active && selected !== null ? (
          <>
            <span className="dm-inspector-label">Selected</span>
            <strong className="dm-inspector-name">{active.label}</strong>
            <DatumEditor
              key={selected}
              datum={active}
              index={selected}
              onChange={onValueChange}
            />
            <span className="dm-inspector-hint">
              drag the pin, or use ↑ ↓
            </span>
          </>
        ) : (
          <p className="dm-inspector-empty">
            Select a value to inspect and edit it.
          </p>
        )}
        <div className="dm-history">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-keyshortcuts="Control+Z Meta+Z"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z"
          >
            Redo
          </button>
        </div>
      </div>

      <div
        className="data-values dm-data-strip"
        role="group"
        aria-label="Data values"
      >
        {data.map((datum, index) => (
          <DatumItem
            key={`${datum.label}-${index}`}
            datum={datum}
            index={index}
            selected={selected === index}
            maximum={maximum}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
}

function DatumItemComponent({
  datum,
  index,
  selected,
  maximum,
  onSelect,
  onHover,
}: {
  datum: Datum;
  index: number;
  selected: boolean;
  maximum: number;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const ratio = Math.min(1, datum.value / maximum);
  return (
    <div className="dm-datum">
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${datum.label}, ${formatValue(datum.value)}${
          selected ? ", selected" : ""
        }`}
        onClick={() => onSelect(index)}
        onFocus={() => onHover(index)}
        onBlur={() => onHover(null)}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") onHover(index);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") onHover(null);
        }}
      >
        <span className="dm-datum-label" title={datum.label}>
          {datum.label}
        </span>
        <strong>{formatValue(datum.value)}</strong>
        <i
          aria-hidden="true"
          style={{ "--dm-bar-scale": ratio } as CSSProperties}
        />
      </button>
    </div>
  );
}

const DatumItem = memo(DatumItemComponent);

function DatumEditor({
  datum,
  index,
  onChange,
}: {
  datum: Datum;
  index: number;
  onChange: (index: number, value: number, continuous: boolean) => void;
}) {
  const [draft, setDraft] = useState(String(datum.value));
  const focused = useRef(false);
  const step = valueStep(datum.value);

  useEffect(() => {
    if (!focused.current) setDraft(String(datum.value));
  }, [datum.value]);

  return (
    <span className="dm-value-editor">
      <button
        type="button"
        aria-label={`Decrease ${datum.label}`}
        onClick={() => onChange(index, datum.value - step, false)}
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={1_000_000}
        step={step}
        value={draft}
        aria-label={`Value for ${datum.label}`}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          setDraft(String(datum.value));
        }}
        onChange={(event) => {
          const value = event.target.value;
          setDraft(value);
          if (value.trim() === "") return;
          const parsed = Number(value);
          if (Number.isFinite(parsed)) onChange(index, parsed, true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <button
        type="button"
        aria-label={`Increase ${datum.label}`}
        onClick={() => onChange(index, datum.value + step, false)}
      >
        +
      </button>
    </span>
  );
}
