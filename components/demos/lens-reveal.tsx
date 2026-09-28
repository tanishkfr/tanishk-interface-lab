"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  LensReveal,
  type LensRevealShape,
} from "@/components/lab/lens-reveal/lens-reveal";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — an interface audit sheet for a fictional pricing page.
 *
 * One surface, three lenses: review annotations, a revised layout and
 * live measurement chrome. Every string is invented sample copy.
 */

const AUDIT = {
  heading: "Plans that scale with your team",
  eyebrow: "/pricing · draft 03",
  intro:
    "Start free for as long as you like, then move up when the workspace needs more seats or longer history. Prices are per editor, billed monthly; viewers are always free.",
  terms:
    "If the team changes mid-cycle the invoice prorates automatically, and unused time is credited back on the next statement. Annual billing takes two months off the total.",
  callout: "Annual billing: two months off, applied on the first invoice.",
  head: ["Plan", "Monthly", "Seats"],
  rows: [
    ["Studio", "€12", "up to 5"],
    ["Team", "€28", "up to 25"],
    ["Scale", "Custom", "unlimited"],
  ],
  notes: [
    "Name who pays: per editor, not per seat.",
    "Proration promise — keep it above the fold.",
    "Most teams land here; name the trigger.",
  ],
};

type SheetLayer = "base" | "annotate" | "compare" | "debug";

const LENS_COPY: Record<
  "annotate" | "compare" | "debug",
  { label: string; description: string }
> = {
  annotate: {
    label: "Reveal review annotations",
    description:
      "Review annotations. Note 1: prices are per editor, so name who pays. Note 2: the proration promise is worth keeping above the fold. Note 3: the Team plan is the common landing point, so name the upgrade trigger.",
  },
  compare: {
    label: "Reveal the revised layout",
    description:
      "A revised pass of the same copy: a tighter heading hierarchy, the annual-billing callout promoted above the terms, and the Team row highlighted in the plan table.",
  },
  debug: {
    label: "Reveal measurement values",
    description:
      "Measurement chrome. Heading line-height 30px, body line-height 18px, measure 64 characters, block gap 14px, margin rail 118px.",
  },
};

export default function LensRevealDemo({ values }: DemoProps) {
  const mode: "annotate" | "compare" | "debug" =
    values.mode === "compare" || values.mode === "debug"
      ? values.mode
      : "annotate";
  const size = Number(values.size ?? 190);
  const shape: LensRevealShape = values.shape === "square" ? "square" : "circle";
  const edge = Boolean(values.edge);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0.5, y: 0.5 });

  const base = useMemo(() => <Sheet layer="base" />, []);
  const lens = useMemo(() => <Sheet layer={mode} />, [mode]);

  const placeHandle = useCallback(() => {
    const surface = surfaceRef.current;
    const handle = handleRef.current;
    if (!surface || !handle) return;
    const w = surface.clientWidth;
    const h = surface.clientHeight;
    if (w === 0 || h === 0) return;
    const half = Math.max(0, Math.min(size, w, h)) / 2;
    const { x, y } = lastPos.current;
    handle.style.transform = `translate(${x * w}px, ${y * h - half}px) translate(-50%, -50%)`;
    handle.style.opacity = "1";
  }, [size]);

  const onPositionChange = useCallback(
    (x: number, y: number) => {
      lastPos.current = { x, y };
      placeHandle();
    },
    [placeHandle],
  );

  useEffect(() => {
    placeHandle();
  }, [placeHandle, edge]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#e9e9e5] p-3 sm:p-6">
      <div className="flex h-full max-h-[540px] w-full max-w-[660px] flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_60px_-40px_rgba(20,20,24,0.55)]">
        {/* window chrome */}
        <div className="flex items-center gap-2.5 border-b border-black/5 bg-[#fbfbfa] px-3.5 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#d8d8d4]" />
            <span className="h-2 w-2 rounded-full bg-[#d8d8d4]" />
            <span className="h-2 w-2 rounded-full bg-[#d8d8d4]" />
          </span>
          <span className="truncate font-mono text-[10px] tracking-[0.02em] text-[#5f5f68]">
            Interface audit — /pricing
          </span>
        </div>

        {/* toolbar */}
        <div className="flex items-center gap-2 overflow-hidden border-b border-black/5 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#4f27e0]" aria-hidden="true" />
          <span className="truncate font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#5f5f68]">
            review pass
          </span>
          <span className="h-3 w-px flex-none bg-black/10" aria-hidden="true" />
          <span className="truncate font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#8c8c94]">
            1280 viewport · AA contrast · draft 03
          </span>
        </div>

        {/* the audited surface */}
        <div ref={surfaceRef} className="relative min-h-0 flex-1">
          <LensReveal
            base={base}
            lens={lens}
            size={size}
            shape={shape}
            label={LENS_COPY[mode].label}
            description={LENS_COPY[mode].description}
            onPositionChange={onPositionChange}
            className="h-full w-full"
          />
          {edge ? (
            <div
              ref={handleRef}
              className="pointer-events-none absolute left-0 top-0 z-10 opacity-0 transition-opacity duration-300"
              aria-hidden="true"
            >
              <span className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/10 bg-white/95 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#32119c] shadow-[0_6px_18px_-10px_rgba(20,20,24,0.5)]">
                  <span className="flex gap-[2px]">
                    <span className="h-1 w-1 rounded-full bg-[#4f27e0]" />
                    <span className="h-1 w-1 rounded-full bg-[#4f27e0]" />
                    <span className="h-1 w-1 rounded-full bg-[#4f27e0]" />
                  </span>
                  drag
                </span>
                <span className="whitespace-nowrap font-mono text-[8px] tracking-[0.08em] text-[#8c8c94]">
                  move or drag to inspect
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* the sheet itself — identical skeleton for base / annotate / debug */
/* ---------------------------------------------------------------- */

function Sheet({ layer }: { layer: SheetLayer }) {
  if (layer === "compare") return <RevisedSheet />;
  const annotate = layer === "annotate";
  const debug = layer === "debug";

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_68px] content-start gap-y-[14px] py-4 sm:grid-cols-[minmax(0,1fr)_118px] sm:py-5">
        <div className={`relative px-4 sm:px-6 ${debug ? "ring-1 ring-[#4f27e0]/35" : ""}`}>
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#8c8c94]">
            {AUDIT.eyebrow}
          </p>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-[22px] tracking-[-0.01em] text-[#141418] sm:text-[21px] sm:leading-[30px]">
            {AUDIT.heading}
          </h3>
          {debug ? <Chip className="-top-2 right-1">lh 30px</Chip> : null}
        </div>
        <Rail layer={layer} index={0} />

        <div className={`relative px-4 sm:px-6 ${debug ? "ring-1 ring-[#4f27e0]/35" : ""}`}>
          <p className="max-w-[64ch] text-[10px] leading-[16px] text-[#3f3f46] sm:text-[11.5px] sm:leading-[18px]">
            Start free for as long as you like, then move up when the
            workspace needs more seats or longer history.{" "}
            <Phrase n={1} show={annotate}>Prices are per editor</Phrase>,
            billed monthly; viewers are always free.
          </p>
          {debug ? <Baselines /> : null}
          {debug ? <Chip className="-top-1.5 left-4">lh 18px</Chip> : null}
          {debug ? <Chip className="-top-1.5 right-1">w 64ch</Chip> : null}
        </div>
        <Rail layer={layer} index={1} />

        <div className={`relative px-4 sm:px-6 ${debug ? "ring-1 ring-[#4f27e0]/35" : ""}`}>
          <p className="max-w-[64ch] text-[10px] leading-[16px] text-[#3f3f46] sm:text-[11.5px] sm:leading-[18px]">
            If the team changes mid-cycle the invoice prorates
            automatically, and{" "}
            <Phrase n={2} show={annotate}>
              unused time is credited back
            </Phrase>{" "}
            on the next statement. Annual billing takes two months off the
            total.
          </p>
          {debug ? <Baselines /> : null}
        </div>
        <Rail layer={layer} index={2} />

        <div className={`relative px-4 sm:px-6 ${debug ? "ring-1 ring-[#4f27e0]/35" : ""}`}>
          <MiniTable markTeam={annotate} />
          {debug ? <Chip className="-top-2 right-1">gap 14px</Chip> : null}
          <p className="mt-2 max-w-[64ch] text-[8.5px] leading-[13px] text-[#8c8c94]">
            {AUDIT.callout}
          </p>
        </div>
        <Rail layer={layer} index={3} />
      </div>
    </div>
  );
}

function RevisedSheet() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div className="flex h-full flex-col gap-2.5 px-4 py-4 sm:gap-3.5 sm:px-6 sm:py-5">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#4f27e0]">
          revised pass · tighter hierarchy
        </p>
        <h3 className="max-w-[46ch] text-[13px] font-semibold leading-[18px] tracking-[-0.01em] text-[#141418] sm:text-[17px] sm:leading-[22px]">
          {AUDIT.heading}
        </h3>
        <p className="max-w-[64ch] text-[10px] leading-[15px] text-[#3f3f46] sm:text-[11px] sm:leading-[16px]">
          {AUDIT.intro}
        </p>
        <div className="max-w-[64ch] rounded-md border border-[#4f27e0]/25 bg-[#f4f1ff] px-2.5 py-2 text-[9.5px] leading-[14px] text-[#32119c] sm:px-3 sm:py-2.5 sm:text-[10.5px] sm:leading-[16px]">
          {AUDIT.callout}
        </div>
        <p className="max-w-[64ch] text-[10px] leading-[15px] text-[#3f3f46] sm:text-[11px] sm:leading-[16px]">
          {AUDIT.terms}
        </p>
        <MiniTable revised />
      </div>
    </div>
  );
}

function MiniTable({
  revised = false,
  markTeam = false,
}: {
  revised?: boolean;
  markTeam?: boolean;
}) {
  return (
    <table className="w-full max-w-[64ch] border-collapse text-left">
      <thead>
        <tr className={revised ? "border-b border-black/20" : "border-b border-black/15"}>
          {AUDIT.head.map((cell) => (
            <th
              key={cell}
              className={`py-1.5 pr-2 font-mono font-medium uppercase tracking-[0.14em] text-[#8c8c94] ${revised ? "text-[7.5px]" : "text-[8px]"}`}
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {AUDIT.rows.map((row, i) => (
          <tr
            key={row[0]}
            className={
              revised && i === 1
                ? "border-b border-[#4f27e0]/20 bg-[#f4f1ff]/70"
                : "border-b border-black/5"
            }
          >
            {row.map((cell, j) => (
              <td
                key={cell}
                className={`py-1.5 pr-2 ${revised ? "text-[9px]" : "text-[9.5px] sm:text-[10.5px]"} ${
                  j === 0
                    ? "font-medium text-[#141418]"
                    : "font-mono text-[9px] text-[#5f5f68] sm:text-[10px]"
                }`}
              >
                {i === 1 && j === 0 && markTeam ? (
                  <Phrase n={3} show>
                    {cell}
                  </Phrase>
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Phrase({
  n,
  show,
  children,
}: {
  n: number;
  show: boolean;
  children: ReactNode;
}) {
  return (
    <span className="relative">
      {children}
      {show ? (
        <span
          aria-hidden="true"
          className="absolute -right-2.5 -top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#4f27e0] font-mono text-[8px] font-semibold leading-none text-white ring-1 ring-white"
        >
          {n}
        </span>
      ) : null}
    </span>
  );
}

function Chip({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 rounded-[3px] border border-[#4f27e0]/30 bg-[#f4f1ff] px-1 py-[1px] font-mono text-[7.5px] leading-none text-[#32119c] ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

function Baselines() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [--lr-bl:16px] sm:[--lr-bl:18px]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0 calc(var(--lr-bl) - 3px), rgba(79, 39, 224, 0.35) calc(var(--lr-bl) - 3px) calc(var(--lr-bl) - 2px), transparent calc(var(--lr-bl) - 2px) var(--lr-bl))",
      }}
    />
  );
}

function Rail({ layer, index }: { layer: SheetLayer; index: number }) {
  const note = index > 0 ? AUDIT.notes[index - 1] : null;
  return (
    <div className="border-l border-black/5 bg-[#fbfbfa] px-2 sm:px-3">
      {layer === "base" && index === 0 ? (
        <p className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#c4c4c0]">
          margin
        </p>
      ) : null}
      {layer === "annotate" && note ? (
        <div className="rounded-[4px] border border-[#4f27e0]/25 bg-white px-1.5 py-1">
          <span className="font-mono text-[7px] text-[#4f27e0]">{index}</span>
          <span className="mt-0.5 block text-[7.5px] leading-[1.4] text-[#3f3f46] sm:text-[9px]">
            {note}
          </span>
        </div>
      ) : null}
      {layer === "debug" ? (
        <p className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-[#4f27e0]">
          {["h3", "p · 1", "p · 2", "table"][index]}
        </p>
      ) : null}
    </div>
  );
}
