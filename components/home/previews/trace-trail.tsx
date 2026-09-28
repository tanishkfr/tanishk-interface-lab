import { Fragment } from "react";

/**
 * CATALOG PREVIEW — Trace Trail. The provenance line at rest, its
 * breadcrumb drawn as three nodes; on hover the compact step list
 * slides down over the line.
 */
const NODES = ["You", "retriever", "draft-1"];
const ROWS = [
  { actor: "You", action: "Asked for a summary", at: "09:12" },
  { actor: "retriever", action: "Pulled 4 passages", at: "09:12" },
  { actor: "draft-1", action: "Wrote the summary", at: "09:13" },
];

export default function TraceTrailPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f5f2] p-3">
      <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(20,20,24,0.04)] transition-opacity duration-300 group-hover/preview:opacity-0">
        <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#137a4e]" />
        <span className="min-w-0 flex-1 truncate font-mono text-[9.5px] text-[#141418]/70">
          asked → retrieved → drafted
        </span>
        <span className="flex-none font-mono text-[9px] text-[#8c8c94]">3 steps</span>
      </div>
      <div className="mt-7 flex items-center gap-1 px-1">
        {NODES.map((node, index) => (
          <Fragment key={node}>
            <span className="min-w-0 flex-1 text-center">
              <span className={`mx-auto block h-[7px] w-[7px] rounded-full ${index === NODES.length - 1 ? "bg-[#4f27e0]" : "bg-[#141418]/20"}`} />
              <span className="mt-1.5 block truncate font-mono text-[8.5px] uppercase tracking-[0.08em] text-[#8c8c94]">{node}</span>
            </span>
            {index < NODES.length - 1 ? <span className="mb-4 h-px w-3 flex-none bg-[#141418]/15" /> : null}
          </Fragment>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 -translate-y-1 opacity-0 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:translate-y-0 group-hover/preview:opacity-100">
        <div className="rounded-lg border border-black/10 bg-white p-2.5 shadow-[0_12px_26px_-16px_rgba(20,20,24,0.4)]">
          <div className="flex items-center gap-2 border-b border-black/5 pb-2">
            <span className="h-[7px] w-[7px] rounded-full bg-[#137a4e]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8c8c94]">activity</span>
            <span className="ml-auto font-mono text-[9px] text-[#8c8c94]">3 steps</span>
          </div>
          <ul className="mt-2 space-y-[7px]">
            {ROWS.map((row, index) => (
              <li key={row.actor} className="flex items-center gap-2">
                <span className={`h-[5px] w-[5px] flex-none rounded-full ${index === ROWS.length - 1 ? "bg-[#137a4e]" : "bg-[#141418]/25"}`} />
                <span className="font-mono text-[9px] font-semibold text-[#26262c]">{row.actor}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] text-[#5f5f68]">{row.action}</span>
                <span className="font-mono text-[8.5px] text-[#b0b0b6]">{row.at}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
