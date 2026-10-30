import test from "node:test";
import assert from "node:assert/strict";
import { canRequestUndo } from "../components/lab/undo-window/undo-policy.ts";

test("undo is only available before the host deadline", () => {
  assert.equal(canRequestUndo("available", 1000, 999), true);
  assert.equal(canRequestUndo("available", 1000, 1000), false);
  assert.equal(canRequestUndo("available", 1000, 1001), false);
  assert.equal(canRequestUndo("pending", 1000, 1), false);
  assert.equal(canRequestUndo("expired", 1000, 1), false);
  assert.equal(canRequestUndo("available", Number.NaN, 1), false);
});
