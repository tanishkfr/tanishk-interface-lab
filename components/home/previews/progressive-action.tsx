/**
 * CATALOG PREVIEW — Progressive Command Button.
 *
 * A miniature document card whose action pill cycles ready → running
 * → done on hover: three stacked layers cross-fading while a progress
 * fill sweeps underneath. Pure CSS, staged with transition delays.
 */
export default function ProgressiveActionPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2]">
      <div className="absolute left-1/2 top-1/2 w-[78%] max-w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8c8c94]">
            Quarterly review
          </span>
          <span className="h-[6px] w-7 rounded-full bg-[#141418]/10" />
        </div>

        <div className="mt-2.5 space-y-1.5">
          <span className="block h-[6px] w-full rounded-full bg-[#141418]/10" />
          <span className="block h-[6px] w-4/5 rounded-full bg-[#141418]/10" />
          <span className="block h-[6px] w-3/5 rounded-full bg-[#141418]/10" />
        </div>

        <div className="relative mt-3 h-9 overflow-hidden rounded-lg border border-[#4f27e0]/25 bg-[#4f27e0]/10">
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#4f27e0]/20 transition-transform delay-[140ms] duration-[700ms] ease-out group-hover/preview:scale-x-100" />

          <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-[#32119c] opacity-100 transition-opacity duration-100 group-hover/preview:opacity-0">
            Generate summary
          </span>

          <span className="absolute inset-0 grid place-items-center opacity-100 transition-opacity duration-150 group-hover/preview:opacity-0 group-hover/preview:delay-[860ms]">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#32119c] opacity-0 transition-opacity duration-150 group-hover/preview:opacity-100 group-hover/preview:delay-[160ms]">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#4f27e0]/30 border-t-[#4f27e0] group-hover/preview:animate-spin" />
              Running
            </span>
          </span>

          <span className="absolute inset-0 grid place-items-center gap-1.5 text-[11px] font-semibold text-[#0d5c3b] opacity-0 transition-opacity duration-150 group-hover/preview:opacity-100 group-hover/preview:delay-[900ms]">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true" focusable="false">
                <path
                  d="M3 8.5 6.2 11.6 13 4.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Done
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
