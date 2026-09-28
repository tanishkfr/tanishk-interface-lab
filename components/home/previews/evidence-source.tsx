/**
 * CATALOG PREVIEW — Expandable Evidence Source.
 *
 * One citation line with a status dot; on hover the panel unfolds —
 * two excerpt rules and a confidence bar — the component's
 * grid-rows move in miniature.
 */
export default function EvidenceSourcePreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2]">
      <div className="absolute inset-0 flex flex-col justify-center gap-2 px-5">
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(20,20,24,0.06)]">
          <div className="flex items-center gap-2">
            <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#147a4e]" />
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#141418]">
              Designing Interfaces, 3rd ed.
            </span>
            <span className="flex-none text-[10px] font-medium text-[#147a4e]">
              Verified
            </span>
            <svg
              viewBox="0 0 12 12"
              className="h-[10px] w-[10px] flex-none text-[#8c8c94] transition-transform duration-300 group-hover/preview:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </div>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="pt-2.5 opacity-0 transition-opacity duration-500 group-hover/preview:opacity-100">
                <div className="h-[5px] w-11/12 rounded-full bg-[#141418]/[0.13]" />
                <div className="mt-1.5 h-[5px] w-2/3 rounded-full bg-[#141418]/[0.13]" />
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#141418]/[0.09]">
                    <div className="h-full w-[86%] rounded-full bg-[#141418]/55" />
                  </div>
                  <span className="font-mono text-[8.5px] text-[#8c8c94]">
                    86%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2">
          <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#8a5300]/70" />
          <span className="min-w-0 flex-1 truncate text-[10.5px] text-[#5f5f68]">
            Staged settings: defaults and first-run setup
          </span>
          <span className="flex-none text-[9.5px] font-medium text-[#8a5300]">
            Probable
          </span>
        </div>
      </div>
    </div>
  );
}
