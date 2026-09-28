/**
 * CATALOG PREVIEW — Agent Review Surface.
 *
 * A proposal card mid-review: title, a four-row diff, and the accept
 * action. On hover the decision lands — the accepted chip slides in
 * while the accept pill fades out.
 */
export default function AgentReviewPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f2f2ef]">
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="w-full max-w-[252px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_1px_2px_rgba(20,20,24,0.06)]">
          <div className="border-b border-black/[0.06] px-3.5 pb-2 pt-3">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8c8c94]">
              Proposed change
            </p>
            <p className="mt-1 truncate text-[11.5px] font-semibold text-[#141418]">
              Rename total → amount
            </p>
          </div>

          <div className="space-y-[3px] px-2.5 py-2.5 font-mono text-[9.5px] leading-[1.5]">
            <Row kind="context" text="CREATE TABLE orders (" />
            <Row kind="remove" text="total_cents integer NOT NULL" />
            <Row kind="add" text="amount_cents integer NOT NULL" />
            <Row kind="context" text=");" />
          </div>

          <div className="relative flex h-[38px] items-center border-t border-black/[0.06] px-3">
            <span className="rounded-full bg-[#4f27e0] px-3 py-[4px] text-[9.5px] font-medium text-white transition-opacity duration-300 group-hover/preview:opacity-0">
              Accept change
            </span>
            <span className="absolute inset-y-0 left-3 flex translate-y-1 items-center gap-1.5 text-[9.5px] font-medium text-[#0f5c3c] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:translate-y-0 group-hover/preview:opacity-100">
              <span className="h-[7px] w-[7px] rounded-full bg-[#147a4e]" />
              Change accepted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type RowKind = "add" | "remove" | "context";

function Row({ kind, text }: { kind: RowKind; text: string }) {
  const wash = kind === "add" ? "bg-[#137a4e]/[0.09]" : kind === "remove" ? "bg-[#b3261e]/[0.07]" : "";
  const sign = kind === "add" ? "+" : kind === "remove" ? "−" : " ";
  const tone = kind === "add" ? "text-[#0f5c3c]" : kind === "remove" ? "text-[#92201a]" : "text-[#8c8c94]";
  return (
    <div className={`flex gap-1.5 rounded-[3px] px-1.5 py-[1px] ${wash}`}>
      <span className={`w-2 flex-none ${tone}`}>{sign}</span>
      <span className="truncate text-[#3a3a42]">{text}</span>
    </div>
  );
}
