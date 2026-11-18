import test from "node:test";
import assert from "node:assert/strict";
import {
  batchDimensions,
  chooseBatchPlacement,
  framePosition,
  variationFrameName,
  batchFrameName,
  newBatchId,
} from "../src/main/placement.ts";

test("batch geometry is a clean 2x2 grid with a title band", () => {
  const dims = batchDimensions(1000, 700);
  assert.equal(dims.width, 48 * 2 + 1000 * 2 + 56);
  assert.equal(dims.height, 88 + 48 + 700 * 2 + 56);
  assert.deepEqual(framePosition(0, 1000, 700), { x: 48, y: 88 });
  assert.deepEqual(framePosition(1, 1000, 700), { x: 48 + 1000 + 56, y: 88 });
  assert.deepEqual(framePosition(2, 1000, 700), { x: 48, y: 88 + 700 + 56 });
  assert.deepEqual(framePosition(3, 1000, 700), { x: 48 + 1000 + 56, y: 88 + 700 + 56 });
});

test("placement sits to the right of the source and avoids existing work", () => {
  const source = { x: 100, y: 100, w: 800, h: 600 };
  const batch = { width: 900, height: 800 };
  const free = chooseBatchPlacement(source, batch, []);
  assert.ok(free.x > source.x + source.w);
  assert.equal(free.y, source.y);
  const occupied = [
    { x: 100, y: 100, w: 800, h: 600 },
    { x: free.x, y: free.y, w: 900, h: 800 },
  ];
  const moved = chooseBatchPlacement(source, batch, occupied);
  assert.notDeepEqual(moved, free);
  assert.ok(moved.x >= free.x);
});

test("generated names are stable and human-readable", () => {
  assert.equal(variationFrameName("brutalist", 1), "GRID CRIMES / BRUTALIST / 001");
  assert.equal(variationFrameName("swiss editorial", 12), "GRID CRIMES / SWISS EDITORIAL / 012");
  assert.equal(batchFrameName(3), "GRID CRIMES / BATCH 003");
  const id = newBatchId(2718, 1_700_000_000_000);
  assert.match(id, /^gc_[a-z0-9]+_[a-z0-9]+$/);
});
