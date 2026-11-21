/**
 * CATALOG PREVIEW — Lightfield Surface.
 * A product card caught by a moving light, on a light Lab workbench.
 * The highlight is a violet-tinted radial gradient; no page-level dark.
 */
export default function LightfieldSurfacePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[320px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-end justify-between border-b border-black/10 pb-1.5">
          <div>
            <p className="font-mono text-[5px] uppercase tracking-[0.14em] text-[#4f27e0]">
              Material studies / 2026
            </p>
            <p className="mt-0.5 text-[16px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
              Objects under a moving light.
            </p>
          </div>
          <span className="font-mono text-[5px] uppercase tracking-wide text-[#8c8c94]">03</span>
        </div>

        <div className="mt-2 grid h-[160px] grid-cols-[1.3fr_1fr] gap-2">
          <div className="relative overflow-hidden rounded-lg border border-black/10 bg-[#f6f4ff]">
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-[14%] h-[54%] w-[42%] -translate-x-1/2 rounded-t-[45%] bg-[linear-gradient(145deg,#4b3a36,#141418_70%)]" />
              <div className="absolute bottom-[18%] left-1/2 h-[3px] w-[36%] -translate-x-1/2 rounded-full bg-black/40" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(79,39,224,0.22),transparent_52%)] opacity-70 transition-opacity duration-500 group-hover/preview:opacity-100" />
            <div className="relative flex h-full flex-col justify-end p-2">
              <p className="font-mono text-[5px] uppercase tracking-[0.12em] text-[#4f27e0]">Ceramic</p>
              <p className="text-[14px] font-semibold leading-none tracking-[-0.03em] text-[#141418]">
                Vessel 04
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-[5px] uppercase tracking-wide text-[#5f5f68]">Matte</span>
                <span className="rounded-full border border-[#4f27e0]/30 px-1.5 py-0.5 text-[5px] text-[#32119c]">
                  View
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative flex-1 overflow-hidden rounded-lg border border-black/10 bg-[#f0e6d8]">
              <div className="absolute left-1/2 top-[20%] h-[42%] w-[34%] -translate-x-1/2 bg-[linear-gradient(120deg,#c79a5a,#8a5f2c_55%,#e3c48b)]" />
              <div className="absolute left-1/2 top-[62%] h-[18%] w-px -translate-x-1/2 bg-[#8a5f2c]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.5),transparent_52%)]" />
              <p className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold text-[#141418]">
                Halo lamp
              </p>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-black/10 bg-[#dfe3ee]">
              <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#141418]/20" />
              <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#141418]/15 ring-1 ring-[#141418]/20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.6),transparent_55%)]" />
              <p className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold text-[#141418]">
                Monolith
              </p>
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex justify-between border-t border-black/10 pt-1 font-mono text-[5px] uppercase tracking-[0.06em] text-[#8c8c94]">
          <span>Matte · Satin · Gloss</span>
          <span>Pointer light</span>
        </div>
      </div>
    </div>
  );
}
