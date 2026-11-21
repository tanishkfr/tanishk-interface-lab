"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import "./edge-reveal.css";

export type EdgeRevealProps = {
  title: string;
  category: string;
  /** Supplementary copy revealed in the overlay. */
  detail?: ReactNode;
  media: ReactNode;
  /** A real action inside the overlay, e.g. a button or link. */
  action?: ReactNode;
  tone?: "light" | "dark";
  /** CSS aspect-ratio for the card. Any ratio works. */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
};

type Edge = "top" | "right" | "bottom" | "left";

function edgeFor(clientX: number, clientY: number, rect: DOMRect): Edge {
  const distances: Array<[Edge, number]> = [
    ["top", clientY - rect.top],
    ["right", rect.right - clientX],
    ["bottom", rect.bottom - clientY],
    ["left", clientX - rect.left],
  ];
  distances.sort((a, b) => a[1] - b[1]);
  return distances[0][0];
}

/**
 * EDGE REVEAL
 *
 * The supplemental layer enters from whichever edge the pointer chose
 * and leaves toward the edge it exits through. The card's title and
 * category stay visible at rest, so the effect never carries essential
 * information. Keyboard focus opens the layer, Escape closes it, and a
 * tap toggles it on touch. Reduced motion swaps the travel for a fade.
 */
export function EdgeReveal({
  title,
  category,
  detail,
  media,
  action,
  tone = "dark",
  ratio = "4 / 5",
  className,
  style,
}: EdgeRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [edge, setEdge] = useState<Edge>("bottom");
  const tap = useRef({ x: 0, y: 0, id: -1, moved: false });

  const enter = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setEdge(edgeFor(event.clientX, event.clientY, rect));
    setOpen(true);
  };

  const leave = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    if (rootRef.current?.contains(document.activeElement)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setEdge(edgeFor(event.clientX, event.clientY, rect));
    setOpen(false);
  };

  const beginTap = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch") return;
    tap.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      moved: false,
    };
  };

  const moveTap = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || tap.current.id !== event.pointerId)
      return;
    if (
      Math.hypot(event.clientX - tap.current.x, event.clientY - tap.current.y) >
      10
    ) {
      tap.current.moved = true;
    }
  };

  const endTap = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch") return;
    if (tap.current.id !== event.pointerId || tap.current.moved) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a")) return;
    setEdge("bottom");
    setOpen((current) => !current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      rootRef.current?.focus();
    }
  };

  const onBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    )
      return;
    setOpen(false);
  }, []);

  return (
    <article
      ref={rootRef}
      className={`er-card${className ? ` ${className}` : ""}`}
      data-tone={tone}
      data-open={open ? "true" : "false"}
      data-edge={edge}
      style={{ ...style, "--er-ratio": ratio } as CSSProperties}
      tabIndex={0}
      aria-label={`${title} — ${category}`}
      onPointerEnter={enter}
      onPointerDown={beginTap}
      onPointerMove={moveTap}
      onPointerUp={endTap}
      onPointerLeave={leave}
      onFocus={() => setOpen(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <div className="er-media" aria-hidden="true">
        {media}
      </div>
      <div className="er-scrim" aria-hidden="true" />
      <div className="er-base">
        <span className="er-category">{category}</span>
        <h3 className="er-title">{title}</h3>
        <span className="er-touch-hint" aria-hidden="true">
          Tap for details
        </span>
      </div>
      <div className="er-overlay" inert={!open} aria-hidden={!open}>
        <div className="er-overlay-inner">
          <span className="er-overlay-category">{category}</span>
          <h4 className="er-overlay-title">{title}</h4>
          {detail ? <div className="er-detail">{detail}</div> : null}
          {action ? <div className="er-action">{action}</div> : null}
        </div>
        <span className="er-edge-mark" aria-hidden="true" />
      </div>
    </article>
  );
}
