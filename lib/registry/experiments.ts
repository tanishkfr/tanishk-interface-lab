import type { Experiment, PreviewControl } from "./types.ts";
import { CATEGORIES } from "./types.ts";

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
    slug: "scrub-number",
    name: "Scrub Number",
    tagline: "Drag for a feeling. Type for precision.",
    summary:
      "A compact controlled number field with a horizontal drag handle, direct numeric input and keyboard adjustments. Useful for creative tools, layout inspectors and parameter panels.",
    category: "Input",
    tags: ["number", "drag", "precision", "keyboard"],
    status: "stable",
    tech: ["React", "Pointer Events", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/scrub-number/scrub-number.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/scrub-number/scrub-number.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "step",
          label: "Size increment",
          options: [
            { value: "1", label: "One" },
            { value: "5", label: "Five" },
            { value: "10", label: "Ten" },
          ],
        },
      ],
      defaults: { step: "1" },
      hint: "Drag the arrow handles, type a number, or focus a handle and use arrow keys.",
    },
    props: [
      {
        name: "value",
        type: "number",
        description: "Controlled numeric value.",
      },
      {
        name: "onChange",
        type: "(value: number) => void",
        description: "Receives the finite, rounded and clamped value.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible and accessible field label.",
      },
      {
        name: "min",
        type: "number",
        default: "0",
        description: "Lower bound.",
      },
      {
        name: "max",
        type: "number",
        default: "100",
        description: "Upper bound.",
      },
      {
        name: "step",
        type: "number",
        default: "1",
        description: "Positive increment; invalid increments fall back to one.",
      },
    ],
    accessibility: [
      "A native labeled number input provides direct entry and native numeric semantics.",
      "The drag handle is a focusable button: arrow keys adjust, Shift multiplies keyboard steps, and Home/End reach the bounds.",
      "Pointer capture ends on release or cancellation; horizontal touch dragging is limited to the handle.",
      "No animation is required for operation.",
    ],
    usage: `"use client";
import { useState } from "react";
import { ScrubNumber } from "@/components/lab/scrub-number/scrub-number";

export function SizeField() {
  const [value, setValue] = useState(48);
  return <ScrubNumber label="Size" value={value} onChange={setValue} min={12} max={120} />;
}`,
    demoNote:
      "The controls change the actual size, corner radius and rotation of a local specimen. No values are saved or sent.",
    designDecisions: [
      "Keep dragging on an explicit handle so text entry and scrolling remain predictable.",
      "Use native numeric input alongside the drag gesture so precision never depends on pointer dexterity.",
    ],
    order: 20,
  },
  {
    slug: "signal-field",
    name: "Signal Field",
    tagline: "An animated glyph background that softens around the pointer.",
    summary:
      "A low-resolution animated canvas rendered as glyphs, dithered dots or pixels. The field moves at rest and softens around the pointer. Use it as a background for a hero, empty state or section.",
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
          label: "Field density",
          min: 0.1,
          max: 1,
          step: 0.05,
          unit: "percent",
        },
        {
          kind: "slider",
          id: "intensity",
          label: "Field contrast",
          min: 0,
          max: 1,
          step: 0.05,
          unit: "percent",
        },
        {
          kind: "slider",
          id: "pointerRadius",
          label: "Pointer effect radius",
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
        description:
          "Suppression radius around the pointer, in cells. 0 disables.",
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
        description:
          "How cells resolve: characters, halftone dots or solid fragments.",
      },
      {
        name: "accent",
        type: "string",
        default: "—",
        description:
          "Hex colour for the densest cells. Without it the field inherits currentColor at low opacity.",
      },
      {
        name: "seed",
        type: "number",
        default: "1",
        description:
          "Changes the noise field’s composition. Same seed, same field.",
      },
      {
        name: "paused",
        type: "boolean",
        default: "false",
        description:
          "Freeze the field externally; the last composed frame stays.",
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
    designDecisions: [
      "Gentle settling helps align a card after scrolling without taking over the gesture. Avoid strong snapping where uninterrupted free scrolling matters more.",
    ],
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
          label: "Settling mode",
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
          "Settling strength. `assist` is the only JS mode: a scroll-end nudge you can cancel by moving.",
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
    designDecisions: [
      "A focused item and visible neighbours help people browse a sequence while retaining context. A list may be better for comparison across many items.",
    ],
    pairsWith: ["lens-reveal"],
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
      "A cursor disc that responds to links, buttons and marked targets.",
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
          label: "Cursor state",
          options: [
            { value: "rest", label: "Rest" },
            { value: "link", label: "Link" },
            { value: "ambiguous", label: "Ambiguous" },
            { value: "unsupported", label: "Unsupported" },
            { value: "incomplete", label: "Incomplete" },
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
      hint: "Move a fine pointer over the rows and buttons.",
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
        description: 'Word carried by the disc on data-cursor="view" targets.',
      },
      {
        name: "blend",
        type: "string",
        default: '"difference"',
        description:
          "Any mix-blend-mode value; difference is the honest default.",
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
    designDecisions: [
      "Structured input can emerge from a familiar sentence, reducing the need to fill in a form first. Keep the parsed result visible and editable when precision matters.",
    ],
    pairsWith: ["contextual-dock"],
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
      hint: "Edit the sentence and inspect the parsed form.",
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
    designDecisions: [
      "Reviewing a proposed change in place keeps the decision close to its context. This is useful when a person needs to inspect and accept or reject work before it is applied.",
    ],
    pairsWith: ["inline-diff", "trace-trail"],
    name: "Agent Review Surface",
    tagline:
      "Proposed change, evidence, and a human decision — the step between.",
    summary:
      "A review surface for a proposed change, with a title, diff, evidence and controls to accept, reject or revise. The structured diff can represent changes to code, documents or configuration.",
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
          label: "Show details",
        },
        {
          kind: "toggle",
          id: "confidence",
          label: "Show sample confidence",
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
        description:
          "Source status supplied by the host. It does not establish verification on its own.",
      },
      {
        name: "confidence",
        type: "number",
        description:
          "0–1 confidence value supplied by the host; shown as a meter when provided.",
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
      "Expand a fictional sample source to inspect its excerpt and illustrative status and confidence values.",
    order: 7,
  },

  {
    slug: "spatial-command",
    designDecisions: [
      "A command menu brings actions into reach without occupying the workspace. It works best when commands have clear names and a discoverable way to open the menu.",
    ],
    pairsWith: ["contextual-dock"],
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
    tagline: "A record that grows from compact summary into structured detail.",
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
          label: "Show details",
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
    designDecisions: [
      "Holding adds a deliberate step before a consequential action. Provide a keyboard path and avoid using the delay for routine actions.",
    ],
    pairsWith: ["progressive-action"],
    name: "Hold to Confirm",
    tagline: "Deliberate friction for actions that deserve a second of intent.",
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
      hint: "Press and hold the button, or hold Space while it is focused.",
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
        description:
          "Tone of the control; danger is reserved for destructive actions.",
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
    designDecisions: [
      "Showing progress and completion at the action helps people understand what happened. The application still owns the operation and its failure handling.",
    ],
    pairsWith: ["hold-to-confirm"],
    name: "Progressive Command Button",
    tagline:
      "One button that shows ready, running, review and done — without a modal.",
    summary:
      "Long-running actions usually mean a spinner, then a toast, then a modal asking you to confirm what you just asked for. This button keeps the whole small workflow in one control: idle, running with real progress, a review beat, then a done state with a way to run again. The application performs the work; the button shows progress and completion.",
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
    tagline: "One line of provenance that opens into the whole action history.",
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
          label: "Show details",
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
        description:
          "One-line collapsed text; defaults to the step actions joined by arrows.",
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
        description:
          "{ id, title, meta?, content } — content is the panel shown when selected.",
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
    tagline: "Original, revision and reason — revealed in place, legibly.",
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
        description:
          "When provided, an accept control appears next to the reason.",
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
    tagline: "A movable lens that reveals the layer beneath a surface.",
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
  {
    slug: "undo-window",
    name: "Undo Window",
    tagline: "A short recovery window for reversible actions.",
    summary:
      "Shows the outcome of a recent action and offers a time-limited request to reverse it. The host owns persistence, the deadline and the result of restoration. The quick undo is one active opportunity; provide a separate recovery route for important actions.",
    category: "Systems",
    tags: ["recovery", "undo", "actions"],
    status: "experimental",
    tech: ["React", "TypeScript"],
    dependencies: [],
    files: [
      {
        path: "components/lab/undo-window/undo-window.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/undo-window/undo-window.css",
        kind: "styles",
        type: "registry:file",
      },
      {
        path: "components/lab/undo-window/undo-policy.ts",
        kind: "logic",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "duration",
          label: "Undo window",
          options: [
            { value: "10", label: "10 sec" },
            { value: "30", label: "30 sec" },
            { value: "60", label: "60 sec" },
          ],
        },
        { kind: "toggle", id: "fail", label: "Simulate restore failure" },
      ],
      defaults: { duration: "30", fail: false },
      hint: "Archive a project, then choose Undo or restore it from the archive.",
    },
    props: [
      {
        name: "entry",
        type: "UndoEntry | null",
        description:
          "Host-owned action identity, label, absolute deadline and confirmed status. Use a new id for each action.",
      },
      {
        name: "onUndo",
        type: "(id: string) => void",
        description:
          "Requests restoration. The host reports pending, restored or failed through entry.",
      },
      {
        name: "onExpire",
        type: "(id: string) => void",
        description:
          "Notifies the host that the deadline passed; the host validates and finalizes the action.",
      },
    ],
    accessibility: [
      "The action and result are announced in a polite status region; the remaining time is not repeatedly announced.",
      "Undo is a keyboard-operable button with a visible focus state. Provide an independent recovery route for consequential actions.",
      "The surface uses no motion to convey its state.",
    ],
    usage: `import { UndoWindow } from "@/components/lab/undo-window/undo-window";

<UndoWindow entry={recentAction} onUndo={requestRestore} onExpire={finalizeAction} />`,
    demoNote:
      "Archive a fictional project, then undo it. Change the simulated result to inspect failure and use the archive to restore later.",
    designDecisions: [
      "A reversible action can proceed without a blocking confirmation when recovery is straightforward. The quick window is not the only recovery path: the sample archive remains available after it ends.",
      "Only one quick-undo target is active. A newer archive supersedes the earlier target; the host remains responsible for actual persistence and recovery.",
    ],
    pairsWith: ["hold-to-confirm", "progressive-action"],
    order: 17,
  },
  {
    slug: "permission-scope",
    name: "Permission Scope Inspector",
    tagline: "Review what an assistant may access and for how long.",
    summary:
      "Presents an authorization request with its resource, operations and duration. People can deny it or choose a narrower grant. The host validates and enforces every permission, expiry and revocation; this component only communicates choices.",
    category: "Agentic",
    tags: ["permissions", "scope", "authorization"],
    status: "experimental",
    tech: ["React", "TypeScript"],
    dependencies: [],
    files: [
      {
        path: "components/lab/permission-scope/permission-scope.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/permission-scope/permission-scope.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "scope",
          label: "Requested scope",
          options: [
            { value: "selected", label: "Selected files" },
            { value: "folder", label: "Whole folder" },
          ],
        },
        {
          kind: "choice",
          id: "operation",
          label: "Requested access",
          options: [
            { value: "read-write", label: "Read and move" },
            { value: "read", label: "Read only" },
          ],
        },
      ],
      defaults: { scope: "selected", operation: "read-write" },
      hint: "Inspect the scope, then deny or allow the selected access.",
    },
    props: [
      {
        name: "request",
        type: "PermissionRequest",
        description:
          "Host-provided identity, purpose, resource, requested access and consequence of denial. Use a new id for changed requests.",
      },
      {
        name: "status / grant",
        type: "PermissionStatus / PermissionDecision",
        description:
          "Host-confirmed request or grant state; include matching grant details for an active grant.",
      },
      {
        name: "onGrant / onDeny / onRevoke",
        type: "callbacks",
        description:
          "Requests a decision or revocation. The host validates, enforces and reports the result.",
      },
    ],
    accessibility: [
      "Access and duration use labelled radio groups; denial remains available alongside approval.",
      "The decision result is announced as a status and focus remains on the request surface.",
      "No information depends on animation or color alone.",
    ],
    usage: `import { PermissionScopeInspector } from "@/components/lab/permission-scope/permission-scope";

<PermissionScopeInspector request={request} status={status} grant={grant} onGrant={requestGrant} onDeny={denyRequest} onRevoke={requestRevoke} />`,
    demoNote:
      "Review a fictional file request. The sample records choices locally and does not access files.",
    designDecisions: [
      "A clear resource and operation help people distinguish reading from changing files. The initial selection is read only and applies once, so broader access requires a deliberate choice.",
      "The interface communicates intent; a trusted host must enforce the scope and expiry. A permission decision is distinct from reviewing a proposed result.",
    ],
    pairsWith: ["agent-review", "trace-trail"],
    order: 18,
  },
  {
    slug: "failure-recovery",
    name: "Failure Recovery Surface",
    tagline: "Understand what completed and choose how to recover.",
    summary:
      "Presents a host-owned multi-step operation, its confirmed progress, preserved work and available recovery actions. Retry safety and rollback availability come from the host, which must prevent duplicate work and validate each result.",
    category: "Systems",
    tags: ["recovery", "failure", "operations"],
    status: "experimental",
    tech: ["React", "TypeScript"],
    dependencies: [],
    files: [
      {
        path: "components/lab/failure-recovery/failure-recovery.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/failure-recovery/failure-recovery.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "failure",
          label: "Simulated failure",
          options: [
            { value: "upload", label: "Upload" },
            { value: "package", label: "Package" },
            { value: "none", label: "None" },
          ],
        },
        { kind: "toggle", id: "retryFail", label: "Simulate retry failure" },
        {
          kind: "toggle",
          id: "confirmRetry",
          label: "Retry needs confirmation",
        },
        { kind: "toggle", id: "rollback", label: "Rollback available" },
      ],
      defaults: {
        failure: "upload",
        retryFail: false,
        confirmRetry: false,
        rollback: true,
      },
      hint: "Start the sample export. If a step fails, inspect the preserved work and retry or roll back.",
    },
    props: [
      {
        name: "phase / steps",
        type: "RecoveryPhase / RecoveryStep[]",
        description:
          "Host-confirmed operation phase and individual step states.",
      },
      {
        name: "preserved",
        type: "string",
        description:
          "Host-provided explanation of preserved work and whether a partial result is usable.",
      },
      {
        name: "retrySafety / rollbackAvailable",
        type: "RetrySafety / boolean",
        description:
          "Host-provided recovery policy. Confirmation is requested when retry safety is uncertain.",
      },
      {
        name: "onStart / onRetry / onRollback",
        type: "callbacks",
        description:
          "Requests operations; the host executes, deduplicates and confirms outcomes.",
      },
    ],
    accessibility: [
      "Step states are written as words and do not rely on color alone.",
      "Status changes are announced politely, and keyboard focus stays on the recovery surface after an action.",
      "No animation is required to understand progress or recovery.",
    ],
    usage: `import { FailureRecoverySurface } from "@/components/lab/failure-recovery/failure-recovery";

<FailureRecoverySurface title="Export workspace" phase={phase} steps={steps} preserved={preserved} retrySafety="safe" rollbackAvailable={canRollback} onStart={start} onRetry={retryStep} onRollback={rollback} />`,
    demoNote:
      "Run a fictional export. Change the failure and retry controls to inspect recovery without creating or uploading files.",
    designDecisions: [
      "A partial failure needs more context than a single error message. Step states and a plain-language summary show what is preserved and what remains unfinished.",
      "The host determines whether retry or rollback is safe. This surface requests actions and displays confirmed results; it does not perform or deduplicate operations.",
    ],
    pairsWith: ["progressive-action", "trace-trail"],
    order: 19,
  },
  {
    slug: "continuity-tabs",
    name: "Continuity Tabs",
    tagline: "One selection surface, moving with the content it reveals.",
    summary:
      "A tab system with a measured selection indicator, directional panel transitions and a viewport that follows the active panel's real height. Tabs stay mounted, so state survives selection changes.",
    category: "Navigation",
    tags: ["tabs", "spring", "measurement", "settings"],
    status: "stable",
    tech: ["React", "ResizeObserver", "Web Animations API"],
    dependencies: [],
    files: [
      {
        path: "components/lab/continuity-tabs/continuity-tabs.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/continuity-tabs/continuity-tabs.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "motion",
          label: "Selection motion",
          options: [
            { value: "spring", label: "Spring" },
            { value: "fade", label: "Calm" },
            { value: "none", label: "Instant" },
          ],
        },
        { kind: "toggle", id: "disableAccess", label: "Disable Access tab" },
      ],
      defaults: { motion: "spring", disableAccess: false },
      hint: "Switch with arrows, Home or End. Disable Access to see a skipped tab.",
    },
    props: [
      {
        name: "tabs",
        type: "{ id: string; label: string; content: ReactNode; disabled?: boolean }[]",
        description: "The tab records. Content stays mounted while inactive.",
      },
      {
        name: "value",
        type: "string",
        description: "Controlled active tab id.",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "Initial active tab in uncontrolled use; defaults to the first enabled tab.",
      },
      {
        name: "onValueChange",
        type: "(id: string) => void",
        description: "Called when a different tab is selected.",
      },
      {
        name: "label",
        type: "string",
        default: '"Tabs"',
        description: "Accessible name for the tab list.",
      },
      {
        name: "motion",
        type: '"spring" | "fade" | "none"',
        default: '"spring"',
        description: "Selection and content transition character.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for layout customization.",
      },
    ],
    accessibility: [
      "Implements the ARIA tabs pattern: tablist, tab and tabpanel roles, aria-selected and aria-controls, with one roving tab stop.",
      "Arrow keys wrap through enabled tabs; Home and End jump to the bounds; disabled tabs are skipped.",
      "Inactive panels are hidden and inert, so their controls never enter the tab order or the accessibility tree.",
      "The measured height transition and panel movement are disabled under prefers-reduced-motion; the instant mode remains fully usable.",
    ],
    usage: `"use client";
import { useState } from "react";
import { ContinuityTabs } from "@/components/lab/continuity-tabs/continuity-tabs";

export function WorkspaceSettings() {
  const [tab, setTab] = useState("overview");
  return (
    <ContinuityTabs
      value={tab}
      onValueChange={setTab}
      label="Workspace settings"
      tabs={[
        { id: "overview", label: "Overview", content: <Overview /> },
        { id: "activity", label: "Activity", content: <Activity /> },
        { id: "access", label: "Access", content: <Access /> },
      ]}
    />
  );
}`,
    demoNote:
      "A four-tab workspace settings surface. Overview, Activity, Preferences and Access have different heights and densities; Access can be disabled from the preview controls.",
    designDecisions: [
      "The indicator is measured from the live button rather than from equal-width assumptions, so short and long labels both receive the right surface.",
      "Panels remain mounted and only the active and outgoing panels are painted. Internal form state survives switching, and the viewport transitions between measured heights instead of collapsing.",
      "Entering content travels in the direction of the tab change while the outgoing panel leaves the other way, preserving the felt location of the interface.",
    ],
    pairsWith: ["focus-stack", "morphing-metadata"],
    order: 21,
  },
  {
    slug: "chapter-rail",
    name: "Chapter Rail",
    tagline: "A reading map that moves while you read.",
    summary:
      "A scroll-linked chapter navigator for long-form pages. The marker interpolates through each section's actual progress, the labels quiet down or step forward, and every link remains a native anchor.",
    category: "Navigation",
    tags: ["scroll", "editorial", "progress", "anchors"],
    status: "stable",
    tech: ["React", "Scroll Events", "ResizeObserver", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/chapter-rail/chapter-rail.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/chapter-rail/chapter-rail.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        { kind: "toggle", id: "numbers", label: "Chapter numbers" },
        {
          kind: "choice",
          id: "labels",
          label: "Rail labels",
          options: [
            { value: "short", label: "Short" },
            { value: "long", label: "Full" },
          ],
        },
      ],
      defaults: { numbers: true, labels: "short" },
      hint: "Scroll the article slowly, then use the rail to jump between chapters.",
    },
    props: [
      {
        name: "chapters",
        type: "{ id: string; label: string; title?: string }[]",
        description: "Section ids and their rail labels; title becomes the link's accessible name.",
      },
      {
        name: "label",
        type: "string",
        default: '"Chapters"',
        description: "Accessible name for the navigation landmark.",
      },
      {
        name: "numbered",
        type: "boolean",
        default: "true",
        description: "Show 01, 02… beside the labels.",
      },
      {
        name: "scrollContainer",
        type: "HTMLElement | null",
        description:
          "The scrolling element. Omit to use the nearest scrollable ancestor, then the window.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for layout customization.",
      },
    ],
    accessibility: [
      "Links are ordinary anchors with href values, so browser navigation, open-in-new-tab and history all work.",
      "The active chapter is exposed with aria-current=\"location\"; the marker and progress line are decorative.",
      "No scroll hijacking, snapping or wheel interception is used. Clicking a chapter scrolls natively.",
      "On narrow viewports the rail becomes a compact horizontal navigator with a visible focus ring; reduced motion removes marker interpolation.",
    ],
    usage: `import { ChapterRail } from "@/components/lab/chapter-rail/chapter-rail";

const chapters = [
  { id: "intro", label: "Introduction" },
  { id: "method", label: "Method" },
  { id: "findings", label: "Findings" },
];

export function Article() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 40 }}>
      <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
        <ChapterRail chapters={chapters} numbered />
      </aside>
      <article>
        <section id="intro"><h2>Introduction</h2></section>
        <section id="method"><h2>Method</h2></section>
        <section id="findings"><h2>Findings</h2></section>
      </article>
    </div>
  );
}`,
    demoNote:
      "A five-chapter research note with enough copy to scroll. The rail is sticky in the article and becomes a horizontal chapter bar below 720px. The labels and numbering come from the preview controls.",
    designDecisions: [
      "The marker is interpolated from the active section's reading progress, not from an IntersectionObserver threshold, so it keeps drifting between chapter boundaries.",
      "The component finds its own scroll container by walking up the tree. That makes the same source work in a page, a docs panel or a preview iframe without a provider.",
      "Only transform, height and colour change. The listener is passive and coalesced into one animation frame, and it never writes to scrollTop.",
    ],
    pairsWith: ["inline-diff", "focus-stack"],
    order: 22,
  },
  {
    slug: "elastic-sheet",
    name: "Elastic Sheet",
    tagline: "A side panel on a desk, a bottom sheet in your hand.",
    summary:
      "A responsive dialog sheet with measured spring settling, a focus trap, scroll containment and optional touch dismissal. Desktop gets a side panel; narrow viewports get a bottom sheet with a grab handle.",
    category: "Navigation",
    tags: ["dialog", "sheet", "focus", "filters"],
    status: "stable",
    tech: ["React", "Portal", "Pointer Events", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/elastic-sheet/elastic-sheet.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/elastic-sheet/elastic-sheet.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "backdrop",
          label: "Backdrop click",
          options: [
            { value: "dismiss", label: "Dismiss" },
            { value: "blocked", label: "Blocked" },
          ],
        },
        { kind: "toggle", id: "swipe", label: "Swipe to dismiss" },
        {
          kind: "choice",
          id: "size",
          label: "Desktop width",
          options: [
            { value: "regular", label: "Regular" },
            { value: "wide", label: "Wide" },
          ],
        },
      ],
      defaults: { backdrop: "dismiss", swipe: false, size: "regular" },
      hint: "Open Filters, change the year range to trigger validation, then apply.",
    },
    props: [
      {
        name: "open",
        type: "boolean",
        description: "Controlled visibility.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called for Escape, the close button, backdrop dismissal and a completed swipe.",
      },
      {
        name: "title",
        type: "string",
        description: "Dialog heading and accessible name.",
      },
      {
        name: "description",
        type: "string",
        description: "Optional supporting line, linked with aria-describedby.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Scrollable sheet body; usually a form.",
      },
      {
        name: "closeOnBackdrop",
        type: "boolean",
        default: "true",
        description: "Allow a backdrop click to dismiss the sheet.",
      },
      {
        name: "swipeToDismiss",
        type: "boolean",
        default: "false",
        description: "Enable the mobile grab-handle drag. Ignored for mouse pointers.",
      },
      {
        name: "size",
        type: '"regular" | "wide"',
        default: '"regular"',
        description: "Desktop panel width; mobile is always a full-width bottom sheet.",
      },
      {
        name: "className",
        type: "string",
        description: "Merged onto the panel for local styling.",
      },
    ],
    accessibility: [
      "Uses role=\"dialog\" with aria-modal, labelled by its title and optionally described by its description.",
      "Focus moves into the sheet on open, Tab and Shift+Tab are contained, and focus returns to the opener on close.",
      "Escape always closes. Backdrop dismissal is configurable, and the close button is a label-able 36px target.",
      "The page scroll is locked with scrollbar compensation, so opening does not shift the layout; content scrolls inside the sheet.",
      "Swipe dismissal is opt-in, requires a deliberate 92px drag, and never competes with the sheet's vertical scroll.",
    ],
    usage: `"use client";
import { useState } from "react";
import { ElasticSheet } from "@/components/lab/elastic-sheet/elastic-sheet";

export function LibraryFilters() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Filters</button>
      <ElasticSheet
        open={open}
        onOpenChange={setOpen}
        title="Filter projects"
        description="Changes appear when you apply them."
        closeOnBackdrop={false}
      >
        <form onSubmit={(event) => { event.preventDefault(); setOpen(false); }}>
          {/* real controls and an apply action */}
        </form>
      </ElasticSheet>
    </>
  );
}`,
    demoNote:
      "A project library with a working filter form. Applying filters changes the visible cards and active chips; reset restores the full shelf. Validation blocks an inverted year range. The preview controls change backdrop behaviour, swipe dismissal and desktop width.",
    designDecisions: [
      "The sheet is portaled to the body so it cannot be clipped by a preview stage or a transformed card, while its CSS remains scoped to the component.",
      "Opening locks page scroll with a scrollbar-width compensation value; the panel itself owns its overflow. The backdrop only changes opacity, so context behind it stays legible.",
      "Touch dismissal lives on a dedicated handle with pointer capture and a threshold. It cannot fire from a scroll gesture in the body and is off by default.",
    ],
    pairsWith: ["reflow-grid", "quiet-status-stack"],
    order: 23,
  },
  {
    slug: "reflow-grid",
    name: "Reflow Grid",
    tagline: "Filter the shelf. The objects find their new places.",
    summary:
      "A generic collection grid with FLIP movement, animated entry and exit, and a real empty state. Filtering and sorting keep existing nodes and move them from their previous slots instead of rebuilding the grid.",
    category: "Systems",
    tags: ["grid", "filter", "FLIP", "collection"],
    status: "stable",
    tech: ["React", "Web Animations API", "CSS Grid"],
    dependencies: [],
    files: [
      {
        path: "components/lab/reflow-grid/reflow-grid.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/reflow-grid/reflow-grid.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "slider",
          id: "gap",
          label: "Grid gap",
          min: 8,
          max: 24,
          step: 2,
          unit: "px",
        },
        { kind: "toggle", id: "animate", label: "Animate reflow" },
      ],
      defaults: { gap: 14, animate: true },
      hint: "Filter, sort, switch to list, then search for something that does not exist.",
    },
    props: [
      {
        name: "items",
        type: "T[]",
        description: "The current ordered collection.",
      },
      {
        name: "getKey",
        type: "(item: T) => string",
        description: "Stable identity for each record; required for movement and focus.",
      },
      {
        name: "renderItem",
        type: "(item: T, context: { mode: \"grid\" | \"list\" }) => ReactNode",
        description: "Renders one card. Fill the grid cell for equal rows.",
      },
      {
        name: "mode",
        type: '"grid" | "list"',
        default: '"grid"',
        description: "Two layout modes; switching runs the same measured animation.",
      },
      {
        name: "empty",
        type: "ReactNode",
        description: "Content for the empty state. A quiet default is provided.",
      },
      {
        name: "label",
        type: "string",
        default: '"Collection"',
        description: "Accessible name for the region.",
      },
      {
        name: "animate",
        type: "boolean",
        default: "true",
        description: "Turn off layout motion without changing the result.",
      },
      {
        name: "gap",
        type: "number",
        default: "14",
        description: "Grid gap in pixels.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for local layout.",
      },
    ],
    accessibility: [
      "The grid is a labelled region with a list and list items, and an empty result is exposed as a status message.",
      "FLIP is measured from offset positions, so a running animation never feeds a wrong starting point into the next filter.",
      "Removed cards leave as inert, aria-hidden ghosts for 220ms; they cannot receive pointer or keyboard focus.",
      "If the focused card is removed by a host update, focus moves to the labelled region instead of being dropped on the document.",
      "Reduced motion removes movement and exit animation, and the animate prop provides an explicit off switch.",
    ],
    usage: `"use client";
import { useMemo, useState } from "react";
import { ReflowGrid } from "@/components/lab/reflow-grid/reflow-grid";

type Object = { id: string; name: string; category: string };

export function Archive({ objects }: { objects: Object[] }) {
  const [category, setCategory] = useState("All");
  const items = useMemo(
    () => objects.filter((object) => category === "All" || object.category === category),
    [objects, category],
  );
  return (
    <>
      <button onClick={() => setCategory("Lighting")}>Lighting</button>
      <ReflowGrid
        items={items}
        getKey={(object) => object.id}
        label="Object archive"
        renderItem={(object) => <article>{object.name}</article>}
      />
    </>
  );
}`,
    demoNote:
      "A working object archive with category filters, search, three sort orders, grid/list switching, save toggles and an add action. The collection has ten objects and enough states to exercise removal, insertion and empty results.",
    designDecisions: [
      "Position is captured with offsetLeft/offsetTop rather than getBoundingClientRect, so an in-flight transform cannot contaminate the next measurement.",
      "Removed cards become absolutely positioned ghosts at their old coordinates. The remaining cards can reflow immediately, which avoids the two-stage pause of waiting for an exit before measuring.",
      "The component is generic and has no opinion about artwork. It owns movement, identity and focus; the consumer owns the card.",
    ],
    pairsWith: ["shared-moment-gallery", "lens-reveal"],
    order: 24,
  },
  {
    slug: "spring-disclosure",
    name: "Spring Disclosure",
    tagline: "Content that stays connected to its container.",
    summary:
      "A disclosure system that interpolates between measured content heights while the icon, rule, copy and spacing settle together. Supports single and multiple open panels, live content resizing and nested controls.",
    category: "Systems",
    tags: ["accordion", "height", "measurement", "product"],
    status: "stable",
    tech: ["React", "ResizeObserver", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/spring-disclosure/spring-disclosure.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/spring-disclosure/spring-disclosure.css",
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
          label: "Open behaviour",
          options: [
            { value: "single", label: "Single" },
            { value: "multiple", label: "Multiple" },
          ],
        },
        { kind: "toggle", id: "disabled", label: "Disable shipping panel" },
      ],
      defaults: { mode: "single", disabled: false },
      hint: "Open Care and repair to use the nested postcode form. Switch to Multiple to keep several panels open.",
    },
    props: [
      {
        name: "items",
        type: "{ id: string; title: string; content: ReactNode; summary?: string; disabled?: boolean }[]",
        description: "Panels in display order. Content can contain interactive controls.",
      },
      {
        name: "mode",
        type: '"single" | "multiple"',
        default: '"single"',
        description: "Single closes the previous panel; multiple keeps a set open.",
      },
      {
        name: "value",
        type: "string[]",
        description: "Controlled open ids.",
      },
      {
        name: "defaultOpen",
        type: "string[]",
        description: "Initial open ids; defaults to the first panel in uncontrolled use.",
      },
      {
        name: "onValueChange",
        type: "(ids: string[]) => void",
        description: "Called with the next open set.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for local layout.",
      },
    ],
    accessibility: [
      "Each trigger is a native button inside a heading, with aria-expanded and aria-controls pointing at its region.",
      "Closed panels are inert and aria-hidden, so nested links and inputs never become hidden tab stops.",
      "If a panel closes while focus is inside it, focus returns to that panel's trigger.",
      "The compare table and specification table keep real table semantics, and disabled rows are true disabled buttons.",
      "The height transition is disabled under reduced motion while all content remains reachable.",
    ],
    usage: `import { SpringDisclosure } from "@/components/lab/spring-disclosure/spring-disclosure";

export function ProductInfo() {
  return (
    <SpringDisclosure
      mode="multiple"
      defaultOpen={["overview"]}
      items={[
        { id: "overview", title: "Overview", content: <p>A quiet task light.</p> },
        { id: "specs", title: "Specifications", content: <SpecTable /> },
        { id: "care", title: "Care and repair", content: <CareForm /> },
      ]}
    />
  );
}`,
    demoNote:
      "A product information panel for a fictional lamp. Panels include prose, a box list with an add-on, a specifications table, a comparison table and a working repair-partner form. The shipping panel can be disabled by the preview controls.",
    designDecisions: [
      "Heights are measured from the content element and observed while open. Nothing relies on height: auto mid-transition, so a panel that grows still fits without a snap.",
      "Only the height, icon, opacity and small copy offsets animate. There is no overshoot: the content should feel attached, not elastic for its own sake.",
      "The summary line remains visible while open at reduced emphasis, so the reader keeps the panel's subject even when the content is tall.",
    ],
    pairsWith: ["morphing-metadata", "focus-frame"],
    order: 25,
  },
  {
    slug: "quiet-status-stack",
    name: "Quiet Status Stack",
    tagline: "Background work, without the applause.",
    summary:
      "A restrained notification stack for long-running operations. New rows enter while existing rows make room, success can settle away, errors wait for a person, and one polite live region announces only meaningful state changes.",
    category: "Systems",
    tags: ["notifications", "progress", "async", "status"],
    status: "stable",
    tech: ["React", "Web Animations API", "ARIA Live"],
    dependencies: [],
    files: [
      {
        path: "components/lab/quiet-status-stack/quiet-status-stack.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/quiet-status-stack/quiet-status-stack.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "slider",
          id: "max",
          label: "Visible notes",
          min: 1,
          max: 5,
          step: 1,
        },
        { kind: "toggle", id: "auto", label: "Auto-dismiss successes" },
      ],
      defaults: { max: 3, auto: true },
      hint: "Start or advance a job, fail one, then retry it from the note or the job row.",
    },
    props: [
      {
        name: "items",
        type: "{ id: string; title: string; detail?: string; status: \"pending\" | \"processing\" | \"success\" | \"error\"; progress?: number; action?: { label: string; onClick: () => void; busy?: boolean }; dismissible?: boolean; autoDismissMs?: number }[]",
        description: "Host-owned operations in display order. Only the first `max` are shown.",
      },
      {
        name: "onDismiss",
        type: "(id: string) => void",
        description: "Called after the dismiss animation, or when an auto-dismiss expires.",
      },
      {
        name: "max",
        type: "number",
        default: "4",
        description: "Maximum visible notes.",
      },
      {
        name: "label",
        type: "string",
        default: '"Background activity"',
        description: "Accessible name for the stack.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for local positioning.",
      },
    ],
    accessibility: [
      "The stack is a labelled list of real status items; the visual state is not the only carrier.",
      "One visually hidden polite live region announces start, completion and failure. Progress ticks are never announced frame by frame.",
      "Progress uses role=\"progressbar\" with a numeric value; indeterminate work omits aria-valuenow.",
      "Auto-dismiss is paused on hover and focus and resumes with the remaining time; errors do not auto-dismiss.",
      "Dismiss and action buttons are labelled, and reduced motion swaps the entry and movement for immediate updates.",
    ],
    usage: `"use client";
import { QuietStatusStack } from "@/components/lab/quiet-status-stack/quiet-status-stack";

export function ExportActivity({ jobs, dismiss }: { jobs: Job[]; dismiss: (id: string) => void }) {
  return (
    <QuietStatusStack
      max={3}
      onDismiss={dismiss}
      items={jobs.map((job) => ({
        id: job.id,
        title: job.name,
        detail: job.note,
        status: job.status,
        progress: job.status === "processing" ? job.progress : undefined,
        action: job.status === "error"
          ? { label: "Retry", onClick: () => job.retry() }
          : undefined,
        autoDismissMs: job.status === "success" ? 6000 : undefined,
      }))}
    />
  );
}`,
    demoNote:
      "A fictional processing desk with four jobs. Starting, advancing, failing, retrying and opening a job all update the job record; the note stack is derived from that state, never simulated separately.",
    designDecisions:
      [
        "Existing notes are FLIP-measured when the list changes, while the new note enters on top of that movement. The stack feels like one surface rearranging, not several cards restarting.",
        "Errors and processing work sort to the top so the visible limit never hides the item that needs attention.",
        "The component handles timing and pause semantics; the host owns the operation. That keeps the notification honest: it cannot claim success the job has not reported.",
      ],
    pairsWith: ["progressive-action", "failure-recovery"],
    order: 26,
  },
  {
    slug: "liquid-segmented",
    name: "Liquid Segmented Control",
    tagline: "A selection surface with a little momentum.",
    summary:
      "A radiogroup segmented control whose selection surface is measured from the chosen label, glides between slots and gains a few pixels toward the direction of travel. Keyboard selection and focus move together.",
    category: "Input",
    tags: ["segmented", "radiogroup", "keyboard", "density"],
    status: "stable",
    tech: ["React", "ResizeObserver", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/liquid-segmented/liquid-segmented.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/liquid-segmented/liquid-segmented.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "size",
          label: "Control size",
          options: [
            { value: "md", label: "Regular" },
            { value: "sm", label: "Small" },
          ],
        },
        { kind: "toggle", id: "stretch", label: "Travel stretch" },
        { kind: "toggle", id: "disable", label: "Disable Spacious" },
      ],
      defaults: { size: "md", stretch: true, disable: false },
      hint: "Use arrow keys, Home or End. Watch the shelf reflow as density changes.",
    },
    props: [
      {
        name: "options",
        type: "{ value: string; label: string; disabled?: boolean }[]",
        description: "The choices, in visual order.",
      },
      {
        name: "value",
        type: "string",
        description: "Controlled selected value.",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        description: "Called when the selection changes by click or keyboard.",
      },
      {
        name: "label",
        type: "string",
        description: "Accessible name for the radiogroup.",
      },
      {
        name: "size",
        type: '"sm" | "md"',
        default: '"md"',
        description: "Control height and label scale.",
      },
      {
        name: "stretch",
        type: "boolean",
        default: "true",
        description: "Allow the brief directional stretch during travel.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for local layout.",
      },
    ],
    accessibility: [
      "Exposes a labelled radiogroup with radio roles, aria-checked and a roving tab stop on the current option.",
      "Arrow keys move selection and focus together; Home and End reach the first and last enabled options; disabled options are skipped.",
      "The moving surface is decorative. Text contrast and the focus ring do not depend on its position.",
      "The selection state is announced by the radio semantics, not by colour or motion.",
      "The stretch and glide are removed under reduced motion; the surface changes position instantly.",
    ],
    usage: `"use client";
import { useState } from "react";
import { LiquidSegmented } from "@/components/lab/liquid-segmented/liquid-segmented";

export function DensityControl() {
  const [density, setDensity] = useState("comfortable");
  return (
    <LiquidSegmented
      label="Layout density"
      value={density}
      onChange={setDensity}
      options={[
        { value: "compact", label: "Compact" },
        { value: "comfortable", label: "Comfortable" },
        { value: "spacious", label: "Spacious" },
      ]}
    />
  );
}`,
    demoNote:
      "A reading-room density switcher. Compact removes excerpts and avatars, comfortable shows a balanced row, and spacious reveals notes and more generous spacing. The selected option can be disabled from the preview controls.",
    designDecisions: [
      "The surface is measured from the selected button, not built as equal fractions. Labels of different lengths receive an honest pill.",
      "The stretch is capped at 18px and only lasts for the first 190ms of travel. It reads as weight, not as a rubber band.",
      "The control and the content share a single state value; changing density actually changes the sample interface's spacing and information, not just the control decoration.",
    ],
    pairsWith: ["scrub-number", "focus-frame"],
    order: 27,
  },
  {
    slug: "focus-frame",
    name: "Focus Frame",
    tagline: "The field tells you exactly where you are.",
    summary:
      "A labelled form field where focus draws a precise frame around the input, the label warms, and hint, error and success messages crossfade in a reserved slot. Validation uses icons and text as well as colour.",
    category: "Input",
    tags: ["form", "validation", "labels", "focus"],
    status: "stable",
    tech: ["React", "CSS", "ARIA"],
    dependencies: [],
    files: [
      {
        path: "components/lab/focus-frame/focus-frame.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/focus-frame/focus-frame.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "validate",
          label: "Validation timing",
          options: [
            { value: "blur", label: "On blur" },
            { value: "submit", label: "On submit" },
          ],
        },
        { kind: "toggle", id: "simulateError", label: "Simulate save failure" },
      ],
      defaults: { validate: "blur", simulateError: false },
      hint: "Clear the email to see an error, then save. The message slot never pushes the form.",
    },
    props: [
      {
        name: "label",
        type: "string",
        description: "Visible and accessible field label; never replaced by a placeholder.",
      },
      {
        name: "value",
        type: "string",
        description: "Controlled field value.",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        description: "Receives every edit.",
      },
      {
        name: "onBlur",
        type: "() => void",
        description: "Hook for host validation timing.",
      },
      {
        name: "id",
        type: "string",
        description: "Field id; generated when omitted.",
      },
      {
        name: "name",
        type: "string",
        description: "Native form field name.",
      },
      {
        name: "type",
        type: '"text" | "email" | "password" | "url"',
        default: '"text"',
        description: "Native input type when not multiline.",
      },
      {
        name: "placeholder",
        type: "string",
        description: "Optional example, never the only label.",
      },
      {
        name: "hint",
        type: "string",
        description: "Quiet helper message.",
      },
      {
        name: "error",
        type: "string",
        description: "Error message; also sets aria-invalid and the error treatment.",
      },
      {
        name: "success",
        type: "string",
        description: "Optional restrained success message.",
      },
      {
        name: "required",
        type: "boolean",
        default: "false",
        description: "Marks the field required and shows an asterisk.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Native disabled with a muted, dashed frame.",
      },
      {
        name: "readOnly",
        type: "boolean",
        default: "false",
        description: "Native read-only with a tinted frame and a visible flag.",
      },
      {
        name: "multiline",
        type: "boolean",
        default: "false",
        description: "Render a textarea instead of an input.",
      },
      {
        name: "rows",
        type: "number",
        default: "4",
        description: "Visible rows for a multiline field.",
      },
      {
        name: "maxLength",
        type: "number",
        description: "Native maximum length.",
      },
      {
        name: "showCount",
        type: "boolean",
        default: "false",
        description: "Show the character count when maxLength is present.",
      },
      {
        name: "autoComplete",
        type: "string",
        description: "Native autocomplete hint.",
      },
      {
        name: "size",
        type: '"compact" | "regular"',
        default: '"regular"',
        description: "Field height and type scale.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the field root.",
      },
    ],
    accessibility: [
      "A real <label> is always visible above the control; placeholder text is optional and never the label.",
      "Errors set aria-invalid and are linked through aria-describedby; the message also carries an icon and text, so colour is not the only signal.",
      "The message area reserves its space and crossfades content, so validation never moves the next field under the pointer.",
      "Disabled and read-only are native attributes with distinct visual treatments and explicit flags.",
      "The message region is polite and atomic; success is a short confirmation rather than a second form event.",
    ],
    usage: `"use client";
import { useState } from "react";
import { FocusFrame } from "@/components/lab/focus-frame/focus-frame";

export function ProfileField() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <FocusFrame
      label="Workspace name"
      value={name}
      onChange={setName}
      onBlur={() => setError(name.trim() ? "" : "A name is required.")}
      error={error}
      hint="Shown to everyone with access."
      maxLength={60}
      showCount
      required
    />
  );
}`,
    demoNote:
      "A workspace profile form with a live required name, a validated email, an optional description, a read-only id and a disabled billing contact. Save can succeed or fail from the preview controls, and reset restores the saved values.",
    designDecisions: [
      "The label lives outside the input. Floating-label patterns hide context as soon as typing begins; this field keeps it visible and uses the frame for focus instead.",
      "The message row has a fixed minimum height, so moving from a hint to a two-line error cannot shift the rest of the form.",
      "The focus frame uses a restrained outer ring plus four tiny corner marks. The effect is legible at a glance but does not compete with the value being typed.",
    ],
    pairsWith: ["adaptive-composer", "liquid-segmented"],
    order: 28,
  },
  {
    slug: "edge-reveal",
    name: "Edge Reveal",
    tagline: "The detail enters from the edge you chose.",
    summary:
      "A directional card reveal for editorial galleries. The overlay enters from the pointer's nearest edge and leaves toward the exit edge; title and category stay visible at rest, and focus opens the same layer for keyboard users.",
    category: "Motion",
    tags: ["hover", "direction", "portfolio", "focus"],
    status: "stable",
    tech: ["React", "Pointer Events", "CSS Transforms"],
    dependencies: [],
    files: [
      {
        path: "components/lab/edge-reveal/edge-reveal.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/edge-reveal/edge-reveal.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "tone",
          label: "Overlay tone",
          options: [
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ],
        },
        { kind: "toggle", id: "action", label: "Show save action" },
      ],
      defaults: { tone: "dark", action: true },
      hint: "Enter a card from a different edge. On keyboard, focus a card and press Escape to close.",
    },
    props: [
      {
        name: "title",
        type: "string",
        description: "Always-visible title and overlay heading.",
      },
      {
        name: "category",
        type: "string",
        description: "Always-visible category and overlay kicker.",
      },
      {
        name: "detail",
        type: "ReactNode",
        description: "Supplementary copy revealed in the overlay.",
      },
      {
        name: "media",
        type: "ReactNode",
        description: "The image, illustration or composition filling the card.",
      },
      {
        name: "action",
        type: "ReactNode",
        description: "A real action inside the overlay, usually a button or link.",
      },
      {
        name: "tone",
        type: '"light" | "dark"',
        default: '"dark"',
        description: "Overlay and scrim colour treatment.",
      },
      {
        name: "ratio",
        type: "string",
        default: '"4 / 5"',
        description: "Any CSS aspect-ratio, including wide and square cards.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the card.",
      },
      {
        name: "style",
        type: "CSSProperties",
        description: "Merged with the aspect-ratio custom property.",
      },
    ],
    accessibility: [
      "The card is a labelled focusable group; focusing it opens the same overlay a pointer would reveal.",
      "Escape closes the overlay and returns focus to the card. Tab moves into the action while the layer is open.",
      "The overlay is inert and aria-hidden while closed, so hidden actions are not tab stops.",
      "Title and category are always visible at rest; the additional detail is never required to identify the card.",
      "On coarse pointers a visible tap hint replaces hover, and tapping toggles the layer. Reduced motion swaps travel for a fade.",
    ],
    usage: `import { EdgeReveal } from "@/components/lab/edge-reveal/edge-reveal";

export function PortfolioCard() {
  return (
    <EdgeReveal
      title="Lumen"
      category="Brand systems"
      detail="A low-light identity for a repertory cinema."
      media={<img src="/work/lumen.jpg" alt="" />}
      ratio="4 / 5"
      action={<a href="/work/lumen">View case study</a>}
    />
  );
}`,
    demoNote:
      "A six-project editorial gallery made from code-drawn studies. Each card reveals its description and a save action from the edge the pointer used; the shortlist count updates in the header. Tone and action visibility are configurable.",
    designDecisions: [
      "The nearest edge is computed from the pointer's distance to each side at entry, and again at exit, so the direction is a property of the gesture rather than a fixed preset.",
      "The overlay is the only moving layer; the media gets a 2.5% scale at most. Full-card zoom would obscure which edge was chosen.",
      "Mobile gets an explicit tap hint and a persistent title/category instead of a hover-only interaction that touch cannot discover.",
    ],
    pairsWith: ["shared-moment-gallery", "lens-reveal"],
    order: 29,
  },
  {
    slug: "number-drift",
    name: "Number Drift",
    tagline: "Only the digits that changed need to move.",
    summary:
      "An animated numeric display that aligns formatted output from the right and rolls each changed digit in the direction of the value. Separators and unchanged digits stay put, and the final value is announced once.",
    category: "Motion",
    tags: ["numbers", "digits", "metrics", "Intl"],
    status: "stable",
    tech: ["React", "Intl.NumberFormat", "CSS Animations"],
    dependencies: [],
    files: [
      {
        path: "components/lab/number-drift/number-drift.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/number-drift/number-drift.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "precision",
          label: "Precision",
          options: [
            { value: "natural", label: "Natural" },
            { value: "one", label: "1 decimal" },
            { value: "two", label: "2 decimals" },
          ],
        },
        { kind: "toggle", id: "compact", label: "Compact large values" },
        { kind: "toggle", id: "deltas", label: "Show deltas" },
      ],
      defaults: { precision: "natural", compact: false, deltas: true },
      hint: "Use the +/− steppers, then Randomize. Unchanged digits should stay completely still.",
    },
    props: [
      {
        name: "value",
        type: "number",
        description: "The numeric value to display.",
      },
      {
        name: "locale",
        type: "string",
        description: "Locale passed to Intl.NumberFormat; inherits the runtime default when omitted.",
      },
      {
        name: "format",
        type: "Intl.NumberFormatOptions",
        description: "Currency, percent, compact notation, fraction digits and sign display.",
      },
      {
        name: "prefix",
        type: "string",
        description: "Static text before the number, such as a currency symbol.",
      },
      {
        name: "suffix",
        type: "string",
        description: "Static text after the number, such as a unit.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the inline root.",
      },
    ],
    accessibility: [
      "The rolling digits are aria-hidden decoration; a visually hidden span carries the final prefix, formatted value and suffix once.",
      "No live region is attached by default, so a rapidly updating metric cannot flood a screen reader.",
      "Unchanged digits keep their DOM nodes, and all numeric cells use tabular figures for stable widths.",
      "Reduced motion sets every roll directly to its final value with no animation.",
    ],
    usage: `import { NumberDrift } from "@/components/lab/number-drift/number-drift";

export function Revenue({ value }: { value: number }) {
  return (
    <NumberDrift
      value={value}
      locale="en-GB"
      prefix="£"
      format={{ maximumFractionDigits: 0 }}
    />
  );
}`,
    demoNote:
      "A printed annual-review board with four metrics. Each row has its own steppers; the header can increase or decrease everything, randomize, reset and change precision. Compact notation is available for the large values.",
    designDecisions: [
      "Formatted characters are aligned from the right, so growing a number does not disturb the units, decimal point or separator positions relative to the digits.",
      "A digit rolls through the shortest directional path: 9→0 on an increase is one step, not nine. Decrease runs the strip the other way.",
      "The number is right-aligned inside a fixed metric column. Width changes happen at the left edge, away from the unit and the reading anchor.",
    ],
    pairsWith: ["scrub-number", "signal-field"],
    order: 30,
  },
  {
    slug: "shared-moment-gallery",
    name: "Shared Moment Gallery",
    tagline: "The image keeps its place when the room changes.",
    summary:
      "A grid-to-detail gallery with a measured shared-element flight. The selected study lifts from its thumbnail into the reading room, captions arrive in sequence, and closing returns the visual to its source card.",
    category: "Media",
    tags: ["gallery", "shared element", "dialog", "FLIP"],
    status: "stable",
    tech: ["React", "Web Animations API", "Portal", "Focus Management"],
    dependencies: [],
    files: [
      {
        path: "components/lab/shared-moment-gallery/shared-moment-gallery.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/shared-moment-gallery/shared-moment-gallery.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "choice",
          id: "layout",
          label: "Grid rhythm",
          options: [
            { value: "editorial", label: "Editorial" },
            { value: "uniform", label: "Uniform" },
          ],
        },
        { kind: "toggle", id: "captions", label: "Show dates in grid" },
      ],
      defaults: { layout: "editorial", captions: true },
      hint: "Open a study, use the arrow keys, then Escape. Focus should return to the card you opened.",
    },
    props: [
      {
        name: "items",
        type: "{ id: string; title: string; category: string; date: string; caption: string; visual: ReactNode; alt: string; span?: \"standard\" | \"tall\" | \"wide\" }[]",
        description: "The studies, their visuals and their accessible descriptions. `span` controls the thumbnail ratio.",
      },
      {
        name: "label",
        type: "string",
        default: '"Gallery"',
        description: "Accessible name for the collection.",
      },
      {
        name: "layout",
        type: '"editorial" | "uniform"',
        default: '"editorial"',
        description: "Editorial masonry rhythm or an even grid.",
      },
      {
        name: "captions",
        type: "boolean",
        default: "true",
        description: "Show dates beside categories in the grid.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root for local layout.",
      },
    ],
    accessibility: [
      "Cards are real buttons labelled with title and category; the artwork itself is not the only accessible name.",
      "The detail view is a modal dialog with a title, caption description, containment for Tab and Shift+Tab, and focus returned to the source card.",
      "Escape closes; Left and Right move through the collection; the close and next/previous controls are labelled buttons.",
      "Body scroll is locked with scrollbar compensation while the reading room is open.",
      "The shared flight uses FLIP rather than the View Transitions API, so it has the same behaviour in every supported browser. Reduced motion replaces it with an immediate open and close.",
      "Each study exposes a written alt description in the detail view, not only the photograph.",
    ],
    usage: `"use client";
import { SharedMomentGallery } from "@/components/lab/shared-moment-gallery/shared-moment-gallery";

export function Studies() {
  return (
    <SharedMomentGallery
      items={studies.map((study) => ({
        id: study.id,
        title: study.title,
        category: study.category,
        date: study.date,
        caption: study.caption,
        alt: study.alt,
        visual: <img src={study.image} alt="" />,
        span: study.span,
      }))}
    />
  );
}`,
    demoNote:
      "Six code-drawn field studies in an editorial grid. The detail view keeps the same visual, adds the caption and alt description, and supports next/previous. The grid rhythm and date captions are configurable.",
    designDecisions: [
      "A real element is measured on both sides of the transition: the source card and the detail media. The visual is not a screenshot clone, so it remains sharp and the same component content can be reused.",
      "The return path measures the source card again at close. If the grid has not changed underneath the dialog, the visual lands exactly where the reader left it.",
      "The panel chrome fades while the media travels, so closing reads as one object leaving rather than a whole modal shrinking into a card.",
    ],
    pairsWith: ["edge-reveal", "focus-stack"],
    order: 31,
  },
  {
    slug: "lightfield-surface",
    name: "Lightfield Surface",
    tagline: "A small amount of physical light, not a glow.",
    summary:
      "A card that catches light from the pointer through a damped highlight and a heavily constrained tilt. The animation loop stops when the surface settles, and coarse pointers or reduced-motion users receive the static finish.",
    category: "Media",
    tags: ["pointer", "light", "product", "tilt"],
    status: "stable",
    tech: ["React", "Pointer Events", "requestAnimationFrame", "CSS"],
    dependencies: [],
    files: [
      {
        path: "components/lab/lightfield-surface/lightfield-surface.tsx",
        kind: "component",
        type: "registry:component",
      },
      {
        path: "components/lab/lightfield-surface/lightfield-surface.css",
        kind: "styles",
        type: "registry:file",
      },
    ],
    preview: {
      devices: ["desktop", "mobile"],
      controls: [
        {
          kind: "slider",
          id: "intensity",
          label: "Light intensity",
          min: 0,
          max: 1,
          step: 0.05,
          unit: "percent",
        },
        {
          kind: "slider",
          id: "tilt",
          label: "Micro tilt (degrees)",
          min: 0,
          max: 6,
          step: 1,
        },
        {
          kind: "slider",
          id: "highlight",
          label: "Highlight size",
          min: 20,
          max: 90,
          step: 2,
          unit: "percent",
        },
        {
          kind: "choice",
          id: "finish",
          label: "Surface finish",
          options: [
            { value: "matte", label: "Matte" },
            { value: "satin", label: "Satin" },
            { value: "gloss", label: "Gloss" },
          ],
        },
        { kind: "toggle", id: "disabled", label: "Lighting off" },
      ],
      defaults: {
        intensity: 0.5,
        tilt: 3,
        highlight: 52,
        finish: "satin",
        disabled: false,
      },
      hint: "Move across a card, then leave it. The surface should settle, not snap.",
    },
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "The card surface content.",
      },
      {
        name: "intensity",
        type: "number",
        default: "0.5",
        description: "Highlight strength from 0–1.",
      },
      {
        name: "tilt",
        type: "number",
        default: "3",
        description: "Maximum tilt in degrees; clamped to 6.",
      },
      {
        name: "highlight",
        type: "number",
        default: "52",
        description: "Highlight radius as a percentage of the surface.",
      },
      {
        name: "finish",
        type: '"matte" | "satin" | "gloss"',
        default: '"satin"',
        description: "Surface response: diffuse, balanced or a sharper specular streak.",
      },
      {
        name: "focusable",
        type: "boolean",
        default: "false",
        description: "Make the surface itself a tab stop with a visible focus ring.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Stop pointer response and show the static finish.",
      },
      {
        name: "className",
        type: "string",
        description: "Forwarded to the root.",
      },
      {
        name: "style",
        type: "CSSProperties",
        description: "Merged with the lightfield custom properties.",
      },
    ],
    accessibility: [
      "The light and tilt are decorative; all content remains fully readable and operable without them.",
      "A focusable surface has a visible focus ring and a static off-centre highlight; focus-within also lifts the light.",
      "Coarse pointers and prefers-reduced-motion receive a fixed light treatment with no tilt.",
      "The damping loop only runs while the pointer is moving or the surface is settling, then cancels itself.",
      "The disabled prop stops pointer response without changing layout or removing any content.",
    ],
    usage: `import { LightfieldSurface } from "@/components/lab/lightfield-surface/lightfield-surface";

export function ProductCard() {
  return (
    <LightfieldSurface intensity={0.55} tilt={3} highlight={50} finish="satin">
      <article style={{ padding: 20 }}>
        <img src="/objects/vessel.jpg" alt="Vessel 04 in matte stoneware" />
        <h3>Vessel 04</h3>
      </article>
    </LightfieldSurface>
  );
}`,
    demoNote:
      "Three material studies on a dark showroom wall. The preview controls change intensity, tilt, highlight size and finish across all three; lighting can be switched off entirely. Selecting an object updates the sample viewing.",
    designDecisions: [
      "The pointer target is damped toward the current light at 18% per frame. That small lag is what makes the surface feel lit rather than cursor-attached.",
      "The light lives above the content in screen blend mode, while the plane's tilt is clamped to six degrees. The result is depth and a specular shift, not a rotating card.",
      "The loop compares the target and current values and cancels itself when settled. A page of twelve cards at rest runs nothing.",
    ],
    pairsWith: ["soft-snap", "edge-reveal"],
    order: 32,
  },
];


export const experimentCount = experiments.length;

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}

export function sortedExperiments(): Experiment[] {
  return [...experiments].sort((a, b) => a.order - b.order);
}

/**
 * THE HOMEPAGE COLLECTION IS CURATED, NOT DERIVED FROM THE REGISTRY.
 *
 * The registry is the single source for the /components library. The
 * homepage keeps its original twenty entries so a library expansion
 * cannot silently change the composition, search results or previews
 * there. `homeExperiments()` is the only list the homepage should use.
 */
export const HOME_FEATURED_SLUGS = [
  "signal-field",
  "soft-snap",
  "evidence-carousel",
  "inverted-cursor",
  "adaptive-composer",
  "agent-review",
  "evidence-source",
  "spatial-command",
  "morphing-metadata",
  "contextual-dock",
  "hold-to-confirm",
  "progressive-action",
  "trace-trail",
  "focus-stack",
  "inline-diff",
  "lens-reveal",
  "undo-window",
  "permission-scope",
  "failure-recovery",
  "scrub-number",
] as const;

const HOME_SET = new Set<string>(HOME_FEATURED_SLUGS);

export function homeExperiments(): Experiment[] {
  return sortedExperiments().filter((experiment) =>
    HOME_SET.has(experiment.slug),
  );
}

export function isHomeFeatured(slug: string): boolean {
  return HOME_SET.has(slug);
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
