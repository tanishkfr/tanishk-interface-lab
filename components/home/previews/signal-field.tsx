import { SignalField } from "@/components/lab/signal-field/signal-field";

/**
 * CATALOG PREVIEW — Signal Field.
 *
 * The real component, at catalog cost: a coarser grid, lower density
 * and no pointer field. It is the one preview that is genuinely alive
 * on the page, because a still frame would misrepresent it.
 */
export default function SignalFieldPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <SignalField
        className="absolute inset-0 text-[#141418]"
        density={0.46}
        intensity={0.5}
        pointerRadius={8}
        cell={18}
        seed={7}
      />
      <div className="pointer-events-none absolute left-[36%] top-[35%] h-16 w-16 rounded-full bg-white/70 opacity-0 transition-[opacity,transform] duration-500 group-hover/preview:translate-x-12 group-hover/preview:opacity-100 group-focus-within/preview:translate-x-12 group-focus-within/preview:opacity-100"><span className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#4f27e0]" /></div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="h-[5px] w-16 rounded-full bg-[#141418]/55" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8c8c94]">
          live
        </span>
      </div>
    </div>
  );
}
