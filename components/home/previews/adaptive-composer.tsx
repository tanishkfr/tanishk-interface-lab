/**
 * CATALOG PREVIEW — Adaptive Composer.
 *
 * A still capture field mid-sentence: the intent chip already names the
 * read, and the parsed structure chips wait just under the field. On
 * hover they slide into place — the input rearranging into what it
 * recognised.
 */
export default function AdaptiveComposerPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f3f0] p-4">
      <div className="flex h-full flex-col justify-center">
        <span className="mb-2 w-fit rounded-full bg-[#4f27e0]/10 px-2.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-[#32119c]">
          Meeting
        </span>

        <div className="rounded-xl border border-black/10 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
          <p className="flex items-center gap-1 text-[11px] leading-5 text-[#141418]">
            <span className="truncate">
              review the deck with Ana on tue 2pm
            </span>
            <span
              className="h-3.5 w-px flex-none bg-[#4f27e0]"
              aria-hidden="true"
            />
          </p>
        </div>

        <div className="mt-2 flex gap-1.5">
          <span className="translate-y-1 rounded-md bg-white px-2 py-[3px] font-mono text-[9px] tracking-[0.06em] text-[#32119c] opacity-0 shadow-[0_1px_2px_rgba(20,20,24,0.05)] transition-all duration-500 ease-out group-hover/preview:translate-y-0 group-hover/preview:opacity-100">
            Tue 14:30
          </span>
          <span className="translate-y-1 rounded-md bg-white px-2 py-[3px] font-mono text-[9px] tracking-[0.06em] text-[#32119c] opacity-0 shadow-[0_1px_2px_rgba(20,20,24,0.05)] transition-all delay-75 duration-500 ease-out group-hover/preview:translate-y-0 group-hover/preview:opacity-100">
            45 min
          </span>
        </div>

        <div className="mt-3 h-px w-3/5 bg-black/10" />
      </div>
    </div>
  );
}
