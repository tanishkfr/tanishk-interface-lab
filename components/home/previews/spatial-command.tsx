/**
 * CATALOG PREVIEW — Spatial Command Menu.
 *
 * A miniature palette: a query with a live caret, three results in two
 * groups, and a slim preview block. On hover the highlight steps down one
 * row and the preview content swaps — neither reflows the list.
 */
export default function SpatialCommandPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2]">
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white shadow-[0_10px_30px_-12px_rgba(20,20,24,0.25)]">
        <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-[1.5px] border-black/25" />
          <span className="font-mono text-[9px] text-[#5f5f68]">new</span>
          <span aria-hidden="true" className="h-3 w-px animate-pulse bg-[#4f27e0]" />
          <span className="ml-auto rounded border border-black/10 px-1 py-px font-mono text-[8px] text-[#8c8c94]">
            esc
          </span>
        </div>

        <div className="flex gap-2.5 p-2.5">
          <div className="min-w-0 flex-1">
            <p className="px-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#8c8c94]">
              Create
            </p>
            <div className="relative mt-1 space-y-1">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-10 h-6 rounded-md bg-[#4f27e0]/[0.07] ring-1 ring-[#4f27e0]/30 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:translate-y-[28px]"
              />
              <MiniRow label="New document" hint="⌘N" />
              <MiniRow label="New from template" />
            </div>
            <p className="mt-1.5 px-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#8c8c94]">
              Navigate
            </p>
            <div className="mt-1">
              <MiniRow label="Open recent" hint="⌘1" />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative h-[96px] w-[68px] flex-none overflow-hidden rounded-md border border-black/10 bg-[#fbfbfa]"
          >
            <div className="absolute inset-2 transition-opacity duration-500 group-hover/preview:opacity-0">
              <span className="block h-6 rounded-sm bg-[#4f27e0]/15" />
              <span className="mt-1.5 block h-1 w-4/5 rounded-full bg-black/20" />
              <span className="mt-1 block h-1 w-3/5 rounded-full bg-black/10" />
            </div>
            <div className="absolute inset-2 opacity-0 transition-opacity duration-500 group-hover/preview:opacity-100">
              <span className="block h-1 w-full rounded-full bg-black/20" />
              <span className="mt-1 block h-1 w-2/3 rounded-full bg-black/10" />
              <span className="mt-1.5 block h-3 w-3/5 rounded-sm bg-[#4f27e0]/15" />
              <span className="mt-1 block h-1 w-4/5 rounded-full bg-black/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRow({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex h-6 items-center justify-between rounded-md px-1.5">
      <span className="truncate text-[9px] text-[#141418]">{label}</span>
      {hint ? <span className="font-mono text-[8px] text-[#8c8c94]">{hint}</span> : null}
    </div>
  );
}
