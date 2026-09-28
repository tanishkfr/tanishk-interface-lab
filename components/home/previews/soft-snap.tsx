/**
 * CATALOG PREVIEW — Soft Snap.
 *
 * A miniature lane: three note cards, a settle line across the frame.
 * On hover the pile eases up until the highlighted card's top edge sits
 * on the line — the whole behaviour in one frame.
 */
export default function SoftSnapPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2]">
      <div className="absolute inset-x-0 top-[36%] z-10 border-t border-dashed border-[#4f27e0]/60" />
      <div className="absolute left-3 top-[36%] z-10 -translate-y-1/2 rounded-full bg-[#4f27e0] px-2 py-[3px] font-mono text-[9px] uppercase tracking-[0.12em] text-white">
        settle
      </div>

      <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:-translate-y-[10px]">
        <div className="absolute inset-x-6 top-[11%] h-[24%]">
          <MiniCard index="010" tone="#dfe3ee" />
        </div>
        <div className="absolute inset-x-5 top-[40%] h-[24%]">
          <MiniCard index="011" tone="#f0e6d8" active />
        </div>
        <div className="absolute inset-x-6 top-[69%] h-[24%]">
          <MiniCard index="012" tone="#e2ece5" />
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  index,
  tone,
  active = false,
}: {
  index: string;
  tone: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-full items-center gap-2.5 rounded-lg border bg-white px-2 shadow-[0_1px_2px_rgba(20,20,24,0.05)] ${
        active ? "border-[#4f27e0]/45" : "border-black/10"
      }`}
    >
      <span
        className="block h-[58%] w-12 flex-none rounded-[5px]"
        style={{ background: tone }}
      />
      <span className="min-w-0 flex-1">
        <span className="block h-[6px] w-3/5 rounded-full bg-[#141418]/70" />
        <span className="mt-1.5 block h-[5px] w-4/5 rounded-full bg-[#141418]/20" />
      </span>
      <span className="font-mono text-[9px] tracking-[0.1em] text-[#8c8c94]">
        {index}
      </span>
    </div>
  );
}
