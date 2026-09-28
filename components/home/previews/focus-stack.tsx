/**
 * CATALOG PREVIEW — Focus Stack.
 *
 * A miniature pile of three cards with the middle one forward. On card
 * hover the top card travels down into the front position while the
 * middle one steps back — the selection coming forward, in one frame.
 */
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function MiniCard({
  title,
  meta,
  className = "",
}: {
  title: string;
  meta: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-x-0 rounded-lg border border-black/10 bg-white p-2.5 shadow-[0_1px_2px_rgba(20,20,24,0.05)] transition-all duration-500 ${EASE} ${className}`}
    >
      <p className="truncate text-[10px] font-medium text-[#141418]">{title}</p>
      <p className="mt-0.5 truncate font-mono text-[7.5px] uppercase tracking-[0.08em] text-[#8c8c94]">
        {meta}
      </p>
      <div className="mt-2 flex gap-1">
        <span className="h-[5px] w-3/5 rounded-full bg-[#141418]/15" />
        <span className="h-[5px] w-1/5 rounded-full bg-[#141418]/10" />
      </div>
    </div>
  );
}

export default function FocusStackPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f2f2ef]">
      <div className="absolute inset-x-4 top-3 flex gap-1.5">
        <span className="rounded-[5px] border border-black/10 bg-white px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-[#8c8c94]">
          draft 12
        </span>
        <span className="rounded-[5px] border border-[#4f27e0]/45 bg-[#4f27e0]/[0.09] px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-[#32119c]">
          draft 11
        </span>
        <span className="rounded-[5px] border border-black/10 bg-white px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-[#8c8c94]">
          draft 10
        </span>
      </div>

      <div className="absolute inset-x-6 top-[30%] h-[118px]">
        <MiniCard
          title="Draft 12"
          meta="needs review"
          className="top-0 z-10 -translate-y-[13px] scale-[0.93] opacity-60 group-hover/preview:z-30 group-hover/preview:translate-y-[13px] group-hover/preview:scale-100 group-hover/preview:opacity-100"
        />
        <MiniCard
          title="Draft 11"
          meta="in review · 2 comments"
          className="top-[13px] z-20 group-hover/preview:z-10 group-hover/preview:-translate-y-[13px] group-hover/preview:scale-[0.93] group-hover/preview:opacity-60"
        />
        <MiniCard
          title="Draft 10"
          meta="approved"
          className="top-[26px] z-0 translate-y-[9px] scale-[0.88] opacity-50"
        />
      </div>
    </div>
  );
}
