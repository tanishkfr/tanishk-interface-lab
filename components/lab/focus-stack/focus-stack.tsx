"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "./focus-stack.css";

export type StackItem = {
  id: string;
  title: string;
  meta?: string;
  content: ReactNode;
};

export type FocusStackProps = {
  items: StackItem[];
  /** Controlled selection; omit to let the stack select itself. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Initial selection in uncontrolled use. */
  defaultIndex?: number;
  /** Depth offset in pixels between stacked items. */
  spread?: number;
  /** A slight fan rotation for physical stacks. */
  rotate?: boolean;
  className?: string;
};

const SCALE_STEP = 0.045;
const MAX_ROTATION = 1.2;
const MIN_OPACITY = 0.55;

/**
 * FOCUS STACK — a queue that keeps its context visible.
 *
 * The active card owns the flow, so the container height is the card the
 * reader is looking at. The other cards sit behind it, fanned by
 * distance: items before the active one lift upward, items after it drop
 * downward, both scaling and fading with depth. Only the active panel is
 * rendered visibly — the rest are `hidden`, so assistive technology sees
 * exactly one tabpanel. Arrow keys, Home and End move selection; the tab
 * row is a single tab stop.
 */
export function FocusStack({
  items,
  index,
  onIndexChange,
  defaultIndex = 0,
  spread = 34,
  rotate = false,
  className,
}: FocusStackProps) {
  const isControlled = index !== undefined;
  const [internal, setInternal] = useState(defaultIndex);
  const count = items.length;
  const raw = isControlled ? index : internal;
  const active = count === 0 ? 0 : Math.max(0, Math.min(raw, count - 1));

  const uid = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /* Uncontrolled selection follows the items when the host slices them. */
  if (!isControlled && count > 0 && internal > count - 1) {
    setInternal(count - 1);
  }

  const select = (next: number) => {
    if (count === 0) return;
    const clamped = Math.max(0, Math.min(next, count - 1));
    if (clamped === active) return;
    if (!isControlled) setInternal(clamped);
    onIndexChange?.(clamped);
  };

  const focusAndSelect = (next: number) => {
    if (count === 0) return;
    const wrapped = ((next % count) + count) % count;
    select(wrapped);
    tabRefs.current[wrapped]?.focus();
  };

  const onTablistKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(active - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect(active + 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(count - 1);
        break;
      default:
        break;
    }
  };

  if (count === 0) return null;

  return (
    <div
      className={`fs-root${className ? ` ${className}` : ""}`}
      data-stacked={count > 1 ? "true" : "false"}
      style={{ "--fs-spread": `${spread}px` } as CSSProperties}
    >
      <div
        className="fs-tabs"
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Stack items"
        onKeyDown={onTablistKeyDown}
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            className="fs-tab"
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
          >
            <span className="fs-tab-title">{item.title}</span>
            {item.meta ? <span className="fs-tab-meta">{item.meta}</span> : null}
          </button>
        ))}
      </div>

      <div className="fs-pile">
        {items.map((item, i) => {
          const depth = i - active;
          const isActive = depth === 0;
          const distance = Math.abs(depth);
          const scale = 1 - SCALE_STEP * distance;
          const backStyle: CSSProperties = {
            transform: `translateY(${spread * depth}px) scale(${scale}) rotate(${
              rotate ? (depth < 0 ? -MAX_ROTATION : MAX_ROTATION) : 0
            }deg)`,
            opacity: Math.max(MIN_OPACITY, 1 - 0.1 * distance),
            zIndex: count + 1 - distance,
          };
          return (
            <div
              key={item.id}
              className={`fs-card${isActive ? " fs-card--active" : ""}`}
              style={isActive ? { zIndex: count + 2 } : backStyle}
              aria-hidden={isActive ? undefined : true}
              inert={!isActive}
            >
              {!isActive ? (
                <div
                  className={`fs-peek ${
                    depth > 0 ? "fs-peek--bottom" : "fs-peek--top"
                  }`}
                >
                  <span className="fs-peek-title">{item.title}</span>
                  {item.meta ? (
                    <span className="fs-peek-meta">{item.meta}</span>
                  ) : null}
                </div>
              ) : null}
              <div
                role="tabpanel"
                id={`${uid}-panel-${i}`}
                aria-labelledby={`${uid}-tab-${i}`}
                className="fs-panel"
                tabIndex={0}
                hidden={!isActive}
              >
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
