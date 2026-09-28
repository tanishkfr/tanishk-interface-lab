import type { Experiment, PreviewControl } from "./types";
import { CATEGORIES } from "./types";

/**
 * THE EXPERIMENT REGISTRY — the single source of truth.
 *
 * Every record here flows to three places: the home catalog, the
 * /experiments/[slug] page, and the shadcn-compatible registry item
 * served from /r/[slug].json. If an experiment exists, it exists
 * here first.
 */

export const experiments: Experiment[] = [
  {
    slug: "signal-field",
    name: "Signal Field",
    tagline:
      "An ambient glyph field that the pointer quiets, not creates.",
    summary:
      "A low-resolution canvas field that resolves into monospace glyphs, dithered dots or sparse pixel fragments. It is already alive at rest; the pointer pushes density down in a soft radius, so attention reads as subtraction rather than a gimmick that only exists while you move. Built for hero backdrops, empty states and section grounds in editorial and tool interfaces.",
    category: "Motion",
    tags: ["canvas", "ambient", "pointer", "background"],
    status: "stable",
    tech: ["React", "Canvas 2D", "IntersectionObserver"],
    dependencies: [],
    files: [
      {
        path: "components/lab/signal-field/signal-field.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/signal-field/signal-field.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "slider",
          id: "density",
          label: "Density",
          min: 0.1,
          max: 1,
          step: 0.05,
          unit: "percent",
        },
        {
          kind: "slider",
          id: "intensity",
          label: "Intensity",
          min: 0,
          max: 1,
          step: 0.05,
          unit: "percent",
        },
        {
          kind: "slider",
          id: "pointerRadius",
          label: "Pointer radius",
          min: 0,
          max: 18,
          step: 1,
          unit: "cells",
        },
        {
          kind: "slider",
          id: "speed",
          label: "Speed",
          min: 0,
          max: 2,
          step: 0.1,
          unit: "multiplier",
        },
        {
          kind: "choice",
          id: "mode",
          label: "Render as",
          options: [
            { value: "glyph", label: "Glyphs" },
            { value: "dither", label: "Halftone" },
            { value: "pixel", label: "Pixels" },
          ],
        },
      ],
      defaults: {
        density: 0.45,
        intensity: 0.55,
        pointerRadius: 10,
        speed: 1,
        mode: "glyph",
      },
      hint: "Move the pointer across the field",
    },
    props: [
      {
        name: "glyphs",
        type: "string",
        default: '"·:+*#"',
        description: "Character ramp, quietest first.",
      },
      {
        name: "cell",
        type: "number",
        default: "14",
        description: "Grid cell size in CSS pixels.",
      },
      {
        name: "density",
        type: "number",
        default: "0.4",
        description: "0–1 ambient resolve level at rest.",
      },
      {
        name: "intensity",
        type: "number",
        default: "0.5",
        description: "0–1 contrast curve; higher resolves more of the field.",
      },
      {
        name: "pointerRadius",
        type: "number",
        default: "9",
        description: "Suppression radius around the pointer, in cells. 0 disables.",
      },
      {
        name: "speed",
        type: "number",
        default: "1",
        description: "Time scale for the underlying noise. 0 freezes it.",
      },
      {
        name: "mode",
        type: '"glyph" | "dither" | "pixel"',
        default: '"glyph"',
        description: "How cells resolve: characters, halftone dots or solid fragments.",
      },
      {
        name: "accent",
        type: "string",
        default: "—",
        description:
          'Hex colour for the densest cells. Without it the field inherits currentColor at low opacity.',
      },
      {
        name: "seed",
        type: "number",
        default: "1",
        description: "Changes the noise field’s composition. Same seed, same field.",
      },
      {
        name: "paused",
        type: "boolean",
        default: "false",
        description: "Freeze the field externally; the last composed frame stays.",
      },
    ],
    accessibility: [
      "The canvas is aria-hidden decoration — never the only carrier of information.",
      "Offscreen, hidden tabs and prefers-reduced-motion stop the render loop entirely; reduced motion paints one composed static frame instead.",
      "Coarse pointers get no pointer field, so phones show the ambient state only.",
      "DPR is capped and the paint rate adapts to cell count, so it stays cheap on high-refresh displays.",
    ],
    usage: `import { SignalField } from "@/components/lab/signal-field/signal-field";

export function Hero() {
  return (
    <section className="relative min-h-[60vh]">
      <SignalField
        className="absolute inset-0 h-full w-full text-[#141418]"
        density={0.4}
        intensity={0.6}
        pointerRadius={10}
        accent="#4f27e0"
      />
      <h1 className="relative">Interface experiments</h1>
    </section>
  );
}`,
    demoNote:
      "A sample editorial hero: the field runs at rest and yields around the pointer. Try each render mode — glyphs for texture, halftone for print, pixels for signal.",
    order: 1,
  },

  {
    slug: "soft-snap",
    name: "Soft Snap Cards",
    tagline:
      "Full-width cards that settle into frame without hijacking your scroll.",
    summary:
      "CSS scroll-snap proximity, and nothing more aggressive than that: when a gesture ends near a card, the browser settles it; when you keep scrolling, it never pulls you back. This is the framing behaviour large editorial cards need — case studies, changelog entries, media features — gated to fine pointers on wide screens, with reduced-motion readers left untouched.",
    category: "Motion",
    tags: ["scroll", "editorial", "cards", "css"],
    status: "stable",
    tech: ["React", "CSS scroll-snap", "IntersectionObserver"],
    dependencies: [],
    files: [
      {
        path: "components/lab/soft-snap/soft-snap.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/soft-snap/soft-snap.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "mode",
          label: "Settle",
          options: [
            { value: "proximity", label: "Proximity" },
            { value: "mandatory", label: "Mandatory" },
            { value: "off", label: "Off" },
          ],
        },
        {
          kind: "choice",
          id: "align",
          label: "Frame",
          options: [
            { value: "start", label: "Top" },
            { value: "center", label: "Center" },
          ],
        },
        {
          kind: "slider",
          id: "spacing",
          label: "Spacing",
          min: 12,
          max: 56,
          step: 4,
          unit: "px",
        },
        {
          kind: "toggle",
          id: "count",
          label: "Six cards",
        },
      ],
      defaults: {
        mode: "proximity",
        align: "start",
        spacing: 28,
        count: false,
      },
      hint: "Scroll inside the lane, then stop mid-card",
    },
    props: [
      {
        name: "mode",
        type: '"off" | "proximity" | "mandatory" | "assist"',
        default: '"proximity"',
        description:
          "Settle strength. `assist` is the only JS mode: a scroll-end nudge you can cancel by moving.",
      },
      {
        name: "align",
        type: '"start" | "center" | "nearest"',
        default: '"start"',
        description: "Where a settled card comes to rest.",
      },
      {
        name: "gap",
        type: "number",
        default: "24",
        description: "Space between cards in pixels.",
      },
      {
        name: "gate",
        type: '"fine" | "always"',
        default: '"fine"',
        description:
          "fine applies settling only on wide, fine-pointer, no-preference screens.",
      },
    ],
    accessibility: [
      "Snapping only ever assists a gesture that already ended near a card; the lane scrolls normally at every scroll speed.",
      "Disabled entirely for reduced-motion readers and touch screens, where native momentum scrolling is already the right behaviour.",
      "Cards remain ordinary tab stops; scrolling a focused card into view triggers the browser’s own scroll behaviour, not a trap.",
    ],
    usage: `import { SoftSnap, SoftSnapItem } from "@/components/lab/soft-snap/soft-snap";
import "./soft-snap-overrides.css"; // optional page-level styling

export function WorkLane({ entries }: { entries: Entry[] }) {
  return (
    <SoftSnap mode="proximity" align="start" gap={28} className="h-[70vh]">
      {entries.map((entry) => (
        <SoftSnapItem key={entry.slug}>
          <article className="h-[62vh]">{/* card */}</article>
        </SoftSnapItem>
      ))}
    </SoftSnap>
  );
}`,
    demoNote:
      "Six plausible case-study cards in a bounded lane. Scroll with the wheel or drag the scrollbar and watch a card frame itself — switch settling off to feel the difference.",
    order: 2,
  },

  {
    slug: "evidence-carousel",
    name: "Evidence Carousel",
    tagline:
      "A large media carousel for case studies — drag, keys, captions, no autoplay.",
    summary:
      "One view dominant, neighbours peeking in from the edges, a quiet counter and caption underneath, and every way of moving it — drag, buttons, arrow keys, native touch scroll — stays in sync because the index is derived from the strip’s own resting position. Nothing advances on its own; the reader is the only thing that moves it.",
    category: "Media",
    tags: ["carousel", "gallery", "case-study", "drag"],
    status: "stable",
    tech: ["React", "CSS scroll-snap", "Pointer Events"],
    dependencies: [],
    files: [
      {
        path: "components/lab/evidence-carousel/evidence-carousel.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/evidence-carousel/evidence-carousel.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "toggle",
          id: "peek",
          label: "Adjacent peeks",
        },
        {
          kind: "choice",
          id: "count",
          label: "Slides",
          options: [
            { value: "3", label: "3" },
            { value: "5", label: "5" },
            { value: "7", label: "7" },
          ],
        },
        {
          kind: "choice",
          id: "ratio",
          label: "Ratio",
          options: [
            { value: "16 / 10", label: "16:10" },
            { value: "4 / 3", label: "4:3" },
            { value: "1 / 1", label: "1:1" },
          ],
        },
        {
          kind: "toggle",
          id: "captions",
          label: "Captions",
        },
      ],
      defaults: { peek: true, count: "5", ratio: "16 / 10", captions: true },
      hint: "Drag, arrow keys, or the buttons",
    },
    props: [
      {
        name: "items",
        type: "CarouselItem[]",
        description:
          "{ id, caption, meta?, content } — content is any node, so images, video posters or live components all work.",
      },
      {
        name: "label",
        type: "string",
        description: "Accessible name for the carousel region.",
      },
      {
        name: "ratio",
        type: "string",
        default: '"16 / 10"',
        description: "CSS aspect-ratio for each slide.",
      },
      {
        name: "peek",
        type: "boolean",
        default: "true",
        description: "Show the neighbouring slides at the viewport edges.",
      },
      {
        name: "loop",
        type: "boolean",
        default: "false",
        description: "Wrap from last to first when the buttons are used.",
      },
      {
        name: "onIndexChange",
        type: "(index: number) => void",
        description: "Notifies the host after any movement settles.",
      },
    ],
    accessibility: [
      "A labelled region with aria-roledescription=carousel; each slide is a labelled group with aria-current on the active one.",
      "Left/Right, Home and End keys move the strip; the viewport itself is one tab stop.",
      "Buttons expose disabled states at the ends (unless loop is on); the caption is a polite live region.",
      "Videos inside slides are the host’s concern — the Lab demo shows posters, so nothing autoplays.",
    ],
    usage: `import { EvidenceCarousel } from "@/components/lab/evidence-carousel/evidence-carousel";

const views = [
  { id: "v1", caption: "First capture", content: <img src="/v1.jpg" alt="" /> },
  { id: "v2", caption: "Detail pass", content: <img src="/v2.jpg" alt="" /> },
];

export function Gallery() {
  return <EvidenceCarousel items={views} label="Product gallery" ratio="16 / 10" />;
}`,
    demoNote:
      "Sample content: seven plates of real public-domain photography (Wikimedia Commons) arranged as a fictional survey archive. Drag the strip with a mouse, or use the arrow keys while it is focused.",
    order: 3,
  },

  {
    slug: "inverted-cursor",
    name: "Inverted Cursor",
    tagline:
      "A difference-blended cursor disc with honest states and clean teardown.",
    summary:
      "One white disc painted with mix-blend-mode: difference, so it inverts whatever it crosses. It steps aside over selectable text, expands over interactive targets, and can carry a single label cut from its own surface. Fine pointers only, with a lifecycle that always hands the native cursor back — on unmount, on blur, on route change, on pointer-kind change.",
    category: "Input",
    tags: ["cursor", "pointer", "blend-mode", "states"],
    status: "stable",
    tech: ["React", "Pointer Events", "mix-blend-mode"],
    dependencies: [],
    files: [
      {
        path: "components/lab/inverted-cursor/inverted-cursor.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/inverted-cursor/inverted-cursor.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop"],
      controls: [
        {
          kind: "choice",
          id: "state",
          label: "Sample state",
          options: [
            { value: "rest", label: "Rest" },
            { value: "link", label: "Link" },
            { value: "view", label: "View" },
            { value: "pressed", label: "Pressed" },
          ],
        },
        {
          kind: "slider",
          id: "size",
          label: "Rest size",
          min: 14,
          max: 40,
          step: 2,
          unit: "px",
        },
        {
          kind: "slider",
          id: "grow",
          label: "Grow on targets",
          min: 1,
          max: 4,
          step: 0.2,
          unit: "multiplier",
        },
        {
          kind: "choice",
          id: "label",
          label: "Label",
          options: [
            { value: "none", label: "None" },
            { value: "VIEW", label: "VIEW" },
            { value: "OPEN", label: "OPEN" },
          ],
        },
        {
          kind: "toggle",
          id: "magnetic",
          label: "Magnetic targets",
        },
      ],
      defaults: {
        state: "view",
        size: 22,
        grow: 2.6,
        label: "VIEW",
        magnetic: true,
      },
      hint: "This preview is desktop-only — the disc follows your pointer",
    },
    props: [
      {
        name: "size",
        type: "number",
        default: "22",
        description: "Rest diameter in pixels.",
      },
      {
        name: "grow",
        type: "number",
        default: "2.6",
        description: "Scale over links, buttons and marked surfaces.",
      },
      {
        name: "label",
        type: "string",
        default: '"VIEW"',
        description: "Word carried by the disc on data-cursor=\"view\" targets.",
      },
      {
        name: "blend",
        type: "string",
        default: '"difference"',
        description: "Any mix-blend-mode value; difference is the honest default.",
      },
      {
        name: "magnetic",
        type: "boolean",
        default: "false",
        description:
          "Targets marked data-cursor-magnet drift a clamped few pixels toward the pointer.",
      },
      {
        name: "respectReducedMotion",
        type: "boolean",
        default: "true",
        description: "Removes easing and magnetism, keeping the position 1:1.",
      },
    ],
    accessibility: [
      "Never engages on coarse pointers or keyboard-only sessions — the native cursor is untouched unless a fine pointer actually moves.",
      "Over inputs, textareas and selectable prose the disc steps aside and the native I-beam returns.",
      "The disc is aria-hidden and purely additive; nothing requires it to complete an action.",
      "Labels are never detached from the disc: they are cut from the same surface, so no stale word can survive a teardown.",
    ],
    usage: `import { InvertedCursor } from "@/components/lab/inverted-cursor/inverted-cursor";

// Mount once, near the root of the page:
export function Cursor() {
  return <InvertedCursor label="VIEW" grow={2.6} magnetic />;
}

// Then mark your own surfaces:
// <a data-cursor="view">Case study</a>
// <button data-cursor="link">Save</button>`,
    demoNote:
      "A sample project index: hover rows, buttons and media to see the disc expand, and press to see the pressed state. The disc is live — move your pointer anywhere in the frame.",
    order: 4,
  },

  {
    slug: "adaptive-composer",
    name: "Adaptive Composer",
    tagline:
      "Type a sentence; the input rearranges into the structure it recognised.",
    summary:
      "Deterministic text-to-structure, not AI: a small intent parser reads the sentence as you type and the composer exposes the structured form underneath — a parsed date and duration for meetings, a live result for arithmetic, a place row, a task checklist, people chips. The input keeps its one job; the interface below it changes to fit what you meant.",
    category: "Input",
    tags: ["composer", "input", "intent", "deterministic"],
    status: "stable",
    tech: ["React", "TypeScript parser"],
    dependencies: [],
    files: [
      {
        path: "components/lab/adaptive-composer/adaptive-composer.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/adaptive-composer/composer-parse.ts",
        kind: "logic",
        type: "registry:file",
      },
      {
        path: "components/lab/adaptive-composer/adaptive-composer.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "sample",
          label: "Sample",
          options: [
            { value: "meeting", label: "Meeting" },
            { value: "math", label: "Calculation" },
            { value: "place", label: "Place" },
            { value: "task", label: "Tasks" },
            { value: "person", label: "People" },
            { value: "link", label: "Link" },
          ],
        },
        {
          kind: "toggle",
          id: "parsed",
          label: "Show parsed form",
        },
        {
          kind: "toggle",
          id: "hint",
          label: "Show intent hint",
        },
      ],
      defaults: { sample: "meeting", parsed: true, hint: true },
      hint: "Edit the sentence — the structure follows",
    },
    props: [
      {
        name: "value / onValueChange",
        type: "string / (v: string) => void",
        description: "Controlled text; omit both to let the composer own it.",
      },
      {
        name: "defaultValue",
        type: "string",
        default: '""',
        description: "Initial text for uncontrolled use.",
      },
      {
        name: "onSubmit",
        type: "(value, intent, payload) => void",
        description: "Fires on ⌘/Ctrl+Enter with the parsed structure.",
      },
      {
        name: "sample",
        type: "string",
        description: "Example sentence shown as a nudge while empty.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables both the field and the structure panel.",
      },
    ],
    accessibility: [
      "The text field is the only required control; the parsed panel is aria-live=polite and never steals focus.",
      "Every parsed row is presentational — submitting works with the raw sentence alone.",
      "Intents are announced as text (“Meeting · Tuesday 14:30, 1 hour”), so the structure is readable without the visuals.",
      "The parser is deterministic and offline; nothing is sent anywhere, so it is safe for private text.",
    ],
    usage: `import { AdaptiveComposer } from "@/components/lab/adaptive-composer/adaptive-composer";
import { parseComposerInput } from "@/components/lab/adaptive-composer/composer-parse";

export function Capture() {
  return (
    <AdaptiveComposer
      sample="review the deck with Ana on tue 2pm for 45m"
      onSubmit={(value, intent, payload) => {
        console.log(intent, payload); // "meeting", { ... }
      }}
    />
  );
}

// parseComposerInput is exported for tests and custom panels.`,
    demoNote:
      "Pick a sample sentence, then edit it. The composer names the intent it recognised and lays out the structured form — date and duration, result, place, checklist, people or link.",
    order: 5,
  },

  {
    slug: "agent-review",
    name: "Agent Review Surface",
    tagline:
      "Proposed change, evidence, and a human decision — the step between.",
    summary:
      "When an automated process wants to change something, this is the surface where a person decides. A titled proposal, a real diff, the evidence the system used, and three honest actions: accept, reject, revise. It works for code, documents and configuration alike because the diff is structured data, not a screenshot.",
    category: "Agentic",
    tags: ["review", "diff", "human-in-the-loop", "decisions"],
    status: "stable",
    tech: ["React", "TypeScript"],
    dependencies: [],
    files: [
      {
        path: "components/lab/agent-review/agent-review.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/agent-review/agent-review.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "sample",
          label: "Proposal",
          options: [
            { value: "rename", label: "Schema rename" },
            { value: "copy", label: "Copy edit" },
            { value: "config", label: "Config change" },
          ],
        },
        {
          kind: "choice",
          id: "state",
          label: "Decision",
          options: [
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ],
        },
        {
          kind: "toggle",
          id: "evidence",
          label: "Evidence strip",
        },
        {
          kind: "toggle",
          id: "shortcuts",
          label: "Key hints",
        },
      ],
      defaults: {
        sample: "rename",
        state: "pending",
        evidence: true,
        shortcuts: true,
      },
      hint: "Try A / R / E keys while the surface has focus",
    },
    props: [
      {
        name: "change",
        type: "ReviewChange",
        description:
          "{ id, title, rationale, files: [{ path, hunks }] } — hunks are { kind, text, line? } rows.",
      },
      {
        name: "evidence",
        type: "{ label, value }[]",
        description: "Short evidence rows shown with the proposal.",
      },
      {
        name: "decision",
        type: '"pending" | "accepted" | "rejected" | "revise"',
        default: '"pending"',
        description: "Controlled decision; omit for the internal state.",
      },
      {
        name: "onDecision",
        type: "(decision, note?) => void",
        description: "Called with the reviewer’s choice.",
      },
      {
        name: "shortcuts",
        type: "boolean",
        default: "true",
        description: "A / R / E key bindings, shown as hints.",
      },
    ],
    accessibility: [
      "The diff is a real list of added/removed lines with sr-only prefixes, not colour alone.",
      "Decision buttons are ordinary buttons with visible focus; shortcuts are additive, never required.",
      "Deciding is announced politely (“Change accepted”) and the surface stays in place — no modal, no focus jump.",
      "Rejecting with a note is fully reversible in the host’s own model; the surface never pretends a decision is final.",
    ],
    usage: `import { AgentReviewSurface } from "@/components/lab/agent-review/agent-review";

const change = {
  id: "c1",
  title: "Rename column \`total\` to \`amount\`",
  rationale: "Matches the billing schema and fixes three call sites.",
  files: [
    {
      path: "db/schema/orders.sql",
      hunks: [
        { kind: "context", text: "CREATE TABLE orders (", line: 12 },
        { kind: "remove", text: "  total_cents integer", line: 13 },
        { kind: "add", text: "  amount_cents integer", line: 13 },
        { kind: "context", text: ");", line: 14 },
      ],
    },
  ],
};

export function Review() {
  return <AgentReviewSurface change={change} onDecision={(d) => save(d)} />;
}`,
    demoNote:
      "Three plausible proposals — a schema rename, a copy edit, a config change — with real diffs and evidence rows. Accept, reject or revise; the surface reports the decision inline.",
    order: 6,
  },

  {
    slug: "evidence-source",
    name: "Expandable Evidence Source",
    tagline:
      "A citation that unfolds from one line into an inspectable source card.",
    summary:
      "Compact when you are skimming, complete when you are checking. One line carries the claim’s source; unfolding grows the excerpt, the location, a confidence/status reading and the way out to the original. Built for AI answers, research tools and education products where “trust me” is not an acceptable citation.",
    category: "Agentic",
    tags: ["citations", "progressive-disclosure", "research", "trust"],
    status: "stable",
    tech: ["React", "CSS grid transitions"],
    dependencies: [],
    files: [
      {
        path: "components/lab/evidence-source/evidence-source.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/evidence-source/evidence-source.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "status",
          label: "Status",
          options: [
            { value: "verified", label: "Verified" },
            { value: "probable", label: "Probable" },
            { value: "unverified", label: "Unverified" },
          ],
        },
        {
          kind: "toggle",
          id: "open",
          label: "Expanded",
        },
        {
          kind: "toggle",
          id: "confidence",
          label: "Confidence meter",
        },
        {
          kind: "toggle",
          id: "many",
          label: "Three sources",
        },
      ],
      defaults: {
        status: "verified",
        open: false,
        confidence: true,
        many: true,
      },
      hint: "Click a source line to unfold it",
    },
    props: [
      {
        name: "source",
        type: "EvidenceSourceData",
        description:
          "{ id, title, publisher?, excerpt, location?, status?, confidence?, date?, href? }",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        default: "false",
        description: "Start unfolded.",
      },
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Controlled expansion.",
      },
      {
        name: "status",
        type: '"verified" | "probable" | "unverified"',
        default: '"verified"',
        description: "How well the source supports the claim.",
      },
      {
        name: "confidence",
        type: "number",
        description: "0–1; renders as a small meter when provided.",
      },
      {
        name: "onOpenSource",
        type: "(source) => void",
        description: "Fired by the “Open source” action so hosts can route it.",
      },
    ],
    accessibility: [
      "The summary line is a single button with aria-expanded; the panel is a labelled region.",
      "Status is written out (“Verified”) as well as coloured, and the confidence meter has a text value.",
      "Expansion animates grid-template-rows, which collapses to an instant state change under reduced motion.",
      "Long excerpts wrap and clamp gracefully; the open-source action is a real link when href is provided.",
    ],
    usage: `import { EvidenceSource } from "@/components/lab/evidence-source/evidence-source";

export function Citation() {
  return (
    <EvidenceSource
      source={{
        id: "s1",
        title: "Designing Interfaces, 3rd ed.",
        publisher: "O'Reilly",
        excerpt:
          "Progressive disclosure defers advanced or rarely used features to a secondary screen…",
        location: "Ch. 4, p. 71",
        status: "verified",
        confidence: 0.86,
        href: "https://example.com/book",
      }}
    />
  );
}`,
    demoNote:
      "Three sources with different strengths — a book, a study, a forum answer — so the status and confidence readings have something to say. Unfold any line.",
    order: 7,
  },

  {
    slug: "spatial-command",
    name: "Spatial Command Menu",
    tagline:
      "A ⌘K menu where results regroup by kind and selection previews its effect.",
    summary:
      "Search as usual, but the result list keeps its spatial structure: matches stay grouped by kind instead of collapsing into one flat list, and the highlighted command previews what it will actually do before you commit. Keyboard speed is untouched — the preview costs nothing, and the menu never animates between query keystrokes.",
    category: "Navigation",
    tags: ["command-menu", "search", "keyboard", "preview"],
    status: "stable",
    tech: ["React", "Dialog", "Keyboard"],
    dependencies: [],
    files: [
      {
        path: "components/lab/command-menu/command-menu.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/command-menu/command-menu.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "toggle",
          id: "preview",
          label: "Preview pane",
        },
        {
          kind: "toggle",
          id: "groups",
          label: "Group headings",
        },
        {
          kind: "toggle",
          id: "hotkey",
          label: "⌘K hotkey",
        },
        {
          kind: "choice",
          id: "density",
          label: "Row height",
          options: [
            { value: "compact", label: "Compact" },
            { value: "roomy", label: "Roomy" },
          ],
        },
      ],
      defaults: {
        preview: true,
        groups: true,
        hotkey: true,
        density: "compact",
      },
      hint: "Press ⌘K / Ctrl+K, or open from the button",
    },
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Controlled visibility.",
      },
      {
        name: "items",
        type: "CommandItem[]",
        description:
          "{ id, label, group, keywords?, description?, shortcut?, preview?, run? }",
      },
      {
        name: "hotkey",
        type: "boolean | string",
        default: "true",
        description: "Binds ⌘K / Ctrl+K while mounted; a string rebinds it.",
      },
      {
        name: "previewPanel",
        type: "boolean",
        default: "true",
        description: "Shows the selected command’s preview/description pane.",
      },
      {
        name: "groups",
        type: "string[]",
        description: "Fixed group order; otherwise first-seen order is kept.",
      },
      {
        name: "onRun",
        type: "(item) => void",
        description: "Called before the menu closes, after item.run().",
      },
    ],
    accessibility: [
      "A real dialog: labelled, focus is moved in on open and returned on close, Escape always closes.",
      "The list is a listbox with aria-activedescendant; typing filters, ↑↓ moves, Enter runs.",
      "The preview pane is aria-live=polite so its description is announced, not seen only.",
      "Groups are headings in the listbox, so screen-reader users hear the same structure.",
    ],
    usage: `const items = [
  {
    id: "new-case",
    label: "New case study",
    group: "Create",
    keywords: ["draft", "case"],
    description: "Starts a draft with the standard case template.",
    preview: <CasePreview />,
    run: () => createDraft(),
  },
  // ...
];

<CommandMenu
  open={open}
  onOpenChange={setOpen}
  items={items}
  groups={["Create", "Navigate", "Settings"]}
/>`,
    demoNote:
      "A sample workspace menu — create, navigate, review, settings. Type to filter, watch the preview pane describe the highlighted command, and run one to see it land.",
    order: 8,
  },

  {
    slug: "morphing-metadata",
    name: "Morphing Metadata",
    tagline:
      "A record that grows from compact summary into structured detail.",
    summary:
      "Compact and expanded are the same surface, not two widgets: the summary keys become detail rows, the numbers keep their position, and the transition is a morph rather than an accordion unfolding underneath. Where the browser supports the View Transitions API the swap is a true cross-fade of shared geometry; everywhere else it degrades to a clean, quick re-layout.",
    category: "Systems",
    tags: ["metadata", "progressive-disclosure", "view-transitions"],
    status: "experimental",
    tech: ["React", "View Transitions API", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/morphing-metadata/morphing-metadata.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/morphing-metadata/morphing-metadata.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "kind",
          label: "Record",
          options: [
            { value: "file", label: "File" },
            { value: "person", label: "Person" },
            { value: "run", label: "Run" },
          ],
        },
        {
          kind: "toggle",
          id: "expanded",
          label: "Expanded",
        },
        {
          kind: "choice",
          id: "transition",
          label: "Morph",
          options: [
            { value: "auto", label: "Auto" },
            { value: "view-transition", label: "View Transition" },
            { value: "none", label: "Instant" },
          ],
        },
      ],
      defaults: { kind: "file", expanded: false, transition: "auto" },
      hint: "Toggle expanded and watch how the values move",
    },
    props: [
      {
        name: "record",
        type: "MetadataRecord",
        description:
          "{ id, title, kind, summary: { label → value }, detail: { label, value }[] }",
      },
      {
        name: "expanded",
        type: "boolean",
        description: "Controlled state; omit for the internal toggle.",
      },
      {
        name: "defaultExpanded",
        type: "boolean",
        default: "false",
        description: "Initial state in uncontrolled use.",
      },
      {
        name: "transition",
        type: '"auto" | "view-transition" | "none"',
        default: '"auto"',
        description:
          "auto uses the View Transitions API when available and CSS otherwise.",
      },
      {
        name: "onExpandedChange",
        type: "(expanded: boolean) => void",
        description: "Notifies the host of the state change.",
      },
    ],
    accessibility: [
      "One button toggles the record; aria-expanded and a label that changes with state (“Show run details”).",
      "Both states render the same values — expansion adds detail, it never replaces information.",
      "View Transitions are skipped under prefers-reduced-motion, where the swap is instant.",
      "The detail list is a real definition list, so screen readers get label/value pairs.",
    ],
    usage: `const record = {
  id: "run-418",
  title: "nightly-export",
  kind: "Run · 4m 12s",
  summary: { status: "Passed", records: "18,204", duration: "4m 12s" },
  detail: [
    { label: "Started", value: "02:00 UTC" },
    { label: "Trigger", value: "schedule" },
  ],
};

<MorphingMetadata record={record} />`,
    demoNote:
      "Three record shapes — a file, a person, a pipeline run. Toggle expanded and watch the summary values slide into the detail list instead of a panel opening below.",
    order: 9,
  },

  {
    slug: "contextual-dock",
    name: "Contextual Dock",
    tagline:
      "A toolbar that reconfigures around the selection — with no layout jump.",
    summary:
      "What you can do should follow what you have selected: nothing selected is a quiet tool shelf, a text selection brings type controls, an object selection brings object actions, a multi-selection brings batch actions. The dock reserves its space and cross-fades between sets, so the interface never shifts under the pointer mid-selection.",
    category: "Navigation",
    tags: ["toolbar", "selection", "context", "actions"],
    status: "stable",
    tech: ["React", "ARIA toolbar"],
    dependencies: [],
    files: [
      {
        path: "components/lab/contextual-dock/contextual-dock.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/contextual-dock/contextual-dock.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "context",
          label: "Selection",
          options: [
            { value: "none", label: "None" },
            { value: "text", label: "Text" },
            { value: "object", label: "Object" },
            { value: "multi", label: "Multi" },
          ],
        },
        {
          kind: "choice",
          id: "layout",
          label: "Placement",
          options: [
            { value: "floating", label: "Floating" },
            { value: "inline", label: "Inline" },
          ],
        },
        {
          kind: "toggle",
          id: "status",
          label: "Selection label",
        },
      ],
      defaults: { context: "text", layout: "floating", status: true },
      hint: "Or select text / click blocks in the mock document",
    },
    props: [
      {
        name: "context",
        type: '"none" | "text" | "object" | "multi"',
        description: "The host’s current selection kind.",
      },
      {
        name: "sets",
        type: "Record<Context, DockAction[]>",
        description:
          "Actions per context; the dock cross-fades between sets and reserves the widest.",
      },
      {
        name: "label",
        type: "string",
        description: "Status line, e.g. “3 blocks selected”.",
      },
      {
        name: "placement",
        type: '"floating" | "inline"',
        default: '"floating"',
        description: "Floats above content or sits in flow.",
      },
      {
        name: "onAction",
        type: "(id: string, context) => void",
        description: "Fired with the action id.",
      },
    ],
    accessibility: [
      "A real toolbar: arrow keys move between items, Home/End jump, and only one item is tabbable at a time.",
      "The context change is announced (“Text selection — 6 actions”).",
      "Actions are buttons with labels; icon-only actions keep their accessible names.",
      "The dock reserves width, so a context change never moves the page or the pointer’s target.",
    ],
    usage: `const sets = {
  none: [{ id: "insert", label: "Insert block" }],
  text: [
    { id: "bold", label: "Bold" },
    { id: "comment", label: "Comment" },
  ],
  object: [{ id: "duplicate", label: "Duplicate" }],
  multi: [{ id: "align", label: "Align" }],
};

<ContextualDock context={selection.kind} sets={sets} onAction={handle} />`,
    demoNote:
      "A sample document surface: select text, click a block, or shift-click two blocks. The dock follows the selection and never moves the page.",
    order: 10,
  },

  {
    slug: "hold-to-confirm",
    name: "Hold to Confirm",
    tagline:
      "Deliberate friction for actions that deserve a second of intent.",
    summary:
      "Publishing, deploying, overwriting and accepting-all are the actions where a click is too cheap. Press and hold for a moment — with visible progress, a cancel path on release, and keyboard and touch equivalents — and the action commits. No modal, no checkbox theatre, and the friction is exactly as long as the host says it should be.",
    category: "Input",
    tags: ["confirmation", "pointer", "keyboard", "touch"],
    status: "stable",
    tech: ["React", "Pointer Events", "Keyboard"],
    dependencies: [],
    files: [
      {
        path: "components/lab/hold-to-confirm/hold-to-confirm.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/hold-to-confirm/hold-to-confirm.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "slider",
          id: "duration",
          label: "Hold time",
          min: 300,
          max: 2000,
          step: 100,
          unit: "ms",
        },
        {
          kind: "choice",
          id: "variant",
          label: "Action",
          options: [
            { value: "publish", label: "Publish" },
            { value: "deploy", label: "Deploy" },
            { value: "overwrite", label: "Overwrite" },
          ],
        },
        {
          kind: "choice",
          id: "fill",
          label: "Progress",
          options: [
            { value: "fill", label: "Fill" },
            { value: "ring", label: "Ring" },
          ],
        },
        {
          kind: "toggle",
          id: "reset",
          label: "Reset after confirm",
        },
      ],
      defaults: {
        duration: 900,
        variant: "publish",
        fill: "fill",
        reset: true,
      },
      hint: "Press and hold the button — Space works too",
    },
    props: [
      {
        name: "label",
        type: "string",
        description: "Idle label, e.g. “Publish release”.",
      },
      {
        name: "duration",
        type: "number",
        default: "900",
        description: "Hold time in milliseconds before commit.",
      },
      {
        name: "onConfirm",
        type: "() => void",
        description: "Fired once the hold completes.",
      },
      {
        name: "variant",
        type: '"accent" | "danger"',
        default: '"accent"',
        description: "Tone of the control; danger is reserved for destructive actions.",
      },
      {
        name: "progress",
        type: '"fill" | "ring"',
        default: '"fill"',
        description: "How the hold is drawn.",
      },
      {
        name: "resetAfterConfirm",
        type: "boolean",
        default: "true",
        description: "Return to idle a moment after confirming.",
      },
    ],
    accessibility: [
      "Keyboard: hold Space or Enter; the progress bar is a real progressbar with aria-valuenow.",
      "Releasing early cancels with a visible retreat, announced as “Cancelled”.",
      "Touch: press-and-hold works natively; the context menu is suppressed only on the control itself.",
      "The hold length is generous and documented in the accessible description; hosts should keep destructive alternatives for assistive tech.",
    ],
    usage: `import { HoldToConfirm } from "@/components/lab/hold-to-confirm/hold-to-confirm";

export function Publish() {
  return (
    <HoldToConfirm
      label="Publish release"
      duration={900}
      onConfirm={() => publish()}
    />
  );
}`,
    demoNote:
      "Three consequential actions with a visible hold. Release early to see the cancel, or hold to the end — the control reports what it did in a live region.",
    order: 11,
  },

  {
    slug: "progressive-action",
    name: "Progressive Command Button",
    tagline:
      "One button that shows ready, running, review and done — without a modal.",
    summary:
      "Long-running actions usually mean a spinner, then a toast, then a modal asking you to confirm what you just asked for. This button keeps the whole small workflow in one control: idle, running with real progress, a review beat, then a done state with a way to run again. The host owns the work; the button owns the honesty.",
    category: "Systems",
    tags: ["actions", "state", "progress", "async"],
    status: "stable",
    tech: ["React", "ARIA live regions"],
    dependencies: [],
    files: [
      {
        path: "components/lab/progressive-action/progressive-action.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/progressive-action/progressive-action.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "action",
          label: "Action",
          options: [
            { value: "generate", label: "Generate" },
            { value: "upload", label: "Upload" },
            { value: "analyze", label: "Analyze" },
          ],
        },
        {
          kind: "toggle",
          id: "review",
          label: "Review step",
        },
        {
          kind: "toggle",
          id: "autoplay",
          label: "Auto-run demo",
        },
        {
          kind: "choice",
          id: "width",
          label: "Width",
          options: [
            { value: "auto", label: "Auto" },
            { value: "fixed", label: "Fixed" },
          ],
        },
      ],
      defaults: {
        action: "generate",
        review: true,
        autoplay: false,
        width: "auto",
      },
      hint: "Press the button to walk the phases",
    },
    props: [
      {
        name: "phase",
        type: '"ready" | "running" | "review" | "done" | "error"',
        description: "Controlled phase — the host owns the workflow.",
      },
      {
        name: "progress",
        type: "number",
        description: "0–1 while running; omit for an indeterminate bar.",
      },
      {
        name: "onRun / onAccept / onRetry / onReset",
        type: "() => void",
        description: "Callbacks per phase.",
      },
      {
        name: "reviewSummary",
        type: "ReactNode",
        description: "Short summary shown in the review phase.",
      },
      {
        name: "labels",
        type: "Partial<Record<Phase, string>>",
        description: "Override any phase’s label.",
      },
      {
        name: "fixedWidth",
        type: "number",
        description: "Pins the control width so phase changes never resize it.",
      },
    ],
    accessibility: [
      "Phase changes are announced through a polite live region (“Running”, “Ready for review”, “Done”).",
      "The running state exposes a progressbar with a text value; cancel is a real button.",
      "Every phase keeps one obvious primary action and visible focus.",
      "No modal is ever opened; the control works the same with a keyboard alone.",
    ],
    usage: `const [phase, setPhase] = useState<Phase>("ready");

<ProgressiveAction
  phase={phase}
  progress={progress}
  labels={{ ready: "Generate summary", running: "Summarising…", review: "Check the summary" }}
  reviewSummary={<SummaryPreview />}
  onRun={start}
  onAccept={() => setPhase("done")}
  onReset={() => setPhase("ready")}
/>`,
    demoNote:
      "A plausible export/summarise action that walks its phases in place. Turn on auto-run to watch the whole cycle, or press the button yourself.",
    order: 12,
  },

  {
    slug: "trace-trail",
    name: "Trace Trail",
    tagline:
      "One line of provenance that opens into the whole action history.",
    summary:
      "Automated work should be able to say where it came from. Collapsed, it is a single breadcrumb — source, transformations, result — with a status dot. Expanded, each step gets an actor, what it did, when, and the source it used, so a person can audit the chain without leaving the sentence they were reading.",
    category: "Agentic",
    tags: ["provenance", "audit", "automation", "breadcrumb"],
    status: "stable",
    tech: ["React", "TypeScript"],
    dependencies: [],
    files: [
      {
        path: "components/lab/trace-trail/trace-trail.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/trace-trail/trace-trail.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "sample",
          label: "Trace",
          options: [
            { value: "summary", label: "Summarise" },
            { value: "export", label: "Export" },
            { value: "failed", label: "Failed run" },
          ],
        },
        {
          kind: "toggle",
          id: "open",
          label: "Expanded",
        },
        {
          kind: "toggle",
          id: "times",
          label: "Timestamps",
        },
        {
          kind: "toggle",
          id: "sources",
          label: "Source links",
        },
      ],
      defaults: { sample: "summary", open: false, times: true, sources: true },
      hint: "Open the trail to inspect each step",
    },
    props: [
      {
        name: "steps",
        type: "TraceStep[]",
        description:
          "{ id, actor, action, detail?, at?, source?, status } — actor is “you”, a tool name or a model.",
      },
      {
        name: "summary",
        type: "string",
        description: "One-line collapsed text; defaults to the step actions joined by arrows.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        default: "false",
        description: "Start expanded.",
      },
      {
        name: "showTimes",
        type: "boolean",
        default: "true",
        description: "Show each step’s timestamp.",
      },
      {
        name: "onStepSelect",
        type: "(step) => void",
        description: "Called when a step is focused or activated.",
      },
    ],
    accessibility: [
      "The collapsed line is a button with aria-expanded; the expanded trail is an ordered list, because it is a sequence.",
      "Status is written (“Failed at step 3”), not only coloured.",
      "Source links are real links with distinguishable names, never icon-only.",
      "Timestamps render in title and visually, so they are readable in both modes.",
    ],
    usage: `const steps = [
  { id: "s1", actor: "You", action: "Asked for a summary", at: "09:12" },
  {
    id: "s2",
    actor: "retriever",
    action: "Pulled 4 passages",
    detail: "22 documents scanned",
    source: { label: "notes/incident-412.md", href: "/files/412" },
    at: "09:12",
  },
  { id: "s3", actor: "draft-1", action: "Wrote the summary", status: "ok", at: "09:13" },
];

<TraceTrail steps={steps} summary="Asked → retrieved → drafted" />`,
    demoNote:
      "Three traces — a summarise run, an export, and a failed run — with realistic steps. Expand to inspect the chain.",
    order: 13,
  },

  {
    slug: "focus-stack",
    name: "Focus Stack",
    tagline:
      "Overlapping items where the selection comes forward — context stays behind.",
    summary:
      "A queue of overlapping surfaces where the selected one lifts forward and the rest remain partially visible, so you always know where you are in the pile. Arrow keys move the selection, the stack fans back in depth order, and the content of the active item swaps without the pile ever dissolving into a plain list.",
    category: "Media",
    tags: ["stack", "queue", "keyboard", "cards"],
    status: "stable",
    tech: ["React", "ARIA tablist"],
    dependencies: [],
    files: [
      {
        path: "components/lab/focus-stack/focus-stack.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/focus-stack/focus-stack.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "slider",
          id: "spread",
          label: "Spread",
          min: 14,
          max: 54,
          step: 4,
          unit: "px",
        },
        {
          kind: "toggle",
          id: "rotate",
          label: "Slight rotation",
        },
        {
          kind: "choice",
          id: "kind",
          label: "Content",
          options: [
            { value: "review", label: "Review queue" },
            { value: "inbox", label: "Inbox" },
          ],
        },
        {
          kind: "slider",
          id: "count",
          label: "Items",
          min: 3,
          max: 6,
          step: 1,
        },
      ],
      defaults: { spread: 34, rotate: true, kind: "review", count: 5 },
      hint: "Arrow keys or click a tab",
    },
    props: [
      {
        name: "items",
        type: "StackItem[]",
        description: "{ id, title, meta?, content } — content is the panel shown when selected.",
      },
      {
        name: "index / onIndexChange",
        type: "number / (index: number) => void",
        description: "Controlled selection.",
      },
      {
        name: "defaultIndex",
        type: "number",
        default: "0",
        description: "Initial selection in uncontrolled use.",
      },
      {
        name: "spread",
        type: "number",
        default: "34",
        description: "Depth offset in pixels between stacked items.",
      },
      {
        name: "rotate",
        type: "boolean",
        default: "false",
        description: "A slight fan rotation for physical stacks.",
      },
    ],
    accessibility: [
      "Implement as a tablist: Left/Right and Up/Down move between items, Home/End jump, the tab row is a single tab stop.",
      "The visible panel is labelled by its tab; panels stay in the DOM and are hidden with hidden, so screen readers get exactly one.",
      "Depth is decorative — no information is carried by stack position or rotation alone.",
      "Reduced motion removes the fan transition; the selection still changes instantly.",
    ],
    usage: `const items = [
  { id: "r1", title: "Draft 12", meta: "Needs review", content: <Draft /> },
  { id: "r2", title: "Draft 11", meta: "Approved", content: <Draft /> },
];

<FocusStack items={items} spread={34} rotate />`,
    demoNote:
      "A review queue and an inbox as tactile stacks. Select with the pointer or arrow keys — the pile keeps its context behind the selection.",
    order: 14,
  },

  {
    slug: "inline-diff",
    name: "Inline Diff Text",
    tagline:
      "Original, revision and reason — revealed in place, legibly.",
    summary:
      "A sentence that changed, shown as a sentence: the removed words stay visible, the revision sits in their place, and the reason is one affordance away. Word-level diffing is computed locally, so it works for editorial tools, version history and any AI rewrite that owes the reader an explanation.",
    category: "Systems",
    tags: ["diff", "editing", "version-history", "prose"],
    status: "stable",
    tech: ["React", "LCS word diff"],
    dependencies: [],
    files: [
      {
        path: "components/lab/inline-diff/inline-diff.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/inline-diff/word-diff.ts",
        kind: "logic",
        type: "registry:file",
      },
      {
        path: "components/lab/inline-diff/inline-diff.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "sample",
          label: "Revision",
          options: [
            { value: "tighten", label: "Tightened" },
            { value: "tone", label: "Tone shift" },
            { value: "correct", label: "Correction" },
          ],
        },
        {
          kind: "toggle",
          id: "open",
          label: "Show reason",
        },
        {
          kind: "choice",
          id: "density",
          label: "Emphasis",
          options: [
            { value: "quiet", label: "Quiet" },
            { value: "marked", label: "Marked" },
          ],
        },
      ],
      defaults: { sample: "tighten", open: false, density: "marked" },
      hint: "Toggle the reason, or accept the revision",
    },
    props: [
      {
        name: "change",
        type: "InlineDiffChange",
        description: "{ id, before, after, reason, author?, at?, segments? }",
      },
      {
        name: "segments",
        type: "DiffSegment[]",
        description:
          "Pre-computed word segments; omit to diff before/after with the bundled LCS.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        default: "false",
        description: "Show the reason on first render.",
      },
      {
        name: "onAccept",
        type: "() => void",
        description: "When provided, an accept control appears next to the reason.",
      },
      {
        name: "emphasis",
        type: '"quiet" | "marked"',
        default: '"marked"',
        description: "How strongly the change is tinted.",
      },
    ],
    accessibility: [
      "Removed and added words are announced as text, prefixed with “removed:” / “added:” in a screen-reader-only layer — never colour alone.",
      "The reason is a button with aria-expanded; accepting is a normal button with a status announcement.",
      "The diff is computed with a bounded LCS on word tokens, so long paragraphs stay fast.",
      "Works in both directions: nothing is lost if the revision is rejected — the original remains readable in place.",
    ],
    usage: `import { InlineDiffText } from "@/components/lab/inline-diff/inline-diff";

<InlineDiffText
  change={{
    id: "d1",
    before: "We should probably try to improve the onboarding soon.",
    after: "Onboarding needs a shorter path to the first success.",
    reason: "Tightened the claim and named the outcome.",
    author: "editor",
    at: "14:02",
  }}
  onAccept={accept}
/>`,
    demoNote:
      "Three prose revisions with word-level changes. Open the reason, or accept the revision to see the sentence settle.",
    order: 15,
  },

  {
    slug: "lens-reveal",
    name: "Lens Reveal",
    tagline:
      "A movable lens that reveals the layer beneath a surface.",
    summary:
      "Not a magnifier: a lens you move over a surface to reveal a second, registered layer — annotations over a page, before/after over artwork, debug values over a rendered chart. Pointer and touch drag move it, arrow keys move it precisely, and everything it reveals is also available in an accessible list, so the lens is an accelerator rather than a gate.",
    category: "Media",
    tags: ["reveal", "comparison", "annotation", "lens"],
    status: "experimental",
    tech: ["React", "clip-path", "Pointer Events"],
    dependencies: [],
    files: [
      {
        path: "components/lab/lens-reveal/lens-reveal.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/lens-reveal/lens-reveal.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "mode",
          label: "Layer",
          options: [
            { value: "annotate", label: "Annotations" },
            { value: "compare", label: "Before / after" },
            { value: "debug", label: "Debug values" },
          ],
        },
        {
          kind: "slider",
          id: "size",
          label: "Lens size",
          min: 110,
          max: 320,
          step: 10,
          unit: "px",
        },
        {
          kind: "choice",
          id: "shape",
          label: "Shape",
          options: [
            { value: "circle", label: "Circle" },
            { value: "square", label: "Square" },
          ],
        },
        {
          kind: "toggle",
          id: "edge",
          label: "Edge handle",
        },
      ],
      defaults: { mode: "annotate", size: 190, shape: "circle", edge: true },
      hint: "Move the lens with the pointer, or focus and use arrow keys",
    },
    props: [
      {
        name: "base",
        type: "ReactNode",
        description: "The surface the reader sees first.",
      },
      {
        name: "lens",
        type: "ReactNode",
        description: "The registered layer revealed under the lens.",
      },
      {
        name: "size",
        type: "number",
        default: "190",
        description: "Lens diameter in pixels.",
      },
      {
        name: "shape",
        type: '"circle" | "square"',
        default: '"circle"',
        description: "Lens geometry.",
      },
      {
        name: "keyboardStep",
        type: "number",
        default: "28",
        description: "Pixels moved per arrow-key press.",
      },
      {
        name: "label",
        type: "string",
        default: '"Reveal layer"',
        description: "Accessible name for the lens region.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Text description of what the lens reveals, read to assistive tech.",
      },
      {
        name: "onPositionChange",
        type: "(x, y) => void",
        description: "Normalised lens centre, for syncing sidecars.",
      },
    ],
    accessibility: [
      "The lens region is focusable and driven by arrow keys; Shift makes each step finer.",
      "Everything the lens reveals is duplicated in a visually-hidden list that assistive tech reads in order.",
      "Touch drags the lens with the same clamping as the pointer.",
      "Reduced motion removes the lens easing; the reveal is a direct positional update.",
    ],
    usage: `import { LensReveal } from "@/components/lab/lens-reveal/lens-reveal";

<LensReveal
  base={<PagePreview />}
  lens={<AnnotationLayer />}
  size={190}
  label="Reveal review annotations"
/>`,
    demoNote:
      "Three lenses over one sample surface: review annotations, a revised layout, and live debug values. Drag the lens, or focus it and use the arrow keys.",
    order: 16,
  },
];

export const experimentCount = experiments.length;

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}

export function sortedExperiments(): Experiment[] {
  return [...experiments].sort((a, b) => a.order - b.order);
}

export function experimentsByCategory(): { category: string; count: number }[] {
  return CATEGORIES.map((category) => ({
    category,
    count: experiments.filter((experiment) => experiment.category === category)
      .length,
  }));
}

export function neighbours(slug: string): {
  previous: Experiment | null;
  next: Experiment | null;
} {
  const ordered = sortedExperiments();
  const index = ordered.findIndex((experiment) => experiment.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}

export { CATEGORIES };
export type { PreviewControl };
