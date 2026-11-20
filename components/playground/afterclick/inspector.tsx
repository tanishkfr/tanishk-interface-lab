"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  formatClock,
  formatDelay,
  formatDuration,
  isActionKind,
  type ACEvent,
  type Recording,
  type StateMapModel,
} from "@/lib/afterclick/schema";
import {
  DATA_LABELS,
  evidenceLabel,
  eventLabel,
  eventTone,
  valueLabel,
} from "@/lib/afterclick/view";

export function Inspector({
  recording,
  map,
  event,
  onSelect,
  onAddAnnotation,
  onRemoveAnnotation,
}: {
  recording: Recording;
  map: StateMapModel;
  event: ACEvent | null;
  onSelect: (id: string) => void;
  onAddAnnotation: (eventId: string, text: string) => boolean;
  onRemoveAnnotation: (annotationId: string) => void;
}) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const action = useMemo(() => {
    if (!event) return null;
    if (isActionKind(event.kind)) return event;
    if (event.afterActionId) {
      return recording.events.find((item) => item.id === event.afterActionId) ?? null;
    }
    return null;
  }, [event, recording.events]);

  const group = useMemo(
    () => (action ? map.groups.find((item) => item.action.id === action.id) ?? null : null),
    [action, map.groups],
  );

  const annotations = event
    ? recording.annotations.filter((annotation) => annotation.eventId === event.id)
    : [];

  const actionIndex = action
    ? map.actions.findIndex((item) => item.id === action.id) + 1
    : 0;

  if (!event) {
    return (
      <aside className="ac-inspector" id="ac-inspector" aria-labelledby="ac-inspector-title">
        <header className="ac-panel-head">
          <div>
            <h2 id="ac-inspector-title">Inspector</h2>
            <p>Select an event to inspect it.</p>
          </div>
        </header>
      </aside>
    );
  }

  const data = event.data
    ? Object.entries(event.data).filter(([key]) => key !== "observationWindowMs")
    : [];
  const isAction = isActionKind(event.kind);

  function submitAnnotation(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;
    const added = onAddAnnotation(event.id, note);
    if (added) {
      setNote("");
      setMessage("Annotation added. Export the recording to keep it.");
    } else {
      setMessage("Write a short annotation first.");
    }
  }

  return (
    <aside className="ac-inspector" id="ac-inspector" aria-labelledby="ac-inspector-title">
      <header className="ac-panel-head">
        <div>
          <h2 id="ac-inspector-title">Inspector</h2>
          <p>
            {eventLabel(event)} · {formatClock(event.t)}
          </p>
        </div>
        <span className={`ac-evidence ac-evidence-${event.evidence}`}>
          {evidenceLabel(event)}
        </span>
      </header>

      <div className={`ac-inspector-title tone-${eventTone(event)}`}>
        <h3>{event.title}</h3>
        {action && !isAction ? (
          <button
            type="button"
            className="ac-relation-link"
            onClick={() => onSelect(action.id)}
          >
            {formatDelay(event.deltaMs)} after A{String(actionIndex).padStart(2, "0")} ·{" "}
            {action.title}
          </button>
        ) : null}
      </div>

      {isAction && group ? (
        <div className="ac-outcome-block">
          {group.firstDelta === null ? (
            <>
              <p className="ac-outcome-headline is-lost">No observed DOM change</p>
              <p className="ac-outcome-copy">
                {group.outcome === "recording-ended"
                  ? `Observation stopped after ${formatDuration(group.watchedMs)}. No conclusion can be drawn from this short window.`
                  : `Watched for ${formatDuration(group.watchedMs)}. This is a measured absence, not proof that nothing happened.`}
              </p>
            </>
          ) : (
            <>
              <p className="ac-outcome-headline">
                {formatDelay(group.firstDelta)} to first change
              </p>
              <p className="ac-outcome-copy">
                {group.consequences.length} observed state
                {group.consequences.length === 1 ? "" : "s"} in the{" "}
                {formatDuration(recording.capture.observationWindowMs)} window.
              </p>
            </>
          )}
          {group.consequences.length > 0 ? (
            <ol className="ac-consequence-list">
              {group.consequences.map((consequence) => (
                <li key={consequence.id}>
                  <button type="button" onClick={() => onSelect(consequence.id)}>
                    <span
                      className={`ac-consequence-dot tone-${eventTone(consequence)}`}
                      aria-hidden="true"
                    />
                    <span>{consequence.title}</span>
                    <span>{formatDelay(consequence.deltaMs)}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {event.changes?.length ? (
        <div className="ac-inspector-block">
          <p className="ac-block-label">Observed changes</p>
          <ul className="ac-change-list">
            {event.changes.map((change, index) => (
              <li key={`${change.property}-${index}`}>
                <span>{change.property}</span>
                <strong>{change.summary}</strong>
                {change.from !== undefined || change.to !== undefined ? (
                  <code>
                    {change.from ?? "—"} → {change.to ?? "—"}
                  </code>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {event.target?.label ? (
        <div className="ac-target-label">
          <span>UI label</span>
          <strong>“{event.target.label}”</strong>
        </div>
      ) : null}

      {event.warnings?.length ? (
        <div className="ac-warning-box">
          <p className="ac-block-label">Warnings</p>
          <ul>
            {event.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="ac-details">
        <summary>Technical details</summary>
        <dl className="ac-detail-grid">
          <div>
            <dt>Family</dt>
            <dd>{event.family}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{event.confidence ?? "not declared"}</dd>
          </div>
          {event.target ? (
            <div>
              <dt>Target</dt>
              <dd>
                <code>&lt;{event.target.tag}&gt;</code>
                {event.target.role ? ` · ${event.target.role}` : ""}
                {event.target.inputType ? ` · ${event.target.inputType}` : ""}
              </dd>
            </div>
          ) : null}
          {event.target?.selector ? (
            <div>
              <dt>Selector</dt>
              <dd><code>{event.target.selector}</code></dd>
            </div>
          ) : null}
        </dl>
        {data.length ? (
          <dl className="ac-data-list">
            {data.map(([key, value]) => (
              <div key={key}>
                <dt>{DATA_LABELS[key] ?? key}</dt>
                <dd>
                  {key === "preview" ? (
                    <span className="ac-preview">“{valueLabel(key, value)}”</span>
                  ) : (
                    valueLabel(key, value)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="ac-evidence-note">
          {event.evidence === "inferred"
            ? "The DOM change was observed; this label was inferred from text or component semantics."
            : event.evidence === "manual"
              ? "This was placed by a person, not detected by the recorder."
              : "This is an observed page fact. Interpretation is kept separate."}
        </p>
      </details>

      <section className="ac-annotations" aria-labelledby="ac-annotations-title">
        <div className="ac-annotations-head">
          <h3 id="ac-annotations-title">Annotations</h3>
          <span>{annotations.length}</span>
        </div>
        {annotations.length ? (
          <ul className="ac-annotation-list">
            {annotations.map((annotation) => (
              <li key={annotation.id}>
                <p>{annotation.text}</p>
                <button
                  type="button"
                  aria-label={`Delete annotation: ${annotation.text.slice(0, 40)}`}
                  onClick={() => onRemoveAnnotation(annotation.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <form className="ac-annotation-form" onSubmit={submitAnnotation}>
          <label htmlFor="ac-annotation-text">Add a comment</label>
          <textarea
            id="ac-annotation-text"
            value={note}
            maxLength={1000}
            rows={2}
            placeholder="What did this state mean for the person using it?"
            onChange={(input) => setNote(input.target.value)}
            onKeyDown={(keyboard) => {
              if ((keyboard.metaKey || keyboard.ctrlKey) && keyboard.key === "Enter") {
                keyboard.preventDefault();
                keyboard.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="ac-annotation-actions">
            <span>Ctrl/⌘ + Enter</span>
            <button type="submit" className="ac-button ac-button-dark" disabled={!note.trim()}>
              Add annotation
            </button>
          </div>
        </form>
        <p className="ac-annotation-status" role="status" aria-live="polite">
          {message}
        </p>
      </section>
    </aside>
  );
}
