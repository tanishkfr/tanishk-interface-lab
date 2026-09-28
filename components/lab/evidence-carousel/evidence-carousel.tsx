"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "./evidence-carousel.css";

export type CarouselItem = {
  id: string;
  caption: string;
  meta?: string;
  /** Any node: an image, a video poster, a live component. */
  content: ReactNode;
};

type EvidenceCarouselProps = {
  items: CarouselItem[];
  /** Accessible name for the carousel region. */
  label: string;
  /** CSS aspect-ratio applied to every slide. */
  ratio?: string;
  /** Show the neighbouring slides at the viewport edges. */
  peek?: boolean;
  /** Wrap from last to first when the buttons are used. */
  loop?: boolean;
  /** Show the caption row under the strip. */
  captions?: boolean;
  onIndexChange?: (index: number) => void;
  className?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * EVIDENCE CAROUSEL — one large view at a time.
 *
 * The strip is a plain horizontal scroller with scroll-snap: the
 * browser owns the touch gesture and the layout, the index is derived
 * from where the strip has come to rest, and the buttons and arrow keys
 * drive the same scroll position — so every way of moving it stays in
 * sync. Nothing advances on its own; the reader is the only thing that
 * moves this.
 */
export function EvidenceCarousel({
  items,
  label,
  ratio = "16 / 10",
  peek = true,
  loop = false,
  captions = true,
  onIndexChange,
  className,
}: EvidenceCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const reducedRef = useRef(false);
  const jumpRef = useRef(true);

  /* The strip's own geometry is the source of truth. Positions are
     measured against the viewport box rather than offsetLeft, so the
     centring is correct wherever the carousel sits on the page. */
  const slideCentre = useCallback((slide: HTMLElement, viewport: HTMLElement) => {
    const slideBox = slide.getBoundingClientRect();
    const viewportBox = viewport.getBoundingClientRect();
    return (
      slideBox.left - viewportBox.left + viewport.scrollLeft + slideBox.width / 2
    );
  }, []);

  const activeFromScroll = useCallback((): number => {
    const viewport = viewportRef.current;
    if (!viewport) return 0;
    const slides = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-ec-slide]"),
    );
    const centre = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    slides.forEach((slide, slideIndex) => {
      const distance = Math.abs(slideCentre(slide, viewport) - centre);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = slideIndex;
      }
    });
    return best;
  }, [slideCentre]);

  const goTo = useCallback(
    (next: number, smooth = true) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const slides = Array.from(
        viewport.querySelectorAll<HTMLElement>("[data-ec-slide]"),
      );
      if (slides.length === 0) return;
      const clamped = loop
        ? ((next % slides.length) + slides.length) % slides.length
        : Math.max(0, Math.min(slides.length - 1, next));
      const slide = slides[clamped];
      if (!slide) return;
      const left =
        slideCentre(slide, viewport) - viewport.clientWidth / 2;
      viewport.scrollTo({
        left,
        behavior: reducedRef.current || !smooth ? "auto" : "smooth",
      });
    },
    [loop, slideCentre],
  );

  /* the index follows the strip */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = motion.matches;
    const onMotion = () => {
      reducedRef.current = motion.matches;
    };
    motion.addEventListener("change", onMotion);

    let frame = 0;
    const measure = () => {
      frame = 0;
      setIndex(activeFromScroll());
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (jumpRef.current) {
      jumpRef.current = false;
      goTo(0, false);
    }
    measure();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", onMotion);
    };
  }, [activeFromScroll, goTo]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  /* a mouse drag moves the strip; touch already scrolls natively */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let travelled = 0;

    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      travelled = 0;
      startX = event.clientX;
      startLeft = viewport.scrollLeft;
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = "true";
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      travelled = Math.max(travelled, Math.abs(dx));
      viewport.scrollLeft = startLeft - dx;
    };
    const up = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete viewport.dataset.dragging;
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      if (travelled > 6) goTo(activeFromScroll());
    };

    viewport.addEventListener("pointerdown", down);
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", up);
    viewport.addEventListener("pointercancel", up);
    return () => {
      viewport.removeEventListener("pointerdown", down);
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", up);
      viewport.removeEventListener("pointercancel", up);
    };
  }, [goTo, activeFromScroll]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(items.length - 1);
    }
  };

  if (items.length === 0) return null;

  const atStart = !loop && index === 0;
  const atEnd = !loop && index === items.length - 1;

  return (
    <section
      className={`lab-carousel${className ? ` ${className}` : ""}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      data-peek={peek ? "true" : "false"}
    >
      <div
        className="lab-carousel-viewport"
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`${label}: ${items.length} slides. Use the previous and next buttons or the arrow keys.`}
      >
        <ul className="lab-carousel-track">
          {items.map((item, itemIndex) => (
            <li
              className="lab-carousel-slide"
              key={item.id}
              data-ec-slide
              data-active={itemIndex === index ? "true" : "false"}
              aria-label={`${itemIndex + 1} of ${items.length}: ${item.caption}`}
              aria-roledescription="slide"
              role="group"
              style={{ "--ec-ratio": ratio } as CSSProperties}
            >
              <div className="lab-carousel-media">{item.content}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lab-carousel-bar">
        <div className="lab-carousel-controls">
          <button
            type="button"
            className="lab-carousel-btn"
            onClick={() => goTo(index - 1)}
            disabled={atStart}
            aria-label="Previous slide"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="lab-carousel-btn"
            onClick={() => goTo(index + 1)}
            disabled={atEnd}
            aria-label="Next slide"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {captions ? (
          <p className="lab-carousel-caption" aria-live="polite">
            <span className="lab-carousel-caption-text">
              {items[index]?.caption ?? ""}
            </span>
            {items[index]?.meta ? (
              <span className="lab-carousel-meta">{items[index]?.meta}</span>
            ) : null}
          </p>
        ) : (
          <span className="lab-carousel-caption" />
        )}

        <p className="lab-carousel-count">
          <span className="lab-carousel-count-now">{pad(index + 1)}</span>
          <span aria-hidden="true" className="lab-carousel-count-sep">
            /
          </span>
          <span>{pad(items.length)}</span>
        </p>
      </div>

      <div className="lab-carousel-progress" aria-hidden="true">
        <span
          style={{ transform: `scaleX(${(index + 1) / items.length})` }}
        />
      </div>
    </section>
  );
}
