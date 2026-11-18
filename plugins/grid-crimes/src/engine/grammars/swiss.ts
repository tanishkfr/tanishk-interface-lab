import type { Rect } from "../../shared/types.ts";
import { gridCell } from "../compose.ts";
import type { GrammarDefinition } from "./helpers.ts";
import {
  action,
  addIndex,
  addRuleGrid,
  headline,
  rotation,
  visual,
} from "./helpers.ts";

function columnsFor(c: {
  content: Rect;
  dna: { columns: number; gutter: number };
}) {
  const columns = Math.max(4, c.dna.columns);
  const gutter = Math.max(8, Math.round(c.dna.gutter * Math.min(c.content.w, c.content.h)));
  const colW = (c.content.w - gutter * (columns - 1)) / columns;
  return {
    columns,
    gutter,
    rect: (start: number, span: number, y: number, h: number): Rect => ({
      x: c.content.x + start * (colW + gutter),
      y,
      w: colW * span + gutter * Math.max(0, span - 1),
      h,
    }),
  };
}

const asymmetricGrid: GrammarDefinition = {
  id: "asymmetric-grid",
  name: "Asymmetric grid",
  build(c) {
    const content = c.content;
    const grid = columnsFor(c);
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (h) {
      c.place(
        h,
        grid.rect(0, 7, content.y, content.h * 0.32),
        { emphasis: 1.1, z: 31 },
      );
    } else if (c.focal) {
      c.place(c.focal, grid.rect(0, 7, content.y, content.h * 0.32), { z: 31 });
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        grid.rect(7, 5, content.y + content.h * 0.06, content.h * 0.5),
        { fit: "fill", z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        grid.rect(0, 3, content.y + content.h * 0.78, content.h * 0.08),
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: grid.rect(4, 8, 0, 0).x,
        y: content.y + content.h * 0.62,
        w: grid.rect(4, 8, 0, 0).w,
        h: content.h * 0.26,
      },
      { columns: 3, emphasis: 0.92, z: 27 },
    );

    c.rule("h", content.y + content.h * 0.52, {
      start: content.x,
      end: content.x + grid.rect(0, 4, 0, 0).w,
      thickness: Math.max(1, c.height * 0.002),
      z: 18,
    });
    c.rule("h", content.y + content.h * 0.9, {
      thickness: Math.max(2, c.height * 0.004),
      z: 18,
    });
    c.decor(
      "block",
      {
        x: content.x,
        y: content.y + content.h * 0.36,
        w: Math.max(20, grid.rect(0, 1, 0, 0).w * 0.6),
        h: Math.max(2, c.height * 0.004),
      },
      c.palette.accent,
      { z: 20 },
    );
    addIndex(c, "tr", `SWISS / ${String(c.settings.seed).slice(-3)} / ${grid.columns} COL`);
  },
};

const editorialSpread: GrammarDefinition = {
  id: "editorial-spread",
  name: "Editorial spread",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);

    if (v) {
      c.place(
        v,
        {
          x: c.width * 0.56,
          y: 0,
          w: c.width * 0.44,
          h: c.height * 0.7,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y + content.h * 0.02,
          w: content.w * 0.48,
          h: content.h * 0.35,
        },
        { emphasis: 1.08, z: 31 },
      );
    } else if (c.focal) {
      c.place(
        c.focal,
        { x: content.x, y: content.y, w: content.w * 0.5, h: content.h * 0.34 },
        { z: 31 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x,
          y: content.y + content.h * 0.82,
          w: content.w * 0.2,
          h: content.h * 0.065,
        },
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.47,
        w: content.w * 0.46,
        h: content.h * 0.28,
      },
      { columns: 2, emphasis: 0.94, z: 27 },
    );

    c.rule("h", content.y + content.h * 0.1, {
      thickness: Math.max(1, c.height * 0.0025),
      z: 19,
    });
    c.rule("h", content.y + content.h * 0.93, {
      thickness: Math.max(1, c.height * 0.0025),
      z: 19,
    });
    c.rule("v", content.x + content.w * 0.51, {
      start: content.y + content.h * 0.1,
      end: content.y + content.h * 0.78,
      thickness: Math.max(1, c.width * 0.0012),
      z: 19,
    });
    addIndex(c, "tr", `EDITORIAL / ${String(c.settings.seed).slice(-3)}`);
  },
};

const modular: GrammarDefinition = {
  id: "modular",
  name: "Modular field",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const grid = columnsFor(c);
    const cellW = grid.rect(0, 1, 0, 0).w;
    const gap = grid.gutter;
    const cols = 3;
    const rows = 3;
    const cellH = (content.h - gap * 2) / rows;

    if (h) {
      c.place(
        h,
        grid.rect(0, 2, content.y, cellH),
        { emphasis: 1.06, z: 31 },
      );
    } else if (c.focal) {
      c.place(c.focal, grid.rect(0, 2, content.y, cellH), { z: 31 });
    }

    if (v && !c.isPlaced(v)) {
      c.place(
        v,
        {
          x: content.x + (cellW + gap) * 2,
          y: content.y,
          w: cellW,
          h: cellH + gap + cellH,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x + cellW * 2 + gap,
          y: content.y + cellH * 2 + gap + cellH * 0.04,
          w: cellW,
          h: cellH * 0.26,
        },
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + cellH + gap,
        w: cellW * 2 + gap,
        h: cellH * 2 + gap,
      },
      { columns: 2, emphasis: 0.9, z: 27 },
    );

    for (let index = 1; index < cols; index += 1) {
      c.rule("v", content.x + index * (cellW + gap) - gap / 2, {
        start: content.y,
        end: content.y + content.h,
        thickness: Math.max(1, c.width * 0.0012),
        z: 18,
      });
    }
    for (let index = 1; index < rows; index += 1) {
      c.rule("h", content.y + index * (cellH + gap) - gap / 2, {
        start: content.x,
        end: content.x + content.w,
        thickness: Math.max(1, c.height * 0.0012),
        z: 18,
      });
    }
    c.decor(
      "block",
      {
        x: content.x + cellW * 2 + gap,
        y: content.y + cellH * 2 + gap * 2,
        w: cellW,
        h: Math.max(10, cellH * 0.16),
      },
      c.palette.accent,
      { z: 14, backing: true },
    );
    addIndex(c, "br", `MODULAR / ${String(c.settings.seed).slice(-3)}`);
  },
};

const posterColumn: GrammarDefinition = {
  id: "poster-column",
  name: "Poster column",
  build(c) {
    const content = c.content;
    const h = headline(c);
    const v = visual(c);
    const a = action(c);
    const leftW = content.w * 0.34;
    const rightX = content.x + content.w * 0.41;

    if (v) {
      c.place(
        v,
        {
          x: rightX,
          y: content.y + content.h * 0.03,
          w: content.w * 0.57,
          h: content.h * 0.62,
        },
        { fit: "fill", z: 8 },
      );
    }

    if (h) {
      c.place(
        h,
        {
          x: content.x,
          y: content.y,
          w: leftW,
          h: content.h * 0.38,
        },
        { emphasis: 1.14, z: 31 },
      );
    } else if (c.focal) {
      c.place(c.focal, { x: content.x, y: content.y, w: leftW, h: content.h * 0.36 }, { z: 31 });
    }

    if (a) {
      c.place(
        a,
        {
          x: content.x,
          y: content.y + content.h * 0.4,
          w: leftW * 0.85,
          h: content.h * 0.075,
        },
        { z: 34 },
      );
    }

    c.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.5,
        w: leftW,
        h: content.h * 0.36,
      },
      { direction: "column", emphasis: 0.94, z: 27 },
    );

    c.rule("v", content.x + content.w * 0.38, {
      start: content.y,
      end: content.y + content.h,
      thickness: Math.max(2, c.width * 0.002),
      z: 17,
    });
    c.rule("h", content.y + content.h * 0.7, {
      start: rightX,
      end: content.x + content.w,
      thickness: Math.max(1, c.height * 0.002),
      z: 17,
    });
    c.decor(
      "bar",
      {
        x: rightX,
        y: content.y + content.h * 0.66,
        w: content.w * 0.15,
        h: Math.max(10, c.height * 0.016),
      },
      c.palette.accent,
      { z: 15 },
    );
    addIndex(c, "bl", `POSTER / ${String(c.settings.seed).slice(-3)}`);
    addRuleGrid(c, 1);
  },
};

export const swissGrammars: GrammarDefinition[] = [
  asymmetricGrid,
  editorialSpread,
  modular,
  posterColumn,
];
