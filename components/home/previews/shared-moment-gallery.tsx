/**
 * CATALOG PREVIEW — Shared Moment Gallery.
 * A light gallery wall where one study lifts into a detail frame.
 * Lab chrome around the photographs; the images keep their own colour.
 */
export default function SharedMomentGalleryPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[320px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-end justify-between border-b border-black/10 pb-1.5">
          <div>
            <p className="font-mono text-[5px] uppercase tracking-[0.14em] text-[#4f27e0]">
              Field studies / Vol. 02
            </p>
            <p className="mt-0.5 text-[16px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
              Six observations of light.
            </p>
          </div>
          <span className="font-mono text-[5px] uppercase tracking-wide text-[#8c8c94]">2024—25</span>
        </div>

        <div className="relative mt-2 grid h-[160px] grid-cols-3 grid-rows-2 gap-1.5">
          <div className="relative col-span-2 row-span-1 overflow-hidden rounded-md border border-black/10 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:scale-[0.98]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4c7b3_0%,#e5a189_52%,#9a5a48_100%)]" />
            <div className="absolute right-[16%] top-[22%] h-6 w-6 rounded-full bg-[#f8e3c8]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#6b3c32]" />
          </div>
          <div className="row-span-2 overflow-hidden rounded-md border border-black/10 bg-[#0f241e]">
            <div className="relative h-full">
              <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-[#d8e4bd]" />
              {[0, 1, 2].map((tree) => (
                <span
                  key={tree}
                  className="absolute bottom-0 w-[3px] bg-[#203b31]"
                  style={{ left: `${22 + tree * 24}%`, height: `${45 + tree * 12}%` }}
                />
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-black/10 bg-[#d9b98a]">
            <div className="mx-auto mt-2 h-full w-[130%] rounded-t-full bg-[#b88a57]" />
          </div>
          <div className="overflow-hidden rounded-md border border-black/10 bg-[#281412]">
            <div className="relative flex h-full items-center justify-center">
              <span className="absolute h-9 w-9 rounded-full border border-[#ff795b]/60" />
              <span className="absolute h-6 w-6 rounded-full border border-[#ff795b]" />
              <span className="h-2 w-2 rounded-full bg-[#ffc2a9]" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 rounded-md bg-[#141418] p-2 opacity-0 shadow-[0_10px_24px_-18px_rgba(20,20,24,0.5)] transition-all duration-500 group-hover/preview:translate-y-0 group-hover/preview:opacity-100 group-focus-within/preview:translate-y-0 group-focus-within/preview:opacity-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[5px] uppercase tracking-[0.12em] text-[#e5e94b]">
                  Landscape / March 2025
                </p>
                <p className="mt-0.5 text-[12px] font-semibold leading-none text-white">Salt Flat</p>
              </div>
              <span className="rounded-full border border-white/25 px-1.5 py-0.5 text-[5px] text-white/70">
                Close
              </span>
            </div>
            <div className="mt-1.5 flex gap-2 border-t border-white/10 pt-1 font-mono text-[5px] text-white/45">
              <span>← Previous</span>
              <span className="ml-auto">Next →</span>
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex justify-between border-t border-black/10 pt-1 font-mono text-[5px] uppercase tracking-[0.06em] text-[#8c8c94]">
          <span>Photographed 2024—2025</span>
          <span>Arrow keys · Escape</span>
        </div>
      </div>
    </div>
  );
}
