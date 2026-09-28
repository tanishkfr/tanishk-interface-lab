import test from "node:test";
import assert from "node:assert/strict";
import { diffWords } from "../components/lab/inline-diff/word-diff.ts";

test("segments reconstruct both sentences", () => {
  const before = "We should probably improve onboarding soon.";
  const after = "We should improve onboarding now.";

  const segments = diffWords(before, after);
  const replayed = segments
    .filter((segment) => segment.kind !== "added")
    .map((segment) => segment.text)
    .join("");
  const revised = segments
    .filter((segment) => segment.kind !== "removed")
    .map((segment) => segment.text)
    .join("");

  assert.equal(replayed, before);
  assert.equal(revised, after);
});

test("only the changed words are marked", () => {
  const segments = diffWords(
    "The release ships on Tuesday.",
    "The release ships on Wednesday.",
  );
  const removed = segments
    .filter((segment) => segment.kind === "removed")
    .map((segment) => segment.text.trim())
    .join(" ");
  const added = segments
    .filter((segment) => segment.kind === "added")
    .map((segment) => segment.text.trim())
    .join(" ");

  assert.equal(removed, "Tuesday.");
  assert.equal(added, "Wednesday.");
});

test("identical text is a single same segment", () => {
  const segments = diffWords("Nothing changed here.", "Nothing changed here.");
  assert.equal(segments.length, 1);
  assert.equal(segments[0]?.kind, "same");
});

test("empty and one-sided inputs stay safe", () => {
  assert.deepEqual(diffWords("", ""), []);
  const onlyAdded = diffWords("", "new words");
  assert.equal(onlyAdded.filter((s) => s.kind === "added").length, 1);
  const onlyRemoved = diffWords("old words", "");
  assert.equal(onlyRemoved.filter((s) => s.kind === "removed").length, 1);
});

test("very long inputs fall back to a whole-string replace", () => {
  const before = Array.from({ length: 500 }, (_, i) => `word${i}`).join(" ");
  const after = Array.from({ length: 500 }, (_, i) => `term${i}`).join(" ");
  const segments = diffWords(before, after);
  assert.equal(segments.length, 2);
  assert.equal(segments[0]?.kind, "removed");
  assert.equal(segments[1]?.kind, "added");
});
