"use client";
import { useState } from "react";
import { ProjectHeading, download } from "./workbench";
const SAMPLE =
  "  A small idea.  A little room.  \n\nA small idea.  A little room.\n“Make something useful,” she said.\n  Then make it yours.  ";
export default function TextDesk() {
  const [source, setSource] = useState(SAMPLE),
    [trim, setTrim] = useState(true),
    [spaces, setSpaces] = useState(true),
    [quotes, setQuotes] = useState(false),
    [unique, setUnique] = useState(false),
    [blank, setBlank] = useState(false),
    [letterCase, setLetterCase] = useState("Keep case"),
    [status, setStatus] = useState("Your text stays in this browser.");
  let result = source.replace(/\r\n?/g, "\n");
  if (trim)
    result = result
      .split("\n")
      .map((s) => s.trim())
      .join("\n")
      .trim();
  if (spaces) result = result.replace(/[\t\u00a0 ]+/g, " ");
  if (quotes) result = result.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  if (blank)
    result = result
      .split("\n")
      .filter((s) => s.trim())
      .join("\n");
  if (unique) result = [...new Set(result.split("\n"))].join("\n");
  if (letterCase === "lowercase") result = result.toLocaleLowerCase();
  if (letterCase === "UPPERCASE") result = result.toLocaleUpperCase();
  const words = (result.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [])
      .length,
    characters = Array.from(result).length;
  return (
    <div className="project-world world-text">
      <div className="v2-wrap">
        <ProjectHeading slug="text-desk" />
        <div className="text-desk-options">
          {(
            [
              ["Trim edges", trim, setTrim],
              ["Tidy spaces", spaces, setSpaces],
              ["Straight quotes", quotes, setQuotes],
              ["Remove blank lines", blank, setBlank],
              ["Unique lines", unique, setUnique],
            ] as const
          ).map(([label, checked, set]) => (
            <label key={label}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => set(e.target.checked)}
              />
              {label}
            </label>
          ))}
          <label>
            Letter case
            <select
              value={letterCase}
              onChange={(e) => setLetterCase(e.target.value)}
            >
              {["Keep case", "lowercase", "UPPERCASE"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="text-desk-papers">
          <label>
            01 / Your text
            <textarea
              maxLength={200000}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
              placeholder="Paste a messy paragraph, a list, or a little thought…"
            />
          </label>
          <label>
            02 / Clean copy
            <textarea
              readOnly
              value={result}
              aria-label="Clean copy"
              spellCheck={false}
            />
          </label>
        </div>
        <div className="text-desk-bottom">
          <p aria-live="polite">
            {words.toLocaleString()} words · {characters.toLocaleString()}{" "}
            Unicode code points · {result ? result.split("\n").length : 0} lines
          </p>
          <div>
            <button
              className="lab-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result);
                  setStatus("Clean copy is on your clipboard.");
                } catch {
                  setStatus(
                    "Clipboard unavailable. Select the clean copy or download it.",
                  );
                }
              }}
            >
              Copy clean text
            </button>
            <button
              className="lab-button secondary"
              onClick={() => {
                download("clean-copy.txt", result, "text/plain;charset=utf-8");
                setStatus("Clean copy downloaded as UTF-8 text.");
              }}
            >
              Download .txt
            </button>
            <button
              className="quiet-button"
              onClick={() => {
                setSource("");
                setStatus("A fresh page.");
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <p role="status" className="instrument-note">
          {status}
        </p>
        <section className="project-notes">
          <h2>Less formatting. More meaning.</h2>
          <p>
            Paste up to 200,000 characters. Every operation is explicit and
            reversible: your original text stays on the left, while the right
            reflects the selected rules. Unique lines keeps the first
            occurrence, compares exact text after whitespace and quote cleanup,
            and runs before case conversion.
          </p>
          <p>
            Counts use Unicode code points rather than bytes; compound emoji can
            contain several code points. Word counts are a convenience for
            prose, not a linguistic tokenizer. Nothing is uploaded, stored
            remotely, or sent to a model.
          </p>
        </section>
      </div>
    </div>
  );
}
