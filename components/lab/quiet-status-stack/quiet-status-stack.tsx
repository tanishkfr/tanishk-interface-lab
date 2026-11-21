"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./quiet-status-stack.css";

export type StatusTone = "pending" | "processing" | "success" | "error";

export type StatusAction = {
  label: string;
  onClick: () => void;
  busy?: boolean;
};

export type StatusItem = {
  id: string;
  title: string;
  detail?: string;
  status: StatusTone;
  /** 0–1 for determinate work. Omit for an indeterminate bar. */
  progress?: number;
  action?: StatusAction;
  /** Defaults to true. Errors stay until dismissed. */
  dismissible?: boolean;
  /** Only used for settled items. Pauses on hover and focus. */
  autoDismissMs?: number;
};

export type QuietStatusStackProps = {
  items: StatusItem[];
  onDismiss?: (id: string) => void;
  /** How many rows remain visible at once. */
  max?: number;
  label?: string;
  className?: string;
};

function Icon({ tone }: { tone: StatusTone }) {
  if (tone === "success") {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
        <path
          d="M3.5 9.5l3.4 3.2 7.6-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === "error") {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
        <path
          d="M9 3.2v7.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="9" cy="14" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (tone === "processing") {
    return (
      <svg
        className="qs-spinner"
        viewBox="0 0 18 18"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="9"
          cy="9"
          r="6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.24"
        />
        <path
          d="M9 2.6a6.4 6.4 0 0 1 6.4 6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="3.1" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function StatusRow({
  item,
  onDismiss,
  register,
}: {
  item: StatusItem;
  onDismiss?: (id: string) => void;
  register: (id: string, node: HTMLElement | null) => void;
}) {
  const rowRef = useRef<HTMLElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef<number | null>(null);
  const started = useRef<number>(0);
  const timer = useRef<number | null>(null);
  const leaveTimer = useRef<number | null>(null);
  const dismissing = useRef(false);
  const auto = Boolean(item.autoDismissMs && item.status === "success");
  const canDismiss = item.dismissible !== false;

  const dismiss = (delay = true) => {
    if (dismissing.current) return;
    dismissing.current = true;
    if (!delay) {
      onDismiss?.(item.id);
      return;
    }
    setLeaving(true);
    leaveTimer.current = window.setTimeout(
      () => onDismiss?.(item.id),
      180,
    );
  };

  /* Auto-dismiss is deadline-based so hover/focus pauses preserve the rest. */
  useEffect(() => {
    if (!auto || paused) {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      if (remaining.current !== null && started.current) {
        remaining.current = Math.max(
          0,
          remaining.current - (Date.now() - started.current),
        );
      }
      return;
    }
    if (remaining.current === null)
      remaining.current = item.autoDismissMs ?? 0;
    if (remaining.current <= 0) return;
    started.current = Date.now();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      dismiss();
    }, remaining.current);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, paused, item.autoDismissMs, item.id]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  const progress =
    typeof item.progress === "number"
      ? Math.max(0, Math.min(1, item.progress))
      : null;

  return (
    <li
      ref={(node) => {
        rowRef.current = node;
        register(item.id, node);
      }}
      className="qs-item"
      data-tone={item.status}
      data-leaving={leaving ? "true" : "false"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <span className="qs-icon" aria-hidden="true">
        <Icon tone={item.status} />
      </span>
      <div className="qs-copy">
        <p className="qs-title">{item.title}</p>
        {item.detail ? <p className="qs-detail">{item.detail}</p> : null}
        {item.status === "processing" ? (
          <div
            className="qs-progress"
            role="progressbar"
            aria-label={`${item.title} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              progress === null ? undefined : Math.round(progress * 100)
            }
            data-indeterminate={progress === null ? "true" : "false"}
          >
            <span
              style={
                progress === null
                  ? undefined
                  : { transform: `scaleX(${progress})` }
              }
            />
          </div>
        ) : null}
      </div>
      <div className="qs-actions">
        {item.action ? (
          <button
            type="button"
            className="qs-action"
            onClick={item.action.onClick}
            disabled={item.action.busy}
          >
            {item.action.busy ? "Working…" : item.action.label}
          </button>
        ) : null}
        {canDismiss ? (
          <button
            type="button"
            className="qs-dismiss"
            aria-label={`Dismiss ${item.title}`}
            onClick={() => dismiss()}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </li>
  );
}

/**
 * QUIET STATUS STACK
 *
 * A low-volume activity log for work that continues in the background.
 * Rows move with a small FLIP pass when one is added or removed, while
 * the new row enters on top of that movement. Success can auto-dismiss
 * and pauses on hover or focus; errors wait for a person. A single
 * polite live region announces state changes, never progress frames.
 */
export function QuietStatusStack({
  items,
  onDismiss,
  max = 4,
  label = "Background activity",
  className,
}: QuietStatusStackProps) {
  const visible = items.slice(0, Math.max(1, max));
  const nodes = useRef(new Map<string, HTMLElement>());
  const boxes = useRef(new Map<string, DOMRect>());
  const previous = useRef<string[]>([]);
  const live = useRef<HTMLParagraphElement>(null);
  const tones = useRef(new Map<string, StatusTone>());

  const register = (id: string, node: HTMLElement | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  };

  useLayoutEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const next = new Map<string, DOMRect>();
    for (const item of visible) {
      const node = nodes.current.get(item.id);
      if (!node) continue;
      next.set(item.id, node.getBoundingClientRect());
    }
    if (previous.current.length) {
      let index = 0;
      for (const item of visible) {
        const node = nodes.current.get(item.id);
        const before = boxes.current.get(item.id);
        if (!node || !before) {
          index += 1;
          continue;
        }
        const after = next.get(item.id);
        if (after && Math.abs(before.top - after.top) > 0.5) {
          node.animate(
            [
              { transform: `translateY(${before.top - after.top}px)` },
              { transform: "translateY(0)" },
            ],
            {
              duration: 260,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              delay: index < previous.current.length ? 0 : 30,
            },
          );
        }
        index += 1;
      }
      for (const item of visible) {
        if (!previous.current.includes(item.id) && nodes.current.get(item.id)) {
          nodes.current.get(item.id)!.animate(
            [
              { opacity: 0, transform: "translateY(-5px) scale(0.99)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        }
      }
    }
    boxes.current = next;
    previous.current = visible.map((item) => item.id);

    /* Announce transitions, not progress ticks. */
    let message = "";
    for (const item of visible) {
      const tone = tones.current.get(item.id);
      if (tone !== item.status) {
        tones.current.set(item.id, item.status);
        if (item.status === "success") message = `${item.title} finished.`;
        else if (item.status === "error")
          message = `${item.title} needs attention.`;
        else if (!tone && item.status === "processing")
          message = `${item.title} started.`;
      }
    }
    if (message && live.current) {
      live.current.textContent =
        live.current.textContent === message ? `${message}\u200B` : message;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map((item) => `${item.id}:${item.status}`).join("|")]);

  return (
    <div className={`qs-root${className ? ` ${className}` : ""}`}>
      <p ref={live} className="qs-live" aria-live="polite" aria-atomic="true" />
      <ul className="qs-list" aria-label={label}>
        {visible.map((item) => (
          <StatusRow
            key={item.id}
            item={item}
            onDismiss={onDismiss}
            register={register}
          />
        ))}
      </ul>
    </div>
  );
}
