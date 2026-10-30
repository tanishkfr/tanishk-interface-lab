export default function UndoWindowPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-[#efeeeb] px-6">
      <div className="w-full max-w-[250px] rounded-xl border border-black/10 bg-white p-4">
        <p className="font-mono text-[9px] uppercase tracking-[.1em] text-[#606068]">Projects</p>
        <div className="mt-3 flex justify-between border-b border-black/10 pb-3 text-[11px] font-semibold"><span>Field notes</span><span className="text-[#606068]">Active</span></div>
        <div className="mt-3 rounded-lg border border-[#dfd9fa] bg-[#f6f4ff] p-3">
          <div className="grid">
            <div className="col-start-1 row-start-1 transition-opacity duration-300 group-hover/preview:opacity-0 group-focus-within/preview:opacity-0"><p className="text-[11px] font-semibold">Atlas research archived</p><div className="mt-2 flex items-center justify-between text-[10px] text-[#5f5f68]"><span>30s to undo</span><span className="font-semibold text-[#32119c]">Undo →</span></div></div>
            <div className="col-start-1 row-start-1 opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-within/preview:opacity-100"><p className="text-[11px] font-semibold text-[#0f5c3c]">✓ Atlas research restored</p><p className="mt-2 text-[10px] text-[#5f5f68]">Back in active projects</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
