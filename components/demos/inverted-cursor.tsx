import { InvertedCursor } from "@/components/lab/inverted-cursor/inverted-cursor";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a studio index.
 *
 * A plausible index page for a small design studio. The cursor is real
 * and lives over the whole stage: hover the marked row for the view
 * state, the second marked row for link, the paragraph to hand the
 * I-beam back, and the archive button to feel the magnet.
 */

type Project = {
  title: string;
  type: string;
  year: string;
  cursor?: "link";
};

const PROJECTS: Project[] = [
  { title: "Harbour Line type specimen", type: "Type design", year: "2026" },
  { title: "Museum of Quiet Machines", type: "Identity", year: "2025" },
  {
    title: "Field Notes on Colour",
    type: "Editorial system",
    year: "2025",
    cursor: "link",
  },
  { title: "Backlot scheduling tool", type: "Product interface", year: "2024" },
];

/** The row the state control rewires. */
const SPECIMEN_INDEX = 0;

export default function InvertedCursorDemo({ values }: DemoProps) {
  const state = String(values.state ?? "view");
  const size = Number(values.size ?? 22);
  const grow = Number(values.grow ?? 2.6);
  const rawLabel = String(values.label ?? "VIEW");
  const label = rawLabel === "none" ? "" : rawLabel;
  const magnetic = Boolean(values.magnetic ?? true);

  /* "pressed" is pointer-down, not a hover surface: the specimen row
     grows like a link, and the legend asks for a press and hold. */
  const specimenCursor =
    state === "view" ? "view" : state === "rest" ? undefined : "link";
  const legend =
    state === "pressed"
      ? "Specimen: pressed — press and hold the marked row"
      : state === "rest"
        ? "Specimen: rest — the marked row is plain ground"
        : `Specimen: ${state} — hover the marked row`;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f5f4f1] text-[#141418]">
      <InvertedCursor
        size={size}
        grow={grow}
        label={label}
        magnetic={magnetic}
      />

      <header className="flex items-baseline justify-between gap-4 border-b border-black/10 px-6 py-4 sm:px-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8c8c94]">
            Studio index · 2026
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            Studio Vellum
          </h2>
        </div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4f27e0]"
          aria-hidden="true"
        >
          Move your pointer
        </p>
      </header>

      {/* divs rather than <li>: rows are target ground, not selectable prose. */}
      <div
        role="list"
        aria-label="Selected work"
        className="px-6 py-4 sm:px-10"
      >
        {PROJECTS.map((project, index) => {
          const specimen = index === SPECIMEN_INDEX;
          return (
            <div
              role="listitem"
              key={project.title}
              data-cursor={specimen ? specimenCursor : project.cursor}
              className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-black/10 py-3.5 ${
                specimen
                  ? "-mx-3 rounded-lg px-3 outline-2 outline-dashed -outline-offset-4 outline-[#4f27e0]/40"
                  : ""
              }`}
            >
              <h3 className="min-w-0 flex-1 text-[15px] font-medium tracking-[-0.01em]">
                {project.title}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b6b73]">
                {project.type}
              </span>
              <span className="ml-auto font-mono text-[10px] text-[#8c8c94]">
                {project.year}
              </span>
              {specimen ? (
                <span className="rounded-full bg-[#4f27e0]/10 px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] text-[#32119c]">
                  specimen · {state}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <p
        data-cursor="text"
        className="mx-6 mt-4 max-w-[54ch] text-sm leading-6 text-[#4c4c54] sm:mx-10"
      >
        Vellum keeps a working index of everything that leaves the studio:
        type specimens, identities, small internal tools. Select any of this
        line to copy it — the disc steps aside and the native I-beam takes
        over.
      </p>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-6 py-4 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8c8c94]">
          {legend}
        </p>
        <button
          type="button"
          data-cursor="magnet"
          data-cursor-magnet
          className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium text-[#141418] shadow-[0_1px_2px_rgba(20,20,24,0.06)] transition-colors hover:border-[#4f27e0]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f27e0]"
        >
          Request the full index
        </button>
      </footer>
    </div>
  );
}
