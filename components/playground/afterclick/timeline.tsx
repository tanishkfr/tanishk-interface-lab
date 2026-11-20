"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  formatClock,
  formatDelay,
  isActionKind,
  type Recording,
} from "@/lib/afterclick/schema";
import { eventLabel, eventTone, isFocusEvent } from "@/lib/afterclick/view";

export function Timeline({
  recording,
  selectedId,
  onSelect,
}: {
  recording: Recording;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const events = useMemo(() => recording.events, [recording.events]);
  const actions = useMemo(
    () => recording.events.filter((event) => isActionKind(event.kind)),
    [recording.events],
  );

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const row = listRef.current.querySelector<HTMLElement>(
      `[data-event-id="${selectedId}"]`,
    );
    if (!row) return;
    const container = listRef.current;
    const rowRect = row.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const rowTop = rowRect.top - containerRect.top + container.scrollTop;
    const rowBottom = rowTop + row.offsetHeight;
    if (rowTop < container.scrollTop + 8) {
      container.scrollTop = Math.max(0, rowTop - 12);
    } else if (rowBottom > container.scrollTop + container.clientHeight - 8) {
      container.scrollTop = rowBottom - container.clientHeight + 12;
    }
  }, [selectedId]);

  function focusRow(id: string) {
    window.requestAnimationFrame(() => {
      document.getElementById(`ac-event-${id}`)?.focus();
    });
  }

  function moveSelection(index: number, delta: number) {
    if (!events.length) return;
    const next = Math.max(0, Math.min(events.length - 1, index + delta));
    onSelect(events[next].id);
    focusRow(events[next].id);
  }

  return (
    <section className="ac-timeline-panel" aria-labelledby="ac-timeline-title">
      <header className="ac-panel-head">
        <div>
          <h2 id="ac-timeline-title">Timeline</h2>
          <p>{events.length} recorded events</p>
        </div>
        <span className="ac-panel-count">Relative time</span>
      </header>

      {events.length === 0 ? (
        <div className="ac-empty-inline">
          <p>This recording has no events.</p>
        </div>
      ) : (
        <ol
          className="ac-timeline-list"
          ref={listRef}
          role="listbox"
          aria-label={`Interaction timeline, ${events.length} events. Use arrow keys to inspect.`}
        >
          {events.map((event, index) => {
            const selected = event.id === selectedId;
            const action = event.afterActionId
              ? recording.events.find((item) => item.id === event.afterActionId)
              : null;
            const actionIndex = action
              ? actions.findIndex((item) => item.id === action.id)
              : -1;
            const annotationCount = recording.annotations.filter(
              (annotation) => annotation.eventId === event.id,
            ).length;
            return (
              <li
                key={event.id}
                id={`ac-event-${event.id}`}
                data-event-id={event.id}
                className={`ac-timeline-row ${selected ? "is-selected" : ""} tone-${eventTone(event)} ${isFocusEvent(event) ? "is-focus" : ""}`}
                role="option"
                aria-selected={selected}
                aria-label={`${formatClock(event.t)}, ${eventLabel(event)}: ${event.title}${annotationCount ? `, ${annotationCount} annotations` : ""}`}
                tabIndex={selected || (!selectedId && index === 0) ? 0 : -1}
                onClick={() => onSelect(event.id)}
                onKeyDown={(keyboard) => {
                  if (keyboard.key === "ArrowDown") {
                    keyboard.preventDefault();
                    moveSelection(index, 1);
                  } else if (keyboard.key === "ArrowUp") {
                    keyboard.preventDefault();
                    moveSelection(index, -1);
                  } else if (keyboard.key === "Home") {
                    keyboard.preventDefault();
                    onSelect(events[0].id);
                    focusRow(events[0].id);
                  } else if (keyboard.key === "End") {
                    keyboard.preventDefault();
                    onSelect(events[events.length - 1].id);
                    focusRow(events[events.length - 1].id);
                  } else if (keyboard.key === "Enter" || keyboard.key === " ") {
                    keyboard.preventDefault();
                    onSelect(event.id);
                  }
                }}
              >
                <span className="ac-event-seq" aria-hidden="true">
                  {String(event.seq + 1).padStart(2, "0")}
                </span>
                <span className="ac-event-marker" aria-hidden="true" />
                <span className="ac-event-content">
                  <span className="ac-event-topline">
                    <span className="ac-event-kind">{eventLabel(event)}</span>
                    <span className="ac-event-time">{formatClock(event.t)}</span>
                    {annotationCount > 0 ? (
                      <span className="ac-event-note">
                        {annotationCount} note{annotationCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </span>
                  <span className="ac-event-title">{event.title}</span>
                  {action ? (
                    <span className="ac-event-relation">
                      after A{String(actionIndex + 1).padStart(2, "0")} ·{" "}
                      {formatDelay(event.deltaMs)}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
