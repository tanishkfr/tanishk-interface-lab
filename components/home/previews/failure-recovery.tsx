export default function FailureRecoveryPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-[#efeeeb] px-6">
      <div className="w-full max-w-[250px] rounded-xl border border-black/10 bg-white p-4">
        <div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#606068]">Workspace export</span><span className="text-[9px] font-semibold text-[#8b3219]">Needs attention</span></div>
        <div className="mt-3 space-y-2 text-[11px]"><p className="flex justify-between"><span>Prepare archive</span><span className="text-[#5f5f68]">Complete</span></p><p className="flex justify-between"><span>Package files</span><span className="text-[#5f5f68]">Complete</span></p><div className="grid border-t border-black/10 pt-2 font-semibold"><p className="col-start-1 row-start-1 flex justify-between transition-opacity duration-300 group-hover/preview:opacity-0 group-focus-within/preview:opacity-0"><span>Upload archive</span><span className="text-[#8b3219]">Failed</span></p><p className="col-start-1 row-start-1 flex justify-between text-[#0f5c3c] opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-within/preview:opacity-100"><span>Upload archive</span><span>Complete</span></p></div></div>
        <div className="mt-3 grid text-[10px]"><p className="col-start-1 row-start-1 text-[#32119c] transition-opacity duration-300 group-hover/preview:opacity-0 group-focus-within/preview:opacity-0">Retry upload →</p><p className="col-start-1 row-start-1 text-[#0f5c3c] opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-within/preview:opacity-100">✓ Export complete</p></div>
      </div>
    </div>
  );
}
