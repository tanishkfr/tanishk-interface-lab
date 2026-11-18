import type { Rect } from "../../shared/types.ts";
import type { GrammarDefinition } from "./helpers.ts";
import {
  action,
  addIndex,
  addStamp,
  headline,
  rotation,
  visual,
} from "./helpers.ts";

const brokenColumns: GrammarDefinition = {
  id: "broken-columns",
  name: "Broken columns",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (h) {
      c.place(
        h,
        {
          x: content.x + content.w * 0.03,
          y: content.y + content.h * 0.1,
          w: content.w * 0.76,
          h: content.h * 0.28,
        },
        { emphasis: 1.16, z: 31, rotation: rotation(c, 0.4) },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x + content.w * 0.03,
          y: content.y + content.h * 0.1,
          w: content.w * 0.72,
          h: content.h * 0.28,
        },
        { z: 31, rotation: rotation(c, 0.4) },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.47,
          y: content.y + content.h * 0.47,
          w: content.w * 0.56,
          h: content.h * 0.29,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.5) },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.07,
          y: content.y + content.h * 0.85,
          w: content.w * 0.22,
          h: content.h * 0.06,
        },
        { z: 34, rotation: rotation(c, 0.8) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.04,
        y: content.y + content.h * 0.49,
        w: content.w * 0.32,
        h: content.h * 0.29,
      },
      { columns: 2, emphasis: 0.88, z: 27 },
    );

    c.rule("v", content.x + content.w * 0.42, {
      start: content.y + content.h * 0.4,
      end: content.y + content.h * 0.88,
      thickness: Math.max(2, c.width * 0.002),
      z: 17,
    });
    c.rule("h", content.y + content.h * 0.44, {
      start: content.x,
      end: content.x + content.w * 0.34,
      thickness: Math.max(1, c.height * 0.0018),
      z: 17,
    });
    c.decor(
      "bar",
      {
        x: content.x + content.w * 0.58,
        y: content.y + content.h * 0.05,
        w: content.w * 0.24,
        h: Math.max(10, c.height * 0.014),
      },
      c.palette.accent,
      { z: 15, rotation: rotation(c, 0.3) },
    );
    addIndex(c, "br", `OFFSET / ${String(c.settings.seed).slice(-3)}`);
    addStamp(c, content.x + content.w * 0.45, content.y + content.h * 0.9, "FAULT LINE", c.palette.accent);
  },
};

const drift: GrammarDefinition = {
  id: "drift",
  name: "Drift",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const drift = content.w * 0.025;

    if (h) {
      c.place(
        h,
        {
          x: content.x + drift * 1.2,
          y: content.y + content.h * 0.08,
          w: content.w * 0.75,
          h: content.h * 0.27,
        },
        { emphasis: 1.12, rotation: rotation(c, 0.35), z: 31 },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x + drift,
          y: content.y + content.h * 0.08,
          w: content.w * 0.72,
          h: content.h * 0.27,
        },
        { z: 31, rotation: rotation(c, 0.35) },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.38,
          y: content.y + content.h * 0.46,
          w: content.w * 0.6,
          h: content.h * 0.31,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.45) },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.08,
          y: content.y + content.h * 0.85,
          w: content.w * 0.24,
          h: content.h * 0.06,
        },
        { z: 34, rotation: rotation(c, 0.9) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.04,
        y: content.y + content.h * 0.46,
        w: content.w * 0.28,
        h: content.h * 0.34,
      },
      { direction: "column", emphasis: 0.9, z: 27 },
    );

    for (let index = 0; index < 5; index += 1) {
      c.decor(
        "rule",
        {
          x: content.x + drift * index,
          y: content.y + content.h * (0.16 + index * 0.16),
          w: content.w * 0.18,
          h: Math.max(1, c.height * 0.0014),
        },
        index % 2 ? c.palette.accent : c.palette.ink,
        { z: 17, rotation: rotation(c, 0.18) },
      );
    }
    c.decor(
      "block",
      {
        x: content.x + content.w * 0.81,
        y: content.y + content.h * 0.06,
        w: content.w * 0.15,
        h: content.h * 0.03,
      },
      c.palette.alt,
      { z: 15, rotation: rotation(c, 0.5) },
    );
    addIndex(c, "tr", `DRIFT / ${String(c.settings.seed).slice(-3)}`);
  },
};

const stagger: GrammarDefinition = {
  id: "stagger",
  name: "Stagger",
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
          y: content.y + content.h * 0.05,
          w: content.w * 0.72,
          h: content.h * 0.24,
        },
        { emphasis: 1.14, z: 31, rotation: rotation(c, 0.2) },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x,
          y: content.y + content.h * 0.05,
          w: content.w * 0.7,
          h: content.h * 0.25,
        },
        { z: 31 },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.52,
          y: content.y + content.h * 0.36,
          w: content.w * 0.46,
          h: content.h * 0.28,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.35) },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.06,
          y: content.y + content.h * 0.86,
          w: content.w * 0.22,
          h: content.h * 0.06,
        },
        { z: 34, rotation: rotation(c, 0.7) },
      );
    }

    const remaining = c.remaining;
    if (remaining.length) {
      const zone: Rect = {
        x: content.x + content.w * 0.03,
        y: content.y + content.h * 0.42,
        w: content.w * 0.4,
        h: content.h * 0.36,
      };
      const columns = remaining.length > 4 ? 2 : 1;
      const rows = Math.ceil(remaining.length / columns);
      const gap = Math.max(6, c.gutterPx * 0.7);
      const cellW = (zone.w - gap * (columns - 1)) / columns;
      const cellH = (zone.h - gap * (rows - 1)) / rows;
      remaining.forEach((block, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const shift = (row % 2 === 0 ? 1 : -1) * content.w * 0.018;
        c.place(
          block,
          {
            x: zone.x + column * (cellW + gap) + shift,
            y: zone.y + row * (cellH + gap),
            w: cellW,
            h: cellH,
          },
          { z: 27, emphasis: 0.86 },
        );
      });
    }

    for (let index = 0; index < 4; index += 1) {
      c.decor(
        "rule",
        {
          x: content.x + (index % 2 ? content.w * 0.46 : content.w * 0.04),
          y: content.y + content.h * (0.35 + index * 0.13),
          w: content.w * 0.26,
          h: Math.max(1, c.height * 0.0015),
        },
        index === 2 ? c.palette.accent : c.palette.ink,
        { z: 16 },
      );
    }
    addIndex(c, "br", `STAGGER / ${String(c.settings.seed).slice(-3)}`);
  },
};

const orbit: GrammarDefinition = {
  id: "orbit",
  name: "Orbit",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const cx = content.x + content.w * 0.44;
    const cy = content.y + content.h * 0.34;

    c.decor(
      "ring",
      {
        x: cx - content.w * 0.18,
        y: cy - content.w * 0.18,
        w: content.w * 0.36,
        h: content.w * 0.36,
      },
      c.palette.accent,
      { z: 2, opacity: 0.9 },
    );

    if (h) {
      c.place(
        h,
        {
          x: content.x + content.w * 0.28,
          y: content.y + content.h * 0.18,
          w: content.w * 0.5,
          h: content.h * 0.24,
        },
        { emphasis: 1.14, z: 31, align: "CENTER", rotation: rotation(c, 0.3) },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        {
          x: content.x + content.w * 0.26,
          y: content.y + content.h * 0.18,
          w: content.w * 0.48,
          h: content.h * 0.24,
        },
        { z: 31, align: "CENTER" },
      );
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + content.w * 0.66,
          y: content.y + content.h * 0.45,
          w: content.w * 0.29,
          h: content.h * 0.27,
        },
        { fit: "fill", z: 8, rotation: rotation(c, 0.55) },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + content.w * 0.06,
          y: content.y + content.h * 0.6,
          w: content.w * 0.2,
          h: content.h * 0.06,
        },
        { z: 34, rotation: rotation(c, 1) },
      );
    }

    c.placeSupport(
      {
        x: content.x + content.w * 0.05,
        y: content.y + content.h * 0.72,
        w: content.w * 0.9,
        h: content.h * 0.2,
      },
      { columns: 4, emphasis: 0.86, z: 27 },
    );

    c.decor(
      "rule",
      {
        x: content.x + content.w * 0.08,
        y: content.y + content.h * 0.13,
        w: content.w * 0.16,
        h: Math.max(1, c.height * 0.0014),
      },
      c.palette.ink,
      { z: 18, rotation: rotation(c, 0.6) },
    );
    c.decor(
      "cross",
      {
        x: content.x + content.w * 0.08,
        y: content.y + content.h * 0.82,
        w: content.w * 0.04,
        h: content.w * 0.04,
      },
      c.palette.accent,
      { z: 22 },
    );
    addIndex(c, "tl", `ORBIT / ${String(c.settings.seed).slice(-3)}`);
    addIndex(c, "br", `OFF AXIS / ${String(c.settings.seed).slice(-2)}`);
  },
};

export const antigridGrammars: GrammarDefinition[] = [
  brokenColumns,
  drift,
  stagger,
  orbit,
];
