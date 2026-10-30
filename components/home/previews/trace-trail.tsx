const ROWS = [
  { actor: "You", action: "Requested a summary" },
  { actor: "Retriever", action: "Found 4 passages" },
  { actor: "Draft", action: "Wrote the summary" },
];

export default function TraceTrailPreview() {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-[#f5f5f2] px-5">
      <div className="w-full max-w-[300px] rounded-xl border border-black/10 bg-white p-3.5 shadow-[0_1px_3px_rgba(20,20,24,0.05)]">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[.1em] text-[#606068]">Summary · provenance</p>
        <div className="flex items-center gap-2 rounded-md border border-black/10 bg-[#f8f8f6] px-2.5 py-2">
          <span className="h-2 w-2 flex-none rounded-full bg-[#137a4e]" />
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[#26262c]">Requested → retrieved → drafted</span>
          <span className="flex-none font-mono text-[9px] text-[#606068]">3 steps</span>
          <span className="text-[10px] text-[#606068] transition-transform duration-300 group-hover/preview:rotate-180 group-focus-within/preview:rotate-180">⌄</span>
        </div>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover/preview:grid-rows-[1fr] group-focus-within/preview:grid-rows-[1fr]">
          <div className="overflow-hidden"><ol className="space-y-2 px-1 pb-0.5 pt-3">{ROWS.map((row, index) => <li key={row.actor} className="flex items-center gap-2 text-[10px]"><span className={`h-1.5 w-1.5 rounded-full ${index === 2 ? "bg-[#4f27e0]" : "bg-[#a3a3ab]"}`} /><span className="w-[58px] font-semibold text-[#26262c]">{row.actor}</span><span className="text-[#606068]">{row.action}</span></li>)}</ol></div>
        </div>
      </div>
    </div>
  );
}
