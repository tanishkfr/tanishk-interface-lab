"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import "./liquid-segmented.css";

export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type LiquidSegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible group name. */
  label: string;
  size?: "sm" | "md";
  /** Let the surface stretch briefly in the direction of travel. */
  stretch?: boolean;
  className?: string;
};

/**
 * LIQUID SEGMENTED CONTROL
 *
 * A radiogroup with one physical selection surface. The surface is
 * measured from the chosen option and glides between slots; during a
 * change it gains a few pixels toward the direction of travel and
 * settles back. Arrow keys move selection and focus together, disabled
 * options are skipped, and the roving tab stop always points at the
 * current choice.
 */
export function LiquidSegmented({
  options,
  value,
  onChange,
  label,
  size = "md",
  stretch = true,
  className,
}: LiquidSegmentedProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ x: 0, width: 0, ready: false });
  const [give, setGive] = useState({ amount: 0, direction: 1 });
  const giveTimer = useRef<number | null>(null);
  const usable = options.filter((option) => !option.disabled);
  const activeValue = options.some(
    (option) => option.value === value && !option.disabled,
  )
    ? value
    : (usable[0]?.value ?? "");
  const selected = options.find((option) => option.value === activeValue);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const button = buttonRefs.current.get(activeValue);
    if (!root || !button) return;
    setIndicator({
      x: button.offsetLeft,
      width: button.offsetWidth,
      ready: true,
    });
  }, [activeValue]);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    for (const button of buttonRefs.current.values()) observer.observe(button);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const choose = (next: string, current: string) => {
    const from = options.findIndex((option) => option.value === current);
    const to = options.findIndex((option) => option.value === next);
    if (stretch && from !== -1 && to !== -1 && from !== to) {
      const amount = Math.min(18, Math.abs(to - from) * 5);
      setGive({ amount, direction: to > from ? 1 : -1 });
      if (giveTimer.current !== null) window.clearTimeout(giveTimer.current);
      giveTimer.current = window.setTimeout(() => {
        setGive({ amount: 0, direction: 1 });
        giveTimer.current = null;
      }, 190);
    }
    onChange(next);
  };

  useEffect(
    () => () => {
      if (giveTimer.current !== null) window.clearTimeout(giveTimer.current);
    },
    [],
  );

  const move = (
    event: KeyboardEvent<HTMLButtonElement>,
    direction: 1 | -1,
  ) => {
    event.preventDefault();
    const usable = options.filter((option) => !option.disabled);
    if (!usable.length) return;
    const current = usable.findIndex(
      (option) => option.value === selected?.value,
    );
    const next = usable[(current + direction + usable.length) % usable.length];
    choose(next.value, selected?.value ?? value);
    buttonRefs.current.get(next.value)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      move(event, 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      move(event, -1);
    else if (event.key === "Home") {
      event.preventDefault();
      const first = options.find((option) => !option.disabled);
      if (first) {
        choose(first.value, selected?.value ?? value);
        buttonRefs.current.get(first.value)?.focus();
      }
    } else if (event.key === "End") {
      event.preventDefault();
      const last = [...options].reverse().find((option) => !option.disabled);
      if (last) {
        choose(last.value, selected?.value ?? value);
        buttonRefs.current.get(last.value)?.focus();
      }
    }
  };

  const width = indicator.width + give.amount;
  const x =
    indicator.x -
    (give.amount && give.direction < 0 ? give.amount : 0);

  return (
    <div
      ref={rootRef}
      className={`ls-root${className ? ` ${className}` : ""}`}
      role="radiogroup"
      aria-label={label}
      data-size={size}
    >
      <span
        className="ls-indicator"
        aria-hidden="true"
        data-ready={indicator.ready ? "true" : "false"}
        style={{ width, transform: `translate3d(${x}px, 0, 0)` }}
      />
      {options.map((option) => {
        const checked = option.value === activeValue;
        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) buttonRefs.current.set(option.value, node);
              else buttonRefs.current.delete(option.value);
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={option.disabled}
            tabIndex={checked ? 0 : -1}
            className="ls-option"
            onClick={() => choose(option.value, activeValue)}
            onKeyDown={onKeyDown}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
