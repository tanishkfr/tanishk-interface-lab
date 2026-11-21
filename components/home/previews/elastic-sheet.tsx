/**
 * CATALOG PREVIEW — Elastic Sheet.
 * A project library with a filter sheet that arrives on hover.
 * Lab neutral surfaces, violet actions, neutral project matter.
 */
export default function ElasticSheetPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f2] p-4">
      <div className="mx-auto w-[94%] max-w-[310px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-end justify-between border-b border-black/10 pb-2">
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.14em] text-[#4f27e0]">
              Project library
            </p>
            <p className="mt-0.5 text-[17px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
              Selected work
            </p>
          </div>
          <span className="rounded-full border border-[#4f27e0]/30 bg-[#f6f4ff] px-2 py-0.5 text-[7px] font-semibold text-[#32119c]">
            Filters
          </span>
        </div>
        <div className="mt-2 space-y-1.5">
          {[
            ["Morrow identity", "Brand", "2024", "Active", "#dfe3ee"],
            ["Tidewater annual", "Editorial", "2025", "Active", "#f0e6d8"],
            ["Atlas archive", "Research", "2023", "Archived", "#dcd5ed"],
          ].map(([name, category, year, status, tone], index) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg border border-black/10 bg-[#fcfcfa] p-1.5 transition-opacity duration-300 group-hover/preview:opacity-70"
              style={{ transitionDelay: `${index * 30}ms` }}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-md text-[13px] font-semibold text-black/50"
                style={{ background: tone as string }}
              >
                {name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[8px] font-semibold text-[#141418]">{name}</span>
                <span className="mt-0.5 block text-[7px] text-[#5f5f68]">
                  {category} · {year}
                </span>
              </span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[6px] uppercase tracking-wide ${
                  status === "Archived"
                    ? "bg-black/5 text-[#5f5f68]"
                    : "bg-[#f6f4ff] text-[#32119c]"
                }`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-[#141418]/15 opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-within/preview:opacity-100" />
      <div className="absolute bottom-3 right-2 top-3 w-[62%] translate-x-[110%] rounded-xl border border-black/10 bg-white p-3 shadow-[-18px_0_40px_-24px_rgba(20,20,24,0.35)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/preview:translate-x-0 group-focus-within/preview:translate-x-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#141418]">Filter projects</p>
            <p className="mt-0.5 text-[7px] text-[#5f5f68]">Changes appear when you apply.</p>
          </div>
          <span className="grid h-4 w-4 place-items-center rounded-full border border-black/10 text-[7px] text-[#5f5f68]">
            ×
          </span>
        </div>
        <div className="mt-2.5 space-y-2">
          <div>
            <span className="text-[6px] font-semibold uppercase tracking-wide text-[#5f5f68]">Search</span>
            <div className="mt-1 h-5 rounded border border-black/15 bg-white px-1.5 py-1">
              <span className="block h-1 w-1/2 rounded-full bg-black/10" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {["All", "Brand", "Editorial", "Research"].map((chip, index) => (
              <span
                key={chip}
                className={`rounded-full px-1.5 py-0.5 text-[6px] ${
                  index === 0
                    ? "bg-[#4f27e0] text-white"
                    : "border border-black/15 text-[#5f5f68]"
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="h-5 flex-1 rounded border border-black/15 bg-white px-1 py-1">
              <span className="block h-1 w-5 rounded-full bg-black/10" />
            </div>
            <div className="h-5 flex-1 rounded border border-black/15 bg-white px-1 py-1">
              <span className="block h-1 w-5 rounded-full bg-black/10" />
            </div>
          </div>
          <div className="flex justify-end gap-1 pt-1">
            <span className="rounded-full border border-black/15 px-2 py-0.5 text-[6px] text-[#5f5f68]">
              Reset
            </span>
            <span className="rounded-full bg-[#4f27e0] px-2 py-0.5 text-[6px] font-semibold text-white">
              Apply
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
