import test from "node:test";
import assert from "node:assert/strict";
import {
  experiments,
  experimentCount,
  homeExperiments,
  HOME_FEATURED_SLUGS,
  isHomeFeatured,
  neighbours,
  sortedExperiments,
} from "../lib/registry/experiments.ts";
import {
  buildRegistryIndex,
  buildRegistryItem,
  bundledSource,
} from "../lib/registry/build.ts";

const NEW_SLUGS = [
  "continuity-tabs",
  "chapter-rail",
  "elastic-sheet",
  "reflow-grid",
  "spring-disclosure",
  "quiet-status-stack",
  "liquid-segmented",
  "focus-frame",
  "edge-reveal",
  "number-drift",
  "shared-moment-gallery",
  "lightfield-surface",
];

test("the library contains 32 complete, uniquely ordered records", () => {
  assert.equal(experimentCount, 32);
  assert.equal(experiments.length, 32);
  assert.equal(new Set(experiments.map((item) => item.slug)).size, 32, "slugs are unique");
  assert.equal(new Set(experiments.map((item) => item.order)).size, 32, "orders are unique");
  assert.deepEqual(
    sortedExperiments().map((item) => item.order),
    Array.from({ length: 32 }, (_, index) => index + 1),
  );
  for (const slug of NEW_SLUGS) {
    assert.ok(experiments.some((item) => item.slug === slug), `includes ${slug}`);
  }
});

test("every new record publishes the documentation and preview contract", () => {
  for (const slug of NEW_SLUGS) {
    const item = experiments.find((entry) => entry.slug === slug);
    assert.ok(item, slug);
    assert.ok(item.tagline.length > 20, `${slug} tagline`);
    assert.ok(item.summary.length > 100, `${slug} summary`);
    assert.ok(item.preview.controls.length >= 1, `${slug} has real preview controls`);
    assert.ok(Object.keys(item.preview.defaults).length >= 1, `${slug} has defaults`);
    assert.ok(item.props.length >= 5, `${slug} documents its public props`);
    assert.ok(item.accessibility.length >= 4, `${slug} documents accessibility`);
    assert.ok((item.designDecisions?.length ?? 0) >= 2, `${slug} has design decisions`);
    for (const pair of item.pairsWith ?? []) {
      assert.notEqual(pair, slug, `${slug} does not pair with itself`);
      assert.ok(
        experiments.some((entry) => entry.slug === pair),
        `${slug} pairs with an existing ${pair}`,
      );
    }
    assert.ok(item.usage.includes("import"), `${slug} has usage code`);
    assert.ok(item.demoNote.length > 40, `${slug} describes the live demo`);
    assert.deepEqual(item.dependencies, [], `${slug} is dependency-free`);
    assert.equal(item.files.length, 2, `${slug} ships source and styles`);
    for (const file of item.files) {
      assert.ok(
        file.path.startsWith(`components/lab/${slug}/`),
        `${slug} file is scoped to its folder`,
      );
    }
  }
});

test("the homepage keeps its curated twenty and cannot inherit the expansion", () => {
  assert.equal(HOME_FEATURED_SLUGS.length, 20);
  assert.equal(homeExperiments().length, 20);
  for (const slug of NEW_SLUGS) {
    assert.equal(isHomeFeatured(slug), false, `homepage excludes ${slug}`);
    assert.equal(
      homeExperiments().some((item) => item.slug === slug),
      false,
      `homepage list excludes ${slug}`,
    );
  }
  for (const entry of homeExperiments()) {
    assert.ok((HOME_FEATURED_SLUGS as readonly string[]).includes(entry.slug));
  }
});

test("registry manifests are portable and contain the real shipped source", () => {
  const manifest = buildRegistryIndex();
  assert.equal(manifest.items.length, 32);
  for (const slug of NEW_SLUGS) {
    const item = experiments.find((entry) => entry.slug === slug);
    assert.ok(item);
    const built = buildRegistryItem(item);
    assert.equal(built.name, slug);
    assert.deepEqual(built.dependencies, []);
    assert.equal(built.files.length, 2);
    for (const file of built.files) {
      assert.ok(file.content.length > 500, `${slug} ${file.path} has full source`);
      assert.ok(
        !/from\s+["']@\//.test(file.content),
        `${slug} ${file.path} avoids the site alias`,
      );
      assert.ok(
        !/from\s+["']next\//.test(file.content),
        `${slug} ${file.path} does not depend on Next`,
      );
      for (const match of file.content.matchAll(/from\s+["']([^"']+)["']/g)) {
        const specifier = match[1];
        assert.ok(
          specifier === "react" ||
            specifier === "react-dom" ||
            specifier.startsWith("./"),
          `${slug} ${file.path} imports only React or sibling files, not ${specifier}`,
        );
      }
    }
    const bundle = bundledSource(item);
    assert.ok(bundle.includes("─── components/lab/"), `${slug} bundle labels files`);
    assert.ok(bundle.includes(".css"), `${slug} bundle includes styles`);
  }
});

test("previous and next navigation reaches the new tail without dead ends", () => {
  const ordered = sortedExperiments();
  for (const slug of NEW_SLUGS) {
    const { previous, next } = neighbours(slug);
    assert.ok(previous, `${slug} has a previous component`);
    assert.ok(next || ordered.at(-1)?.slug === slug, `${slug} has a next or ends the list`);
  }
  assert.equal(ordered[0]?.slug, "signal-field");
  assert.equal(ordered.at(-1)?.slug, "lightfield-surface");
});
