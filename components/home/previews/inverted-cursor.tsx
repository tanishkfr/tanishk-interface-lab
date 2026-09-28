/**
 * CATALOG PREVIEW — Inverted Cursor.
 *
 * A still studio index. The white disc rests half on the dark page ground
 * and half on the light index card, so the difference blend reads as a
 * split disc — one side light, one side dark. On hover it glides down
 * onto the small OPEN chip and grows.
 */
export default function InvertedCursorPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#141418] p-4">
      <div className="absolute inset-y-4 left-[26%] right-4 rounded-xl bg-[#f6f5f2] p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8c8c94]">
            Studio Vellum
          </span>
          <span className="rounded-full border border-black/10 px-2 py-[1px] font-mono text-[8px] uppercase tracking-[0.12em] text-[#6b6b73]">
            index
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <Row title="Harbour Line" meta="Type · 2026" />
          <Row title="Quiet Machines" meta="Identity · 2025" />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-md bg-black/[0.04] px-2 py-1.5">
          <span className="rounded-full bg-[#1b1b21] px-2 py-[2px] font-mono text-[8px] tracking-[0.12em] text-white">
            OPEN
          </span>
          <span className="text-[9px] text-[#6b6b73]">Full archive</span>
        </div>

        {/* The cursor disc — plain div, difference-blended, never mounted. */}
        <div className="pointer-events-none absolute -left-2 top-[56px] h-3.5 w-3.5 rounded-full bg-white mix-blend-difference transition-all duration-500 ease-out group-hover/preview:translate-x-[38px] group-hover/preview:translate-y-[42px] group-hover/preview:scale-[2]" />
      </div>
    </div>
  );
}

function Row({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-black/5 pb-1.5">
      <span className="truncate text-[10px] font-medium text-[#141418]">
        {title}
      </span>
      <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.1em] text-[#8c8c94]">
        {meta}
      </span>
    </div>
  );
}
