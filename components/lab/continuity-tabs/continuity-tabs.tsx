"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "./continuity-tabs.css";

export type ContinuityTab = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type ContinuityTabsProps = {
  tabs: ContinuityTab[];
  /** Controlled active tab id. */
  value?: string;
  /** Initial tab id in uncontrolled use. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Accessible name for the tab list. */
  label?: string;
  /**
   * spring — a short, damped glide; fade — a calm crossfade;
   * none — instant, for low-power surfaces.
   */
  motion?: "spring" | "fade" | "none";
  className?: string;
};

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * CONTINUITY TABS
 *
 * The selection surface is one object: it is measured from the live tab
 * and moves with a damped spring. Content panels stay mounted, so their
 * internal state survives tab changes; only the active and outgoing
 * panels are painted. The viewport height follows the measured active
 * panel, which means a shorter panel does not yank the page upward.
 */
export function ContinuityTabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  label = "Tabs",
  motion = "spring",
  className,
}: ContinuityTabsProps) {
  const uid = useId();
  const enabled = tabs.filter((tab) => !tab.disabled);
  const firstId = enabled[0]?.id ?? tabs[0]?.id ?? "";
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? firstId);
  const requested = controlled ? value : internal;
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === requested && !tab.disabled),
  );
  const active = tabs[activeIndex];

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const [indicator, setIndicator] = useState({ x: 0, width: 0, ready: false });
  const [overflow, setOverflow] = useState({ left: false, right: false });
  const [height, setHeight] = useState<number | null>(null);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const outgoingTimer = useRef<number | null>(null);
  const panelAnimation = useRef<Animation | null>(null);

  const measureOverflow = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const next = {
      left: list.scrollLeft > 2,
      right: list.scrollLeft + list.clientWidth < list.scrollWidth - 2,
    };
    setOverflow((current) =>
      current.left === next.left && current.right === next.right
        ? current
        : next,
    );
  }, []);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const button = tabRefs.current.get(active?.id ?? "");
    if (!button) return;
    setIndicator({
      x: button.offsetLeft,
      width: button.offsetWidth,
      ready: true,
    });
    measureOverflow();
  }, [active?.id, measureOverflow]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const button of tabRefs.current.values()) observer.observe(button);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  /* Keep the active tab visible when the list overflows. */
  useEffect(() => {
    const button = tabRefs.current.get(active?.id ?? "");
    button?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active?.id]);

  /* The viewport height is the measured height of the active panel. */
  const measurePanel = useCallback(() => {
    const panel = panelRefs.current.get(active?.id ?? "");
    if (!panel) return;
    const next = panel.scrollHeight;
    setHeight((current) => (current === next ? current : next));
  }, [active?.id]);

  useLayoutEffect(() => {
    measurePanel();
    const panel = panelRefs.current.get(active?.id ?? "");
    if (!panel || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measurePanel);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [measurePanel, active?.id]);

  /* Animate the entering panel and retire the outgoing one. */
  const previousId = useRef(active?.id);
  useLayoutEffect(() => {
    if (!active) return;
    const previous = previousId.current;
    previousId.current = active.id;
    if (!previous || previous === active.id) return;

    const panel = panelRefs.current.get(active.id);
    const prevPanel = panelRefs.current.get(previous);
    const dir =
      tabs.findIndex((tab) => tab.id === active.id) >
      tabs.findIndex((tab) => tab.id === previous)
        ? 1
        : -1;
    setDirection(dir);
    setOutgoing(previous);

    panelAnimation.current?.cancel();
    if (panel && motion !== "none") {
      if (reducedMotion()) {
        panel.style.opacity = "1";
        panel.style.transform = "none";
      } else {
        panelAnimation.current = panel.animate(
          [
            {
              opacity: 0,
              transform: `translate3d(${dir * 18}px, 0, 0)`,
            },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: motion === "spring" ? 300 : 220,
            easing:
              motion === "spring"
                ? "cubic-bezier(0.16, 1, 0.3, 1)"
                : "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        );
      }
    }
    if (prevPanel && motion !== "none" && !reducedMotion()) {
      prevPanel.animate(
        [
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
          {
            opacity: 0,
            transform: `translate3d(${dir * -14}px, 0, 0)`,
          },
        ],
        {
          duration: motion === "spring" ? 230 : 180,
          easing: "cubic-bezier(0.4, 0, 1, 1)",
        },
      );
    }

    if (outgoingTimer.current !== null) window.clearTimeout(outgoingTimer.current);
    outgoingTimer.current = window.setTimeout(
      () => {
        setOutgoing(null);
        outgoingTimer.current = null;
      },
      motion === "none" ? 0 : 320,
    );
  }, [active, motion, tabs]);

  useEffect(
    () => () => {
      if (outgoingTimer.current !== null)
        window.clearTimeout(outgoingTimer.current);
      panelAnimation.current?.cancel();
    },
    [],
  );

  const select = (id: string, focus = false) => {
    if (controlled) onValueChange?.(id);
    else setInternal(id);
    if (focus) tabRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const selectable = tabs
      .map((tab, position) => ({ tab, position }))
      .filter(({ tab }) => !tab.disabled);
    if (selectable.length === 0) return;
    const current = selectable.findIndex(({ position }) => position === index);
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (current + 1) % selectable.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (current - 1 + selectable.length) % selectable.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = selectable.length - 1;
    if (next === null) return;
    event.preventDefault();
    const target = selectable[next];
    select(target.tab.id, true);
  };

  if (!active) return null;

  return (
    <div
      className={`ct-root${className ? ` ${className}` : ""}`}
      data-motion={motion}
    >
      <div className="ct-tablist-wrap" data-fade-left={overflow.left ? "true" : "false"} data-fade-right={overflow.right ? "true" : "false"}>
        <div
          ref={listRef}
          className="ct-tablist"
          role="tablist"
          aria-label={label}
          onScroll={measureOverflow}
        >
          {tabs.map((tab, index) => {
            const selected = tab.id === active.id;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(tab.id, node);
                  else tabRefs.current.delete(tab.id);
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${uid}-panel-${tab.id}`}
                aria-disabled={tab.disabled || undefined}
                disabled={tab.disabled}
                tabIndex={selected ? 0 : -1}
                className="ct-tab"
                onClick={() => select(tab.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                {tab.label}
              </button>
            );
          })}
          <span
            className="ct-indicator"
            aria-hidden="true"
            data-ready={indicator.ready ? "true" : "false"}
            style={{
              width: indicator.width,
              transform: `translate3d(${indicator.x}px, 0, 0)`,
            }}
          />
        </div>
      </div>
      <div
        className="ct-viewport"
        data-ready={height !== null ? "true" : "false"}
        style={height !== null ? { height } : undefined}
      >
        {tabs.map((tab) => {
          const selected = tab.id === active.id;
          const leaving = tab.id === outgoing;
          return (
            <div
              key={tab.id}
              ref={(node) => {
                if (node) panelRefs.current.set(tab.id, node);
                else panelRefs.current.delete(tab.id);
              }}
              className={`ct-panel${leaving ? " ct-panel--leaving" : ""}`}
              id={`${uid}-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${tab.id}`}
              aria-hidden={!selected}
              inert={!selected}
              hidden={!selected && !leaving}
              data-direction={direction}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
