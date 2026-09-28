/**
 * CATALOG PREVIEW — Contextual Dock.
 *
 * A miniature document with a sentence selected and the dock beneath
 * it. On hover the action set cross-fades to the multi-selection set
 * and the “3 selected” line appears — same footprint, different
 * context, nothing moves.
 */
export default function ContextualDockPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2]">
      <div className="absolute inset-x-5 top-5 space-y-1.5">
        <span className="block h-2 w-1/2 rounded-full bg-black/25" />
        <span className="block h-1.5 w-full rounded-full bg-black/10" />
        <span className="block h-1.5 w-4/5 rounded-full bg-black/10" />
      </div>

      <div className="absolute inset-x-5 top-[38%] rounded-lg bg-[#4f27e0]/[0.06] p-2 ring-1 ring-[#4f27e0]/25">
        <span className="block h-1.5 w-11/12 rounded-full bg-[#141418]/35" />
        <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-[#141418]/20" />
        <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-[4px] bg-[#4f27e0] text-[8px] font-semibold leading-none text-white opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100">
          3
        </span>
      </div>

      <div className="absolute inset-x-4 bottom-4 rounded-xl border border-black/10 bg-white shadow-[0_8px_22px_-10px_rgba(20,20,24,0.3)]">
        <div className="grid p-1.5">
          <div className="col-start-1 row-start-1 flex gap-1 transition-opacity duration-300 group-hover/preview:opacity-0">
            <Pill>Bold</Pill>
            <Pill>Comment</Pill>
            <Pill>Quote</Pill>
          </div>
          <div className="col-start-1 row-start-1 flex gap-1 opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100">
            <Pill>Align</Pill>
            <Pill>Group</Pill>
            <Pill>Export</Pill>
          </div>
        </div>
        <div className="flex h-6 items-center gap-2 border-t border-black/5 px-2.5">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8c8c94]">
            no selection
          </span>
          <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.14em] text-[#32119c] opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100">
            3 selected
          </span>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-md px-1.5 py-1 text-[8px] leading-none text-[#141418] ring-1 ring-black/10">
      {children}
    </span>
  );
}
