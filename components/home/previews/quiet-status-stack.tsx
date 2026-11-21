/**
 * CATALOG PREVIEW — Quiet Status Stack.
 * A processing desk where a success and an error note sit together.
 * Lab neutral panel, violet progress, green success, rust failure.
 */
export default function QuietStatusStackPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[310px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.13em] text-[#4f27e0]">
              Processing desk
            </p>
            <p className="mt-0.5 text-[12px] font-semibold tracking-[-0.02em] text-[#141418]">
              Brand refresh
            </p>
          </div>
          <span className="rounded-full bg-[#f6f4ff] px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-wide text-[#32119c]">
            1 processing
          </span>
        </div>

        <div className="mt-2 space-y-1">
          {[
            ["brand-guidelines.pdf", "74%"],
            ["hero-shoot.zip", "Queued"],
          ].map(([name, status], index) => (
            <div key={name} className="flex items-center gap-1.5 rounded-md border border-black/10 bg-[#fcfcfa] px-1.5 py-1.5">
              <span className="grid h-5 w-4 place-items-center rounded bg-[#f6f4ff] text-[7px] text-[#4f27e0]">
                ▤
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[7px] font-semibold text-[#141418]">{name}</span>
                <span className="mt-0.5 block h-[2px] w-full overflow-hidden rounded-full bg-black/10">
                  <span
                    className="block h-full bg-[#4f27e0]"
                    style={{ width: index === 0 ? status : "8%" }}
                  />
                </span>
              </span>
              <span className={`rounded-full px-1.5 py-0.5 text-[6px] ${index === 0 ? "bg-[#f6f4ff] text-[#32119c]" : "bg-black/5 text-[#5f5f68]"}`}>
                {index === 0 ? status : "Queued"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 space-y-1">
          <div className="flex items-start gap-1.5 rounded-lg border border-[#0f5c3c]/20 bg-white p-2 shadow-[0_8px_20px_-18px_rgba(20,20,24,0.3)] transition-transform duration-500 group-hover/preview:-translate-y-0.5">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#e2ece5] text-[8px] text-[#0f5c3c]">
              ✓
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[7px] font-semibold text-[#141418]">color-tokens.zip</span>
              <span className="mt-0.5 block text-[6px] text-[#5f5f68]">Ready to download</span>
            </span>
            <span className="text-[6px] text-[#8c8c94]">×</span>
          </div>
          <div className="flex items-start gap-1.5 rounded-lg border border-[#8b3219]/25 bg-[#fdf6f4] p-2">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#f1c7b9] text-[8px] font-bold text-[#8b3219]">
              !
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[7px] font-semibold text-[#141418]">archive-notes.txt</span>
              <span className="mt-0.5 block text-[6px] text-[#8b3219]">Checksum did not match</span>
            </span>
            <span className="rounded border border-[#8b3219]/30 px-1 py-0.5 text-[6px] font-semibold text-[#8b3219]">
              Retry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
