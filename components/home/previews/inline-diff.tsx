export default function InlineDiffPreview() {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-[#f6f6f3] px-5">
      <div className="w-full max-w-[300px] rounded-xl border border-black/10 bg-white p-4 shadow-[0_1px_3px_rgba(20,20,24,0.05)]">
        <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.1em] text-[#606068]"><span>Copy revision</span><span className="text-[#32119c]">1 change</span></div>
        <p className="text-[13px] leading-[1.7] text-[#26262c]">Onboarding takes <del className="rounded-sm bg-[#b3261e]/[0.08] px-0.5 text-[#8f2924]">ten minutes</del>{" "}<ins className="rounded-sm bg-[#137a4e]/[0.12] px-0.5 text-[#0f5c3c] no-underline">two minutes</ins> to the first saved project.</p>
        <div className="mt-3 border-t border-black/10 pt-2.5"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#606068]">Reason</span><p className="mt-1 grid grid-rows-[0fr] text-[11px] text-[#5f5f68] transition-[grid-template-rows] duration-300 group-hover/preview:grid-rows-[1fr] group-focus-within/preview:grid-rows-[1fr]"><span className="overflow-hidden">The earlier estimate overstated the current flow.</span></p></div>
      </div>
    </div>
  );
}
