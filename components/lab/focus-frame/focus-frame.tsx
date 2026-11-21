"use client";

import { useId, type ChangeEvent } from "react";
import "./focus-frame.css";

export type FocusFrameProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  type?: "text" | "email" | "password" | "url";
  placeholder?: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  autoComplete?: string;
  size?: "compact" | "regular";
  className?: string;
};

/**
 * FOCUS FRAME
 *
 * A labelled field where the frame is the interaction: a quiet border
 * resolves into a precise accent, the label warms, and the message slot
 * fades between hint, error and success without moving the page. The
 * label lives outside the input, so it is never replaced by placeholder
 * text. Errors carry an icon and a message as well as a border colour.
 */
export function FocusFrame({
  label,
  value,
  onChange,
  onBlur,
  id,
  name,
  type = "text",
  placeholder,
  hint,
  error,
  success,
  required,
  disabled,
  readOnly,
  multiline,
  rows = 4,
  maxLength,
  showCount,
  autoComplete,
  size = "regular",
  className,
}: FocusFrameProps) {
  const generated = useId();
  const fieldId = id ?? `${generated}-field`;
  const messageId = `${fieldId}-message`;
  const message = error ?? success ?? hint ?? "";
  const tone = error ? "error" : success ? "success" : hint ? "hint" : "none";
  const describedBy = message ? messageId : undefined;

  const change = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange(event.target.value);

  return (
    <div
      className={`ff-root${className ? ` ${className}` : ""}`}
      data-size={size}
      data-tone={tone}
      data-disabled={disabled ? "true" : "false"}
      data-readonly={readOnly ? "true" : "false"}
      data-filled={value.length > 0 ? "true" : "false"}
    >
      <div className="ff-label-row">
        <label htmlFor={fieldId} className="ff-label">
          {label}
          {required ? (
            <span className="ff-required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {readOnly ? <span className="ff-flag">Read only</span> : null}
        {disabled ? <span className="ff-flag">Disabled</span> : null}
      </div>
      <div className="ff-frame">
        <span className="ff-corner ff-corner--tl" aria-hidden="true" />
        <span className="ff-corner ff-corner--tr" aria-hidden="true" />
        <span className="ff-corner ff-corner--bl" aria-hidden="true" />
        <span className="ff-corner ff-corner--br" aria-hidden="true" />
        {multiline ? (
          <textarea
            id={fieldId}
            name={name}
            className="ff-input"
            value={value}
            rows={rows}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={change}
            onBlur={onBlur}
          />
        ) : (
          <input
            id={fieldId}
            name={name}
            className="ff-input"
            type={type}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            autoComplete={autoComplete}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={change}
            onBlur={onBlur}
          />
        )}
      </div>
      <div className="ff-message-row">
        <div
          className="ff-message"
          id={messageId}
          aria-live="polite"
          aria-atomic="true"
        >
          {message ? (
            <span key={message}>
              {error ? (
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <circle
                    cx="8"
                    cy="8"
                    r="6.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M8 4.8v4.1M8 11.2v.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : success ? (
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="M3 8.3l3.2 3.1L13 4.7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              {message}
            </span>
          ) : null}
        </div>
        {showCount && maxLength ? (
          <span className="ff-count" aria-hidden="true">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}
