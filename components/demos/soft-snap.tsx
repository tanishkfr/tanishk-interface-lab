import { SoftSnap, SoftSnapItem } from "@/components/lab/soft-snap/soft-snap";
import "./soft-snap-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a field journal lane.
 *
 * Six plausible case notes: enough of a lane that settling matters,
 * and every card tall enough that framing is visible when it happens.
 */

const ENTRIES = [
  {
    id: "012",
    title: "Wayfinding in dense tables",
    meta: "Field note · 6 min",
    line: "Sorting, density and the cost of a sticky header: what survived a week of real use.",
    tone: "a",
  },
  {
    id: "011",
    title: "The shape of a review step",
    meta: "Field note · 9 min",
    line: "Why the accept button is the least interesting part of human-in-the-loop tooling.",
    tone: "b",
  },
  {
    id: "010",
    title: "Quiet motion in editorial",
    meta: "Field note · 4 min",
    line: "Ambient fields, slow reveals and the discipline of leaving the page mostly still.",
    tone: "c",
  },
  {
    id: "009",
    title: "Citation as interface",
    meta: "Field note · 7 min",
    line: "Progressive disclosure for sources, and why confidence needs a number and a word.",
    tone: "d",
  },
  {
    id: "008",
    title: "Command menus after the honeymoon",
    meta: "Field note · 5 min",
    line: "Grouping, previews and the small decisions that keep ⌘K fast on the fifth day.",
    tone: "e",
  },
  {
    id: "007",
    title: "Selecting many things",
    meta: "Field note · 8 min",
    line: "Batch actions without a floating toolbar that covers half the selection.",
    tone: "f",
  },
];

export default function SoftSnapDemo({ values }: DemoProps) {
  const mode = String(values.mode ?? "proximity") as
    | "off"
    | "proximity"
    | "mandatory"
    | "assist";
  const align = String(values.align ?? "start") as "start" | "center";
  const spacing = Number(values.spacing ?? 28);
  const entries = Boolean(values.count) ? ENTRIES : ENTRIES.slice(0, 4);

  return (
    <div className="dm-ss-root">
      <header className="dm-ss-head">
        <div>
          <p className="dm-ss-eyebrow">Field journal</p>
          <h2 className="dm-ss-title">Notes from shipped work</h2>
        </div>
        <p className="dm-ss-hint" aria-hidden="true">
          {mode === "off" ? "settling off" : `settle · ${mode}`}
        </p>
      </header>

      <SoftSnap
        mode={mode}
        align={align}
        gap={spacing}
        className="dm-ss-lane"
        offset={0}
      >
        {entries.map((entry) => (
          <SoftSnapItem key={entry.id}>
            <article className={`dm-ss-card dm-ss-tone-${entry.tone}`}>
              <div className="dm-ss-poster" aria-hidden="true">
                <span className="dm-ss-index">{entry.id}</span>
              </div>
              <div className="dm-ss-body">
                <h3>{entry.title}</h3>
                <p className="dm-ss-meta">{entry.meta}</p>
                <p className="dm-ss-line">{entry.line}</p>
              </div>
            </article>
          </SoftSnapItem>
        ))}
      </SoftSnap>
    </div>
  );
}
