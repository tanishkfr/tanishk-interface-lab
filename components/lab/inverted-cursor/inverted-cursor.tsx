"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./inverted-cursor.css";

export type InvertedCursorProps = {
  /** Rest diameter in pixels. */
  size?: number;
  /** Scale over links, buttons and marked surfaces. */
  grow?: number;
  /** Word carried by the disc on data-cursor="view" targets. */
  label?: string;
  /** Any mix-blend-mode value; difference is the honest default. */
  blend?: string;
  /** Targets marked data-cursor-magnet drift a clamped few pixels toward the pointer. */
  magnetic?: boolean;
  /** Removes easing and magnetism, keeping the position 1:1. */
  respectReducedMotion?: boolean;
  className?: string;
};

type CursorState = "rest" | "link" | "view" | "text";

/**
 * Tag/attribute rules for the implicit states. An explicit data-cursor on
 * the nearest marked ancestor always outranks these, so a row marked
 * "view" keeps its label even when the pointer sits on the title inside it.
 */
const GENERIC_TARGETS = [
  "a",
  "button",
  "[role='button']",
  "label",
  "select",
  "input",
  "textarea",
  "[contenteditable]",
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "td",
].join(",");

const PROSE_TAGS = /^(p|li|h[1-6]|td)$/;
const MAGNET_TARGETS = "[data-cursor-magnet]";

const EASE = 0.55; // catch-up per frame
const MAGNET_PULL = 0.2; // fraction of the offset a magnet takes
const MAGNET_MAX = 8; // hard clamp, in pixels
const SETTLE = 0.1; // below this the disc snaps and the loop stops

function resolveState(node: EventTarget | null): CursorState {
  if (!(node instanceof Element)) return "rest";

  const marked = node.closest("[data-cursor]");
  const markedKind = marked?.getAttribute("data-cursor");
  if (markedKind === "view" || markedKind === "link" || markedKind === "text") {
    return markedKind;
  }

  const generic = node.closest(GENERIC_TARGETS);
  if (!generic) return "rest";
  if (generic.hasAttribute("contenteditable")) return "text";
  const tag = generic.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return "text";
  if (PROSE_TAGS.test(tag)) return "text";
  return "link";
}

/**
 * INVERTED CURSOR — a difference-blended disc with honest states.
 *
 * One fixed disc follows the pointer with a small per-frame easing. The
 * disc's position travels on the independent `translate` property and its
 * scale on `transform`, so the two never fight. It only engages on fine,
 * hovering pointers and only after the pointer has actually moved; over
 * inputs, editable regions and selectable prose it steps aside and hands
 * the native I-beam back by removing the `data-lab-cursor` attribute the
 * stylesheet keys on. Every exit path — leaving the window, blur, tab
 * hide, media change, unmount — cancels the frame loop, restores the
 * native cursor and resets every magnet transform.
 */
export function InvertedCursor({
  size = 22,
  grow = 2.6,
  label = "VIEW",
  blend = "difference",
  magnetic = false,
  respectReducedMotion = true,
  className,
}: InvertedCursorProps) {
  const discRef = useRef<HTMLDivElement>(null);
  /* Live props are read through a ref so inline values never rebind the
     pointer engine mid-frame. */
  const propsRef = useRef({ grow, magnetic, respectReducedMotion });
  /* The element currently pulled toward the disc, if any. */
  const magnetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    propsRef.current = { grow, magnetic, respectReducedMotion };
  });

  /* Turning magnetism off must never strand a drifted target. */
  useEffect(() => {
    if (magnetic) return;
    const el = magnetRef.current;
    if (el) {
      el.style.transform = "";
      magnetRef.current = null;
    }
  }, [magnetic]);

  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;

    const fineQuery = window.matchMedia("(pointer: fine)");
    const hoverQuery = window.matchMedia("(hover: hover)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let active = false; // disc owns the cursor
    let pressed = false;
    let state: CursorState = "rest";
    let posX = 0;
    let posY = 0;
    let targetX = 0;
    let targetY = 0;
    let hasTarget = false;
    let raf = 0;

    const isReduced = (): boolean =>
      propsRef.current.respectReducedMotion && motionQuery.matches;

    const releaseMagnet = (): void => {
      const el = magnetRef.current;
      if (!el) return;
      el.style.transform = "";
      magnetRef.current = null;
    };

    const writePosition = (x: number, y: number): void => {
      /* NaN must never reach the DOM as "NaNpx". */
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      disc.style.setProperty(
        "translate",
        `calc(${x}px - 50%) calc(${y}px - 50%)`,
      );
    };

    const setState = (next: CursorState): void => {
      if (next === state) return;
      state = next;
      disc.dataset.state = next;
      if (next === "text") {
        // Hand the native I-beam back while over a text surface.
        delete root.dataset.labCursor;
      } else if (active) {
        root.dataset.labCursor = "custom";
      }
    };

    const activate = (): void => {
      if (active) return;
      active = true;
      disc.dataset.engaged = "true";
      if (state !== "text") root.dataset.labCursor = "custom";
    };

    const deactivate = (): void => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      hasTarget = false;
      pressed = false;
      disc.dataset.pressed = "false";
      disc.dataset.engaged = "false";
      delete root.dataset.labCursor;
      releaseMagnet();
      active = false;
    };

    const tick = (): void => {
      raf = 0;
      /* Hard guarantee: an orphaned frame can never re-show the disc. */
      if (!active) return;
      if (!hasTarget) return;
      if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;

      const dx = targetX - posX;
      const dy = targetY - posY;
      if (Math.abs(dx) < SETTLE && Math.abs(dy) < SETTLE) {
        posX = targetX;
        posY = targetY;
        writePosition(posX, posY);
        return;
      }
      posX += dx * EASE;
      posY += dy * EASE;
      writePosition(posX, posY);
      raf = window.requestAnimationFrame(tick);
    };

    const updateMagnet = (node: EventTarget | null): void => {
      if (!propsRef.current.magnetic || isReduced()) {
        releaseMagnet();
        return;
      }
      const el =
        node instanceof Element
          ? node.closest<HTMLElement>(MAGNET_TARGETS)
          : null;
      if (el !== magnetRef.current) releaseMagnet();
      if (!el) return;
      magnetRef.current = el;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dx = posX - (rect.left + rect.width / 2);
      const dy = posY - (rect.top + rect.height / 2);
      const clamp = (value: number): number =>
        Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, value * MAGNET_PULL));
      el.style.transform = `translate(${clamp(dx).toFixed(2)}px, ${clamp(dy).toFixed(2)}px)`;
    };

    const onMove = (event: PointerEvent): void => {
      if (!(fineQuery.matches && hoverQuery.matches)) return;
      const x = event.clientX;
      const y = event.clientY;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const next = resolveState(event.target);
      if (next === "text") {
        if (active) {
          // Keep the position knowledge so leaving text feels continuous,
          // but hide the disc and let the I-beam through.
          posX = x;
          posY = y;
          deactivate();
        }
        return;
      }

      setState(next);
      if (!active) {
        posX = x;
        posY = y;
        targetX = x;
        targetY = y;
        hasTarget = true;
        activate();
        writePosition(posX, posY);
        updateMagnet(event.target);
        return;
      }

      targetX = x;
      targetY = y;
      hasTarget = true;

      if (isReduced()) {
        posX = x;
        posY = y;
        writePosition(posX, posY);
        updateMagnet(event.target);
        return;
      }
      if (!raf) raf = window.requestAnimationFrame(tick);
      updateMagnet(event.target);
    };

    const onDown = (event: PointerEvent): void => {
      if (!active || event.button !== 0) return;
      pressed = true;
      disc.dataset.pressed = "true";
    };

    const onUp = (): void => {
      if (!pressed) return;
      pressed = false;
      disc.dataset.pressed = "false";
    };

    const onExit = (): void => deactivate();

    const onVisibility = (): void => {
      if (document.hidden) deactivate();
    };

    const onMediaChange = (): void => {
      if (!(fineQuery.matches && hoverQuery.matches)) deactivate();
    };

    const onMotionChange = (): void => {
      if (!isReduced()) return;
      releaseMagnet();
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      if (active && hasTarget) {
        posX = targetX;
        posY = targetY;
        writePosition(posX, posY);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onExit);
    document.addEventListener("mouseleave", onExit);
    document.addEventListener("visibilitychange", onVisibility);
    root.addEventListener("pointerleave", onExit);
    fineQuery.addEventListener("change", onMediaChange);
    hoverQuery.addEventListener("change", onMediaChange);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onExit);
      document.removeEventListener("mouseleave", onExit);
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pointerleave", onExit);
      fineQuery.removeEventListener("change", onMediaChange);
      hoverQuery.removeEventListener("change", onMediaChange);
      motionQuery.removeEventListener("change", onMotionChange);
      delete root.dataset.labCursor;
      releaseMagnet();
    };
  }, []);

  return (
    <div
      ref={discRef}
      className={`cur-disc${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      role="presentation"
      data-state="rest"
      data-pressed="false"
      data-engaged="false"
      style={
        {
          "--cur-size": `${size}px`,
          "--cur-grow": String(grow),
          "--cursor-blend": blend,
        } as CSSProperties
      }
    >
      {label ? <span className="cur-disc__label">{label}</span> : null}
    </div>
  );
}
