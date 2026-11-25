import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  ADDITION_KINDS,
  additions,
  announcementFor,
  describeGroups,
  groupAdditions,
  latestAnnouncement,
  newestBatch,
  type LabAddition,
} from "../lib/whats-new.ts";
import { projectBySlug } from "../lib/playground/projects.ts";
import { getExperiment } from "../lib/registry/experiments.ts";

const addition = (
  overrides: Partial<LabAddition> & Pick<LabAddition, "id" | "added" | "kind">,
): LabAddition => ({
  name: overrides.id,
  href: "/components",
  cta: "Browse the components",
  ...overrides,
});

test("every addition has a unique id, a real date, a known kind and copy", () => {
  const ids = new Set<string>();
  for (const entry of additions) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.ok(!ids.has(entry.id), `duplicate addition id: ${entry.id}`);
    ids.add(entry.id);
    assert.match(entry.added, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(
      !Number.isNaN(Date.parse(`${entry.added}T00:00:00Z`)),
      `unreadable date: ${entry.added}`,
    );
    assert.ok(
      ADDITION_KINDS.includes(entry.kind),
      `unknown kind: ${entry.kind}`,
    );
    assert.ok(entry.name.length > 0);
    assert.ok(entry.cta.length > 0);
    assert.ok(entry.href.startsWith("/"));
  }
});

test("the newest date collects the whole batch and nothing older", () => {
  const entries = [
    addition({ id: "a", added: "2026-01-02", kind: "Component" }),
    addition({ id: "b", added: "2026-01-03", kind: "Tool" }),
    addition({ id: "c", added: "2026-01-03", kind: "Component" }),
  ];
  assert.deepEqual(
    newestBatch(entries).map((entry) => entry.id),
    ["b", "c"],
  );
  assert.deepEqual(newestBatch([]), []);
});

test("a solo addition keeps its name, version, note and destination", () => {
  const only = addition({
    id: "undo-window",
    added: "2026-02-01",
    kind: "Component",
    name: "Undo Window",
    version: "v0.2",
    note: "The toast that lets you take it back.",
    href: "/experiments/undo-window",
    cta: "Open the component",
  });
  assert.deepEqual(announcementFor([only]), {
    id: "undo-window",
    name: "Undo Window",
    version: "v0.2",
    note: "The toast that lets you take it back.",
    href: "/experiments/undo-window",
    cta: "Open the component",
  });
});

test("five components in one batch become one counted line", () => {
  const batch = ["a", "b", "c", "d", "e"].map((id) =>
    addition({ id: `part-${id}`, added: "2026-02-02", kind: "Component" }),
  );
  const announcement = announcementFor(batch);
  assert.equal(announcement?.name, "5 new components");
  assert.equal(announcement?.href, "/components");
  assert.equal(announcement?.cta, "Browse the components");
  assert.equal(announcement?.note, undefined);
  assert.equal(announcement?.version, undefined);
});

test("mixed kinds are counted together and lead to the strongest section", () => {
  const batch = [
    addition({ id: "one", added: "2026-02-03", kind: "Component" }),
    addition({ id: "two", added: "2026-02-03", kind: "Component" }),
    addition({ id: "three", added: "2026-02-03", kind: "Tool" }),
  ];
  assert.deepEqual(groupAdditions(batch), [
    { kind: "Component", count: 2 },
    { kind: "Tool", count: 1 },
  ]);
  assert.equal(describeGroups(groupAdditions(batch)), "2 components + 1 tool");
  assert.equal(announcementFor(batch)?.name, "2 components + 1 tool");
  assert.equal(announcementFor(batch)?.href, "/components");
});

test("three or more kinds collapse to one total", () => {
  const batch = [
    addition({ id: "soft", added: "2026-02-04", kind: "Software" }),
    addition({ id: "tool", added: "2026-02-04", kind: "Tool" }),
    addition({ id: "comp", added: "2026-02-04", kind: "Component" }),
  ];
  assert.deepEqual(groupAdditions(batch), [
    { kind: "Component", count: 1 },
    { kind: "Tool", count: 1 },
    { kind: "Software", count: 1 },
  ]);
  assert.equal(announcementFor(batch)?.name, "3 new things");
  assert.equal(announcementFor(batch)?.href, "/components");
});

test("only the newest batch is announced; older entries stay history", () => {
  const entries = [
    addition({ id: "new", added: "2026-02-06", kind: "Tool", name: "Fresh Tool" }),
    addition({ id: "old", added: "2026-02-05", kind: "Component" }),
    addition({ id: "older", added: "2026-02-05", kind: "Component" }),
  ];
  assert.equal(announcementFor(entries)?.name, "Fresh Tool");
});

test("the bar announces the newest real batch", () => {
  assert.ok(latestAnnouncement, "the ledger has no announcement to show");
  assert.deepEqual(latestAnnouncement, announcementFor(additions));
});

test("every addition and the current announcement link to a real page", () => {
  for (const entry of [...additions, latestAnnouncement]) {
    assert.ok(entry, "missing announcement");
    if (entry.href.startsWith("/play/")) {
      assert.ok(projectBySlug(entry.href.slice("/play/".length)), entry.href);
      continue;
    }
    if (entry.href.startsWith("/experiments/")) {
      assert.ok(getExperiment(entry.href.slice("/experiments/".length)), entry.href);
      continue;
    }
    const route = path.join(
      process.cwd(),
      "app",
      ...entry.href.split("/").filter(Boolean),
      "page.tsx",
    );
    assert.ok(existsSync(route), `${entry.href} has no page at app/…`);
  }
});
