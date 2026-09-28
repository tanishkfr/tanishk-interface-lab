"use client";

import { useEffect, useRef } from "react";
import "./signal-field.css";

export type SignalFieldMode = "glyph" | "dither" | "pixel";

export type SignalFieldProps = {
  /** Character ramp, quietest first. */
  glyphs?: string;
  /** Grid cell size in CSS pixels. */
  cell?: number;
  /** 0–1 ambient resolve level at rest. */
  density?: number;
  /** 0–1 contrast curve; higher resolves more of the field. */
  intensity?: number;
  /** Suppression radius around the pointer, in cells. 0 disables it. */
  pointerRadius?: number;
  /** Time scale for the underlying noise. 0 freezes the field. */
  speed?: number;
  /** How cells resolve: characters, halftone dots or solid fragments. */
  mode?: SignalFieldMode;
  /**
   * Ink for the densest cells, as a hex value. Without it the field
   * reads the element's own computed `color`.
   */
  accent?: string;
  /** Changes the noise field's composition. Same seed, same field. */
  seed?: number;
  /** Freeze the field externally; the last composed frame stays. */
  paused?: boolean;
  className?: string;
};

const BANDS = 7;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((value) => (value + 0.5) / 16));

/* One time origin per page, so fields mounted together share a phase. */
let SHARED_EPOCH = 0;

function hash3(x: number, y: number, z: number, seed: number): number {
  let h = seed;
  h = Math.imul(h ^ (x | 0), 0x27d4eb2d);
  h = Math.imul(h ^ (y | 0), 0x165667b1);
  h = Math.imul(h ^ (z | 0), 0x9e3779b9);
  h ^= h >>> 15;
  return ((h >>> 0) % 100000) / 100000;
}

function smooth(edge: number): number {
  return edge * edge * (3 - 2 * edge);
}

function lattice(gx: number, gy: number, gz: number, seed: number): number {
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = gx - x0;
  const fy = gy - y0;
  const ux = smooth(fx);
  const uy = smooth(fy);
  const z0 = Math.floor(gz);
  const fz = gz - z0;
  const corner = (dx: number, dy: number): number => {
    const a = hash3(x0 + dx, y0 + dy, z0, seed);
    const b = hash3(x0 + dx, y0 + dy, z0 + 1, seed);
    return a + (b - a) * fz;
  };
  const top = corner(0, 0) * (1 - ux) + corner(1, 0) * ux;
  const bottom = corner(0, 1) * (1 - ux) + corner(1, 1) * ux;
  return top * (1 - uy) + bottom * uy;
}

function parseColor(value: string): [number, number, number] {
  const match = value.match(/(\d+(?:\.\d+)?)/g);
  if (!match || match.length < 3) return [20, 20, 24];
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * SIGNAL FIELD — an ambient glyph field that the pointer quiets.
 *
 * One Canvas 2D primitive. A low-resolution grid resolves into density
 * glyphs, ordered-halftone dots or sparse pixel fragments. The field is
 * already alive at rest; the pointer subtracts density in a soft radius,
 * so attention reads as a quieting rather than a gimmick that only
 * exists while the pointer moves.
 *
 * Engine contract: at most one rAF loop, running only while the canvas
 * is in the viewport, the tab is visible, motion is allowed and the
 * host has not paused it. Cells repaint only when their glyph or level
 * changes; glyphs are pre-rendered sprites, so a frame costs a grid of
 * integer field evaluations plus a few drawImage calls. Geometry
 * coarsens on narrow viewports, DPR is capped, the paint rate adapts to
 * cell count, and touch pointers get no pointer field.
 */
export function SignalField({
  glyphs = "·:+*#",
  cell = 14,
  density = 0.4,
  intensity = 0.5,
  pointerRadius = 9,
  speed = 1,
  mode = "glyph",
  accent,
  seed = 1,
  paused = false,
  className,
}: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* Props that only affect appearance are read through a ref so inline
     values never rebind the engine mid-paint. */
  const lookRef = useRef({ density, intensity, accent });

  useEffect(() => {
    lookRef.current = { density, intensity, accent };
  });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx0 = el.getContext("2d");
    if (!ctx0) return;
    /* aliased after the null checks so the nested painters below keep
       their non-null types */
    const canvas = el;
    const ctx = ctx0;
    lookRef.current = { density, intensity, accent };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    let width = 1;
    let height = 1;
    let cols = 1;
    let rows = 1;
    let step = cell;
    let dpr = 1;
    let sprite: HTMLCanvasElement | null = null;
    let lastPaint = new Int32Array(1);
    const inkCache: string[] = [];
    const pointerCell = { x: -9999, y: -9999 };
    const pointerClient = { x: -9999, y: -9999 };
    let inView = false;
    let raf = 0;
    const clockStart = SHARED_EPOCH || (SHARED_EPOCH = performance.now());
    let frameMs = 1000 / 24;
    let nextPaintAt = 0;

    const rgb: [number, number, number] = accent
      ? (hexToRgb(accent) ?? parseColor(getComputedStyle(el).color))
      : parseColor(getComputedStyle(el).color);

    const inkFor = (t: number): string => {
      const q = Math.min(12, Math.max(0, Math.round(t * 12)));
      const cached = inkCache[q];
      if (cached !== undefined) return cached;
      const alpha = Math.min(1, 0.09 + 0.68 * (q / 12));
      const built = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
      inkCache[q] = built;
      return built;
    };

    function buildSprites(): void {
      sprite = document.createElement("canvas");
      const size = Math.ceil(step * dpr);
      sprite.width = Math.max(1, size * glyphs.length);
      sprite.height = Math.max(1, size * BANDS);
      const sctx = sprite.getContext("2d");
      if (!sctx) return;
      sctx.font = `${Math.round(size * 0.94)}px ui-monospace, "SF Mono", "Cascadia Mono", Consolas, "Liberation Mono", Menlo, monospace`;
      sctx.textAlign = "center";
      sctx.textBaseline = "middle";
      for (let g = 0; g < glyphs.length; g++) {
        for (let b = 0; b < BANDS; b++) {
          sctx.fillStyle = inkFor(b / (BANDS - 1));
          sctx.fillText(
            glyphs.charAt(g),
            size * g + size / 2,
            size * b + size * 0.55,
          );
        }
      }
    }

    function measure(): void {
      /* Never pin an inline size on the canvas: the stylesheet stays
         authoritative, so a later layout change can give the field room
         again. A zero-sized field paints nothing and stays quiet. */
      canvas.style.width = "";
      canvas.style.height = "";
      const box = canvas.getBoundingClientRect();
      width = Math.max(0, Math.round(box.width));
      height = Math.max(0, Math.round(box.height));
      if (width < 1 || height < 1) {
        canvas.width = 0;
        canvas.height = 0;
        cols = 0;
        rows = 0;
        lastPaint = new Int32Array(0);
        return;
      }
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      step = width < 760 ? Math.max(cell, 16) : cell;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      cols = Math.ceil(width / step) + 1;
      rows = Math.ceil(height / step) + 1;
      frameMs = cols * rows > 4000 ? 1000 / 15 : 1000 / 24;
      nextPaintAt = 0;
      lastPaint = new Int32Array(cols * rows).fill(-1);
      buildSprites();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(performance.now(), true);
    }

    function field(
      x: number,
      y: number,
      clock: number,
      tNow: number,
    ): number {
      const look = lookRef.current;
      const nq = Math.floor(clock * 8) / 8;
      const gx = (x / step) * 0.055;
      const gy = (y / step) * 0.055;
      let v =
        lattice(gx, gy, nq, seed) * 0.62 +
        lattice((x / step) * 0.19, (y / step) * 0.19, nq * 1.6, seed + 7) * 0.33;
      /* Contrast: a thresholded field reads as sampled material —
         structure with quiet pockets — instead of uniform mush. The
         gamma lift keeps the midtones (and therefore the ambient
         texture) present at rest instead of collapsing to nothing. */
      const offset = 0.62 - 0.34 * look.intensity;
      const gain = 1 + 3 * look.intensity;
      v = (v - offset) * gain;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      v = Math.pow(v, 0.62);
      if (!reduced.matches && tNow > 0) {
        if (
          hash3(
            Math.floor(x / step),
            Math.floor(y / step),
            Math.floor(nq * 3),
            seed + 31,
          ) < 0.05
        ) {
          v = Math.min(1, v + 0.2);
        }
      }
      if (pointerRadius > 0 && pointerCell.x > -9000) {
        const d = Math.hypot(pointerCell.x - x, pointerCell.y - y);
        if (d < pointerRadius * step) {
          v -= smooth(1 - d / (pointerRadius * step)) * 0.92;
        }
      }
      v *= 0.45 + 1.25 * look.density;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      return v;
    }

    function paint(now: number, force = false): void {
      if (!sprite || cols === 0 || rows === 0) return;
      if (pointerRadius > 0 && pointerClient.x > -9000) {
        const box = canvas.getBoundingClientRect();
        pointerCell.x = pointerClient.x - box.left;
        pointerCell.y = pointerClient.y - box.top;
      }
      const frozen = reduced.matches || paused || speed <= 0;
      const clock = frozen
        ? Math.floor(seed * 13)
        : ((now - clockStart) / 24000) * speed + Math.floor(seed * 13);
      const densityScale = width < 760 ? (mode === "pixel" ? 1 : 0.7) : 1;

      const clearPrev = (index: number, c: number, r: number): void => {
        if (lastPaint[index] === -1) return;
        ctx.clearRect(c * step, r * step, step, step);
        lastPaint[index] = -1;
      };

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c;
          const x = c * step + step / 2;
          const y = r * step + step / 2;
          const v = field(x, y, clock, now - clockStart) * densityScale;
          if (v <= 0.05) {
            clearPrev(index, c, r);
            continue;
          }

          if (mode === "pixel") {
            const on = v > 0.5;
            const strength = on ? Math.min(1, (v - 0.5) / 0.5) : 0;
            const key = on ? 1 + Math.round(strength * 12) : 0;
            if (!force && lastPaint[index] === key) continue;
            clearPrev(index, c, r);
            lastPaint[index] = key;
            if (!on) continue;
            const s = step * (0.24 + 0.6 * strength);
            ctx.fillStyle = inkFor(strength * 0.9 + 0.1);
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
            continue;
          }

          if (mode === "dither") {
            const on = v > BAYER[r & 3][c & 3];
            const key = on ? Math.min(11, 1 + Math.floor(v * 11)) : 0;
            if (!force && lastPaint[index] === key) continue;
            clearPrev(index, c, r);
            lastPaint[index] = key;
            if (!on) continue;
            const size = step * (0.18 + 0.4 * v);
            ctx.fillStyle = inkFor(Math.min(1, 0.35 + v * 0.65));
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            continue;
          }

          const band = Math.min(BANDS - 1, Math.floor(v * BANDS));
          const glyph = Math.min(
            glyphs.length - 1,
            Math.floor(v * glyphs.length),
          );
          const key = glyph * BANDS + band;
          if (!force && lastPaint[index] === key) continue;
          clearPrev(index, c, r);
          lastPaint[index] = key;
          const sw = sprite.width / glyphs.length;
          const sh = sprite.height / BANDS;
          ctx.drawImage(
            sprite,
            glyph * sw,
            band * sh,
            sw,
            sh,
            c * step,
            r * step,
            step,
            step,
          );
          continue;
        }
      }
    }

    const active = (): boolean =>
      !reduced.matches && !paused && speed > 0 && inView && !document.hidden;

    const tick = (now: number): void => {
      raf = 0;
      if (now < nextPaintAt) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      nextPaintAt = now + frameMs;
      paint(now);
      if (active()) raf = window.requestAnimationFrame(tick);
    };

    const schedule = (): void => {
      if (raf || !inView || document.hidden || reduced.matches || paused) return;
      if (speed <= 0) {
        paint(performance.now(), true);
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    const stop = (): void => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView) {
        measure();
        schedule();
      } else {
        stop();
      }
    });
    io.observe(canvas);

    const onVisibility = (): void => {
      if (document.hidden) stop();
      else schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const wantsPointer = pointerRadius > 0;
    const onMove = (event: PointerEvent): void => {
      if (event.pointerType === "touch" || coarse.matches) return;
      pointerClient.x = event.clientX;
      pointerClient.y = event.clientY;
      schedule();
    };
    const onOut = (): void => {
      pointerClient.x = -9999;
      pointerClient.y = -9999;
      pointerCell.x = -9999;
      pointerCell.y = -9999;
      schedule();
    };
    if (wantsPointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onOut);
    }

    let measureQueued = false;
    const onResize = (): void => {
      if (measureQueued) return;
      measureQueued = true;
      window.requestAnimationFrame(() => {
        measureQueued = false;
        measure();
        schedule();
      });
    };
    window.addEventListener("resize", onResize);
    const ro =
      "ResizeObserver" in window ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(canvas);

    const onMotionChange = (): void => {
      measure();
      schedule();
    };
    reduced.addEventListener("change", onMotionChange);

    measure();
    schedule();

    return () => {
      stop();
      io.disconnect();
      if (ro) ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (wantsPointer) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onOut);
      }
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onMotionChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glyphs, cell, seed, pointerRadius, mode, speed, paused]);

  return (
    <canvas
      ref={canvasRef}
      className={`lab-signal-field${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      role="presentation"
      data-mode={mode}
    />
  );
}
