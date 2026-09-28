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
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="h-[5px] w-16 rounded-full bg-[#141418]/55" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8c8c94]">
          live
        </span>
      </div>
    </div>
  );
}
