/**
 * CATALOG PREVIEW — Hold to Confirm.
 *
 * A miniature release console: on card hover the Publish pill fills
 * left to right, then settles into a check. Pure CSS, staged with
 * transition delays — calm at rest.
 */
export default function HoldToConfirmPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2]">
      <div className="absolute left-1/2 top-1/2 w-[78%] max-w-[236px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8c8c94]">
            Release console
          </span>
          <span className="rounded-full bg-[#4f27e0]/10 px-2 py-[2px] font-mono text-[9px] text-[#32119c]">
            v2.4.0
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="h-[6px] w-20 rounded-full bg-[#141418]/10" />
          <span className="h-[6px] w-9 rounded-full bg-[#141418]/10" />
        </div>
        <div className="mt-1.5 h-[6px] w-2/3 rounded-full bg-[#141418]/10" />

        <div className="relative mt-3 flex h-9 items-center justify-center overflow-hidden rounded-full bg-[#4f27e0]">
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#32119c] transition-transform delay-[120ms] duration-[760ms] ease-out group-hover/preview:scale-x-100" />
          <span className="relative z-10 flex items-center gap-1.5 text-[11px] font-semibold text-white">
            <span className="transition-opacity duration-150 group-hover/preview:opacity-0 group-hover/preview:delay-[800ms]">
              Publish release
            </span>
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover/preview:opacity-100 group-hover/preview:delay-[840ms]">
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3"
                aria-hidden="true"
                focusable="false"
              >
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
