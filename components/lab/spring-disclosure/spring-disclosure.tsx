"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import "./spring-disclosure.css";

const noopSubscribe = () => () => {};
function useClientReady() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
export type DisclosureItem = {
  id: string;
  title: string;
  content: ReactNode;
  /** A short line under the title, visible while collapsed. */
  summary?: string;
  disabled?: boolean;
};

export type SpringDisclosureProps = {
  items: DisclosureItem[];
  /** single closes the previous panel when another opens. */
  mode?: "single" | "multiple";
  /** Controlled open ids. */
  value?: string[];
  defaultOpen?: string[];
  onValueChange?: (ids: string[]) => void;
  className?: string;
};

function DisclosureRow({
  item,
  open,
  onToggle,
}: {
  item: DisclosureItem;
  open: boolean;
  onToggle: () => void;
}) {
  const uid = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const mounted = useClientReady();

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setHeight(content.scrollHeight);
    measure();
    if (!open || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [open, item.content]);

  useEffect(() => {
    if (!open && contentRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
  }, [open]);

  return (
    <div
      className="sd-item"
      data-open={open ? "true" : "false"}
      data-disabled={item.disabled ? "true" : "false"}
      data-ready={mounted ? "true" : "false"}
    >
      <h3 className="sd-heading">
        <button
          ref={triggerRef}
          type="button"
          id={`${uid}-trigger`}
          className="sd-trigger"
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          disabled={item.disabled}
          onClick={onToggle}
        >
          <span className="sd-text">
            <span className="sd-title">{item.title}</span>
            {item.summary ? (
              <span className="sd-summary">{item.summary}</span>
            ) : null}
          </span>
          <span className="sd-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </h3>
      <div
        id={`${uid}-panel`}
        className="sd-panel"
        role="region"
        aria-labelledby={`${uid}-trigger`}
        aria-hidden={!open}
        inert={!open}
        style={{ height: open ? height : 0 }}
      >
        <div ref={contentRef} className="sd-content">
          {item.content}
        </div>
      </div>
    </div>
  );
}

/**
 * SPRING DISCLOSURE
 *
 * Each panel interpolates between measured content heights; the icon,
 * rule, spacing and copy all settle together. Content is observed while
 * open, so a list that grows still fits. When a panel closes with focus
 * inside it, focus returns to its trigger instead of disappearing into
 * the document.
 */
export function SpringDisclosure({
  items,
  mode = "single",
  value,
  defaultOpen,
  onValueChange,
  className,
}: SpringDisclosureProps) {
  const [internal, setInternal] = useState<string[]>(
    defaultOpen ?? (items[0] ? [items[0].id] : []),
  );
  const controlled = value !== undefined;
  const rawOpen = (controlled ? value : internal).filter((id) =>
    items.some((item) => item.id === id && !item.disabled),
  );
  const open =
    mode === "single" && rawOpen.length > 1
      ? [rawOpen[rawOpen.length - 1]]
      : rawOpen;

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    let next: string[];
    if (mode === "single") next = isOpen ? [] : [id];
    else next = isOpen ? open.filter((entry) => entry !== id) : [...open, id];
    if (controlled) onValueChange?.(next);
    else setInternal(next);
  };

  return (
    <div className={`sd-root${className ? ` ${className}` : ""}`} data-mode={mode}>
      {items.map((item) => (
        <DisclosureRow
          key={item.id}
          item={item}
          open={open.includes(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}
