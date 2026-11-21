"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./elastic-sheet.css";

export type ElasticSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Clicking the backdrop closes the sheet. Default true. */
  closeOnBackdrop?: boolean;
  /** Drag the mobile grab handle down to dismiss. Default false. */
  swipeToDismiss?: boolean;
  /** A wider desktop sheet; mobile remains a bottom sheet. */
  size?: "regular" | "wide";
  className?: string;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

let lockCount = 0;
let restoreBody: (() => void) | null = null;

function lockPage() {
  if (typeof document === "undefined") return () => {};
  lockCount += 1;
  if (lockCount === 1) {
    const body = document.body;
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPadding: body.style.paddingRight,
      htmlOverflow: html.style.overflow,
    };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    restoreBody = () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPadding;
      html.style.overflow = previous.htmlOverflow;
      restoreBody = null;
    };
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) restoreBody?.();
  };
}

const noopSubscribe = () => () => {};
function useClientReady() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * ELASTIC SHEET
 *
 * A side sheet on a wide viewport and a bottom sheet on a narrow one.
 * The panel lands with a short damped spring; the backdrop only changes
 * opacity, so the page behind keeps its context. Focus is trapped while
 * open, Escape closes, and focus returns to the trigger. The mobile
 * grab handle is inert unless `swipeToDismiss` is explicitly enabled.
 */
export function ElasticSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeOnBackdrop = true,
  swipeToDismiss = false,
  size = "regular",
  className,
}: ElasticSheetProps) {
  const uid = useId();
  const ready = useClientReady();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(open);
  const drag = useRef({ startY: 0, delta: 0, active: false });

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const panel = panelRef.current;
      if (panel) {
        panel.style.transform = "";
        panel.style.transition = "";
      }
      const timer = window.setTimeout(() => closeRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
    if (!wasOpen.current) return;
    const target = returnFocus.current;
    const timer = window.setTimeout(() => {
      if (target?.isConnected) target.focus();
    }, 20);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    return lockPage();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => node.getClientRects().length > 0,
      );
      if (!nodes.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const onBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnBackdrop) close();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeToDismiss || event.pointerType === "mouse") return;
    drag.current = { startY: event.clientY, delta: 0, active: true };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const panel = panelRef.current;
    if (!panel) return;
    const delta = Math.max(0, event.clientY - drag.current.startY);
    drag.current.delta = delta;
    panel.style.transition = "none";
    panel.style.transform = `translate3d(0, ${delta}px, 0)`;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    const panel = panelRef.current;
    const delta = drag.current.delta;
    drag.current.active = false;
    if (panel) {
      panel.style.transition = "";
      panel.style.transform = "";
    }
    if (delta > 92) close();
  };

  if (!ready) return null;

  return createPortal(
    <div
      className="es-root"
      data-visible={open ? "true" : "false"}
      data-size={size}
      inert={!open}
      aria-hidden={!open}
    >
      <div className="es-backdrop" aria-hidden="true" onClick={onBackdrop} />
      <div
        ref={panelRef}
        className={`es-panel${className ? ` ${className}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        aria-describedby={description ? `${uid}-description` : undefined}
        tabIndex={-1}
      >
        <div
          className="es-grab"
          aria-hidden="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span />
          <i />
          <i />
        </div>
        <header className="es-head">
          <div>
            <h2 id={`${uid}-title`}>{title}</h2>
            {description ? <p id={`${uid}-description`}>{description}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="es-close"
            aria-label="Close sheet"
            onClick={close}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path
                d="M5 5l10 10M15 5L5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="es-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
