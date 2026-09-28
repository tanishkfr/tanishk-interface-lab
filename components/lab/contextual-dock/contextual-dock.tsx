"use client";

import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import "./contextual-dock.css";

export type DockContext = "none" | "text" | "object" | "multi";

export type DockAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
};

export type ContextualDockProps = {
  /** The host’s current selection kind. */
  context: DockContext;
  /** Actions per context. The dock always reserves the widest set. */
  sets: Record<DockContext, DockAction[]>;
  /** Status line, e.g. “3 blocks selected”. */
  label?: string;
  placement?: "floating" | "inline";
  /** Fired with the action id after `action.onSelect()`. */
  onAction?: (id: string, context: DockContext) => void;
  className?: string;
};

const CONTEXT_ORDER: DockContext[] = ["none", "text", "object", "multi"];

const CONTEXT_NAMES: Record<DockContext, string> = {
  none: "No selection",
  text: "Text selection",
  object: "Object selection",
  multi: "Multi-selection",
};

/**
 * CONTEXTUAL DOCK — a toolbar that reconfigures without moving.
 *
 * Every context’s action set is rendered into the same grid cell, so
 * the dock’s width is inherently the widest set; the inactive sets
 * are visibility:hidden and only opacity cross-fades. Nothing shifts
 * under the pointer when the selection changes. Focus is roving —
 * exactly one button is tabbable — and each change is announced.
 */
export function ContextualDock({
  context,
  sets,
  label,
  placement = "floating",
  onAction,
  className,
}: ContextualDockProps) {
  const activeSet = sets[context] ?? [];
  const activeCount = activeSet.length;
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonRefs = useRef<Partial<Record<DockContext, (HTMLButtonElement | null)[]>>>(
    {},
  );

  const safeIndex =
    activeSet.length === 0 ? 0 : Math.min(focusIndex, activeSet.length - 1);

  // The remembered position survives a context change, but never
  // points past the new set.
  const max = Math.max(0, activeCount - 1);
  if (focusIndex > max) {
    setFocusIndex(max);
  }

  const handleToolbarKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const count = activeSet.length;
    if (count === 0) return;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = (safeIndex + 1) % count;
        break;
      case "ArrowLeft":
        next = (safeIndex - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setFocusIndex(next);
    buttonRefs.current[context]?.[next]?.focus();
  };

  const runAction = (action: DockAction) => {
    action.onSelect?.();
    onAction?.(action.id, context);
  };

  const announcement = `${CONTEXT_NAMES[context]} — ${activeSet.length} ${
    activeSet.length === 1 ? "action" : "actions"
  }`;

  return (
    <div
      className={`cd-dock${className ? ` ${className}` : ""}`}
      data-placement={placement}
      data-context={context}
    >
      <div className="cd-status">
        <span className="cd-status-text" aria-live="polite">
          {label ?? ""}
        </span>
        <span className="cd-sr" aria-live="polite">
          {announcement}
        </span>
      </div>

      <div
        className="cd-sets"
        role="toolbar"
        aria-label="Selection actions"
        aria-orientation="horizontal"
        onKeyDown={handleToolbarKeyDown}
      >
        {CONTEXT_ORDER.map((setContext) => {
          const actions = sets[setContext] ?? [];
          const isActive = setContext === context;
          return (
            <div
              key={setContext}
              className="cd-set"
              data-active={isActive ? "true" : undefined}
              aria-hidden={!isActive}
            >
              {actions.map((action, index) => (
                <button
                  key={action.id}
                  type="button"
                  className="cd-btn"
                  data-selected={isActive && index === safeIndex ? "true" : undefined}
                  tabIndex={isActive && index === safeIndex ? 0 : -1}
                  ref={(element) => {
                    const list = (buttonRefs.current[setContext] ??= []);
                    list[index] = element;
                  }}
                  onFocus={() => {
                    if (isActive) setFocusIndex(index);
                  }}
                  onClick={() => runAction(action)}
                >
                  {action.icon ? (
                    <span className="cd-icon" aria-hidden="true">
                      {action.icon}
                    </span>
                  ) : null}
                  <span className="cd-btn-label">{action.label}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
