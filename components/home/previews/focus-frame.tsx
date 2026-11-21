/**
 * CATALOG PREVIEW — Focus Frame.
 * A settings field catches focus on hover, then reveals a valid state.
 * Lab surfaces, violet focus, rust validation.
 */
export default function FocusFramePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[310px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.13em] text-[#4f27e0]">
              Account / Workspace
            </p>
            <p className="mt-0.5 text-[16px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
              Workspace profile
            </p>
          </div>
          <span className="text-[7px] text-[#8c8c94]">Loom &amp; Field</span>
        </div>

        <div className="mt-2.5 space-y-2.5">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[7px] font-semibold text-[#141418] transition-colors duration-200 group-hover/preview:text-[#4f27e0]">
                Workspace name
              </span>
              <span className="font-mono text-[5px] text-[#8c8c94]">17/60</span>
            </div>
            <div className="relative mt-1 rounded-md border border-[#4f27e0] bg-white px-2 py-1.5 shadow-[0_0_0_3px_rgba(79,39,224,0.08)] transition-all duration-300 group-hover/preview:border-[#4f27e0] group-focus-within/preview:border-[#4f27e0]">
              <span className="text-[8px] text-[#141418]">Loom &amp; Field</span>
              <span className="absolute -right-[3px] -top-[3px] h-1.5 w-1.5 border-l border-t border-[#4f27e0]" />
              <span className="absolute -bottom-[3px] -left-[3px] h-1.5 w-1.5 border-b border-l border-[#4f27e0]" />
            </div>
            <p className="mt-1 text-[6px] text-[#5f5f68]">Shown to everyone with access.</p>
          </div>

          <div>
            <span className="text-[7px] font-semibold text-[#141418]">Contact email</span>
            <div className="mt-1 rounded-md border border-[#8b3219]/50 bg-[#fdf6f4] px-2 py-1.5">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[8px] text-[#141418]">studio@loomandfield</span>
                <span className="grid h-2.5 w-2.5 place-items-center rounded-full bg-[#8b3219] text-[6px] font-bold text-white">
                  !
                </span>
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[6px] text-[#8b3219]">
              <span className="font-bold">!</span> Enter a complete email address.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <span className="rounded-full bg-[#4f27e0] px-2 py-1 text-[6px] font-semibold text-white">
              Save changes
            </span>
            <span className="rounded-full border border-black/15 px-2 py-1 text-[6px] text-[#5f5f68]">
              Reset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
