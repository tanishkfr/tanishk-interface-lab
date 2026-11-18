import type { GrammarDefinition } from "./helpers.ts";
import {
  action,
  addIndex,
  headline,
  rotation,
  visual,
} from "./helpers.ts";

const focalLow: GrammarDefinition = {
  id: "focal-low",
  name: "Low focal",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y + content.h * 0.47,
          w: content.w * 0.62,
          h: content.h * 0.2,
        },
        { emphasis: 1.14, z: 31 },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x,
          y: content.y + content.h * 0.46,
          w: content.w * 0.58,
          h: content.h * 0.22,
        },
        { emphasis: 1.04, z: 31 },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.66,
          y: content.y + content.h * 0.15,
          w: content.w * 0.22,
          h: content.h * 0.24,
        },
        { z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x,
          y: content.y + content.h * 0.73,
          w: content.w * 0.22,
          h: content.h * 0.06,
        },
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.47,
        y: content.y + content.h * 0.72,
        w: content.w * 0.42,
        h: content.h * 0.18,
      },
      { columns: 2, emphasis: 0.78, z: 27 },
    );

    c.decor(
      "dot",
      {
        x: content.x,
        y: content.y + content.h * 0.02,
        w: Math.max(10, c.width * 0.008),
        h: Math.max(10, c.width * 0.008),
      },
      c.palette.accent,
      { z: 22 },
    );
    c.rule("h", content.y + content.h * 0.9, {
      start: content.x,
      end: content.x + content.w * 0.5,
      thickness: Math.max(1, c.height * 0.0018),
      z: 18,
    });
    addIndex(c, "tl", `RADICAL / ${String(c.settings.seed).slice(-3)}`);
  },
};

const horizon: GrammarDefinition = {
  id: "horizon",
  name: "Horizon",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (v) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.4,
          y: content.y + content.h * 0.14,
          w: content.w * 0.2,
          h: content.h * 0.2,
        },
        { z: 8 },
      );
    }

    if (h) {
      c.place(
        h,
        {
          x: content.x + content.w * 0.14,
          y: content.y + content.h * 0.48,
          w: content.w * 0.72,
          h: content.h * 0.17,
        },
        { emphasis: 1.12, align: "CENTER", z: 31 },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x + content.w * 0.18,
          y: content.y + content.h * 0.46,
          w: content.w * 0.64,
          h: content.h * 0.18,
        },
        { align: "CENTER", z: 31, emphasis: 1.03 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.38,
          y: content.y + content.h * 0.68,
          w: content.w * 0.24,
          h: content.h * 0.055,
        },
        { z: 34, align: "CENTER" },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.16,
        y: content.y + content.h * 0.8,
        w: content.w * 0.68,
        h: content.h * 0.11,
      },
      { direction: "row", emphasis: 0.76, z: 27, align: "CENTER" },
    );

    c.decor(
      "rule",
      {
        x: content.x + content.w * 0.2,
        y: content.y + content.h * 0.7,
        w: content.w * 0.6,
        h: Math.max(1, c.height * 0.0015),
      },
      c.palette.ink,
      { z: 18 },
    );
    c.decor(
      "ring",
      {
        x: content.x + content.w * 0.46,
        y: content.y + content.h * 0.86,
        w: Math.max(8, c.width * 0.007),
        h: Math.max(8, c.width * 0.007),
      },
      c.palette.accent,
      { z: 22 },
    );
    addIndex(c, "tr", `HORIZON / ${String(c.settings.seed).slice(-3)}`);
  },
};

const edge: GrammarDefinition = {
  id: "edge",
  name: "Edge tension",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (v) {
      c.place(
        v,
        {
          x: c.width * 0.72,
          y: content.y + content.h * 0.08,
          w: c.width * 0.28,
          h: content.h * 0.32,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (h) {
      c.place(
        h,
        {
          x: content.x * 0.45,
          y: content.y + content.h * 0.26,
          w: content.w * 0.65,
          h: content.h * 0.28,
        },
        { emphasis: 1.16, z: 31, align: "LEFT" },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x * 0.45,
          y: content.y + content.h * 0.24,
          w: content.w * 0.6,
          h: content.h * 0.26,
        },
        { z: 31 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.53,
          y: content.y + content.h * 0.63,
          w: content.w * 0.2,
          h: content.h * 0.055,
        },
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.63,
        w: content.w * 0.46,
        h: content.h * 0.24,
      },
      { columns: 2, emphasis: 0.8, z: 27 },
    );

    c.rule("v", c.width * 0.69, {
      start: 0,
      end: c.height,
      thickness: Math.max(1, c.width * 0.0012),
      z: 18,
    });
    c.decor(
      "index",
      {
        x: content.x,
        y: content.y + content.h * 0.08,
        w: Math.max(50, c.width * 0.1),
        h: Math.max(14, c.height * 0.024),
      },
      c.palette.accent,
      { label: "EDGE / 01", z: 44 },
    );
    addIndex(c, "bl", `RADICAL / ${String(c.settings.seed).slice(-3)}`);
  },
};

const quietStack: GrammarDefinition = {
  id: "quiet-stack",
  name: "Quiet stack",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const columnX = content.x;
    const columnW = content.w * 0.46;

    if (v) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.62,
          y: content.y + content.h * 0.1,
          w: content.w * 0.26,
          h: content.h * 0.3,
        },
        { z: 8 },
      );
    }

    if (h) {
      c.place(
        h,
        {
          x: columnX,
          y: content.y + content.h * 0.5,
          w: columnW,
          h: content.h * 0.14,
        },
        { emphasis: 1.08, z: 31 },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: columnX,
          y: content.y + content.h * 0.46,
          w: columnW,
          h: content.h * 0.18,
        },
        { z: 31 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: columnX,
          y: content.y + content.h * 0.88,
          w: columnW * 0.55,
          h: content.h * 0.05,
        },
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: columnX,
        y: content.y + content.h * 0.64,
        w: columnW,
        h: content.h * 0.23,
      },
      { columns: 2, emphasis: 0.8, z: 27 },
    );

    c.decor(
      "bar",
      {
        x: content.x + content.w * 0.58,
        y: content.y + content.h * 0.46,
        w: Math.max(2, c.width * 0.0025),
        h: content.h * 0.28,
      },
      c.palette.ink,
      { z: 18 },
    );
    c.decor(
      "block",
      {
        x: content.x + content.w * 0.62,
        y: content.y + content.h * 0.44,
        w: Math.max(12, c.width * 0.04),
        h: Math.max(12, c.width * 0.04),
      },
      c.palette.accent,
      { z: 16 },
    );
    addIndex(c, "tr", `QUIET / ${String(c.settings.seed).slice(-3)}`);
    void rotation;
  },
};

export const minimalGrammars: GrammarDefinition[] = [
  focalLow,
  horizon,
  edge,
  quietStack,
];
