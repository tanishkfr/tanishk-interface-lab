/**
 * CATALOG PREVIEW — Chapter Rail.
 * A quiet editorial spread with a rail that advances on hover.
 * Same Lab workbench, type and violet signal as the rest of the library.
 */
export default function ChapterRailPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="flex h-full max-h-[214px] w-[94%] max-w-[310px] gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="relative w-[66px] shrink-0 pt-4">
          <div className="absolute bottom-2 left-[7px] top-4 w-px bg-black/10" />
          <div className="absolute left-[7px] top-4 h-0 w-px bg-[#4f27e0] transition-[height] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:h-[36px] group-focus-within/preview:h-[36px]" />
          <span className="absolute left-[3px] top-[23px] h-2 w-2 rounded-full border border-[#4f27e0] bg-white shadow-[0_0_0_3px_rgba(79,39,224,0.12)] transition-[top] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:top-[59px] group-focus-within/preview:top-[59px]" />
          <div className="space-y-[8px] pl-5">
            {["The pause", "Attention", "Waiting", "Language", "Keeping"].map((label, index) => (
              <p
                key={label}
                className={`font-mono text-[7px] uppercase tracking-[0.04em] transition-colors duration-300 ${
                  index === 0
                    ? "text-[#141418] group-hover/preview:text-[#8c8c94]"
                    : index === 2
                      ? "text-[#8c8c94] group-hover/preview:text-[#141418]"
                      : "text-[#8c8c94]"
                }`}
              >
                {label}
              </p>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-2">
          <p className="font-mono text-[6px] uppercase tracking-[0.14em] text-[#4f27e0]">
            Field Office / Note 014
          </p>
          <p className="mt-1 text-[21px] font-semibold leading-[0.95] tracking-[-0.05em] text-[#141418]">
            The quiet
            <br />
            interface
          </p>
          <div className="mt-2.5 space-y-1.5">
            <span className="block h-1 w-full rounded-full bg-black/10" />
            <span className="block h-1 w-[92%] rounded-full bg-black/10" />
            <span className="block h-1 w-[70%] rounded-full bg-black/10" />
          </div>
          <div className="mt-2.5 border-l-2 border-[#4f27e0] pl-2">
            <span className="block h-1 w-[76%] rounded-full bg-black/10" />
            <span className="mt-1 block h-1 w-[58%] rounded-full bg-black/10" />
          </div>
          <div className="mt-2.5 flex h-[42px] items-end gap-[3px] rounded border border-black/10 bg-[#f6f4ff] p-1.5">
            {[32, 58, 41, 76, 63, 88, 54, 70].map((height, index) => (
              <span
                key={index}
                className={index % 3 === 2 ? "flex-1 bg-[#32119c]/60" : "flex-1 bg-[#4f27e0]/75"}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
