/**
 * WHAT'S NEW — the Lab's release ledger.
 *
 * The strip above the masthead renders the newest batch in this list. Adding
 * something to the site means adding one entry here with today's date; the
 * strip updates itself. Never edit the banner component to announce a release.
 *
 * One entry per thing added:
 *
 *   {
 *     id: "undo-window",              // stable, lowercase, unique
 *     added: "2026-12-02",            // the day it shipped
 *     kind: "Component",              // Component | Tool | Experiment | Software
 *     name: "Undo Window",            // shown only when it is the sole addition
 *     href: "/experiments/undo-window",
 *     cta: "Open the component",
 *     version: "v0.2",                // optional, solo additions only
 *     note: "One line that earns the click.", // optional, solo additions only
 *   }
 *
 * Entries that share an `added` date are one batch. A single entry is
 * announced by name; two or more are counted by kind — "5 new components",
 * or "2 components + 1 tool" for two kinds. Three or more kinds collapse to
 * "14 new things" so the strip stays one line. The link goes to the strongest
 * kind's section; batch members are never listed one by one. Keep entries
 * newest first; the earlier entry wins a tie on the same date.
 */
export const ADDITION_KINDS = [
  "Component",
  "Tool",
  "Experiment",
  "Software",
] as const;

export type AdditionKind = (typeof ADDITION_KINDS)[number];

export type LabAddition = {
  /** Stable key; also what a future "dismissed" record would remember. */
  id: string;
  /** ISO calendar date (YYYY-MM-DD). */
  added: string;
  kind: AdditionKind;
  name: string;
  href: string;
  cta: string;
  /** Version of a solo release, e.g. "v0.2.0 beta". */
  version?: string;
  /** One line that earns the click; solo releases only. */
  note?: string;
};

export type LabAnnouncement = {
  id: string;
  name: string;
  href: string;
  cta: string;
  version?: string;
  note?: string;
};

type KindCopy = {
  one: string;
  many: string;
  section: { href: string; cta: string };
};

const KIND_COPY: Record<AdditionKind, KindCopy> = {
  Component: {
    one: "component",
    many: "components",
    section: { href: "/components", cta: "Browse the components" },
  },
  Tool: {
    one: "tool",
    many: "tools",
    section: { href: "/tools", cta: "See the tools" },
  },
  Experiment: {
    one: "experiment",
    many: "experiments",
    section: { href: "/experiments", cta: "See the experiments" },
  },
  Software: {
    one: "software release",
    many: "software releases",
    section: { href: "/software", cta: "See the software" },
  },
};

export const additions: LabAddition[] = [
  {
    id: "fix-storage-windows-0-2",
    added: "2026-11-25",
    kind: "Software",
    name: "fix-storage — Windows",
    version: "v0.2.0 beta",
    note: "Your disk called. It has notes.",
    href: "/software/fix-storage",
    cta: "Read the build notes",
  },
  {
    id: "continuity-tabs",
    added: "2026-11-21",
    kind: "Component",
    name: "Continuity Tabs",
    href: "/experiments/continuity-tabs",
    cta: "Open the component",
  },
  {
    id: "chapter-rail",
    added: "2026-11-21",
    kind: "Component",
    name: "Chapter Rail",
    href: "/experiments/chapter-rail",
    cta: "Open the component",
  },
  {
    id: "elastic-sheet",
    added: "2026-11-21",
    kind: "Component",
    name: "Elastic Sheet",
    href: "/experiments/elastic-sheet",
    cta: "Open the component",
  },
  {
    id: "reflow-grid",
    added: "2026-11-21",
    kind: "Component",
    name: "Reflow Grid",
    href: "/experiments/reflow-grid",
    cta: "Open the component",
  },
  {
    id: "spring-disclosure",
    added: "2026-11-21",
    kind: "Component",
    name: "Spring Disclosure",
    href: "/experiments/spring-disclosure",
    cta: "Open the component",
  },
  {
    id: "quiet-status-stack",
    added: "2026-11-21",
    kind: "Component",
    name: "Quiet Status Stack",
    href: "/experiments/quiet-status-stack",
    cta: "Open the component",
  },
  {
    id: "liquid-segmented",
    added: "2026-11-21",
    kind: "Component",
    name: "Liquid Segmented Control",
    href: "/experiments/liquid-segmented",
    cta: "Open the component",
  },
  {
    id: "focus-frame",
    added: "2026-11-21",
    kind: "Component",
    name: "Focus Frame",
    href: "/experiments/focus-frame",
    cta: "Open the component",
  },
  {
    id: "edge-reveal",
    added: "2026-11-21",
    kind: "Component",
    name: "Edge Reveal",
    href: "/experiments/edge-reveal",
    cta: "Open the component",
  },
  {
    id: "number-drift",
    added: "2026-11-21",
    kind: "Component",
    name: "Number Drift",
    href: "/experiments/number-drift",
    cta: "Open the component",
  },
  {
    id: "shared-moment-gallery",
    added: "2026-11-21",
    kind: "Component",
    name: "Shared Moment Gallery",
    href: "/experiments/shared-moment-gallery",
    cta: "Open the component",
  },
  {
    id: "lightfield-surface",
    added: "2026-11-21",
    kind: "Component",
    name: "Lightfield Surface",
    href: "/experiments/lightfield-surface",
    cta: "Open the component",
  },
  {
    id: "data-matter-0-2",
    added: "2026-11-21",
    kind: "Experiment",
    name: "Data Matter",
    version: "v0.2",
    note: "A sculpture studio for numbers.",
    href: "/play/data-matter",
    cta: "Open the experiment",
  },
  {
    id: "afterclick-0-1",
    added: "2026-11-21",
    kind: "Software",
    name: "AFTERCLICK",
    version: "v0.1.0",
    note: "An interface flight recorder, with a Studio to read it.",
    href: "/software/afterclick",
    cta: "Read the build notes",
  },
];

/** Everything added on the newest date; the announcement is their batch. */
export function newestBatch(
  entries: readonly LabAddition[],
): LabAddition[] {
  const newest = entries.reduce(
    (latest, entry) => (entry.added > latest ? entry.added : latest),
    "",
  );
  return entries.filter((entry) => entry.added === newest);
}

export type AdditionGroup = { kind: AdditionKind; count: number };

/** Counts by kind, strongest first; ties follow ADDITION_KINDS order. */
export function groupAdditions(
  batch: readonly LabAddition[],
): AdditionGroup[] {
  const counts = new Map<AdditionKind, number>();
  for (const entry of batch) {
    counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        ADDITION_KINDS.indexOf(a.kind) - ADDITION_KINDS.indexOf(b.kind),
    );
}

/**
 * "5 new components"; two kinds read "2 components + 1 tool"; three or more
 * kinds collapse to one total so the strip stays a single line.
 */
export function describeGroups(groups: readonly AdditionGroup[]): string {
  const singleKind = groups.length === 1;
  if (!singleKind && groups.length > 2) {
    const total = groups.reduce((sum, group) => sum + group.count, 0);
    return `${total} new things`;
  }
  return groups
    .map(({ kind, count }) => {
      const copy = KIND_COPY[kind];
      const label = count === 1 ? copy.one : copy.many;
      return singleKind ? `${count} new ${label}` : `${count} ${label}`;
    })
    .join(" + ");
}

/**
 * The one thing the strip should say: a solo addition by name, a batch by
 * count. Returns undefined only when the ledger is empty.
 */
export function announcementFor(
  entries: readonly LabAddition[],
): LabAnnouncement | undefined {
  const batch = newestBatch(entries);
  if (batch.length === 0) return undefined;

  if (batch.length === 1) {
    const [entry] = batch;
    return {
      id: entry.id,
      name: entry.name,
      href: entry.href,
      cta: entry.cta,
      version: entry.version,
      note: entry.note,
    };
  }

  const groups = groupAdditions(batch);
  const primary = groups[0];
  const section = KIND_COPY[primary.kind].section;
  return {
    id: `batch-${batch[0].added}`,
    name: describeGroups(groups),
    href: section.href,
    cta: section.cta,
  };
}

export const latestAnnouncement = announcementFor(additions);
