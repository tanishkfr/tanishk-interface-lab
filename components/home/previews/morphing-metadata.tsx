/**
 * CATALOG PREVIEW — Morphing Metadata.
 *
 * One miniature record: header, then two stacked layers in the same
 * space. On card hover the summary chips fade out and the detail rows
 * fade in, so the "same surface changes density" idea reads in one frame.
 */
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function MorphingMetadataPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2] p-4">
      <div className="mx-auto flex h-full max-w-[330px] flex-col rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 flex-none rounded-[4px] border border-black/10 bg-[#f4f4f2]" />
          <span className="min-w-0 truncate text-[11px] font-medium text-[#141418]">
            archive.tar.gz
          </span>
          <span className="hidden font-mono text-[8px] uppercase tracking-[0.1em] text-[#8c8c94] sm:block">
            file · 248 MB
          </span>
          <span className="ml-auto flex-none rounded-full border border-black/10 px-1.5 py-[1px] font-mono text-[8px] uppercase tracking-[0.08em] text-[#5f5f68] transition-colors duration-300 group-hover/preview:border-[#4f27e0]/45 group-hover/preview:text-[#32119c]">
            details
          </span>
        </div>

        <div className="relative mt-3 min-h-0 flex-1">
          <div
            className={`absolute inset-0 flex flex-wrap content-start gap-1.5 transition-all duration-500 ${EASE} group-hover/preview:-translate-y-1 group-hover/preview:opacity-0`}
          >
            {[
              ["size", "248 MB"],
              ["modified", "Mar 14"],
              ["owner", "R. Iyer"],
            ].map(([label, value]) => (
              <span
                key={label}
                className="inline-flex items-baseline gap-1 rounded-full bg-[#141418]/[0.045] px-2 py-1"
              >
                <span className="font-mono text-[7.5px] uppercase tracking-[0.09em] text-[#8c8c94]">
                  {label}
                </span>
                <span className="text-[10px] font-medium text-[#141418]">
                  {value}
                </span>
              </span>
            ))}
          </div>

          <div
            className={`absolute inset-0 translate-y-1 opacity-0 transition-all duration-500 ${EASE} group-hover/preview:translate-y-0 group-hover/preview:opacity-100`}
          >
            {[
              ["Location", "/exports/q1/archive.tar.gz"],
              ["Checksum", "sha256 9f2c…a41d"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 border-t border-black/[0.07] py-1.5 first:border-black/10"
              >
                <span className="flex-none font-mono text-[7.5px] uppercase tracking-[0.09em] text-[#8c8c94]">
                  {label}
                </span>
                <span className="min-w-0 truncate text-right text-[10px] font-medium text-[#141418]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
