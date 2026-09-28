"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./soft-snap.css";

export type SoftSnapMode = "off" | "proximity" | "mandatory" | "assist";
export type SoftSnapAlign = "start" | "center" | "nearest";
export type SoftSnapGate = "fine" | "always";

type SoftSnapProps = {
  /** Settle strength. `assist` is the only JS mode — a cancelable nudge. */
  mode?: SoftSnapMode;
  align?: SoftSnapAlign;
  /** Space between items, in pixels. */
  gap?: number;
  /**
   * `fine` (default) applies settling only on wide, fine-pointer,
   * no-preference screens. `always` applies it wherever it is supported.
   */
  gate?: SoftSnapGate;
  /** Distance in pixels from the lane's top that a settled item keeps. */
  offset?: number;
  className?: string;
  children: ReactNode;
};

const ASSIST_TOLERANCE = 8;
const ASSIST_MAX_DISTANCE = 0.45;
const ASSIST_MIN_VISIBLE = 0.55;
const ASSIST_IDLE_MS = 150;

/**
 * SOFT SNAP — large cards settle into frame without scrolljacking.
 *
 * CSS scroll-snap proximity does the work: when a gesture ends near an
 * item the browser settles it, and when the reader keeps scrolling the
 * lane never pulls them back. `assist` mode adds a small, cancelable
 * nudge for browsers or layouts where proximity alone is too weak —
 * it waits for scrolling to stop, only fires when an item is already
 * mostly in view and close to its resting place, and is cancelled by
 * any new input.
 */
export function SoftSnap({
  mode = "proximity",
  align = "start",
  gap = 24,
  gate = "fine",
  offset = 0,
  className,
  children,
}: SoftSnapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "assist") return;
    const lane = ref.current;
    if (!lane) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    let timer: number | undefined;
    let cancelled = false;

    const settle = () => {
      if (cancelled || !lane.isConnected) return;
      const box = lane.getBoundingClientRect();
      if (box.height === 0) return;
      const items = Array.from(
        lane.querySelectorAll<HTMLElement>("[data-snap-item]"),
      );
      if (items.length === 0) return;

      let best: HTMLElement | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const distance = align === "center"
          ? Math.abs(
              rect.top + rect.height / 2 - (box.top + box.height / 2),
            )
          : Math.abs(rect.top - box.top - offset);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = item;
        }
      }
      if (!best) return;

      const rect = best.getBoundingClientRect();
      const visible =
        Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top);
      const ratio = visible / Math.min(rect.height, box.height);
      if (ratio < ASSIST_MIN_VISIBLE) return;
      if (bestDistance > box.height * ASSIST_MAX_DISTANCE) return;
      if (bestDistance <= ASSIST_TOLERANCE) return;

      const target =
        align === "center"
          ? rect.top - box.top - (box.height - rect.height) / 2
          : rect.top - box.top - offset;
      lane.scrollTo({ top: lane.scrollTop + target, behavior: "smooth" });
    };

    const onScroll = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(settle, ASSIST_IDLE_MS);
    };
    const onInput = () => {
      if (timer) window.clearTimeout(timer);
    };

    lane.addEventListener("scroll", onScroll, { passive: true });
    lane.addEventListener("wheel", onInput, { passive: true });
    lane.addEventListener("touchstart", onInput, { passive: true });
    lane.addEventListener("pointerdown", onInput);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      lane.removeEventListener("scroll", onScroll);
      lane.removeEventListener("wheel", onInput);
      lane.removeEventListener("touchstart", onInput);
      lane.removeEventListener("pointerdown", onInput);
    };
  }, [mode, align, offset]);

  return (
    <div
      ref={ref}
      className={`lab-soft-snap${className ? ` ${className}` : ""}`}
      data-mode={mode}
      data-align={align}
      data-gate={gate}
      style={{ "--snap-gap": `${gap}px`, "--snap-offset": `${offset}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * SOFT SNAP ITEM — one settle target. Items keep their own layout;
 * only their snapping alignment is owned by the lane.
 */
export function SoftSnapItem({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`lab-soft-snap-item${className ? ` ${className}` : ""}`}
      data-snap-item
    >
      {children}
    </div>
  );
}
