"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "./lens-reveal.css";

export type LensRevealShape = "circle" | "square";

type LensRevealProps = {
  /** The surface the reader sees first. */
  base: ReactNode;
  /**
   * The registered layer revealed under the lens: annotations, a
   * revised layout, measurement chrome. It must be presentational —
   * see the accessibility note in the source.
   */
  lens: ReactNode;
  /** Lens diameter (or side length) in pixels. */
  size?: number;
  /** Lens geometry. */
  shape?: LensRevealShape;
  /** Pixels moved per arrow-key press. */
  keyboardStep?: number;
  /** Accessible name for the lens region. */
  label?: string;
  /** What the lens reveals, read to assistive tech. */
  description?: string;
  /** Normalised lens centre (0–1), for syncing sidecars. */
  onPositionChange?: (x: number, y: number) => void;
  className?: string;
};

/** Shift makes each arrow step this fine. */
const FINE_STEP = 6;
/** Per-frame catch-up factor (~0.25); reduced motion runs 1:1. */
const EASE = 0.25;

/**
 * LENS REVEAL — a movable lens that reveals a second, registered
 * layer under a surface.
 *
 * Pointer and touch drag move it (clamped so the lens always stays
 * fully inside the container), arrow keys move it precisely, and
 * Home recentres it. The lens is drawn from the start so the
 * interaction is discoverable.
 *
 * Give the root a size (height, aspect-ratio, flex-grow…) — both the
 * base and lens layers are full-bleed inside it. If the container is
 * smaller than `size`, the lens clamps down to fit.
 *
 * ACCESSIBILITY — `lens` must not introduce interactive elements:
 * it is rendered `aria-hidden`, because the same information has to
 * exist elsewhere. Hosts should duplicate whatever the lens reveals
 * in the page itself (or in `description`), so the lens is an
 * accelerator rather than a gate.
 */
export function LensReveal({
  base,
  lens,
  size = 190,
  shape = "circle",
  keyboardStep = 28,
  label = "Reveal layer",
  description,
  onPositionChange,
  className,
}: LensRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const boxRef = useRef({ w: 0, h: 0 });
  const readyRef = useRef(false);
  const frameRef = useRef(0);
  const apiRef = useRef<{
    nudge: (dx: number, dy: number) => void;
    reset: () => void;
  } | null>(null);
  const callbackRef = useRef(onPositionChange);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const descriptionId = useId();

  useEffect(() => {
    callbackRef.current = onPositionChange;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const reduced = () => motion?.matches ?? false;

    let half = Math.max(0, size) / 2;
    let touchId: number | null = null;
    let lastTouch = { x: 0, y: 0 };

    const clamp = (x: number, y: number) => {
      const { w, h } = boxRef.current;
      if (w <= 0 || h <= 0) return { x, y };
      return {
        x: Math.min(Math.max(x, half), Math.max(half, w - half)),
        y: Math.min(Math.max(y, half), Math.max(half, h - half)),
      };
    };

    const write = () => {
      const { w, h } = boxRef.current;
      root.style.setProperty("--lr-x", `${posRef.current.x}px`);
      root.style.setProperty("--lr-y", `${posRef.current.y}px`);
      if (w > 0 && h > 0) {
        callbackRef.current?.(posRef.current.x / w, posRef.current.y / h);
      }
    };

    const tick = () => {
      frameRef.current = 0;
      const target = targetRef.current;
      const pos = posRef.current;
      if (reduced()) {
        pos.x = target.x;
        pos.y = target.y;
        write();
        return;
      }
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        pos.x = target.x;
        pos.y = target.y;
        write();
        return;
      }
      pos.x += dx * EASE;
      pos.y += dy * EASE;
      write();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (reduced()) {
        if (frameRef.current) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        posRef.current = { ...targetRef.current };
        write();
        return;
      }
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const moveTo = (x: number, y: number) => {
      targetRef.current = clamp(x, y);
      schedule();
    };

    const measure = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      boxRef.current = { w, h };
      if (w > 0 && h > 0) {
        half = Math.max(0, Math.min(size, w, h)) / 2;
      } else {
        half = Math.max(0, size) / 2;
      }
      root.style.setProperty("--lr-r", `${half}px`);
      if (!readyRef.current && w > 0 && h > 0) {
        readyRef.current = true;
        posRef.current = { x: w / 2, y: h / 2 };
        targetRef.current = { x: w / 2, y: h / 2 };
      } else {
        posRef.current = clamp(posRef.current.x, posRef.current.y);
        targetRef.current = clamp(targetRef.current.x, targetRef.current.y);
      }
      write();
    };

    apiRef.current = {
      nudge: (dx, dy) =>
        moveTo(targetRef.current.x + dx, targetRef.current.y + dy),
      reset: () => moveTo(boxRef.current.w / 2, boxRef.current.h / 2),
    };

    const onPointerDown = (event: PointerEvent) => {
      setDragging(true);
      try {
        root.setPointerCapture(event.pointerId);
      } catch {
        /* capture is an enhancement; ignoring keeps older browsers usable */
      }
      if (event.pointerType === "touch") {
        /* touch only moves after a real drag: a plain tap never grabs. */
        touchId = event.pointerId;
        lastTouch = { x: event.clientX, y: event.clientY };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        if (touchId !== event.pointerId) return;
        const dx = event.clientX - lastTouch.x;
        const dy = event.clientY - lastTouch.y;
        lastTouch = { x: event.clientX, y: event.clientY };
        moveTo(targetRef.current.x + dx, targetRef.current.y + dy);
        return;
      }
      const rect = root.getBoundingClientRect();
      moveTo(event.clientX - rect.left, event.clientY - rect.top);
    };

    const endDrag = (event: PointerEvent) => {
      if (touchId === event.pointerId) touchId = null;
      setDragging(false);
      try {
        if (root.hasPointerCapture(event.pointerId)) {
          root.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* nothing to release */
      }
    };

    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => measure())
        : null;
    observer?.observe(root);
    measure();

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      observer?.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);
      apiRef.current = null;
    };
  }, [size]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const api = apiRef.current;
    if (!api) return;
    const step = event.shiftKey ? FINE_STEP : keyboardStep;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      api.nudge(-step, 0);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      api.nudge(step, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      api.nudge(0, -step);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      api.nudge(0, step);
    } else if (event.key === "Home") {
      event.preventDefault();
      api.reset();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`lr-reveal${className ? ` ${className}` : ""}`}
      style={{ "--lr-size": `${size}px` } as CSSProperties}
      data-shape={shape}
      data-dragging={dragging ? "true" : "false"}
      data-focused={focused ? "true" : "false"}
      role="group"
      tabIndex={0}
      aria-label={label}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="lr-base">{base}</div>
      {/* Presentational layer: nothing here is focusable or reachable —
          everything it reveals must also live in the page or in
          `description` (see the component note above). */}
      <div className="lr-overlay" aria-hidden="true">
        <div className="lr-layer">{lens}</div>
      </div>
      <span className="lr-ring" aria-hidden="true" />
      {description ? (
        <p className="lr-sr" id={descriptionId}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
