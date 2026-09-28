/**
 * CATALOG PREVIEW — Evidence Carousel.
 *
 * A miniature archive strip: real plates from the demo's public-domain
 * photo set, the active one centred with its neighbour peeking in, a
 * counter and progress line below. On hover the strip advances one
 * plate, the way the real one moves.
 */
export default function EvidenceCarouselPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbfbfa]">
      <div className="absolute inset-x-0 top-[16%]">
        <div className="ml-[-56%] flex w-full gap-3 transition-[margin-left] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/preview:ml-[-125%]">
          <MiniPlate src="/archive/topographic-sheet.jpg" />
          <MiniPlate
            src="/archive/north-face-camp.jpg"
            position="50% 64%"
            active
          />
          <MiniPlate src="/archive/ground-cover.jpg" position="50% 62%" />
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-black/15 text-[9px] text-[#5f5f68]">
            ←
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-black/15 text-[9px] text-[#5f5f68]">
            →
          </span>
        </span>
        <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#141418]/12">
          <span className="block h-full w-2/3 rounded-full bg-[#141418]/60 transition-transform duration-700 group-hover/preview:translate-x-[10%]" />
        </span>
        <span className="font-mono text-[9px] tracking-[0.1em] text-[#8c8c94]">
          02/05
        </span>
      </div>
    </div>
  );
}

function MiniPlate({
  src,
  active = false,
  position,
}: {
  src: string;
  active?: boolean;
  position?: string;
}) {
  return (
    <span
      className={`relative block aspect-[16/10] w-[62%] flex-none overflow-hidden rounded-lg border bg-[#e7e7e3] ${
        active ? "border-black/10" : "border-black/5"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local archive scan, fixed frame */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={position ? { objectPosition: position } : undefined}
      />
      {active ? (
        <>
          <span className="absolute inset-x-0 bottom-0 block h-14 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-3 block h-[3px] w-8 rounded-full bg-[#8f7bf0]" />
          <span className="absolute bottom-5 left-3 block h-[6px] w-16 rounded-full bg-white/85" />
          <span className="absolute bottom-7 left-3 block h-[5px] w-12 rounded-full bg-white/45" />
        </>
      ) : null}
    </span>
  );
}
