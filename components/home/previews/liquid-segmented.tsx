/**
 * CATALOG PREVIEW — Liquid Segmented.
 * The selection surface slides and the reading list breathes with it.
 * Lab surfaces, violet pill, sans reading list, mono metadata.
 */
export default function LiquidSegmentedPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[310px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-end justify-between border-b border-black/10 pb-2">
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.13em] text-[#4f27e0]">
              Fieldnotes / Reading room
            </p>
            <p className="mt-0.5 text-[17px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
              Six things to read next.
            </p>
          </div>
          <span className="text-[22px] font-semibold leading-none tracking-[-0.06em] text-[#4f27e0]/15">06</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[6px] uppercase tracking-[0.1em] text-[#8c8c94]">
            Density
          </span>
          <div className="relative grid grid-cols-3 rounded-full border border-black/10 bg-[#f6f4ff] p-[2px]">
            <span className="absolute inset-y-[2px] left-[33.333%] w-[calc(33.333%-1.5px)] rounded-full bg-[#4f27e0] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/preview:translate-x-full group-focus-within/preview:translate-x-full" />
            {["Compact", "Comfort", "Spacious"].map((label, index) => (
              <span
                key={label}
                className={`relative z-10 whitespace-nowrap px-1.5 py-0.5 text-center text-[6px] transition-colors duration-300 ${
                  index === 1
                    ? "text-white group-hover/preview:text-[#5f5f68]"
                    : index === 2
                      ? "text-[#5f5f68] group-hover/preview:text-white"
                      : "text-[#5f5f68]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 overflow-hidden rounded-lg border border-black/10">
          <div className="flex justify-between border-b border-black/10 bg-[#fcfcfa] px-2 py-1 font-mono text-[5px] uppercase tracking-[0.08em] text-[#8c8c94]">
            <span>Reading list</span>
            <span>3 in progress</span>
          </div>
          {[
            ["The shape of a pause", "Mira Chen · 18 min"],
            ["A field guide to rooms", "Jon Bell · 11 min"],
            ["Notes on notation", "Ari Soto · 24 min"],
            ["The repair reader", "Fallow Press · 46 min"],
          ].map(([title, meta], index) => (
            <div
              key={title}
              className="flex items-center gap-1.5 border-b border-black/[0.07] px-2 py-1 last:border-0 transition-[padding] duration-500 group-hover/preview:py-2 group-focus-within/preview:py-2"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#dcd5ed] text-[6px] font-semibold text-[#32119c]">
                {title.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[8px] font-semibold text-[#141418]">{title}</span>
                <span className="mt-0.5 block text-[6px] text-[#5f5f68]">{meta}</span>
              </span>
              <span className={`text-[6px] ${index === 0 || index === 2 ? "text-[#4f27e0]" : "text-[#8c8c94]"}`}>
                {index === 0 || index === 2 ? "READING" : index === 1 ? "QUEUED" : "FINISHED"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
