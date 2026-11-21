/**
 * CATALOG PREVIEW — Number Drift.
 * A printed metrics spread in the Lab's white-paper UI. Hovering rolls
 * one digit column; unchanged digits stay put.
 */
export default function NumberDriftPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[320px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-end justify-between border-b-2 border-[#141418] pb-1.5">
          <div>
            <p className="font-mono text-[5px] uppercase tracking-[0.14em] text-[#4f27e0]">
              Annual review / 2026
            </p>
            <p className="mt-0.5 text-[17px] font-semibold leading-none tracking-[-0.04em] text-[#141418]">
              The year in numbers.
            </p>
          </div>
          <span className="rounded-full bg-[#e5e94b] px-1.5 py-0.5 font-mono text-[5px] font-semibold text-[#141418]">
            +12.4%
          </span>
        </div>

        <div className="mt-2 grid grid-cols-2 border-l border-black/10">
          <div className="border-b border-r border-black/10 p-2">
            <p className="text-[6px] font-semibold text-[#141418]">Monthly revenue</p>
            <p className="mt-0.5 font-mono text-[5px] text-[#8c8c94]">Recurring, net</p>
            <div className="mt-1 flex items-end justify-end overflow-hidden">
              <span className="text-[25px] font-semibold leading-none tracking-[-0.05em] text-[#141418]">
                £12
              </span>
              <span className="relative inline-block h-[25px] overflow-hidden text-[25px] font-semibold leading-none tracking-[-0.05em] text-[#141418]">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:-translate-y-[25px] group-focus-within/preview:-translate-y-[25px]">
                  <span className="flex h-[25px] items-center">8</span>
                  <span className="flex h-[25px] items-center">9</span>
                </span>
              </span>
              <span className="text-[25px] font-semibold leading-none tracking-[-0.05em] text-[#141418]">
                ,400
              </span>
            </div>
            <div className="mt-1.5 flex h-4 items-end gap-[2px] border-t border-black/10 pt-1">
              {[30, 46, 38, 55, 49, 66, 61, 74].map((height, index) => (
                <span
                  key={index}
                  className={`flex-1 ${index === 7 ? "bg-[#4f27e0]" : "bg-[#4f27e0]/20"}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <div className="border-b border-r border-black/10 p-2">
            <p className="text-[6px] font-semibold text-[#141418]">Active studios</p>
            <p className="mt-0.5 font-mono text-[5px] text-[#8c8c94]">Weekly active</p>
            <p className="mt-1 text-right text-[25px] font-semibold leading-none tracking-[-0.05em] text-[#141418]">
              2,841
            </p>
            <div className="mt-1.5 flex h-4 items-end gap-[2px] border-t border-black/10 pt-1">
              {[42, 45, 51, 49, 58, 61, 69, 78].map((height, index) => (
                <span
                  key={index}
                  className={`flex-1 ${index === 7 ? "bg-[#4f27e0]" : "bg-[#4f27e0]/20"}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <div className="border-r border-black/10 p-2">
            <p className="text-[6px] font-semibold text-[#141418]">Median session</p>
            <p className="mt-1 text-right text-[25px] font-semibold leading-none tracking-[-0.05em] text-[#141418]">
              18.6<span className="text-[10px]"> min</span>
            </p>
          </div>
          <div className="border-r border-black/10 p-2">
            <p className="text-[6px] font-semibold text-[#141418]">Net change</p>
            <p className="mt-1 text-right text-[25px] font-semibold leading-none tracking-[-0.05em] text-[#8b3219]">
              £−3,740
            </p>
          </div>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[5px] uppercase tracking-[0.06em] text-[#8c8c94]">
          <span>Simulated figures</span>
          <span>Tabular · rolling</span>
        </div>
      </div>
    </div>
  );
}
