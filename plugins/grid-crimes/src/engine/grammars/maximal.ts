import type { GrammarDefinition } from "./helpers.ts";
import {
  action,
  addIndex,
  addStamp,
  ensureCoveringBacking,
  headline,
  rotation,
  visual,
} from "./helpers.ts";
import { mixHex, readableOn } from "../../shared/color.ts";
import { LAB } from "../../shared/presets.ts";

function contrastInk(background: string): string {
  return readableOn(background, [LAB.ink, LAB.paper, LAB.white]);
}

const collage: GrammarDefinition = {
  id: "collage",
  name: "Collage",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    c.decor(
      "block",
      { x: 0, y: 0, w: c.width * 0.26, h: c.height },
      mixHex(c.palette.background, c.palette.ink, 0.12),
      { z: 1 },
    );
    c.decor(
      "ring",
      {
        x: c.width * 0.06,
        y: c.height * 0.08,
        w: c.width * 0.2,
        h: c.width * 0.2,
      },
      c.palette.accent,
      { z: 2, opacity: 0.9 },
    );

    if (v) {
      c.place(
        v,
        {
          x: c.width * 0.3,
          y: c.height * 0.09,
          w: c.width * 0.64,
          h: c.height * 0.48,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.25) },
      );
    }

    if (h) {
      const rect = {
        x: content.x + content.w * 0.02,
        y: content.y + content.h * 0.28,
        w: content.w * 0.58,
        h: content.h * 0.26,
      };
      const backing = ensureCoveringBacking(c, rect, c.palette.accent, Math.round(c.width * 0.018));
      c.place(h, rect, {
        emphasis: 1.22,
        z: 31,
        backdrop: c.palette.accent,
        color: contrastInk(c.palette.accent),
        rotation: rotation(c, 0.35),
      });
      void backing;
    } else if (c.focal && !c.isPlaced(c.focal)) {
      c.place(
        c.focal,
        {
          x: content.x,
          y: content.y + content.h * 0.3,
          w: content.w * 0.55,
          h: content.h * 0.24,
        },
        { z: 31 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.72,
          y: content.y + content.h * 0.78,
          w: content.w * 0.2,
          h: content.h * 0.075,
        },
        { z: 34, rotation: rotation(c, 0.6) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.66,
        w: content.w * 0.66,
        h: content.h * 0.24,
      },
      { columns: 3, emphasis: 0.9, z: 27 },
    );

    c.decor(
      "frame",
      {
        x: c.width * 0.55,
        y: c.height * 0.61,
        w: c.width * 0.4,
        h: c.height * 0.3,
      },
      c.palette.accent,
      { z: 16, rotation: rotation(c, 0.3) },
    );
    c.decor(
      "bar",
      {
        x: 0,
        y: c.height * 0.95,
        w: c.width,
        h: c.height * 0.018,
      },
      c.palette.accent,
      { z: 18 },
    );
    c.decor(
      "dot",
      {
        x: c.width * 0.86,
        y: c.height * 0.12,
        w: c.width * 0.05,
        h: c.width * 0.05,
      },
      c.palette.alt,
      { z: 15 },
    );
    addIndex(c, "tl", `COLLAGE / ${String(c.settings.seed).slice(-3)}`);
    addStamp(c, c.width * 0.06, c.height * 0.9, "MORE / MORE", c.palette.accent);
  },
};

const spectacle: GrammarDefinition = {
  id: "spectacle",
  name: "Spectacle",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (v) {
      c.place(
        v,
        {
          x: 0,
          y: 0,
          w: c.width,
          h: c.height * 0.58,
        },
        { fit: "fill", z: 6 },
      );
    }

    if (h) {
      const rect = {
        x: content.x,
        y: content.y + content.h * 0.38,
        w: content.w * 0.72,
        h: content.h * 0.22,
      };
      const panel = c.palette.background === c.palette.accent ? c.palette.ink : c.palette.accent;
      ensureCoveringBacking(c, rect, panel, Math.round(c.width * 0.012));
      c.place(h, rect, {
        emphasis: 1.25,
        z: 31,
        backdrop: panel,
        color: contrastInk(panel),
        rotation: rotation(c, 0.2),
      });
    } else if (c.focal && !c.isPlaced(c.focal)) {
      c.place(
        c.focal,
        {
          x: content.x,
          y: content.y + content.h * 0.4,
          w: content.w * 0.7,
          h: content.h * 0.2,
        },
        { z: 31 },
      );
    }

    c.decor(
      "block",
      {
        x: 0,
        y: c.height * 0.62,
        w: c.width,
        h: c.height * 0.38,
      },
      c.palette.background,
      { z: 10, backing: true },
    );

    if (a) {
      c.place(
        a,
        {
          x: content.x,
          y: content.y + content.h * 0.84,
          w: content.w * 0.2,
          h: content.h * 0.075,
        },
        { z: 34, rotation: rotation(c, 0.4) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.24,
        y: content.y + content.h * 0.67,
        w: content.w * 0.76,
        h: content.h * 0.2,
      },
      { columns: 3, emphasis: 0.94, z: 27 },
    );

    c.decor(
      "bar",
      {
        x: content.x + content.w * 0.2,
        y: content.y + content.h * 0.63,
        w: Math.max(2, c.width * 0.0025),
        h: content.h * 0.26,
      },
      c.palette.accent,
      { z: 16 },
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
      { z: 14, opacity: 0.7 },
    );
    addIndex(c, "tr", `SPECTACLE / ${String(c.settings.seed).slice(-3)}`);
  },
};

const typeWall: GrammarDefinition = {
  id: "type-wall",
  name: "Type wall",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (h) {
      const rect = {
        x: content.x - content.w * 0.02,
        y: content.y + content.h * 0.14,
        w: content.w * 1.04,
        h: content.h * 0.36,
      };
      const panel = c.dna.backgroundMode === "ink" ? c.palette.accent : c.palette.ink;
      ensureCoveringBacking(c, rect, panel, Math.round(c.width * 0.008));
      c.place(h, rect, {
        emphasis: 1.3,
        z: 31,
        color: contrastInk(panel),
        backdrop: panel,
        align: "CENTER",
        rotation: rotation(c, 0.18),
      });
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x,
          y: content.y + content.h * 0.16,
          w: content.w,
          h: content.h * 0.32,
        },
        { z: 31, align: "CENTER" },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: 0,
          y: content.y + content.h * 0.58,
          w: c.width * 0.28,
          h: content.h * 0.2,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.72,
          y: content.y + content.h * 0.58,
          w: content.w * 0.24,
          h: content.h * 0.08,
        },
        { z: 34, rotation: rotation(c, 0.6) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.3,
        y: content.y + content.h * 0.58,
        w: content.w * 0.38,
        h: content.h * 0.2,
      },
      { direction: "column", emphasis: 0.88, z: 27 },
    );

    c.decor(
      "block",
      {
        x: 0,
        y: c.height * 0.8,
        w: c.width,
        h: c.height * 0.2,
      },
      mixHex(c.palette.background, c.palette.ink, 0.07),
      { z: 1 },
    );
    c.decor(
      "bar",
      {
        x: content.x,
        y: content.y + content.h * 0.53,
        w: content.w,
        h: Math.max(4, c.height * 0.008),
      },
      c.palette.accent,
      { z: 17 },
    );
    c.decor(
      "index",
      {
        x: content.x,
        y: content.y,
        w: content.w * 0.18,
        h: c.height * 0.03,
      },
      c.palette.accent,
      { label: "TYPE IS THE IMAGE", z: 45 },
    );
    addIndex(c, "br", `WALL / ${String(c.settings.seed).slice(-3)}`);
  },
};

const layeredStack: GrammarDefinition = {
  id: "layered-stack",
  name: "Layered stack",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    c.decor(
      "block",
      {
        x: 0,
        y: 0,
        w: c.width,
        h: c.height * 0.3,
      },
      c.palette.ink,
      { z: 1, backing: true },
    );
    c.decor(
      "block",
      {
        x: c.width * 0.08,
        y: c.height * 0.26,
        w: c.width * 0.84,
        h: c.height * 0.035,
      },
      c.palette.accent,
      { z: 12 },
    );

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y,
          w: content.w * 0.78,
          h: content.h * 0.2,
        },
        {
          emphasis: 1.24,
          z: 31,
          backdrop: c.palette.ink,
          color: c.palette.accent,
          rotation: rotation(c, 0.2),
        },
      );
    } else if (c.focal) {
      c.place(c.focal, { x: content.x, y: content.y, w: content.w * 0.76, h: content.h * 0.2 }, { z: 31 });
    }

    if (v) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.12,
          y: content.y + content.h * 0.28,
          w: content.w * 0.86,
          h: content.h * 0.36,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.12) },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.7,
          y: content.y + content.h * 0.77,
          w: content.w * 0.24,
          h: content.h * 0.08,
        },
        { z: 34, rotation: rotation(c, 0.55) },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.71,
        w: content.w * 0.66,
        h: content.h * 0.17,
      },
      { columns: 3, emphasis: 0.9, z: 27 },
    );

    c.decor(
      "frame",
      {
        x: c.width * 0.03,
        y: c.height * 0.33,
        w: c.width * 0.9,
        h: c.height * 0.56,
      },
      c.palette.accent,
      { z: 16 },
    );
    c.decor(
      "bar",
      {
        x: 0,
        y: c.height * 0.9,
        w: c.width * 0.42,
        h: c.height * 0.02,
      },
      c.palette.alt,
      { z: 18 },
    );
    addIndex(c, "tr", `LAYERS / ${String(c.settings.seed).slice(-3)}`);
    addStamp(c, content.x, content.y + content.h * 0.92, "TOO MUCH / JUST ENOUGH");
  },
};

export const maximalGrammars: GrammarDefinition[] = [
  collage,
  spectacle,
  typeWall,
  layeredStack,
];
