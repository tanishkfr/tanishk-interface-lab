"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  ContextualDock,
  type DockAction,
  type DockContext,
} from "@/components/lab/contextual-dock/contextual-dock";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a small document editor.
 *
 * Selecting text inside a block sets the text context; clicking a
 * block selects it; shift-clicking a second block builds a
 * multi-selection; clicking empty space clears everything. The dock
 * sits in the flow at the bottom, so it can never cover the text
 * being selected, at any width.
 */

const BLOCKS = [
  {
    id: "b1",
    label: "Morning survey",
    text: "The headland path floods at spring tide, so the route notes assume an early start and a second reading at the causeway before the light goes flat.",
  },
  {
    id: "b2",
    label: "Recording the tide line",
    text: "Take the eastern transect first. The sand holds a clearer edge there, and the wind rarely moves the marker flags before noon.",
  },
  {
    id: "b3",
    label: "Notes for the next pass",
    text: "Photograph each stake from the same two metres, and log the time beside the frame number so the pair can be matched later.",
  },
];

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  insert: (
    <Glyph>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" />
      <path d="M8 5.5v5M5.5 8h5" />
    </Glyph>
  ),
  outline: (
    <Glyph>
      <path d="M3 4h10M3 8h10M3 12h6" />
    </Glyph>
  ),
  bold: (
    <Glyph>
      <path d="M5 3h3.4a2.4 2.4 0 0 1 0 4.8H5zM5 7.8h4a2.6 2.6 0 0 1 0 5.2H5z" />
      <path d="M5 3v10" />
    </Glyph>
  ),
  comment: (
    <Glyph>
      <path d="M3 4.5h10v6.2H8.6L6 13.2v-2.5H3z" />
    </Glyph>
  ),
  quote: (
    <Glyph>
      <path d="M6 5.5C4.6 6.3 4 7.5 4 9M11 5.5C9.6 6.3 9 7.5 9 9" />
      <path d="M4 9.8h2.2M9 9.8h2.2" />
    </Glyph>
  ),
  copy: (
    <Glyph>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
    </Glyph>
  ),
  up: (
    <Glyph>
      <path d="M8 12.5V4M4.5 7.5 8 4l3.5 3.5" />
    </Glyph>
  ),
  down: (
    <Glyph>
      <path d="M8 3.5V12M4.5 8.5 8 12l3.5-3.5" />
    </Glyph>
  ),
  convert: (
    <Glyph>
      <path d="M3.2 9.8A5 5 0 0 1 12.4 6.2M12.8 6.2A5 5 0 0 1 3.6 9.8" />
      <path d="M12.4 3.6v2.6H9.8M3.6 12.4V9.8h2.6" />
    </Glyph>
  ),
  align: (
    <Glyph>
      <path d="M3 4.5h10M3 8h7M3 11.5h10" />
    </Glyph>
  ),
  group: (
    <Glyph>
      <rect x="2.5" y="2.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="6" y="6" width="7.5" height="7.5" rx="1.5" />
    </Glyph>
  ),
  export: (
    <Glyph>
      <path d="M8 10V2.8M5.2 5.6 8 2.8l2.8 2.8" />
      <path d="M3.2 10v3h9.6v-3" />
    </Glyph>
  ),
  delete: (
    <Glyph>
      <path d="M3.5 4.5h9M6.5 4.5V3h3v1.5" />
      <path d="M5 4.5l.6 9h4.8l.6-9" />
    </Glyph>
  ),
};

const ACTIONS: Record<DockContext, DockAction[]> = {
  none: [
    { id: "insert-block", label: "Insert block", icon: ICONS.insert },
    { id: "outline", label: "Outline", icon: ICONS.outline },
  ],
  text: [
    { id: "bold", label: "Bold", icon: ICONS.bold },
    { id: "comment", label: "Comment", icon: ICONS.comment },
    { id: "quote", label: "Quote", icon: ICONS.quote },
    { id: "copy-markdown", label: "Copy as Markdown", icon: ICONS.copy },
  ],
  object: [
    { id: "duplicate", label: "Duplicate", icon: ICONS.copy },
    { id: "move-up", label: "Move up", icon: ICONS.up },
    { id: "move-down", label: "Move down", icon: ICONS.down },
    { id: "convert", label: "Convert", icon: ICONS.convert },
  ],
  multi: [
    { id: "align", label: "Align", icon: ICONS.align },
    { id: "group", label: "Group", icon: ICONS.group },
    { id: "export", label: "Export", icon: ICONS.export },
    { id: "delete", label: "Delete", icon: ICONS.delete },
  ],
};

export default function ContextualDockDemo({ values }: DemoProps) {
  const forcedContext = values.context;
  const validForcedContext =
    forcedContext === "none" ||
    forcedContext === "text" ||
    forcedContext === "object" ||
    forcedContext === "multi";

  const [context, setContext] = useState<DockContext>(
    validForcedContext ? forcedContext : "text",
  );
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [selectionWords, setSelectionWords] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // The preview control forces a context; the document surface can
  // still take over afterwards.
  const [lastForcedContext, setLastForcedContext] = useState(forcedContext);
  if (forcedContext !== lastForcedContext) {
    setLastForcedContext(forcedContext);
    if (validForcedContext) {
      setContext(forcedContext);
    }
  }

  // A non-empty selection inside the demo root is a text selection.
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const root = rootRef.current;
      if (!root || !root.contains(range.commonAncestorContainer)) return;
      const text = selection.toString().trim();
      if (!text) return;
      const words = text.split(/\s+/).length;
      setSelectionWords((current) => (current === words ? current : words));
      setSelectedBlocks((current) => (current.length === 0 ? current : []));
      setContext((current) => (current === "text" ? current : "text"));
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const selectBlocks = (next: string[]) => {
    setSelectedBlocks(next);
    setContext(next.length === 0 ? "none" : next.length > 1 ? "multi" : "object");
  };

  const handleBlockClick = (
    event: ReactMouseEvent<HTMLElement>,
    id: string,
  ) => {
    // A live text selection wins over a block click — and the surface
    // must not see this click either, or it would clear the selection.
    const selection = window.getSelection();
    const liveSelection = Boolean(
      selection && !selection.isCollapsed && selection.toString().trim(),
    );
    event.stopPropagation();
    if (liveSelection) return;
    setSelectionWords(0);
    const next = event.shiftKey
      ? selectedBlocks.includes(id)
        ? selectedBlocks.filter((blockId) => blockId !== id)
        : [...selectedBlocks, id]
      : [id];
    selectBlocks(next);
  };

  const handleMarkerClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    event.stopPropagation();
    window.getSelection()?.removeAllRanges();
    setSelectionWords(0);
    selectBlocks(
      selectedBlocks.includes(id)
        ? selectedBlocks.filter((blockId) => blockId !== id)
        : [...selectedBlocks, id],
    );
  };

  const handleSurfaceClick = () => {
    // A drag that ended on the surface keeps its text selection.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) return;
    window.getSelection()?.removeAllRanges();
    setSelectionWords(0);
    selectBlocks([]);
  };

  const showStatus = values.status === undefined ? true : Boolean(values.status);
  const firstSelected = BLOCKS.findIndex((block) => block.id === selectedBlocks[0]);
  const statusLabel = !showStatus
    ? undefined
    : context === "text"
      ? selectionWords > 0
        ? `${selectionWords} ${selectionWords === 1 ? "word" : "words"} selected`
        : "Text selection"
      : context === "object"
        ? firstSelected >= 0
          ? `Block ${firstSelected + 1} selected`
          : "1 block selected"
        : context === "multi"
          ? selectedBlocks.length > 1
            ? `${selectedBlocks.length} blocks selected`
            : "Multi-selection"
          : "No selection";

  return (
    <div ref={rootRef} className="flex h-full flex-col bg-[#fafaf9] text-[#141418]">
      <header className="flex flex-none items-center justify-between gap-3 border-b border-black/5 bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
            Field guide — draft 3
          </p>
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-[#8c8c94]">
            Coast survey, morning pass
          </p>
        </div>
        <span className="hidden flex-none rounded-md border border-black/10 px-2 py-1 font-mono text-[10px] text-[#5f5f68] sm:block">
          {context}
        </span>
      </header>

      <div
        onClick={handleSurfaceClick}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      >
        <div className="mx-auto max-w-[44rem] space-y-3">
          {BLOCKS.map((block, index) => {
            const selected = selectedBlocks.includes(block.id);
            return (
              <article
                key={block.id}
                onClick={(event) => handleBlockClick(event, block.id)}
                className={`relative rounded-xl border px-4 py-3.5 pr-9 transition-colors duration-200 ${
                  selected
                    ? "border-[#4f27e0]/40 bg-[#4f27e0]/[0.04]"
                    : "border-black/10 bg-white"
                }`}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8c8c94]">
                  ¶ {String(index + 1).padStart(2, "0")} · {block.label}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#3f3f47]">
                  {block.text}
                </p>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${selected ? "Deselect" : "Select"} block ${index + 1}`}
                  onClick={(event) => handleMarkerClick(event, block.id)}
                  className={`absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-[5px] border leading-none transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f27e0] ${
                    selected
                      ? "border-[#4f27e0] bg-[#4f27e0] text-white"
                      : "border-black/20 bg-white text-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </article>
            );
          })}
        </div>
        <p className="mx-auto mt-4 max-w-[44rem] text-[11px] leading-relaxed text-[#8c8c94]">
          Select text inside a block, click a block, or shift-click a second
          block. Clicking the empty space clears the selection.
        </p>
      </div>

      <footer className="flex-none border-t border-black/5 bg-[#f4f4f2] px-3 py-3 sm:px-5">
        <p
          aria-live="polite"
          className="mb-2 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[#8c8c94]"
        >
          {lastAction ? `Last action — ${lastAction}` : "No action run yet"}
        </p>
        <ContextualDock
          context={context}
          sets={ACTIONS}
          label={statusLabel}
          placement={values.layout === "inline" ? "inline" : "floating"}
          onAction={(id, actionContext) => {
            const action = ACTIONS[actionContext].find((entry) => entry.id === id);
            setLastAction(action ? `${action.label} — ${actionContext}` : id);
          }}
        />
      </footer>
    </div>
  );
}
