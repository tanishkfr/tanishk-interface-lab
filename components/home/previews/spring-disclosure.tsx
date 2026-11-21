/**
 * CATALOG PREVIEW — Spring Disclosure.
 * A product panel where the first row is open and a second follows on hover.
 * Lab surfaces, violet open state, no editorial serif.
 */
export default function SpringDisclosurePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="grid w-[94%] max-w-[310px] grid-cols-[68px_1fr] gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex flex-col justify-between rounded-lg border border-black/10 bg-[#f6f4ff] p-2">
          <div className="relative mx-auto mt-1 h-[78px] w-[4px] bg-[#141418]">
            <span className="absolute -left-[11px] -top-1 h-[22px] w-[26px] rounded-t-full bg-white shadow-[inset_0_0_0_1px_#141418]" />
            <span className="absolute -bottom-1 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[#141418]" />
            <span className="absolute left-1/2 top-[22px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#4f27e0]" />
          </div>
          <div className="space-y-1">
            <span className="block h-1 w-10 rounded-full bg-[#4f27e0]/30" />
            <span className="block h-1 w-8 rounded-full bg-black/10" />
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-mono text-[6px] uppercase tracking-[0.12em] text-[#4f27e0]">
            Task light / 2025
          </p>
          <p className="mt-0.5 text-[21px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
            Rove
          </p>
          <p className="mt-0.5 text-[8px] font-semibold text-[#141418]">£148</p>

          <div className="mt-2 border-t border-black/10">
            <div className="border-b border-black/10 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold text-[#141418]">Overview</span>
                <span className="relative h-2 w-2">
                  <i className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-[#4f27e0]" />
                </span>
              </div>
              <div className="mt-1.5 space-y-1">
                <span className="block h-1 w-full rounded-full bg-black/10" />
                <span className="block h-1 w-[86%] rounded-full bg-black/10" />
                <span className="block h-1 w-[62%] rounded-full bg-black/10" />
              </div>
              <div className="mt-1.5 flex gap-1">
                {["Copenhagen", "Portugal", "5 yr repair"].map((tag) => (
                  <span key={tag} className="rounded-full border border-[#4f27e0]/20 bg-[#f6f4ff] px-1 py-0.5 text-[5px] text-[#32119c]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-b border-black/10 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold text-[#5f5f68]">In the box</span>
                <span className="relative h-2 w-2">
                  <i className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-[#141418]/60" />
                  <i className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-[#141418]/60 transition-opacity duration-200 group-hover/preview:opacity-0 group-focus-within/preview:opacity-0" />
                </span>
              </div>
              <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:max-h-10 group-hover/preview:opacity-100 group-focus-within/preview:max-h-10 group-focus-within/preview:opacity-100">
                <div className="mt-1.5 space-y-1">
                  <span className="block h-1 w-[76%] rounded-full bg-black/10" />
                  <span className="block h-1 w-[58%] rounded-full bg-black/10" />
                </div>
              </div>
            </div>
            <div className="border-b border-black/10 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold text-[#5f5f68]">Specifications</span>
                <span className="relative h-2 w-2">
                  <i className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-[#141418]/60" />
                  <i className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-[#141418]/60" />
                </span>
              </div>
            </div>
            <div className="border-b border-black/10 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold text-[#5f5f68]">Care and repair</span>
                <span className="relative h-2 w-2">
                  <i className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-[#141418]/60" />
                  <i className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-[#141418]/60" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
