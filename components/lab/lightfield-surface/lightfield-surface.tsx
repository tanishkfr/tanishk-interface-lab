"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import "./lightfield-surface.css";

export type LightfieldSurfaceProps = {
  children: ReactNode;
  /** Overall highlight strength, 0–1. */
  intensity?: number;
  /** Maximum tilt in degrees. Keep this small. */
  tilt?: number;
  /** Highlight radius as a percentage of the surface. */
  highlight?: number;
  finish?: "matte" | "satin" | "gloss";
  /** Make the surface itself a tab stop with a visible focus treatment. */
  focusable?: boolean;
  /** Stop responding to the pointer without changing the layout. */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * LIGHTFIELD SURFACE
 *
 * A card that catches light. Pointer movement updates a damped target
 * at most once per frame; the loop stops as soon as the surface has
 * settled, so a page of cards at rest runs nothing. Coarse pointers and
 * reduced-motion users get the static finish. The tilt is clamped and
 * intentionally small: depth, not a funhouse mirror.
 */
export function LightfieldSurface({
  children,
  intensity = 0.5,
  tilt = 3,
  highlight = 52,
  finish = "satin",
  focusable = false,
  disabled = false,
  className,
  style,
}: LightfieldSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 50, y: 22, rx: 0, ry: 0 });
  const current = useRef({ x: 50, y: 22, rx: 0, ry: 0 });
  const frame = useRef<number | null>(null);
  const fine = useRef(true);

  useEffect(() => {
    const query = window.matchMedia?.("(pointer: fine)");
    fine.current = query ? query.matches : true;
    const update = () => {
      fine.current = query ? query.matches : true;
    };
    query?.addEventListener?.("change", update);
    return () => query?.removeEventListener?.("change", update);
  }, []);

  const paint = () => {
    const node = rootRef.current;
    if (!node) return;
    node.style.setProperty("--lf-x", `${current.current.x}%`);
    node.style.setProperty("--lf-y", `${current.current.y}%`);
    node.style.setProperty("--lf-rx", `${current.current.rx}deg`);
    node.style.setProperty("--lf-ry", `${current.current.ry}deg`);
  };

  const stop = () => {
    if (frame.current !== null) {
      window.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  };

  const run = () => {
    if (frame.current !== null) return;
    const tick = () => {
      frame.current = null;
      const t = target.current;
      const c = current.current;
      const ease = 0.18;
      c.x += (t.x - c.x) * ease;
      c.y += (t.y - c.y) * ease;
      c.rx += (t.rx - c.rx) * ease;
      c.ry += (t.ry - c.ry) * ease;
      paint();
      const settled =
        Math.abs(t.x - c.x) < 0.05 &&
        Math.abs(t.y - c.y) < 0.05 &&
        Math.abs(t.rx - c.rx) < 0.01 &&
        Math.abs(t.ry - c.ry) < 0.01;
      if (settled) {
        c.x = t.x;
        c.y = t.y;
        c.rx = t.rx;
        c.ry = t.ry;
        paint();
        return;
      }
      frame.current = window.requestAnimationFrame(tick);
    };
    frame.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => stop, []);

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      disabled ||
      event.pointerType === "touch" ||
      !fine.current ||
      reducedMotion()
    )
      return;
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    target.current = {
      x: px * 100,
      y: py * 100,
      rx: (0.5 - py) * tilt * 2,
      ry: (px - 0.5) * tilt * 2,
    };
    run();
  };

  const leave = () => {
    target.current = { x: 50, y: 16, rx: 0, ry: 0 };
    if (fine.current && !reducedMotion()) run();
  };

  const onFocus = () => {
    if (disabled || !fine.current) return;
    target.current = { x: 30, y: 10, rx: 0, ry: 0 };
    if (!reducedMotion()) run();
  };

  const onBlur = () => {
    if (disabled) return;
    target.current = { x: 50, y: 16, rx: 0, ry: 0 };
    if (!reducedMotion()) run();
  };

  const inline = {
    ...style,
    "--lf-intensity": Math.max(0, Math.min(1, intensity)),
    "--lf-tilt": `${Math.max(0, Math.min(6, tilt))}deg`,
    "--lf-size": `${Math.max(16, Math.min(100, highlight))}%`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`lf-root${className ? ` ${className}` : ""}`}
      data-finish={finish}
      data-disabled={disabled ? "true" : "false"}
      data-focusable={focusable ? "true" : "false"}
      style={inline}
      tabIndex={focusable ? 0 : undefined}
      onPointerMove={move}
      onPointerLeave={leave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="lf-plane">{children}</div>
      <span className="lf-light" aria-hidden="true" />
      <span className="lf-edge" aria-hidden="true" />
    </div>
  );
}
