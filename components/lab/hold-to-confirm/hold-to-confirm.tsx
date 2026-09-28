"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./hold-to-confirm.css";

export type HoldToConfirmVariant = "accent" | "danger";
export type HoldToConfirmProgress = "fill" | "ring";

export type HoldToConfirmProps = {
  /** Idle label, e.g. "Publish release". */
  label: string;
  /** Hold time in milliseconds before the action commits. */
  duration?: number;
  /** Fired exactly once per completed hold. */
  onConfirm?: () => void;
  /** Tone of the control; danger is reserved for destructive actions. */
  variant?: HoldToConfirmVariant;
  /** How the hold is drawn: a background fill or a ring next to the label. */
  progress?: HoldToConfirmProgress;
  /** Return to idle a moment after confirming. */
  resetAfterConfirm?: boolean;
  disabled?: boolean;
  className?: string;
};

type HoldPhase = "idle" | "holding" | "done";

/** How long a released, incomplete hold takes to ease back to zero. */
const CANCEL_EASE_MS = 180;
/** How long the "Done" state stays before returning to idle. */
const DONE_RESET_MS = 1200;

function isHoldKey(key: string) {
  return key === " " || key === "Enter";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * HOLD TO CONFIRM — deliberate friction for consequential actions.
 *
 * Press and hold (pointer, touch or a held Space / Enter) and a real
 * progress reading advances over `duration`; releasing early eases the
 * progress back and announces the cancel, while a completed hold fires
 * `onConfirm` exactly once and shows a done state. Every loop is
 * frame-rate independent (real elapsed time), and cancels on release,
 * on blur, on hidden tabs and on unmount.
 */
export function HoldToConfirm({
  label,
  duration = 900,
  onConfirm,
  variant = "accent",
  progress = "fill",
  resetAfterConfirm = true,
  disabled = false,
  className,
}: HoldToConfirmProps) {
  const [phase, setPhase] = useState<HoldPhase>("idle");
  const [announcement, setAnnouncement] = useState("");

  const rootRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const doneTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef(0);
  const holdFromRef = useRef(0);
  const progressRef = useRef(0);
  const lastPctRef = useRef(-1);
  const phaseRef = useRef<HoldPhase>("idle");
  const durationRef = useRef(duration);
  const confirmRef = useRef(onConfirm);
  const resetRef = useRef(resetAfterConfirm);
  const disabledRef = useRef(disabled);
  const descId = useId();

  useEffect(() => {
    durationRef.current = duration;
    confirmRef.current = onConfirm;
    resetRef.current = resetAfterConfirm;
    disabledRef.current = disabled;
  });

  /** Writes the live progress to the CSS variable and the ARIA bar. */
  const writeProgress = useCallback((value: number) => {
    const p = Math.min(1, Math.max(0, value));
    progressRef.current = p;
    rootRef.current?.style.setProperty("--hold-progress", p.toFixed(4));
    const bar = barRef.current;
    if (!bar) return;
    const pct = Math.round(p * 100);
    if (pct !== lastPctRef.current) {
      lastPctRef.current = pct;
      bar.setAttribute("aria-valuenow", String(pct));
      bar.setAttribute("aria-valuetext", `${pct}%`);
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const clearDoneTimer = useCallback(() => {
    if (doneTimerRef.current !== null) {
      window.clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
  }, []);

  /* Re-announces a repeated message by alternating an invisible char. */
  const announce = useCallback((text: string) => {
    setAnnouncement((current) => (current === text ? `${text}\u200B` : text));
  }, []);

  const complete = useCallback(() => {
    stopLoop();
    writeProgress(1);
    phaseRef.current = "done";
    setPhase("done");
    announce("Done");
    confirmRef.current?.();
    if (resetRef.current) {
      doneTimerRef.current = window.setTimeout(() => {
        doneTimerRef.current = null;
        phaseRef.current = "idle";
        setPhase("idle");
        writeProgress(0);
      }, DONE_RESET_MS);
    }
  }, [announce, stopLoop, writeProgress]);

  const startHold = useCallback(() => {
    if (disabledRef.current || phaseRef.current === "holding") return;
    stopLoop();
    clearDoneTimer();
    if (phaseRef.current === "done") {
      lastPctRef.current = -1;
      writeProgress(0);
    }
    phaseRef.current = "holding";
    setPhase("holding");

    holdFromRef.current = progressRef.current;
    holdStartRef.current =
      performance.now() - holdFromRef.current * Math.max(1, durationRef.current);

    const step = (now: number) => {
      const ms = Math.max(1, durationRef.current);
      const value = holdFromRef.current + (now - holdStartRef.current) / ms;
      if (value >= 1) {
        rafRef.current = null;
        complete();
        return;
      }
      writeProgress(value);
      rafRef.current = window.requestAnimationFrame(step);
    };
    rafRef.current = window.requestAnimationFrame(step);
  }, [clearDoneTimer, complete, stopLoop, writeProgress]);

  const release = useCallback(() => {
    if (phaseRef.current !== "holding") return;
    stopLoop();
    phaseRef.current = "idle";
    setPhase("idle");
    announce("Cancelled");

    const from = progressRef.current;
    if (from <= 0) return;
    if (prefersReducedMotion()) {
      writeProgress(0);
      return;
    }

    const started = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / CANCEL_EASE_MS);
      if (t >= 1) {
        rafRef.current = null;
        writeProgress(0);
        return;
      }
      const eased = 1 - Math.pow(1 - t, 3);
      writeProgress(from * (1 - eased));
      rafRef.current = window.requestAnimationFrame(step);
    };
    rafRef.current = window.requestAnimationFrame(step);
  }, [announce, stopLoop, writeProgress]);

  /* Cancel when the window loses focus or the tab is hidden. */
  useEffect(() => {
    const onBlur = () => release();
    const onVisibility = () => {
      if (document.hidden) release();
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [release]);

  /* Cancel if the host disables the control mid-hold. */
  useEffect(() => {
    if (disabled) release();
  }, [disabled, release]);

  /* Never leave a frame loop or timer behind. */
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (doneTimerRef.current !== null) window.clearTimeout(doneTimerRef.current);
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabledRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Capture is an enhancement; the pointerdown still starts the hold. */
    }
    startHold();
  };

  const endPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* The capture may already be gone. */
    }
    release();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabledRef.current || !isHoldKey(event.key)) return;
    /* Space would scroll the page; Enter would synthesise a click early. */
    if (event.key !== "Enter") event.preventDefault();
    if (event.repeat) return;
    startHold();
  };

  const onKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!isHoldKey(event.key)) return;
    release();
  };

  const seconds = (Math.max(1, duration) / 1000).toFixed(1);

  return (
    <span
      ref={rootRef}
      className={`hc-root${className ? ` ${className}` : ""}`}
      data-phase={phase}
      data-variant={variant}
      data-progress={progress}
    >
      <button
        type="button"
        className="hc-button"
        disabled={disabled}
        aria-describedby={descId}
        aria-label={phase === "done" ? `${label} — done` : undefined}
        onPointerDown={onPointerDown}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <span className="hc-fill" aria-hidden="true" />
        <span className="hc-face">
          {phase === "done" ? (
            <>
              <svg
                className="hc-check"
                viewBox="0 0 16 16"
                width="15"
                height="15"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M3 8.5 6.2 11.6 13 4.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hc-label">Done</span>
            </>
          ) : (
            <>
              {progress === "ring" ? (
                <svg
                  className="hc-ring"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle className="hc-ring-track" cx="12" cy="12" r="9" />
                  <circle className="hc-ring-arc" cx="12" cy="12" r="9" />
                </svg>
              ) : null}
              <span className="hc-label">{label}</span>
            </>
          )}
        </span>
      </button>

      <span
        ref={barRef}
        className="hc-sr"
        role="progressbar"
        aria-label={`Hold progress for ${label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext="0%"
      />
      <span className="hc-sr" id={descId}>
        Press and hold for about {seconds} seconds to confirm. Release early to
        cancel.
      </span>
      <span className="hc-sr" role="status" aria-live="polite">
        {announcement}
      </span>
    </span>
  );
}
