"use client";

/*
 * The previous formatted string is a render-time diff snapshot. It is
 * intentionally a ref: the roll needs the old and new digits in the same
 * commit, and promoting it to state would render the new value once
 * without animation before the snapshot could be read.
 */
/* eslint-disable react-hooks/refs */

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import "./number-drift.css";

export type NumberDriftProps = {
  value: number;
  locale?: string;
  format?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  className?: string;
};

function sequence(
  previous: number | null,
  next: number,
  direction: number,
): { items: number[]; from: number; to: number; duration: number } {
  if (previous === null || previous === next || direction === 0) {
    return { items: [next], from: 0, to: 0, duration: 240 };
  }
  if (direction > 0) {
    const items = [previous];
    let digit = previous;
    while (digit !== next) {
      digit = (digit + 1) % 10;
      items.push(digit);
    }
    return {
      items,
      from: 0,
      to: -(items.length - 1),
      duration: Math.min(420, 220 + items.length * 36),
    };
  }
  const items = [next];
  let digit = next;
  while (digit !== previous) {
    digit = (digit + 1) % 10;
    items.push(digit);
  }
  return {
    items,
    from: -(items.length - 1),
    to: 0,
    duration: Math.min(420, 220 + items.length * 36),
  };
}

function DriftDigit({
  previous,
  digit,
  direction,
}: {
  previous: number | null;
  digit: number;
  direction: number;
}) {
  const built = sequence(previous, digit, direction);
  const style = {
    "--nd-from": `${built.from}em`,
    "--nd-to": `${built.to}em`,
    "--nd-duration": `${built.duration}ms`,
  } as CSSProperties;

  return (
    <span className="nd-digit">
      <span className="nd-track" style={style}>
        {built.items.map((value, index) => (
          <span className="nd-cell" key={`${value}-${index}`}>
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * NUMBER DRIFT
 *
 * Formats with Intl.NumberFormat, then aligns the result from the right
 * so separators and signs keep their place while digits roll. Each
 * changed digit runs a short directional strip; unchanged digits keep
 * their DOM and do not move. The visual is aria-hidden and the final
 * formatted value is exposed once, so assistive technology never hears
 * animation frames.
 */
export function NumberDrift({
  value,
  locale,
  format,
  prefix,
  suffix,
  className,
}: NumberDriftProps) {
  const formatKey = format ? JSON.stringify(format) : "";
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, format),
    // The serialised options are the stable identity of the formatter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, formatKey],
  );
  const text = formatter.format(Number.isFinite(value) ? value : 0);
  const previous = useRef({ text, value });
  const old = previous.current;
  const direction = value > old.value ? 1 : value < old.value ? -1 : 0;

  useEffect(() => {
    previous.current = { text, value };
  }, [text, value]);

  const oldChars = Array.from(old.text);
  const chars = Array.from(text);
  const visual = chars.map((char, index) => {
    const fromRight = chars.length - index;
    const oldIndex = oldChars.length - fromRight;
    const oldChar = oldIndex >= 0 ? oldChars[oldIndex] : "";
    if (/\d/.test(char)) {
      const nextDigit = Number(char);
      const previousDigit = /\d/.test(oldChar) ? Number(oldChar) : null;
      const changed = previousDigit !== nextDigit;
      if (!changed) {
        return (
          <span className="nd-static nd-static--digit" key={`d-${fromRight}`}>
            {char}
          </span>
        );
      }
      return (
        <DriftDigit
          key={`d-${fromRight}-${old.text}-${text}-${oldChar}`}
          previous={previousDigit}
          digit={nextDigit}
          direction={direction}
        />
      );
    }
    return (
      <span className="nd-static" key={`s-${index}-${char}`}>
        {char}
      </span>
    );
  });

  const accessible = `${prefix ?? ""}${text}${suffix ?? ""}`;

  return (
    <span
      className={`nd-root${className ? ` ${className}` : ""}`}
      data-changing={old.text !== text ? "true" : "false"}
    >
      <span className="nd-visual" aria-hidden="true">
        {prefix ? <span className="nd-affix">{prefix}</span> : null}
        {visual}
        {suffix ? <span className="nd-affix">{suffix}</span> : null}
      </span>
      <span className="nd-sr">{accessible}</span>
    </span>
  );
}
