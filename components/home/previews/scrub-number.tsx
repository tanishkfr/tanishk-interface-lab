/**
 * CATALOG PREVIEW — Scrub Number.
 *
 * A specimen and its readout. At rest the square is small and sharp; on
 * hover or keyboard focus the handles "scrub" it larger and rounder while
 * the two values roll over. One state change, no loop.
 */
export default function ScrubNumberPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#dcd5ed]">
      <div className="absolute inset-y-0 left-0 right-[42%] grid place-items-center">
        <div className="relative grid w-[clamp(112px,50%,160px)] aspect-square place-items-center">
          <Guide />
          <div className="relative w-[clamp(84px,80%,128px)] aspect-square rounded-[12px] border border-[#252620] bg-[#5834d7] shadow-[0_12px_26px_rgba(55,27,135,0.20)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:scale-[1.19] group-hover/preview:rounded-[24px] group-hover/preview:shadow-[0_18px_34px_rgba(55,27,135,0.28)] group-focus-within/preview:scale-[1.19] group-focus-within/preview:rounded-[24px] group-focus-within/preview:shadow-[0_18px_34px_rgba(55,27,135,0.28)]" />
          <span className="absolute -bottom-6 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.16em] text-[#5d4c86]">
            ↔ drag to scrub
          </span>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 flex w-[34%] min-w-[110px] max-w-[200px] -translate-y-1/2 flex-col justify-center gap-2.5 rounded-lg border border-[#252620]/15 bg-[#f7f4eb] p-3 shadow-[0_10px_24px_rgba(55,27,135,0.10)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#675f53]">
            Values
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#5834d7]" />
        </div>
        <Readout label="Size" from="48" to="72" />
        <Readout label="Corners" from="12" to="24" />
      </div>
    </div>
  );
}

function Guide() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[#5834d7]/30" />
      <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[#5834d7]/30" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[#5834d7]/30" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[#5834d7]/30" />
    </span>
  );
}

function Readout({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div>
      <span className="mb-1 block text-[10px] leading-none text-[#4d473f]">
        {label}
      </span>
      <span className="flex h-8 items-stretch overflow-hidden rounded-[3px] border border-[#252620]/20 bg-white transition-colors duration-500 group-hover/preview:border-[#5834d7]/45 group-focus-within/preview:border-[#5834d7]/45">
        <span className="grid w-7 flex-none place-items-center border-r border-[#252620]/10 bg-[#eeeae0] text-[12px] text-[#252620] transition-colors duration-500 group-hover/preview:bg-[#e3d8ff] group-focus-within/preview:bg-[#e3d8ff]">
          ↔
        </span>
        <span className="relative block min-w-0 flex-1">
          <span className="absolute inset-0 flex items-center px-2 font-mono text-[11px] tabular-nums text-[#252620] transition-opacity duration-500 group-hover/preview:opacity-0 group-focus-within/preview:opacity-0">
            {from}
          </span>
          <span className="absolute inset-0 flex items-center px-2 font-mono text-[11px] tabular-nums text-[#252620] opacity-0 transition-opacity duration-500 group-hover/preview:opacity-100 group-focus-within/preview:opacity-100">
            {to}
          </span>
        </span>
      </span>
    </div>
  );
}
