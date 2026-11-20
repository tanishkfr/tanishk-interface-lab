"use client";

import type { CSSProperties } from "react";
import {
  formatClock,
  formatDelay,
  formatDuration,
  type ACEvent,
  type Recording,
  type StateMapModel,
} from "@/lib/afterclick/schema";
import { evidenceLabel, eventTone, mapConsequences } from "@/lib/afterclick/view";

function delayWidth(event: ACEvent, windowMs: number): number {
  const delta = event.deltaMs ?? 0;
  return Math.max(3, Math.min(100, (delta / Math.max(1000, windowMs)) * 100));
}

export function StateMap({
  recording,
  map,
  selectedId,
  onSelect,
}: {
  recording: Recording;
  map: StateMapModel;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const windowMs = recording.capture.observationWindowMs || 4000;
  const columns = Math.max(map.groups.length, 1);
  const style = {
    "--ac-map-columns": columns,
    minWidth: `${Math.max(760, columns * 224)}px`,
  } as CSSProperties;

  return (
    <section className="ac-map-panel" aria-labelledby="ac-map-title">
      <header className="ac-map-head">
        <div>
          <h2 id="ac-map-title">State map</h2>
          <p>
            Each action opens a {formatDuration(windowMs)} window. Vertical bars
            show measured time to the observed state.
          </p>
        </div>
        <div className="ac-legend" aria-label="State map legend">
          <span><i className="ac-key ac-key-action" /> Action</span>
          <span><i className="ac-key ac-key-observed" /> Observed</span>
          <span><i className="ac-key ac-key-inferred" /> Inferred</span>
        </div>
      </header>

      {map.groups.length === 0 ? (
        <div className="ac-map-empty">
          <p>No actions in this recording.</p>
        </div>
      ) : (
        <div
          className="ac-map-scroll"
          tabIndex={0}
          role="region"
          aria-label={`State map with ${map.groups.length} actions. Scroll horizontally if needed.`}
        >
          <div className="ac-map-columns" style={style}>
            {map.groups.map((group, index) => {
              const { visible, hidden } = mapConsequences(group, 3);
              const actionNumber = `A${String(index + 1).padStart(2, "0")}`;
              const selectedFamily =
                group.action.id === selectedId ||
                group.consequences.some((event) => event.id === selectedId);
              return (
                <article
                  className={`ac-map-column ${selectedFamily ? "is-selected" : ""} ${group.firstDelta === null ? "is-lost" : ""}`}
                  key={group.action.id}
                >
                  <button
                    type="button"
                    className="ac-map-action"
                    aria-pressed={group.action.id === selectedId}
                    onClick={() => onSelect(group.action.id)}
                  >
                    <span className="ac-map-action-top">
                      <span className="ac-map-action-no">{actionNumber}</span>
                      <span>{formatClock(group.action.t)}</span>
                    </span>
                    <strong>{group.action.title}</strong>
                    <span className="ac-map-action-meta">
                      {group.firstDelta === null
                        ? "No observed change"
                        : `${formatDelay(group.firstDelta)} to first change`}
                      <span>{group.consequences.length} states</span>
                    </span>
                  </button>

                  <div className="ac-map-states">
                    {visible.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`ac-map-state tone-${eventTone(event)} ${event.id === selectedId ? "is-selected" : ""} ${event.evidence === "inferred" ? "is-inferred" : ""}`}
                        aria-pressed={event.id === selectedId}
                        aria-label={`${event.title}. ${formatDelay(event.deltaMs)} after the action. ${evidenceLabel(event)}.`}
                        onClick={() => onSelect(event.id)}
                      >
                        <span className="ac-map-state-top">
                          <i className="ac-map-dot" aria-hidden="true" />
                          <span>{event.title}</span>
                        </span>
                        <span className="ac-map-state-meta">
                          <span className="ac-map-rail" aria-hidden="true">
                            <i
                              style={{ width: `${delayWidth(event, windowMs)}%` }}
                            />
                          </span>
                          <span>{formatDelay(event.deltaMs)}</span>
                          <em>
                            {event.evidence === "inferred" ? "inferred" : "observed"}
                          </em>
                        </span>
                      </button>
                    ))}

                    {!visible.length ? (
                      <button
                        type="button"
                        className="ac-map-lost"
                        aria-pressed={group.action.id === selectedId}
                        onClick={() => onSelect(group.action.id)}
                      >
                        <span>
                          {group.outcome === "recording-ended"
                            ? "Observation cut short"
                            : "No observed DOM change"}
                        </span>
                        <small>
                          {formatDuration(group.watchedMs)} watched
                        </small>
                      </button>
                    ) : null}

                    {hidden > 0 ? (
                      <button
                        type="button"
                        className="ac-map-more"
                        onClick={() => onSelect(group.action.id)}
                      >
                        +{hidden} more in timeline
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
