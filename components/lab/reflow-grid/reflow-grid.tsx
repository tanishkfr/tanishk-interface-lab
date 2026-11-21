"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./reflow-grid.css";

export type ReflowGridProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, context: { mode: "grid" | "list" }) => ReactNode;
  mode?: "grid" | "list";
  empty?: ReactNode;
  label?: string;
  /** Disable layout animation without changing the rendered result. */
  animate?: boolean;
  /** Space between cards, in pixels. */
  gap?: number;
  className?: string;
};

type Box = { x: number; y: number; width: number; height: number };

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * REFLOW GRID
 *
 * Filtering and sorting keep the same DOM nodes and animate from their
 * previous slots with a FLIP pass measured in layout space (offset
 * coordinates, so a running animation never feeds back into the next
 * measurement). Removed cards leave as short-lived, inert ghosts at
 * their old coordinates; the survivors move at the same time instead of
 * waiting for a second layout. Empty, grid, list and narrow states all
 * share one component.
 */
export function ReflowGrid<T>({
  items,
  getKey,
  renderItem,
  mode = "grid",
  empty,
  label = "Collection",
  animate = true,
  gap = 14,
  className,
}: ReflowGridProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const boxes = useRef(new Map<string, Box>());
  const known = useRef(new Map<string, T>());
  const knownMode = useRef(mode);
  const knownGap = useRef(gap);
  const keysRef = useRef<string[]>([]);
  const animations = useRef(new Map<string, Animation>());
  const focusKey = useRef<string | null>(null);
  const ghostTimer = useRef<number | null>(null);
  const [ghosts, setGhosts] = useState<
    { key: string; box: Box; node: ReactNode }[]
  >([]);

  const keys = items.map(getKey);
  const signature = keys.join("\u0001");
  const previousSignature = useRef(signature);

  const setNode = useCallback((key: string, node: HTMLElement | null) => {
    if (node) nodes.current.set(key, node);
    else nodes.current.delete(key);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const changed =
      previousSignature.current !== signature ||
      knownMode.current !== mode ||
      knownGap.current !== gap;
    const reduced = prefersReduced() || !animate;

    const nextBoxes = new Map<string, Box>();
    for (const key of keys) {
      const node = nodes.current.get(key);
      if (!node) continue;
      nextBoxes.set(key, {
        x: node.offsetLeft,
        y: node.offsetTop,
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
    }

    if (changed && !reduced) {
      for (const key of keys) {
        const node = nodes.current.get(key);
        const before = boxes.current.get(key);
        const after = nextBoxes.get(key);
        if (!node || !before || !after) continue;
        const dx = before.x - after.x;
        const dy = before.y - after.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
        animations.current.get(key)?.cancel();
        const animation = node.animate(
          [
            { transform: `translate3d(${dx}px, ${dy}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: 340,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
        animations.current.set(key, animation);
        animation.finished
          .catch(() => {})
          .finally(() => {
            if (animations.current.get(key) === animation)
              animations.current.delete(key);
          });
      }

      const seen = new Set(keysRef.current);
      for (const key of keys) {
        if (seen.has(key)) continue;
        const node = nodes.current.get(key);
        if (!node) continue;
        animations.current.get(key)?.cancel();
        const animation = node.animate(
          [
            { opacity: 0, transform: "scale(0.975)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        animations.current.set(key, animation);
      }

      const removed = keysRef.current.filter((key) => !keys.includes(key));
      if (removed.length) {
        const leaving = removed.flatMap((key) => {
          const box = boxes.current.get(key);
          const item = known.current.get(key);
          if (!box || item === undefined) return [];
          return [
            {
              key,
              box,
              node: renderItem(item, { mode: knownMode.current }),
            },
          ];
        });
        if (leaving.length) {
          setGhosts(leaving);
          if (ghostTimer.current !== null)
            window.clearTimeout(ghostTimer.current);
          ghostTimer.current = window.setTimeout(() => {
            setGhosts([]);
            ghostTimer.current = null;
          }, 230);
        }
      }
    }

    boxes.current = nextBoxes;
    keysRef.current = keys;
    knownMode.current = mode;
    knownGap.current = gap;
    previousSignature.current = signature;
    for (const item of items) known.current.set(getKey(item), item);
    for (const key of [...known.current.keys()]) {
      if (!keys.includes(key)) known.current.delete(key);
    }

    if (
      focusKey.current &&
      !keys.includes(focusKey.current) &&
      (document.activeElement === document.body ||
        !root.contains(document.activeElement))
    ) {
      focusKey.current = null;
      root.focus({ preventScroll: true });
    }
  }, [signature, mode, animate, gap, keys, items, getKey, renderItem]);

  useEffect(
    () => () => {
      if (ghostTimer.current !== null) window.clearTimeout(ghostTimer.current);
      for (const animation of animations.current.values()) animation.cancel();
      animations.current.clear();
    },
    [],
  );

  const style = {
    "--rg-gap": `${gap}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`rg-root${className ? ` ${className}` : ""}`}
      data-mode={mode}
      role="region"
      aria-label={label}
      tabIndex={-1}
      style={style}
      onFocusCapture={(event) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-reflow-key]",
        );
        focusKey.current = item?.dataset.reflowKey ?? null;
      }}
    >
      {items.length === 0 ? (
        <div className="rg-empty" role="status">
          {empty ?? "Nothing matches these filters."}
        </div>
      ) : (
        <div className="rg-grid" role="list">
          {items.map((item) => {
            const key = getKey(item);
            return (
              <div
                key={key}
                ref={(node) => setNode(key, node)}
                className="rg-item"
                role="listitem"
                data-reflow-key={key}
              >
                {renderItem(item, { mode })}
              </div>
            );
          })}
        </div>
      )}
      {ghosts.length > 0 ? (
        <div className="rg-ghosts" aria-hidden="true" inert>
          {ghosts.map((ghost) => (
            <div
              key={`ghost-${ghost.key}`}
              className="rg-ghost"
              style={{
                left: ghost.box.x,
                top: ghost.box.y,
                width: ghost.box.width,
                height: ghost.box.height,
              }}
            >
              {ghost.node}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
