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
import {
  formatIntent,
  parseComposerInput,
  type ComposerIntent,
  type ComposerPayload,
} from "./composer-parse";
import "./adaptive-composer.css";

export type AdaptiveComposerProps = {
  /** Controlled text; omit both value and onValueChange to let it own the text. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Initial text for uncontrolled use. */
  defaultValue?: string;
  /** Example sentence shown as a nudge while the field is empty. */
  sample?: string;
  /** Fires on ⌘/Ctrl+Enter with the raw value and the parsed structure. */
  onSubmit?: (
    value: string,
    intent: ComposerIntent,
    payload: ComposerPayload,
  ) => void;
  disabled?: boolean;
  className?: string;
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${Math.floor(hours)} h ${minutes % 60} min`;
}

/** One readable line for the live region and the summary row. */
function summarise(payload: ComposerPayload): string {
  switch (payload.intent) {
    case "link":
      return `Link · ${payload.url}`;
    case "math":
      return `Calculation · ${payload.math.expression} = ${payload.math.result ?? "—"}`;
    case "meeting": {
      const { meeting } = payload;
      const when = [meeting.day, meeting.time].filter(Boolean).join(" ");
      return [
        "Meeting",
        when,
        meeting.durationMin !== null
          ? formatDuration(meeting.durationMin)
          : "",
      ]
        .filter(Boolean)
        .join(" · ");
    }
    case "task":
      return payload.tasks.length === 1
        ? "1 task"
        : `${payload.tasks.length} tasks`;
    case "place":
      return `Place · ${payload.place.name}`;
    case "person":
      return `People · ${payload.person.names.join(", ")}`;
    default:
      return "Text";
  }
}

/** The read-only structured form for the recognised intent. */
function structureDetail(payload: ComposerPayload): ReactNode {
  switch (payload.intent) {
    case "meeting": {
      const { meeting } = payload;
      return (
        <dl className="ac-grid">
          <div className="ac-row">
            <dt>Title</dt>
            <dd>{meeting.title}</dd>
          </div>
          <div className="ac-row">
            <dt>Day</dt>
            <dd>{meeting.day ?? "—"}</dd>
          </div>
          <div className="ac-row">
            <dt>Time</dt>
            <dd>{meeting.time ?? "—"}</dd>
          </div>
          <div className="ac-row">
            <dt>Duration</dt>
            <dd>
              {meeting.durationMin !== null
                ? formatDuration(meeting.durationMin)
                : "—"}
            </dd>
          </div>
        </dl>
      );
    }
    case "task":
      return (
        <ul className="ac-tasks">
          {payload.tasks.map((task, index) => (
            <li key={`${task.text}-${index}`}>
              <span className="ac-box" aria-hidden="true" />
              <span>{task.text}</span>
            </li>
          ))}
        </ul>
      );
    case "math":
      return (
        <div className="ac-math">
          <code className="ac-expr">{payload.math.expression}</code>
          <span className="ac-eq" aria-hidden="true">
            =
          </span>
          <strong className="ac-value">{payload.math.result ?? "—"}</strong>
        </div>
      );
    case "place":
      return (
        <dl className="ac-grid">
          <div className="ac-row">
            <dt>Place</dt>
            <dd>{payload.place.name}</dd>
          </div>
          <div className="ac-row">
            <dt>Context</dt>
            <dd>{payload.place.context ?? "—"}</dd>
          </div>
        </dl>
      );
    case "person":
      return (
        <div className="ac-people">
          {payload.person.names.map((name) => (
            <span className="ac-person" key={name}>
              {name}
            </span>
          ))}
          {payload.person.verbs.length > 0 ? (
            <p className="ac-quiet">
              {payload.person.verbs.join(", ")}
            </p>
          ) : null}
        </div>
      );
    case "link":
      return <p className="ac-url">{payload.url}</p>;
    default:
      return (
        <p className="ac-quiet">
          Nothing structured recognised — it will be read as a plain note.
        </p>
      );
  }
}

/**
 * ADAPTIVE COMPOSER — one input, a structure that follows the meaning.
 *
 * A deterministic parser (no network, no AI) reads the sentence as it is
 * typed: the chip above the field names the intent, and the panel below
 * lays out the structured form — parsed date and duration, a live result,
 * a place, a checklist, people or the link. The panel is a polite live
 * region and purely presentational; the text field is the only control,
 * and ⌘/Ctrl+Enter submits without inserting a newline.
 */
export function AdaptiveComposer({
  value,
  onValueChange,
  defaultValue = "",
  sample,
  onSubmit,
  disabled = false,
  className,
}: AdaptiveComposerProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const text = controlled ? value : internal;
  const parsed = useMemo(() => parseComposerInput(text), [text]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();
  const hasText = text.trim().length > 0;

  /* Auto-grow between one and three rows. */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const styles = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    const padding =
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom);
    const max =
      (Number.isFinite(lineHeight) ? lineHeight : 22) * 3 +
      (Number.isFinite(padding) ? padding : 0);
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [text, disabled]);

  const update = (next: string): void => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmit?.(text, parsed.intent, parsed.payload);
    }
  };

  return (
    <div
      className={`ac-root${className ? ` ${className}` : ""}`}
      data-intent={parsed.intent}
      data-disabled={disabled ? "true" : "false"}
    >
      <div className="ac-field">
        <div className="ac-field__head">
          <label className="ac-label" htmlFor={inputId}>
            Compose
          </label>
          {hasText ? (
            <span
              className="ac-chip"
              title={`Confidence ${Math.round(parsed.confidence * 100)}%`}
            >
              {formatIntent(parsed.intent)}
            </span>
          ) : null}
        </div>

        <textarea
          id={inputId}
          ref={textareaRef}
          className="ac-input"
          rows={1}
          value={text}
          onChange={(event) => update(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sample}
          disabled={disabled}
        />

        <div className="ac-field__foot">
          <span className="ac-keys" aria-hidden="true">
            ⌘/Ctrl + Enter
          </span>
          {hasText && !disabled ? (
            <button
              type="button"
              className="ac-clear"
              onClick={() => {
                update("");
                textareaRef.current?.focus();
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="ac-structure" aria-live="polite">
        {hasText ? (
          <div className="ac-card">
            <p className="ac-summary">{summarise(parsed.payload)}</p>
            {structureDetail(parsed.payload)}
          </div>
        ) : (
          <p className="ac-quiet">
            The structured form appears here as you type.
          </p>
        )}
      </div>
    </div>
  );
}
