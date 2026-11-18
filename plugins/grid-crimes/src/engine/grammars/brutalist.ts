import type { Rect } from "../../shared/types.ts";
import type { GrammarDefinition } from "./helpers.ts";
import {
  action,
  addEdgeTicks,
  addIndex,
  addStamp,
  headline,
  placeSupportBand,
  rotation,
  safeRect,
  visual,
} from "./helpers.ts";

const monument: GrammarDefinition = {
  id: "monument",
  name: "Monument",
  build(c) {
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const pad = c.marginPx;
    const content = c.content;

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y + content.h * 0.015,
          w: content.w * 0.92,
          h: content.h * 0.38,
        },
        { rotation: rotation(c, 0.18), emphasis: 1.16, z: 31 },
      );
    } else if (v) {
      c.place(
        v,
        {
          x: content.x,
          y: content.y,
          w: content.w * 0.9,
          h: content.h * 0.48,
        },
        { emphasis: 1.05, z: 31 },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.47,
          y: content.y + content.h * 0.45,
          w: content.w * 0.55,
          h: content.h * 0.3,
        },
        { rotation: rotation(c, 0.22), z: 8, fit: "fill" },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.42,
          y: content.y + content.h * 0.8,
          w: content.w * 0.22,
          h: content.h * 0.075,
        },
        { z: 34, rotation: rotation(c, 0.3) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.47,
        w: content.w * 0.36,
        h: content.h * 0.32,
      },
      { columns: 2, z: 27, emphasis: 0.9 },
    );

    c.decor(
      "bar",
      {
        x: 0,
        y: 0,
        w: Math.max(28, c.width * 0.018),
        h: c.height * 0.42,
      },
      c.palette.accent,
      { z: 2 },
    );
    c.decor(
      "block",
      {
        x: content.x + content.w * 0.78,
        y: 0,
        w: c.width * 0.22,
        h: Math.max(10, c.height * 0.018),
      },
      c.palette.alt,
      { z: 3 },
    );
    c.rule("h", content.y + content.h * 0.43, { thickness: Math.max(2, c.height * 0.006) });
    c.rule("v", content.x + content.w * 0.41, {
      start: content.y + content.h * 0.43,
      end: content.y + content.h * 0.9,
      thickness: Math.max(2, c.width * 0.0025),
    });
    c.rule("h", content.y + content.h * 0.92, {
      thickness: Math.max(1, c.height * 0.0025),
      color: c.palette.ink,
    });
    addIndex(c, "tr", `MONUMENT / ${String(c.settings.seed).slice(-3)}`);
    addEdgeTicks(c);
    addStamp(c, content.x, content.y + content.h * 0.93, "NO APOLOGIES", c.palette.accent);
    void pad;
  },
};

const split: GrammarDefinition = {
  id: "split",
  name: "Hard split",
  build(c) {
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const content = c.content;

    if (v) {
      c.place(
        v,
        {
          x: 0,
          y: 0,
          w: c.width * (0.42 + c.rng() * 0.05),
          h: c.height * 0.82,
        },
        { fit: "fill", z: 6 },
      );
    }
    if (h) {
      c.place(
        h,
        {
          x: content.x + content.w * 0.5,
          y: content.y + content.h * 0.06,
          w: content.w * 0.5,
          h: content.h * 0.42,
        },
        { emphasis: 1.18, rotation: rotation(c, 0.12), z: 31 },
      );
    } else if (c.focal && !c.isPlaced(c.focal)) {
      const focalRect: Rect = {
        x: content.x + content.w * 0.5,
        y: content.y + content.h * 0.08,
        w: content.w * 0.5,
        h: content.h * 0.38,
      };
      c.place(c.focal, focalRect, { emphasis: 1.05, z: 31 });
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.5,
          y: content.y + content.h * 0.84,
          w: content.w * 0.26,
          h: content.h * 0.075,
        },
        { z: 34, rotation: rotation(c, 0.2) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.5,
        y: content.y + content.h * 0.54,
        w: content.w * 0.45,
        h: content.h * 0.25,
      },
      { columns: 2, emphasis: 0.92, z: 27 },
    );

    c.decor(
      "bar",
      {
        x: c.width * 0.42,
        y: content.y + content.h * 0.11,
        w: Math.max(16, c.width * 0.01),
        h: content.h * 0.6,
      },
      c.palette.accent,
      { z: 9 },
    );
    c.rule("h", content.y + content.h * 0.92, {
      start: content.x + content.w * 0.5,
      end: c.width,
      thickness: Math.max(2, c.height * 0.004),
    });
    addIndex(c, "br", `HARD SPLIT / ${String(c.settings.seed).slice(-3)}`);
    addEdgeTicks(c);
  },
};

const stack: GrammarDefinition = {
  id: "stack",
  name: "Band stack",
  build(c) {
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const content = c.content;
    const topH = content.h * 0.32;
    const midH = content.h * 0.4;

    if (!c.settings.preserveColors) {
      c.decor(
        "block",
        { x: 0, y: 0, w: c.width, h: content.y + topH },
        c.palette.ink,
        { z: 1, backing: true },
      );
    }

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y,
          w: content.w * 0.85,
          h: topH,
        },
        {
          emphasis: 1.22,
          z: 31,
          backdrop: c.settings.preserveColors ? c.palette.background : c.palette.ink,
          color: c.settings.preserveColors ? null : c.palette.accent,
        },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        { x: content.x, y: content.y, w: content.w * 0.8, h: topH },
        { emphasis: 1.04, z: 31 },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x,
          y: content.y + topH + content.h * 0.035,
          w: content.w * 0.72,
          h: midH,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.76,
          y: content.y + topH + content.h * 0.04,
          w: content.w * 0.22,
          h: content.h * 0.1,
        },
        { z: 34, rotation: rotation(c, 0.3) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + topH + midH + content.h * 0.09,
        w: content.w,
        h: content.h * 0.15,
      },
      { direction: "row", emphasis: 0.9, z: 27, gap: c.gutterPx },
    );

    c.rule("h", content.y + topH + content.h * 0.01, {
      thickness: Math.max(3, c.height * 0.008),
      color: c.palette.accent,
    });
    c.rule("h", content.y + content.h * 0.94, {
      thickness: Math.max(2, c.height * 0.004),
    });
    addIndex(c, "tr", `BAND STACK / ${String(c.settings.seed).slice(-3)}`);
    addStamp(c, content.x + content.w * 0.78, content.y + content.h * 0.95, "STRUCTURE");
  },
};

const stair: GrammarDefinition = {
  id: "stair",
  name: "Stair tension",
  build(c) {
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const content = c.content;

    if (h) {
      c.place(
        h,
        {
          x: content.x + content.w * 0.035,
          y: content.y + content.h * 0.06,
          w: content.w * 0.8,
          h: content.h * 0.31,
        },
        { emphasis: 1.2, rotation: rotation(c, 0.35), z: 31 },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x + content.w * 0.035,
          y: content.y + content.h * 0.05,
          w: content.w * 0.76,
          h: content.h * 0.34,
        },
        { z: 31, emphasis: 1.05 },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.48,
          y: content.y + content.h * 0.47,
          w: content.w * 0.52,
          h: content.h * 0.33,
        },
        { fit: "fill", rotation: rotation(c, 0.5), z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.56,
          y: content.y + content.h * 0.86,
          w: content.w * 0.2,
          h: content.h * 0.07,
        },
        { z: 34, rotation: rotation(c, 0.6) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.5,
        w: content.w * 0.3,
        h: content.h * 0.35,
      },
      { direction: "column", emphasis: 0.94, z: 27 },
    );

    for (let index = 0; index < 4; index += 1) {
      c.decor(
        "rule",
        {
          x: content.x + index * content.w * 0.02,
          y: content.y + content.h * (0.4 + index * 0.055),
          w: content.w * (0.66 - index * 0.06),
          h: Math.max(2, c.height * 0.0035),
        },
        index === 1 ? c.palette.accent : c.palette.ink,
        { z: 12 + index },
      );
    }
    c.decor(
      "bar",
      { x: 0, y: c.height * 0.88, w: c.width * 0.34, h: c.height * 0.018 },
      c.palette.alt,
      { z: 3 },
    );
    addIndex(c, "tl", `STAIR / ${String(c.settings.seed).slice(-3)}`);
    addEdgeTicks(c);
  },
};

export const brutalistGrammars: GrammarDefinition[] = [
  monument,
  split,
  stack,
  stair,
];
