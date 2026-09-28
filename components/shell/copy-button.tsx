"use client";

import { useEffect, useRef, useState } from "react";

/**
 * COPY BUTTON — restrained feedback: the label becomes “Copied” for a
 * moment, then returns. A polite live region carries the confirmation
 * for screen readers without a toast.
 */
export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  dark = false,
  className,
  title,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  dark?: boolean;
  className?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      /* Fallback for non-secure contexts and older browsers. */
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        ok = false;
      }
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      className={`copy-btn${dark ? " copy-btn--dark" : ""}${
        className ? ` ${className}` : ""
      }`}
      data-copied={copied ? "true" : "false"}
      onClick={copy}
      title={title}
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      {copied ? copiedLabel : label}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? `${copiedLabel}: ${title ?? "content"} copied to clipboard` : ""}
      </span>
    </button>
  );
}
