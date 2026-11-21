/**
 * CATALOG PREVIEW — Continuity Tabs.
 * A miniature settings card; on hover the selection surface moves and
 * the content swaps. No mounted tabs, no measurement, no timers.
 */
export default function ContinuityTabsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#eceef2] p-4">
      <div className="w-[88%] max-w-[300px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(29,32,38,0.05)]">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[#3c36c9] text-[10px] font-semibold text-white">
            N
          </span>
          <div>
            <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-[#8a8e96]">
              Northstar Studio
            </p>
            <p className="text-[11px] font-semibold leading-tight">Settings</p>
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-4 rounded-lg border border-black/5 bg-[#f4f4f1] p-1">
          <span className="absolute inset-y-1 left-1 w-[calc(25%-2px)] rounded-md bg-white shadow-[0_1px_2px_rgba(29,32,38,0.12)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/preview:translate-x-full group-focus-within/preview:translate-x-full" />
          {["Overview", "Activity", "Prefs", "Access"].map((label, index) => (
            <span
              key={label}
              className={`relative z-10 py-1 text-center text-[8px] transition-colors duration-300 ${
                index === 0
                  ? "text-[#1d2026] group-hover/preview:text-[#6b6f78]"
                  : index === 1
                    ? "text-[#6b6f78] group-hover/preview:text-[#1d2026]"
                    : "text-[#6b6f78]"
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="relative mt-2.5 h-[74px] overflow-hidden">
          <div className="absolute inset-0 transition-opacity duration-300 group-hover/preview:opacity-0">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-black/10 bg-black/10">
              {["14", "8", "62%"].map((value, index) => (
                <div key={value} className="bg-[#fafaf8] px-1.5 py-1.5">
                  <span className="block h-1 w-5 rounded-full bg-black/10" />
                  <strong className="mt-1 block text-[11px] leading-none">{value}</strong>
                  <span className="mt-0.5 block h-1 w-7 rounded-full bg-black/[0.06]" />
                  {index === 1 ? null : null}
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1.5">
              <span className="block h-1.5 w-full rounded-full bg-black/[0.06]" />
              <span className="block h-1.5 w-4/5 rounded-full bg-black/[0.06]" />
            </div>
          </div>
          <div className="absolute inset-0 opacity-0 transition-opacity delay-100 duration-300 group-hover/preview:opacity-100">
            <div className="flex items-center justify-between rounded-md border border-black/[0.07] bg-[#fafaf8] px-2 py-1.5">
              <span className="text-[8px] font-semibold">Recent activity</span>
              <span className="rounded-full bg-[#eef0f3] px-1.5 py-0.5 text-[7px] text-[#6b6f78]">5</span>
            </div>
            <div className="mt-1.5 space-y-1">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-[#e8e6f8]" />
                  <span className="h-1 flex-1 rounded-full bg-black/[0.06]" />
                  <span className="h-1 w-6 rounded-full bg-black/[0.04]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
