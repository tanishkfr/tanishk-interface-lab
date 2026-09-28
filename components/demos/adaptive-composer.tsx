"use client";

import { useState } from "react";
import { AdaptiveComposer } from "@/components/lab/adaptive-composer/adaptive-composer";
import {
  formatIntent,
  parseComposerInput,
  parseDayTime,
  parseDuration,
  type ComposerPayload,
} from "@/components/lab/adaptive-composer/composer-parse";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a capture desk for a fictional operations workspace.
 *
 * Ledger is the studio's running notebook: quick sentences go in, and the
 * composer shows what it recognised before anything is filed.
 */

const SAMPLES: Record<string, string> = {
  meeting: "review the deck with Ana on tue 2pm for 45m",
  math: "what is 128 * 4 + 12",
  place: "drop the press kit near Rotherhithe Studios on the way back",
  task: "draft the outline; send the invite, then book the room",
  person: "ask Ana and Bo to review the style guide",
  link: "the notes live at index.studio/archive",
};

const RECENT = [
  "review the deck with Ana on tue 2pm for 45m",
  "what is 240 / 6 + 8",
  "file the receipts; update the tracker",
].map((sentence) => ({ sentence, parsed: parseComposerInput(sentence) }));

/** A short, honest detail line for a stored entry. */
function detailOf(sentence: string, payload: ComposerPayload): string {
  switch (payload.intent) {
    case "meeting": {
      const { day, time } = parseDayTime(sentence);
      const minutes = parseDuration(sentence);
      return [day, time, minutes !== null ? `${minutes} min` : null]
        .filter(Boolean)
        .join(" · ");
    }
    case "math":
      return payload.math.result !== null ? `= ${payload.math.result}` : "= —";
    case "task":
      return payload.tasks.length === 1
        ? "1 task"
        : `${payload.tasks.length} tasks`;
    default:
      return "";
  }
}

export default function AdaptiveComposerDemo({ values }: DemoProps) {
  const sampleKey = String(values.sample ?? "meeting");
  const showParsed = Boolean(values.parsed ?? true);
  const showHint = Boolean(values.hint ?? true);
  const sampleText = SAMPLES[sampleKey] ?? SAMPLES.meeting;

  const [text, setText] = useState(sampleText);
  const [filed, setFiled] = useState<string | null>(null);

  const [lastSample, setLastSample] = useState(sampleKey);
  if (sampleKey !== lastSample) {
    setLastSample(sampleKey);
    setText(sampleText);
    setFiled(null);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f4f3f0] px-5 py-5 text-[#141418] sm:px-8">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8c8c94]">
            Ledger · operations
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            Capture
          </h2>
        </div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4f27e0]"
          aria-hidden="true"
        >
          Offline parser
        </p>
      </header>

      <div className="mt-4 flex-1">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_1px_2px_rgba(20,20,24,0.04)]">
          <AdaptiveComposer
            value={text}
            onValueChange={(next) => {
              setText(next);
              setFiled(null);
            }}
            sample={showParsed ? sampleText : ""}
            className={showParsed ? undefined : "[&_.ac-structure]:hidden"}
            onSubmit={(value, intent) => {
              setFiled(
                value.trim().length > 0
                  ? `Filed as ${formatIntent(intent)}`
                  : null,
              );
            }}
          />
          {showHint ? (
            <p className="mt-3 text-xs leading-5 text-[#8c8c94]">
              Write plainly — “book the room for tue 10am” becomes a meeting,
              “18 * 3” becomes a calculation. Nothing leaves this card.
            </p>
          ) : null}
          {filed ? (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#4f27e0]">
              {filed}
            </p>
          ) : null}
        </div>

        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8c8c94]">
            Recent entries
          </h3>
          <ul className="mt-2 divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 bg-white">
            {RECENT.map(({ sentence, parsed }) => (
              <li
                key={sentence}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5"
              >
                <span className="rounded-full bg-black/[0.05] px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.1em] text-[#5f5f68]">
                  {formatIntent(parsed.intent)}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-[#4c4c54]">
                  {sentence}
                </span>
                <span className="font-mono text-[9px] text-[#8c8c94]">
                  {detailOf(sentence, parsed.payload)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
