"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./chapter-rail.css";

export type Chapter = {
  /** The id of the section this chapter points at. */
  id: string;
  label: string;
  /** Optional fuller title, used as the link's accessible name. */
  title?: string;
};

export type ChapterRailProps = {
  chapters: Chapter[];
  /** Accessible name for the navigation landmark. */
  label?: string;
  /** Show 01, 02… beside each label. */
  numbered?: boolean;
  /**
   * The element that owns scrolling. Omit to let the rail find the
   * nearest scrollable ancestor, then fall back to the window.
   */
  scrollContainer?: HTMLElement | null;
  className?: string;
};

function isScrollable(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return (
    /(auto|scroll|overlay)/.test(style.overflowY) &&
    element.scrollHeight > element.clientHeight + 2
  );
}

function findScroller(start: HTMLElement | null): HTMLElement | Window {
  let node = start?.parentElement ?? null;
  while (node && node !== document.body) {
    if (isScrollable(node)) return node;
    node = node.parentElement;
  }
  return window;
}

/**
 * CHAPTER RAIL
 *
 * A reading map that follows the section you are actually in. The
 * marker is interpolated from the section's own scroll progress, so it
 * keeps moving while you read instead of jumping at section boundaries.
 * Scrolling is entirely native: links are ordinary anchors, there is no
 * snap and no scroll listener that writes to scrollTop.
 */
export function ChapterRail({
  chapters,
  label = "Chapters",
  numbered = true,
  scrollContainer,
  className,
}: ChapterRailProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(0);
  const [progress, setProgress] = useState(0);
  const [horizontal, setHorizontal] = useState(false);
  const frame = useRef<number | null>(null);
  const scroller = useRef<HTMLElement | Window | null>(null);
  const activeId = chapters[active]?.id;

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || chapters.length === 0) return;
    const owner = scroller.current;
    const isWindow = owner === window;
    const container = isWindow ? null : (owner as HTMLElement);
    const doc = root.ownerDocument;

    const containerTop = container
      ? container.getBoundingClientRect().top
      : 0;
    const scrollTop = isWindow ? window.scrollY : container!.scrollTop;
    const viewportHeight = isWindow
      ? window.innerHeight
      : container!.clientHeight;
    const anchorLine = scrollTop + Math.min(viewportHeight * 0.34, 320);

    const sections = chapters.map((chapter) =>
      doc.getElementById(chapter.id),
    );
    let index = 0;
    for (let i = 0; i < sections.length; i += 1) {
      const section = sections[i];
      if (!section) continue;
      const top =
        section.getBoundingClientRect().top - containerTop + scrollTop;
      if (top <= anchorLine) index = i;
    }

    const current = sections[index];
    const next = sections[index + 1];
    const currentTop = current
      ? current.getBoundingClientRect().top - containerTop + scrollTop
      : 0;
    const currentHeight = current?.offsetHeight ?? 1;
    const local = Math.max(
      0,
      Math.min(1, (anchorLine - currentTop) / Math.max(currentHeight, 1)),
    );

    /* A last section has no successor: let it hold the end of the rail. */
    const span = index + (next ? local : 1);
    const ratio = chapters.length <= 1 ? 0 : span / (chapters.length - 1);

    const track = trackRef.current;
    const rails = chapters
      .map((chapter) => linkRefs.current.get(chapter.id))
      .filter((node): node is HTMLAnchorElement => Boolean(node));
    if (track && rails.length) {
      const trackRect = track.getBoundingClientRect();
      const centers = rails.map((node) => {
        const rect = node.getBoundingClientRect();
        return horizontal
          ? rect.left + rect.width / 2 - trackRect.left
          : rect.top + rect.height / 2 - trackRect.top;
      });
      const first = centers[0];
      const last = centers[centers.length - 1];
      const safe = Math.max(0, Math.min(1, ratio));
      setPosition(first + safe * (last - first));
      setProgress(safe);
    }
    setActive(index);
  }, [chapters, horizontal]);

  const schedule = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      measure();
    });
  }, [measure]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const owner = scrollContainer ?? findScroller(root);
    scroller.current = owner;
    const target = owner === window ? window : owner;

    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const media = window.matchMedia("(max-width: 720px)");
    const syncOrientation = () => {
      setHorizontal(media.matches);
      window.requestAnimationFrame(measure);
    };
    syncOrientation();
    media.addEventListener?.("change", syncOrientation);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(schedule);
      observer.observe(root);
      const doc = root.ownerDocument;
      for (const chapter of chapters) {
        const section = doc.getElementById(chapter.id);
        if (section) observer.observe(section);
      }
    }
    window.requestAnimationFrame(measure);

    return () => {
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener?.("change", syncOrientation);
      observer?.disconnect();
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [chapters, measure, schedule, scrollContainer]);

  const style = {
    "--cr-pos": `${position}px`,
    "--cr-progress": progress,
  } as CSSProperties;

  useEffect(() => {
    if (!horizontal) return;
    const link = linkRefs.current.get(activeId ?? "");
    link?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId, horizontal]);

  return (
    <nav
      ref={rootRef}
      className={`cr-root${className ? ` ${className}` : ""}`}
      aria-label={label}
      data-horizontal={horizontal ? "true" : "false"}
      style={style}
    >
      <p className="cr-kicker">Reading map</p>
      <div ref={trackRef} className="cr-track" aria-hidden="true">
        <span className="cr-line" />
        <span className="cr-line cr-line--progress" />
        <span className="cr-marker" />
      </div>
      <ol className="cr-list" onScroll={schedule}>
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              ref={(node) => {
                if (node) linkRefs.current.set(chapter.id, node);
                else linkRefs.current.delete(chapter.id);
              }}
              href={`#${chapter.id}`}
              aria-current={index === active ? "location" : undefined}
              aria-label={chapter.title ?? chapter.label}
            >
              {numbered ? (
                <span className="cr-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : null}
              <span className="cr-label">{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
