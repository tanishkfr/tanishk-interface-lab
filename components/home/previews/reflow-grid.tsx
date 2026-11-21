/**
 * CATALOG PREVIEW — Reflow Grid.
 * Four object cards re-slot on hover on a light Lab workbench.
 * No animation loop; the movement is one CSS state change.
 */
import type { CSSProperties } from "react";

export default function ReflowGridPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] p-4">
      <div className="w-[94%] max-w-[320px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,24,0.05)]">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[6px] uppercase tracking-[0.14em] text-[#4f27e0]">
            Object archive
          </p>
          <div className="flex gap-1">
            {["All", "Light", "Seat"].map((chip, index) => (
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
        </div>

        <div className="relative mt-2 h-[150px]">
          {[
            { label: "Halo pendant", tone: "#dfe3ee", x: 0, y: 0, w: 48, h: 64, dx: 52, dy: 0 },
            { label: "Taper stool", tone: "#e2ece5", x: 52, y: 0, w: 48, h: 78, dx: -52, dy: 0 },
            { label: "Fold vessel", tone: "#f0e6d8", x: 0, y: 72, w: 48, h: 60, dx: 52, dy: 0 },
            { label: "Arc mirror", tone: "#dcd5ed", x: 52, y: 86, w: 48, h: 50, dx: -52, dy: 0 },
          ].map((card, index) => (
            <div
              key={card.label}
              className="absolute rounded-lg border border-black/10 bg-white p-1 shadow-[0_1px_2px_rgba(20,20,24,0.04)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover/preview:translate-x-[var(--dx)] group-hover/preview:translate-y-[var(--dy)] group-focus-within/preview:translate-x-[var(--dx)] group-focus-within/preview:translate-y-[var(--dy)]"
              style={{
                left: `${card.x}%`,
                top: card.y,
                width: `${card.w}%`,
                height: card.h,
                "--dx": `${card.dx}%`,
                "--dy": `${card.dy}px`,
                transitionDelay: `${index * 25}ms`,
              } as CSSProperties}
            >
              <div
                className="relative h-[60%] overflow-hidden rounded-md"
                style={{ background: card.tone }}
              >
                <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#141418]/20" />
                <span className="absolute bottom-1 left-1/2 h-px w-6 -translate-x-1/2 bg-[#141418]/25" />
              </div>
              <p className="mt-1 truncate text-[7px] font-semibold text-[#141418]">{card.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-1.5 font-mono text-[5px] uppercase tracking-[0.08em] text-[#8c8c94]">
          <span>10 objects</span>
          <span>Grid / List / Search</span>
        </div>
      </div>
    </div>
  );
}
