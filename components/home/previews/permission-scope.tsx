export default function PermissionScopePreview() {
  return (
    <div className="flex h-full items-center justify-center bg-[#efeeeb] px-6">
      <div className="w-full max-w-[248px] rounded-xl border border-black/10 bg-white p-4">
        <div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#606068]">Access request</span><span className="rounded-full bg-[#f1eefc] px-2 py-1 text-[9px] text-[#32119c]">Review</span></div>
        <p className="mt-3 text-[12px] font-semibold">Mira wants to organize notes</p>
        <div className="mt-3 border-y border-black/10 py-2 text-[10px] leading-5 text-[#5f5f68]"><p>3 selected files</p><div className="grid"><p className="col-start-1 row-start-1 transition-opacity duration-300 group-hover/preview:opacity-0 group-focus-within/preview:opacity-0">Read + move · once</p><p className="col-start-1 row-start-1 font-semibold text-[#32119c] opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-within/preview:opacity-100">Read only · once</p></div></div>
        <div className="mt-3 flex justify-between text-[10px] font-semibold"><span>Deny</span><span className="text-[#32119c]">Inspect scope →</span></div>
      </div>
    </div>
  );
}
