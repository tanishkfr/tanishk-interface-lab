"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import "./command-menu.css";

export type CommandItem = {
  id: string;
  label: string;
  group: string;
  keywords?: string[];
  description?: string;
  shortcut?: string;
  preview?: ReactNode;
  run?: () => void;
  disabled?: boolean;
};

export type CommandMenuProps = {
  /** Controlled visibility. The menu renders nothing while closed. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  /**
   * `true` binds ⌘K / Ctrl+K while mounted. A string rebinds the key
   * (`"p"` → ⌘P), keeping the same modifiers.
   */
  hotkey?: boolean | string;
  /** Shows the selected command’s preview/description pane. */
  previewPanel?: boolean;
  /** Fixed group order; otherwise first-seen order is kept. */
  groups?: string[];
  density?: "compact" | "roomy";
  /** Called before the menu closes, after `item.run()`. */
  onRun?: (item: CommandItem) => void;
  className?: string;
};

type RankedItem = { item: CommandItem; index: number; rank: number };

type CommandGroup = { group: string; items: CommandItem[] };

const HOTKEY_FALLBACK = "k";

/**
 * Match a query against one command. Lower is better; -1 means no
 * match. Labels outrank metadata, and exact/prefix hits float up.
 */
function rankMatch(item: CommandItem, query: string): number {
  const label = item.label.toLowerCase();
  if (label === query) return 0;
  if (label.startsWith(query)) return 1;
  if (label.includes(query)) return 2;
  const metadata = [item.group, ...(item.keywords ?? []), item.description ?? ""];
  if (metadata.join(" \u0000 ").toLowerCase().includes(query)) return 3;
  return -1;
}

/**
 * Filter and regroup. Group order follows the `groups` prop when
 * provided, otherwise the order groups first appear in `items` — a
 * stable order, so the list never reshuffles between keystrokes.
 */
function buildGroups(
  items: CommandItem[],
  query: string,
  groups?: string[],
): CommandGroup[] {
  const q = query.trim().toLowerCase();
  const ranked: RankedItem[] = items.map((item, index) => ({
    item,
    index,
    rank: q ? rankMatch(item, q) : 0,
  }));
  const matched = q
    ? ranked
        .filter((entry) => entry.rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
    : ranked;

  const seen: string[] = [];
  for (const item of items) {
    if (!seen.includes(item.group)) seen.push(item.group);
  }
  const order = groups && groups.length > 0
    ? [
        ...groups.filter((group) => seen.includes(group)),
        ...seen.filter((group) => !groups.includes(group)),
      ]
    : seen;

  return order
    .map((group) => ({
      group,
      items: matched
        .filter((entry) => entry.item.group === group)
        .map((entry) => entry.item),
    }))
    .filter((entry) => entry.items.length > 0);
}

function firstEnabledId(items: CommandItem[]): string | null {
  return items.find((item) => !item.disabled)?.id ?? null;
}

/**
 * COMMAND MENU — a ⌘K palette that keeps its spatial structure.
 *
 * Results stay grouped instead of collapsing into one flat list, and
 * the highlighted command previews its effect before it runs. Filtering
 * is synchronous and untransitioned: the list is a plain re-render, so
 * keystrokes never queue behind animation. The listbox follows the
 * combobox pattern — focus stays in the search input and the active
 * option is tracked with aria-activedescendant — so ↑↓/Home/End and
 * screen-reader announcements read the same structure.
 */
export function CommandMenu({
  open,
  onOpenChange,
  items,
  hotkey = true,
  previewPanel = true,
  groups,
  density = "compact",
  onRun,
  className,
}: CommandMenuProps) {
  const listId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [query, setQuery] = useState("");
  // Opening directly (mount with `open`) still starts with a
  // highlighted command on the very first painted frame.
  const [activeId, setActiveId] = useState<string | null>(() =>
    open ? firstEnabledId(items) : null,
  );

  const results = useMemo(
    () => buildGroups(items, query, groups),
    [items, query, groups],
  );
  const flatItems = useMemo(
    () => results.flatMap((entry) => entry.items),
    [results],
  );
  const activeItem = activeId
    ? flatItems.find((item) => item.id === activeId) ?? null
    : null;

  // Reset the search the moment the menu opens, during the render
  // itself, so the first painted frame never shows the old query.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setQuery("");
      setActiveId(firstEnabledId(items));
    }
  }

  // Open: capture whatever was focused, move focus into the input.
  // Close: hand focus back — but never steal it from a new target.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      if (!previous || !previous.isConnected) return;
      const current = document.activeElement;
      const inside = panel ? panel.contains(current) : false;
      if (!current || current === document.body || inside) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Keep exactly one highlighted, enabled option as results change.
  const activeIsValid =
    activeId !== null &&
    flatItems.some((item) => item.id === activeId && !item.disabled);
  if (open && open === lastOpen && !activeIsValid) {
    const first = firstEnabledId(flatItems);
    if (first !== activeId) setActiveId(first);
  }

  // Hotkey: one stable window listener; the handler itself lives in a
  // ref so it always sees the current props without re-subscribing.
  const hotkeyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    hotkeyHandlerRef.current = (event: KeyboardEvent) => {
      if (!hotkey) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      const char =
        typeof hotkey === "string" && hotkey.length > 0
          ? hotkey.slice(0, 1).toLowerCase()
          : HOTKEY_FALLBACK;
      if (event.key.toLowerCase() !== char) return;
      event.preventDefault();
      onOpenChange(!open);
    };
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => hotkeyHandlerRef.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const optionDomId = (id: string) =>
    `${listId}-opt-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const scrollActiveIntoView = (id: string) => {
    optionRefs.current.get(id)?.scrollIntoView({ block: "nearest" });
  };

  const moveActive = (delta: number, wrap: boolean) => {
    const enabled = flatItems.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const current = enabled.findIndex((item) => item.id === activeId);
    const from = current === -1 ? (delta > 0 ? -1 : enabled.length) : current;
    let next = from + delta;
    next = wrap
      ? ((next % enabled.length) + enabled.length) % enabled.length
      : Math.max(0, Math.min(enabled.length - 1, next));
    const target = enabled[next];
    setActiveId(target.id);
    scrollActiveIntoView(target.id);
  };

  const moveActiveTo = (position: "first" | "last") => {
    const enabled = flatItems.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const target = position === "first" ? enabled[0] : enabled[enabled.length - 1];
    setActiveId(target.id);
    scrollActiveIntoView(target.id);
  };

  const runItem = (item: CommandItem) => {
    if (item.disabled) return;
    item.run?.();
    onRun?.(item);
    onOpenChange(false);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1, true);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1, true);
        break;
      case "PageDown":
        event.preventDefault();
        moveActive(5, false);
        break;
      case "PageUp":
        event.preventDefault();
        moveActive(-5, false);
        break;
      case "Home":
        event.preventDefault();
        moveActiveTo("first");
        break;
      case "End":
        event.preventDefault();
        moveActiveTo("last");
        break;
      case "Enter":
        event.preventDefault();
        if (activeItem) runItem(activeItem);
        break;
      default:
        break;
    }
  };

  // Escape closes, and Tab cycles inside the dialog: the input and the
  // close button are the only tab stops (options follow the combobox
  // pattern and are never focusable).
  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }
    if (event.key !== "Tab") return;
    const root = panelRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.tabIndex !== -1);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const activeInside = active ? root.contains(active) : false;
    if (event.shiftKey && (active === first || !activeInside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !activeInside)) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="cm-root">
      <div
        className="cm-backdrop"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div className="cm-positioner">
        <div
          ref={panelRef}
          className={`cm-panel${className ? ` ${className}` : ""}`}
          data-density={density}
          data-preview={previewPanel ? "true" : "false"}
          role="dialog"
          aria-modal="true"
          aria-label="Command menu"
          onKeyDown={handlePanelKeyDown}
        >
          <div className="cm-search">
            <svg
              className="cm-search-icon"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <circle
                cx="7"
                cy="7"
                r="4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10.5 10.5 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              ref={inputRef}
              className="cm-input"
              type="text"
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setActiveId(
                  firstEnabledId(buildGroups(items, value, groups).flatMap((g) => g.items)),
                );
              }}
              onKeyDown={handleInputKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeId ? optionDomId(activeId) : undefined}
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-label="Search commands"
              placeholder="Search commands…"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="cm-close"
              onClick={() => onOpenChange(false)}
              aria-label="Close command menu"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="cm-body">
            <div className="cm-list-wrap">
              <div
                className="cm-list"
                id={listId}
                role="listbox"
                aria-label="Commands"
              >
                {results.map((entry) => (
                  <div
                    key={entry.group}
                    className="cm-group"
                    role="group"
                    aria-label={entry.group}
                  >
                    <div className="cm-group-label" role="presentation">
                      {entry.group}
                    </div>
                    {entry.items.map((item) => (
                      <div
                        key={item.id}
                        id={optionDomId(item.id)}
                        ref={(element) => {
                          if (element) optionRefs.current.set(item.id, element);
                          else optionRefs.current.delete(item.id);
                        }}
                        className="cm-option"
                        role="option"
                        aria-selected={item.id === activeId}
                        aria-disabled={item.disabled ? "true" : undefined}
                        data-active={item.id === activeId ? "true" : undefined}
                        data-disabled={item.disabled ? "true" : undefined}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => runItem(item)}
                        onMouseMove={() => {
                          if (!item.disabled && item.id !== activeId) {
                            setActiveId(item.id);
                          }
                        }}
                      >
                        <span className="cm-option-label">{item.label}</span>
                        {item.description ? (
                          <span className="cm-option-desc">{item.description}</span>
                        ) : null}
                        {item.shortcut ? (
                          <kbd className="cm-kbd">{item.shortcut}</kbd>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {results.length === 0 ? (
                <p className="cm-empty" role="status">
                  No commands match “{query.trim()}”.
                </p>
              ) : null}
            </div>

            {previewPanel ? (
              <aside className="cm-preview" aria-label="Command preview">
                <div className="cm-preview-head">
                  <span className="cm-preview-title">
                    {activeItem ? activeItem.label : "Preview"}
                  </span>
                  {activeItem?.shortcut ? (
                    <kbd className="cm-kbd">{activeItem.shortcut}</kbd>
                  ) : null}
                </div>
                <div className="cm-preview-body" aria-live="polite">
                  {activeItem?.preview ??
                    activeItem?.description ?? (
                      <p className="cm-preview-quiet">No preview</p>
                    )}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
