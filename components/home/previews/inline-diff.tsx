/**
 * CATALOG PREVIEW — Inline Diff Text.
 *
 * A changed sentence at rest, the reason one chevron away. On hover
 * the reason line fades in and the removed phrase's strikethrough
 * settles into place.
 */
export default function InlineDiffPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f6f6f3] p-3">
      <div className="rounded-lg border border-black/10 bg-white p-3.5 shadow-[0_1px_2px_rgba(20,20,24,0.04)]">
        <p className="font-serif text-[12.5px] leading-[1.8] text-[#26262c]">
          Onboarding takes{" "}
          <del className="[text-decoration-thickness:1px] [text-decoration-color:rgba(179,38,30,0.4)] transition-[text-decoration-color] duration-500 group-hover/preview:[text-decoration-color:rgba(179,38,30,0.8)]">
            about ten minutes
          </del>{" "}
          <ins className="rounded-[3px] bg-[#137a4e]/[0.12] px-[1.5px] no-underline">
            two minutes
          </ins>{" "}
          to the first saved project.
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <svg
            className="h-2.5 w-2.5 text-[#8c8c94] transition-transform duration-300 group-hover/preview:rotate-180"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6.25 8 10.25 12 6.25"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#8c8c94]">
            reason
          </span>
        </div>

        <p className="mt-1.5 translate-y-0.5 pl-4 text-[10.5px] italic text-[#5f5f68] opacity-0 transition duration-300 group-hover/preview:translate-y-0 group-hover/preview:opacity-100">
          “about ten minutes” overstated the current flow.
        </p>
      </div>
    </div>
  );
}
