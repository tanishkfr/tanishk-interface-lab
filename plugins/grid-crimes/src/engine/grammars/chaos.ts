import type { Rect } from "../../shared/types.ts";
import type { GrammarDefinition } from "./helpers.ts";
import {
  action,
  addIndex,
  addStamp,
  bspLeaves,
  ensureCoveringBacking,
  headline,
  rotation,
  visual,
} from "./helpers.ts";
import { mixHex, readableOn } from "../../shared/color.ts";
import { LAB } from "../../shared/presets.ts";

const hybridSplit: GrammarDefinition = {
  id: "hybrid-split",
  name: "Hybrid split",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const split = c.width * (0.36 + c.dna.split * 0.16);

    c.decor(
      "block",
      {
        x: split - c.width * 0.01,
        y: 0,
        w: c.width * 0.02,
        h: c.height,
      },
      c.palette.accent,
      { z: 14 },
    );

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y + content.h * 0.06,
          w: split - content.x - c.gutterPx * 2,
          h: content.h * 0.4,
        },
        { emphasis: 1.22, z: 31, rotation: rotation(c, 0.4) },
      );
    } else if (c.focal && !c.isPlaced(c.focal)) {
      c.place(
        c.focal,
        {
          x: content.x,
          y: content.y + content.h * 0.06,
          w: split - content.x - c.gutterPx * 2,
          h: content.h * 0.4,
        },
        { z: 31 },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: split + c.width * 0.02,
          y: 0,
          w: c.width - split - c.width * 0.02,
          h: c.height * 0.78,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.44,
          y: content.y + content.h * 0.86,
          w: content.w * 0.2,
          h: content.h * 0.07,
        },
        { z: 34, rotation: rotation(c, 0.7) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.62,
        w: content.w * 0.4,
        h: content.h * 0.18,
      },
      { columns: 2, emphasis: 0.9, z: 27 },
    );

    const bandColor = mixHex(c.palette.background, c.palette.ink, 0.1);
    c.decor(
      "frame",
      {
        x: content.x,
        y: content.y + content.h * 0.56,
        w: content.w * 0.38,
        h: content.h * 0.3,
      },
      bandColor,
      { z: 16, rotation: rotation(c, 0.25) },
    );
    c.rule("h", content.y + content.h * 0.82, {
      thickness: Math.max(3, c.height * 0.006),
      color: c.palette.accent,
      z: 18,
    });
    addIndex(c, "tl", `HYBRID / ${String(c.settings.seed).slice(-3)}`);
    addStamp(c, split + c.width * 0.04, c.height * 0.84, "CROSSED / 01", c.palette.accent);
  },
};

const collisionField: GrammarDefinition = {
  id: "collision-field",
  name: "Collision field",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const backingColor = c.palette.accent;

    if (v) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.48,
          y: content.y + content.h * 0.04,
          w: content.w * 0.55,
          h: content.h * 0.5,
        },
        { fit: "fill", z: 6, rotation: rotation(c, 0.5) },
      );
    }

    if (h) {
      const rect: Rect = {
        x: content.x + content.w * 0.02,
        y: content.y + content.h * 0.2,
        w: content.w * 0.7,
        h: content.h * 0.28,
      };
      ensureCoveringBacking(c, rect, backingColor, Math.round(c.width * 0.016));
      c.place(h, rect, {
        emphasis: 1.3,
        z: 31,
        backdrop: backingColor,
        color: readableOn(backingColor, [LAB.ink, LAB.paper, LAB.white]),
        rotation: rotation(c, 0.3),
      });
    } else if (c.focal && !c.isPlaced(c.focal)) {
      const rect: Rect = {
        x: content.x,
        y: content.y + content.h * 0.22,
        w: content.w * 0.66,
        h: content.h * 0.26,
      };
      ensureCoveringBacking(c, rect, backingColor);
      c.place(c.focal, rect, { z: 31, backdrop: backingColor });
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.74,
          y: content.y + content.h * 0.62,
          w: content.w * 0.2,
          h: content.h * 0.07,
        },
        { z: 34, rotation: rotation(c, 1) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.62,
        w: content.w * 0.66,
        h: content.h * 0.28,
      },
      { columns: 3, emphasis: 0.88, z: 27 },
    );

    c.decor(
      "bar",
      {
        x: 0,
        y: c.height * 0.1,
        w: c.width * 0.34,
        h: Math.max(8, c.height * 0.012),
      },
      c.palette.alt,
      { z: 16, rotation: rotation(c, 0.4) },
    );
    c.decor(
      "ring",
      {
        x: c.width * 0.08,
        y: c.height * 0.64,
        w: c.width * 0.14,
        h: c.width * 0.14,
      },
      c.palette.accent,
      { z: 15 },
    );
    c.decor(
      "frame",
      {
        x: c.width * 0.03,
        y: c.height * 0.05,
        w: c.width * 0.94,
        h: c.height * 0.9,
      },
      c.palette.accent,
      { z: 12, rotation: rotation(c, 0.18) },
    );
    c.rule("h", content.y + content.h * 0.58, {
      thickness: Math.max(1, c.height * 0.002),
      z: 18,
    });
    addIndex(c, "tr", `COLLISION / ${String(c.settings.seed).slice(-3)}`);
  },
};

const fracture: GrammarDefinition = {
  id: "fracture",
  name: "Fracture",
  build(c) {
    const content = c.content;
    const blockCount = c.snapshot.blocks.length;
    const depth = blockCount <= 8 ? 3 : blockCount <= 16 ? 4 : 5;
    const leaves = bspLeaves(content, depth, c.rng, c.gutterPx);
    const readingLeaves = [...leaves].sort(
      (a, b) => a.y - b.y || a.x - b.x,
    );
    const byArea = [...leaves].sort((a, b) => b.w * b.h - a.w * a.h);
    const assigned = new Set<string>();
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (h) {
      const leaf = byArea.shift();
      if (leaf) {
        c.place(h, leaf, {
          emphasis: 1.12,
          z: 31,
          rotation: rotation(c, 0.4),
        });
        assigned.add(h.id);
      }
    }
    if (v && byArea.length) {
      const leaf = byArea.shift();
      if (leaf) {
        c.place(v, leaf, { fit: "fill", z: 8, rotation: rotation(c, 0.5) });
        assigned.add(v.id);
      }
    }
    if (a && byArea.length) {
      const leaf = byArea.shift();
      if (leaf) {
        c.place(a, leaf, { z: 34, rotation: rotation(c, 0.8) });
        assigned.add(a.id);
      }
    }

    const remaining = c.remaining;
    const freeLeaves = [...byArea, ...readingLeaves].filter(
      (leaf, index, all) => all.indexOf(leaf) === index,
    );
    let leafIndex = 0;
    for (const block of remaining) {
      if (assigned.has(block.id)) continue;
      const leaf = freeLeaves[leafIndex % Math.max(1, freeLeaves.length)];
      leafIndex += 1;
      if (!leaf) break;
      c.place(block, leaf, {
        z: 27,
        emphasis: block.role === "action" ? 0.95 : 0.86,
        rotation: block.role === "label" ? rotation(c, 0.35) : 0,
      });
    }

    for (let index = 0; index < Math.min(7, leaves.length); index += 1) {
      const leaf = leaves[index];
      c.decor(
        "rule",
        {
          x: leaf.x + leaf.w * 0.04,
          y: leaf.y + leaf.h * 0.08,
          w: leaf.w * 0.22,
          h: Math.max(1, c.height * 0.0012),
        },
        index % 3 === 0 ? c.palette.accent : c.palette.ink,
        { z: 16, rotation: rotation(c, 0.3) },
      );
    }
    c.decor(
      "block",
      {
        x: c.width * 0.84,
        y: 0,
        w: c.width * 0.16,
        h: c.height * 0.03,
      },
      c.palette.accent,
      { z: 16 },
    );
    addIndex(c, "bl", `FRACTURE / ${String(c.settings.seed).slice(-3)}`);
    addStamp(c, content.x + content.w * 0.68, content.y + content.h * 0.92, "LOAD BEARING");
  },
};

const anchorField: GrammarDefinition = {
  id: "anchor-field",
  name: "Anchor field",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const shiftX = (c.rng() - 0.5) * content.w * 0.08;
    const shiftY = (c.rng() - 0.5) * content.h * 0.06;

    c.decor(
      "ring",
      {
        x: content.x + content.w * 0.58 + shiftX,
        y: content.y + content.h * 0.03,
        w: content.w * 0.28,
        h: content.w * 0.28,
      },
      c.palette.alt,
      { z: 2, opacity: 0.85 },
    );

    if (h) {
      c.place(
        h,
        {
          x: content.x + content.w * 0.12 + shiftX,
          y: content.y + content.h * 0.12 + shiftY,
          w: content.w * 0.5,
          h: content.h * 0.25,
        },
        { emphasis: 1.18, z: 31, rotation: rotation(c, 0.5) },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x + content.w * 0.12 + shiftX,
          y: content.y + content.h * 0.12 + shiftY,
          w: content.w * 0.5,
          h: content.h * 0.25,
        },
        { z: 31, rotation: rotation(c, 0.5) },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.63,
          y: content.y + content.h * 0.4,
          w: content.w * 0.32,
          h: content.h * 0.33,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.65) },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.02,
          y: content.y + content.h * 0.72,
          w: content.w * 0.2,
          h: content.h * 0.06,
        },
        { z: 34, rotation: rotation(c, 0.9) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.06,
        y: content.y + content.h * 0.8,
        w: content.w * 0.62,
        h: content.h * 0.13,
      },
      { columns: 4, emphasis: 0.84, z: 27 },
    );

    for (let index = 0; index < 4; index += 1) {
      c.decor(
        "dot",
        {
          x: content.x + content.w * (0.08 + index * 0.21),
          y: content.y + content.h * (index % 2 ? 0.38 : 0.68),
          w: Math.max(6, c.width * 0.006),
          h: Math.max(6, c.width * 0.006),
        },
        index === 1 ? c.palette.accent : c.palette.ink,
        { z: 20 },
      );
    }
    c.decor(
      "bar",
      {
        x: content.x,
        y: content.y + content.h * 0.38,
        w: content.w * 0.32,
        h: Math.max(1, c.height * 0.0018),
      },
      c.palette.ink,
      { z: 17, rotation: rotation(c, 0.4) },
    );
    addIndex(c, "tr", `ANCHORS / ${String(c.settings.seed).slice(-3)}`);
  },
};

function _unusedUnionRects(rects: Rect[]): Rect {
  const left = Math.min(...rects.map((r) => r.x));
  const top = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  return { x: left, y: top, w: right - left, h: bottom - top };
}
void _unusedUnionRects;

export const chaosGrammars: GrammarDefinition[] = [
  hybridSplit,
  collisionField,
  fracture,
  anchorField,
];
