/**
 * CATALOG PREVIEW — Edge Reveal.
 * A portfolio card whose detail layer enters from the left on hover.
 * Light Lab workbench; the dark Lumen plate is the artwork, not the page.
 */
export default function EdgeRevealPreview() {
  return (
    <div className="h-full w-full bg-[#f4f4f2] p-4">
      <div className="mx-auto w-[94%] max-w-[320px]">
        <div className="flex items-end justify-between border-b border-black/10 pb-1.5">
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.14em] text-[#4f27e0]">
              Selected work / 2021—2025
            </p>
            <p className="mt-0.5 text-[15px] font-semibold leading-none tracking-[-0.035em] text-[#141418]">
              Six studies in light, type and material.
            </p>
          </div>
          <span className="font-mono text-[6px] uppercase tracking-wide text-[#8c8c94]">06</span>
        </div>

        <div className="mt-2 grid h-[176px] grid-cols-[1.25fr_1fr] gap-2">
          <div className="relative overflow-hidden rounded-lg border border-black/10">
            <div className="absolute inset-0 bg-[#131a2b]" />
            <div className="absolute right-[18%] top-[18%] h-[46%] w-[46%] rounded-full bg-[#ff795b]" />
            <div className="absolute right-[28%] top-[28%] h-[26%] w-[26%] rounded-full bg-[#ffc2a9]/70" />
            <div className="absolute inset-x-0 bottom-[18%] space-y-2 px-[10%]">
              {[0, 1, 2].map((line) => (
                <span key={line} className="block h-px w-full bg-white/20" />
              ))}
            </div>
            <p className="absolute bottom-2.5 left-2.5 text-[16px] font-semibold tracking-[-0.03em] text-white">
              Lumen
            </p>
            <p className="absolute left-2.5 top-2.5 font-mono text-[5px] uppercase tracking-[0.12em] text-[#a9b0c7]">
              Cinema / Identity
            </p>

            <div className="absolute inset-0 flex translate-x-[-101%] flex-col justify-end bg-[#141418] p-2.5 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:translate-x-0 group-focus-within/preview:translate-x-0">
              <p className="font-mono text-[5px] uppercase tracking-[0.12em] text-[#e5e94b]">
                Brand systems
              </p>
              <p className="mt-0.5 text-[14px] font-semibold leading-none tracking-[-0.03em] text-white">
                Lumen
              </p>
              <p className="mt-1 text-[6px] leading-[1.5] text-white/55">
                A low-light identity for a repertory cinema.
              </p>
              <span className="mt-2 w-fit rounded-full border border-white/40 px-1.5 py-0.5 text-[5px] font-semibold text-white">
                Save study
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative flex-1 overflow-hidden rounded-lg border border-black/10 bg-[#dfe3ee]">
              <div className="absolute right-2 top-2 h-5 w-5 rounded-full bg-white/80" />
              {[0, 1, 2].map((line) => (
                <span
                  key={line}
                  className="absolute left-1 right-1 h-px bg-[#5f5f68]/40"
                  style={{ bottom: `${22 + line * 18}%` }}
                />
              ))}
              <span className="absolute bottom-1 left-1 font-mono text-[5px] uppercase tracking-wide text-[#5f5f68]">
                Tidewater
              </span>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-black/10 bg-[#f0e6d8]">
              <span className="absolute inset-x-2 bottom-3 top-5 rounded-sm bg-[#ff795b]/70" />
              <span className="absolute inset-x-3 bottom-[38%] top-3 rounded-sm bg-[#ffc2a9]" />
              <span className="absolute bottom-1 left-1 font-mono text-[5px] uppercase tracking-wide text-[#5f5f68]">
                Hearth
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
