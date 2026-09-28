/**
 * CATALOG PREVIEW — Lens Reveal.
 *
 * A mini audit sheet under a lens ring: at rest the lens sits over the
 * copy; on card hover it travels right, and the annotated layer inside
 * the clip circle comes into view. Two registered layers, one static
 * clip-path circle, no loops.
 */
export default function LensRevealPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9e9e5]">
      <div className="absolute left-1/2 top-1/2 aspect-[16/10] w-[78%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_18px_34px_-26px_rgba(20,20,24,0.6)]">
        <MiniSheet />

        {/* clip window + ring travel together; the sheet inside is
            counter-translated so it stays registered with the base */}
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:translate-x-[24%]">
          <div className="absolute inset-0 [clip-path:circle(37%_at_36%_50%)]">
            <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:-translate-x-[24%]">
              <MiniSheet annotated />
            </div>
          </div>
          <div className="absolute left-[36%] top-1/2 h-[99%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(20,20,24,0.18),0_12px_26px_-14px_rgba(20,20,24,0.5)]" />
        </div>
      </div>
    </div>
  );
}

function MiniSheet({ annotated = false }: { annotated?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#fbfbfa] px-2.5 py-[7px]">
        <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
        <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
        <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
        <span className="ml-1 h-1.5 w-[38%] rounded-full bg-black/10" />
      </div>
      <div className={`relative flex-1 ${annotated ? "bg-[#f4f1ff]" : "bg-white"}`}>
        <div className="absolute inset-0 flex flex-col gap-[6px] p-[8%]">
          <span className={`h-[7px] w-[58%] rounded-sm ${annotated ? "bg-[#32119c]/85" : "bg-[#141418]/75"}`} />
          <span className="mt-[3px] h-[3px] w-[92%] rounded-full bg-[#141418]/15" />
          <span className="h-[3px] w-[86%] rounded-full bg-[#141418]/15" />
          <span className="h-[3px] w-[63%] rounded-full bg-[#141418]/15" />
          <span className="mt-[3px] h-[3px] w-[88%] rounded-full bg-[#141418]/15" />
          <span className="h-[3px] w-[74%] rounded-full bg-[#141418]/15" />
          <span className="mt-[4px] h-[16%] w-full rounded-[3px] border border-black/10 bg-black/5" />
        </div>
        {annotated ? (
          <>
            <span className="absolute right-[10%] top-[34%] h-[3px] w-[24%] rounded-full bg-[#4f27e0]/45" />
            <span className="absolute right-[10%] top-[46%] h-[3px] w-[18%] rounded-full bg-[#4f27e0]/30" />
            <span className="absolute left-[48%] top-[26%] flex h-4 w-4 items-center justify-center rounded-full bg-[#4f27e0] font-mono text-[7px] font-semibold text-white ring-1 ring-white">
              1
            </span>
            <span className="absolute left-[70%] top-[62%] flex h-4 w-4 items-center justify-center rounded-full bg-[#4f27e0] font-mono text-[7px] font-semibold text-white ring-1 ring-white">
              2
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
