"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./shared-moment-gallery.css";

export type MomentItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  caption: string;
  /** The image, illustration or composition shown in both sizes. */
  visual: ReactNode;
  /** A short description for people who cannot see the visual. */
  alt: string;
  /** Optional editorial emphasis for the thumbnail ratio. */
  span?: "standard" | "tall" | "wide";
};

export type SharedMomentGalleryProps = {
  items: MomentItem[];
  label?: string;
  layout?: "editorial" | "uniform";
  captions?: boolean;
  className?: string;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

let locks = 0;
let release: (() => void) | null = null;

function lockPage() {
  if (typeof document === "undefined") return () => {};
  locks += 1;
  if (locks === 1) {
    const body = document.body;
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    const before = {
      body: body.style.overflow,
      padding: body.style.paddingRight,
      html: html.style.overflow,
    };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    release = () => {
      body.style.overflow = before.body;
      body.style.paddingRight = before.padding;
      html.style.overflow = before.html;
      release = null;
    };
  }
  let done = false;
  return () => {
    if (done) return;
    done = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) release?.();
  };
}

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
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
 * SHARED MOMENT GALLERY
 *
 * Opening a card lifts its media from the thumbnail's exact rectangle
 * into the detail panel with a FLIP measurement, while the caption
 * arrives in a deliberate sequence. Closing runs the same path back to
 * the source card. The detail view is a modal dialog with contained
 * focus, Escape/arrow keys and a stable non-View-Transition fallback.
 */
export function SharedMomentGallery({
  items,
  label = "Gallery",
  layout = "editorial",
  captions = true,
  className,
}: SharedMomentGalleryProps) {
  const uid = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const ready = useClientReady();
  const source = useRef<{ node: HTMLElement; rect: DOMRect } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousIndex = useRef<number | null>(null);
  const dialogTitle = useRef<HTMLHeadingElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (selected === null) return;
    return lockPage();
  }, [selected]);

  useEffect(() => {
    if (selected === null) return;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [selected]);

  const open = (index: number, node: HTMLElement) => {
    source.current = { node, rect: node.getBoundingClientRect() };
    previousIndex.current = null;
    setClosing(false);
    setSelected(index);
  };

  const close = useCallback(() => {
    if (selected === null || closing) return;
    setClosing(true);
    const node = source.current?.node;
    const media = mediaRef.current;
    const reduced = prefersReduced();
    const duration = reduced ? 0 : 300;

    const finish = () => {
      setSelected(null);
      setClosing(false);
      const target = source.current?.node;
      if (target?.isConnected) target.focus();
    };

    if (node && media && !reduced) {
      const from = media.getBoundingClientRect();
      const to = node.getBoundingClientRect();
      const dx = to.left - from.left;
      const dy = to.top - from.top;
      const sx = to.width / Math.max(from.width, 1);
      const sy = to.height / Math.max(from.height, 1);
      media.animate(
        [
          { transform: "none", opacity: 1 },
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            opacity: 0.65,
          },
        ],
        { duration, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );
    }

    closeTimer.current = window.setTimeout(finish, duration + 20);
  }, [selected, closing]);

  const go = (delta: number) => {
    if (selected === null) return;
    previousIndex.current = selected;
    setSelected((current) =>
      current === null
        ? null
        : (current + delta + items.length) % items.length,
    );
  };

  const onKeyDown = (event: {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
  }) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
      return;
    }
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (node) => node.getClientRects().length > 0,
    );
    if (!nodes.length) return;
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

  useEffect(() => {
    if (selected === null) return;
    const handler = (event: globalThis.KeyboardEvent) => {
      onKeyDown(event);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, closing, items.length]);

  /* The media flight happens after the dialog has a real layout. */
  useLayoutEffect(() => {
    if (selected === null || closing) return;
    const media = mediaRef.current;
    if (!media) return;
    const reduced = prefersReduced();
    if (reduced) return;
    if (previousIndex.current === null) {
      const rect = source.current?.rect;
      if (!rect) return;
      const target = media.getBoundingClientRect();
      const dx = rect.left - target.left;
      const dy = rect.top - target.top;
      const sx = rect.width / Math.max(target.width, 1);
      const sy = rect.height / Math.max(target.height, 1);
      media.animate(
        [
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            borderRadius: "8px",
          },
          { transform: "none", borderRadius: "3px" },
        ],
        {
          duration: 430,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
      );
    } else {
      media.animate(
        [
          { opacity: 0, transform: "scale(1.012)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
    previousIndex.current = selected;
  }, [selected, closing]);

  const item = selected === null ? null : items[selected];

  return (
    <div
      className={`smg-root${className ? ` ${className}` : ""}`}
      data-layout={layout}
    >
      <ul className="smg-grid" aria-label={label}>
        {items.map((entry, index) => (
          <li
            key={entry.id}
            className="smg-cell"
            data-span={entry.span ?? "standard"}
          >
            <button
              type="button"
              className="smg-card"
              onClick={(event) => open(index, event.currentTarget)}
              aria-label={`${entry.title}, ${entry.category}. Open study.`}
              data-active={
                selected === index && !closing ? "true" : "false"
              }
            >
              <span className="smg-thumb" aria-hidden="true">
                {entry.visual}
              </span>
              <span className="smg-card-meta">
                <span className="smg-card-title">{entry.title}</span>
                <span className="smg-card-line">
                  {entry.category}
                  {captions ? ` · ${entry.date}` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {ready && item && selected !== null
        ? createPortal(
            <div
              className="smg-overlay"
              data-closing={closing ? "true" : "false"}
            >
              <div
                className="smg-backdrop"
                aria-hidden="true"
                onClick={() => {
                  if (!closing) close();
                }}
              />
              <div
                ref={panelRef}
                className="smg-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${uid}-title`}
                aria-describedby={`${uid}-caption`}
                tabIndex={-1}
              >
                <div ref={mediaRef} className="smg-detail-media" aria-hidden="true">
                  {item.visual}
                </div>
                <div className="smg-detail">
                  <div className="smg-detail-top">
                    <span className="smg-counter">
                      {String(selected + 1).padStart(2, "0")} /{" "}
                      {String(items.length).padStart(2, "0")}
                    </span>
                    <button
                      ref={closeRef}
                      type="button"
                      className="smg-close"
                      onClick={close}
                      aria-label="Close study"
                    >
                      Close
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
                  </div>
                  <div className="smg-detail-meta" key={item.id}>
                    <p className="smg-detail-category">{item.category}</p>
                    <h2 id={`${uid}-title`} ref={dialogTitle} tabIndex={-1}>
                      {item.title}
                    </h2>
                    <p className="smg-detail-date">{item.date}</p>
                    <p id={`${uid}-caption`} className="smg-caption">
                      {item.caption}
                    </p>
                    <p className="smg-alt">{item.alt}</p>
                  </div>
                  <div className="smg-nav">
                    <button type="button" onClick={() => go(-1)} aria-label="Previous study">
                      <span aria-hidden="true">←</span> Previous
                    </button>
                    <button type="button" onClick={() => go(1)} aria-label="Next study">
                      Next <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
