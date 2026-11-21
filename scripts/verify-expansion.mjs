/**
 * EXPANSION VERIFICATION — the twelve new components.
 *
 * Usage (with a production Lab server running):
 *   node scripts/verify-expansion.mjs --base-url=http://127.0.0.1:3300
 *
 * Checks registry manifests, routes, catalog integration, homepage
 * curation, real interactions, narrow layouts, reduced motion, axe and
 * rendered screenshots. It does not trust a successful click as proof:
 * each assertion reads the resulting state.
 */

import { chromium, devices } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const arg = (name, fallback) => {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const BASE = arg("base-url", process.env.LAB_QA_URL || "http://127.0.0.1:3300").replace(/\/$/, "");
const OUT = arg("output-dir", "output/expansion");
const SHOTS = join(OUT, "screenshots");
await mkdir(SHOTS, { recursive: true });

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
const ORIGINAL_HOME = [
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
];

const axeSource = await readFile("node_modules/axe-core/axe.min.js", "utf8");
const results = [];
const failures = [];
const consoleErrors = [];

function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      results.push({ name, pass: true });
      console.log("PASS", name);
    })
    .catch((error) => {
      failures.push({ name, error: error.stack || error.message });
      console.log("FAIL", name, "—", error.message.split("\n")[0]);
      throw error;
    });
}

async function shot(page, name) {
  await page.screenshot({
    path: join(SHOTS, `${name}.png`),
    animations: "disabled",
  });
}

async function previewFrame(page) {
  const frame = page.frameLocator("iframe.component-preview-frame");
  await frame.locator("#demo-root").waitFor({ timeout: 15000 });
  return frame;
}

function previewPage(page) {
  return page.frames().find((item) => item.url().includes("/preview/"));
}

async function axeFrame(frame) {
  await frame.addScriptTag({ content: axeSource });
  return frame.evaluate(async () => {
    const report = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      rules: { "color-contrast": { enabled: true } },
    });
    return report.violations
      .filter((violation) => ["serious", "critical"].includes(violation.impact))
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.slice(0, 4).map((node) => node.target.join(" ")),
      }));
  });
}

async function openDetail(page, slug) {
  await page.goto(`${BASE}/experiments/${slug}`, { waitUntil: "domcontentloaded" });
  const frame = await previewFrame(page);
  await page.locator("iframe.component-preview-frame").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  return frame;
}

async function assertNoOverflow(page, label) {
  const frame = previewPage(page);
  assert.ok(frame, `${label}: preview frame exists`);
  const sizes = await frame.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert.ok(
    sizes.doc <= sizes.viewport + 1,
    `${label}: horizontal overflow ${sizes.doc} > ${sizes.viewport}`,
  );
}

/* ------------------------------------------------------------------ */
/* Registry and route contracts                                        */
/* ------------------------------------------------------------------ */

const index = await (
  await fetch(`${BASE}/r/registry.json`)
).json();
assert.equal(index.items.length, 32, "registry index contains 32 items");
assert.equal(new Set(index.items.map((item) => item.name)).size, 32, "registry names are unique");
for (const slug of NEW_SLUGS) {
  const item = index.items.find((entry) => entry.name === slug);
  assert.ok(item, `registry index includes ${slug}`);
  const response = await fetch(`${BASE}/r/${slug}.json`);
  assert.equal(response.status, 200, `${slug} registry item route`);
  const manifest = await response.json();
  assert.equal(manifest.name, slug);
  assert.deepEqual(manifest.dependencies, [], `${slug} declares no npm dependencies`);
  assert.equal(manifest.files.length, 2, `${slug} ships component and styles`);
  for (const file of manifest.files) {
    assert.ok(file.content.trim().length > 100, `${slug} ${file.path} has real source`);
    assert.ok(!/from\s+["']@\//.test(file.content), `${slug} ${file.path} has no site alias import`);
    assert.ok(file.path.startsWith(`components/lab/${slug}/`), `${slug} file path is scoped`);
  }
  const detail = await fetch(`${BASE}/experiments/${slug}`);
  assert.equal(detail.status, 200, `${slug} detail route`);
  const preview = await fetch(`${BASE}/preview/${slug}`);
  assert.equal(preview.status, 200, `${slug} preview route`);
}
await check("Registry: 32 unique items, manifests and routes", () => {});

const libraryIndex = await (
  await fetch(`${BASE}/r/registry.json`)
).json();
for (const slug of NEW_SLUGS) {
  const item = libraryIndex.items.find((entry) => entry.name === slug);
  assert.ok(item.categories.length > 1, `${slug} has category metadata`);
  assert.ok(item.files.every((file) => file.type), `${slug} file types exist`);
}
await check("Registry: category and file metadata", () => {});

/* ------------------------------------------------------------------ */
/* Browser setup                                                       */
/* ------------------------------------------------------------------ */

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") {
    const text = message.text();
    if (!/favicon|Failed to load resource: the server responded with a status of 404/.test(text)) {
      consoleErrors.push(`console: ${text.slice(0, 300)}`);
    }
  }
});

/* Homepage protection -------------------------------------------------- */

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".gallery-spread");
const homeIndex = await page.evaluate(() => ({
  rows: document.querySelectorAll(".project-index > a").length,
  components: [...document.querySelectorAll(".component-links > a")].map((a) => a.getAttribute("href")),
  everythingCount: document.querySelector('.collection-filters button[aria-pressed="true"] sup')?.textContent,
}));
assert.equal(homeIndex.rows, 0, "homepage opens in the curated gallery, not the index");
assert.equal(homeIndex.components.length, 5, "homepage still shows the five curated component links by default");
assert.equal(homeIndex.everythingCount, "32", "homepage count stays at the curated total");
await page.getByRole("button", { name: /^Components/ }).click();
const homeComponents = await page.$$eval(".component-links > a", (links) =>
  links.map((link) => link.getAttribute("href")),
);
assert.equal(homeComponents.length, 20, "homepage Components filter lists exactly 20 curated components");
for (const slug of NEW_SLUGS) {
  assert.ok(
    !homeComponents.some((href) => href === `/experiments/${slug}`),
    `homepage does not link the new ${slug}`,
  );
}
await page.getByLabel("Search the collection").fill("Continuity Tabs");
await page.waitForTimeout(250);
assert.ok(
  await page.locator(".collection-empty").isVisible(),
  "homepage search cannot find a library-only component",
);
await page.getByRole("button", { name: "Show everything" }).click();
await page.getByRole("button", { name: "Index" }).click();
const homeSlugRows = await page.$$eval(".project-index > a", (links) =>
  links.map((link) => link.getAttribute("href")),
);
assert.equal(homeSlugRows.length, 32, "homepage index keeps 12 projects + 20 curated components");
for (const slug of NEW_SLUGS) {
  assert.ok(
    !homeSlugRows.includes(`/experiments/${slug}`),
    `homepage index excludes ${slug}`,
  );
}
await shot(page, "homepage-protection");
await check("Homepage: original 20 components retained, none of the 12 added", () => {});

/* Library integration ------------------------------------------------- */

await page.goto(`${BASE}/components`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".library-gallery .card");
assert.equal(await page.locator(".library-gallery .card").count(), 32, "library shows 32 cards");
assert.equal(
  await page.locator(".library-categories button").first().textContent(),
  "All32",
  "All category count is derived",
);
const navLinks = await page.$$eval('.docs-sidebar .docs-navigation a[href^="/experiments/"]', (links) =>
  links.map((link) => link.getAttribute("href")),
);
assert.equal(navLinks.length, 32, "sidebar lists all 32 components");
for (const slug of NEW_SLUGS) {
  assert.ok(navLinks.includes(`/experiments/${slug}`), `sidebar includes ${slug}`);
}
await page.locator(".library-search input").fill("continuity");
await page.waitForTimeout(150);
assert.equal(await page.locator(".library-gallery .card").count(), 1, "library search finds Continuity Tabs");
await page.locator(".library-search input").fill("no-such-component");
await page.waitForTimeout(150);
assert.ok(await page.locator(".collection-empty").isVisible(), "library empty state appears");
await page.getByRole("button", { name: "Reset filters" }).click();
await page.locator(".library-categories button", { hasText: "Navigation" }).click();
await page.waitForTimeout(120);
assert.equal(
  await page.locator(".library-gallery .card").count(),
  5,
  "Navigation filter shows five components",
);
await page.locator(".library-search input").fill("");
await page.locator(".library-categories button").filter({ hasText: "All" }).click();
await page.locator(".library-result-line input[type=checkbox]").check({ force: true });
await page.waitForTimeout(120);
assert.equal(
  await page.locator(".library-gallery .card").count(),
  32,
  "the dependency-free filter keeps all 32 components",
);
await page.locator(".library-result-line input[type=checkbox]").uncheck({ force: true });
await page.waitForTimeout(80);
await page.locator(".view-switch button", { hasText: "List" }).click();
await page.waitForTimeout(120);
assert.equal(await page.locator(".library-list a").count(), 32, "list view includes 32 entries");
await page.locator(".view-switch button", { hasText: "Gallery" }).click();
await shot(page, "library-32");
await check("Library: 32 cards, counts, search, filters, list view", () => {});

/* ------------------------------------------------------------------ */
/* Component interactions                                              */
/* ------------------------------------------------------------------ */

let frame = await openDetail(page, "continuity-tabs");
{
  const tablist = frame.getByRole("tablist", { name: "Workspace settings" });
  const overview = frame.getByRole("tab", { name: "Overview" });
  const activity = frame.getByRole("tab", { name: "Activity" });
  assert.equal(await overview.getAttribute("aria-selected"), "true");
  const before = await frame.locator(".ct-viewport").evaluate((node) => node.getBoundingClientRect().height);
  await activity.click();
  await page.waitForTimeout(420);
  assert.equal(await activity.getAttribute("aria-selected"), "true");
  assert.ok(await frame.getByText("Recent activity").isVisible(), "activity content is visible");
  const after = await frame.locator(".ct-viewport").evaluate((node) => node.getBoundingClientRect().height);
  assert.notEqual(Math.round(before), Math.round(after), "viewport height follows the panel");
  await activity.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(320);
  assert.equal(await frame.getByRole("tab", { name: "Preferences" }).getAttribute("aria-selected"), "true");
  await shot(page, "continuity-tabs-activity");
  assert.ok(await tablist.count());
  await assertNoOverflow(page, "continuity-tabs");
}
await check("Continuity Tabs: selection, height, keyboard", () => {});

frame = await openDetail(page, "chapter-rail");
{
  const rail = frame.getByRole("navigation", { name: "Chapters" });
  await frame.locator("#attention-grain").evaluate((node) => node.scrollIntoView());
  await page.waitForTimeout(500);
  const current = await rail.locator('a[aria-current="location"]').textContent();
  assert.match(current || "", /Attention/, "active chapter follows the scroll position");
  await rail.getByRole("link", { name: "What we keep" }).click();
  await page.waitForTimeout(700);
  const nextCurrent = await rail.locator('a[aria-current="location"]').textContent();
  assert.match(nextCurrent || "", /Keeping|What we keep/, "anchor navigation moves the active chapter");
  await shot(page, "chapter-rail-scrolled");
}
await check("Chapter Rail: scroll tracking and native anchors", () => {});

frame = await openDetail(page, "elastic-sheet");
{
  const open = frame.getByRole("button", { name: /^Filters/ });
  await open.click();
  const dialog = frame.getByRole("dialog");
  await dialog.waitFor();
  await page.waitForTimeout(140);
  assert.ok(await dialog.isVisible(), "sheet is visible");
  const focusedInside = await page.evaluate(() => {
    const iframe = document.querySelector("iframe.component-preview-frame");
    const doc = iframe.contentDocument;
    return !!doc?.activeElement?.closest(".es-panel");
  });
  assert.ok(focusedInside, "focus moves into the sheet");
  await shot(page, "elastic-sheet-open");
  const from = frame.getByLabel("From year");
  const to = frame.getByLabel("To year");
  await from.fill("2025");
  await to.fill("2022");
  await frame.locator(".es-body").evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await page.waitForTimeout(120);
  await frame.getByRole("button", { name: /^Apply/ }).click();
  await page.waitForTimeout(180);
  assert.ok(await frame.locator(".dm-es-error").isVisible(), "invalid range shows an error");
  await shot(page, "elastic-sheet-error");
  await from.fill("2022");
  await to.fill("2025");
  await frame.getByRole("radio", { name: "Research" }).check();
  await frame.locator(".es-body").evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await page.waitForTimeout(120);
  await frame.getByRole("button", { name: /^Apply/ }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await frame.locator(".dm-es-card").count(), 1, "apply filters the project library");
  assert.match((await frame.locator(".dm-es-result-count").textContent()) || "", /1 of 6/);
  const focusReturned = await page.evaluate(() => {
    const iframe = document.querySelector("iframe.component-preview-frame");
    return iframe.contentDocument?.activeElement?.textContent?.includes("Filters");
  });
  assert.ok(focusReturned, "focus returns to the Filters trigger");
  await open.click();
  await dialog.waitFor();
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await shot(page, "elastic-sheet-filtered");
}
await check("Elastic Sheet: focus, validation, apply, escape", () => {});

frame = await openDetail(page, "reflow-grid");
{
  const framePage = previewPage(page);
  await framePage.evaluate(() => {
    window.__halo = document.querySelector('[data-reflow-key="halo"]');
  });
  await frame.locator(".dm-rg-filters").getByRole("button", { name: /Lighting/ }).click();
  await page.waitForTimeout(420);
  assert.equal(await frame.locator(".dm-rg-card").count(), 2, "category filter narrows the archive");
  const reused = await framePage.evaluate(
    () => window.__halo === document.querySelector('[data-reflow-key="halo"]'),
  );
  assert.ok(reused, "filtering moves the existing node instead of rebuilding it");
  await shot(page, "reflow-grid-filtered");
  await frame.getByLabel("Search the archive").fill("no-object-matches");
  await page.waitForTimeout(250);
  assert.ok(await frame.locator(".rg-empty").isVisible(), "empty state is exposed");
  await shot(page, "reflow-grid-empty");
  await frame.getByRole("button", { name: "Clear filters" }).click();
  await page.waitForTimeout(300);
  await frame.getByRole("button", { name: /List/ }).click();
  await page.waitForTimeout(420);
  assert.equal(await frame.locator('.rg-root[data-mode="list"]').count(), 1, "list mode is applied");
  await shot(page, "reflow-grid-list");
}
await check("Reflow Grid: filtering, node reuse, empty, list", () => {});

frame = await openDetail(page, "spring-disclosure");
{
  const specs = frame.getByRole("button", { name: /Specifications/ });
  await specs.click();
  await page.waitForTimeout(380);
  assert.equal(await specs.getAttribute("aria-expanded"), "true");
  assert.ok(await frame.getByText("2700 K, 480 lm").isVisible(), "specification content is visible");
  const care = frame.getByRole("button", { name: /Care and repair/ });
  await care.click();
  await page.waitForTimeout(380);
  assert.equal(await specs.getAttribute("aria-expanded"), "false", "single mode closes the previous panel");
  assert.equal(await care.getAttribute("aria-expanded"), "true");
  await frame.getByLabel("Postcode").fill("EC2A");
  await frame.getByRole("button", { name: "Find a partner" }).click();
  assert.match((await frame.getByRole("status").filter({ hasText: /partner workshops/ }).textContent()) || "", /Two partner workshops/);
  await shot(page, "spring-disclosure-care");
}
await check("Spring Disclosure: measured open, single mode, nested form", () => {});

frame = await openDetail(page, "quiet-status-stack");
{
  const stack = frame.getByRole("list", { name: "File processing activity" });
  const archiveRow = frame.locator(".dm-qs-jobs li", { hasText: "archive-notes.txt" });
  await archiveRow.getByRole("button", { name: "Retry" }).click();
  await page.waitForTimeout(300);
  assert.match((await archiveRow.textContent()) || "", /Retrying|processing|12%/);
  const brandRow = frame.locator(".dm-qs-jobs li", { hasText: "brand-guidelines.pdf" });
  await brandRow.getByRole("button", { name: "Fail" }).click();
  await page.waitForTimeout(350);
  assert.ok(
    await stack.locator(".qs-item", { hasText: "brand-guidelines.pdf" }).count(),
    "failure appears in the stack",
  );
  await shot(page, "quiet-status-stack-failure");
  await stack
    .locator(".qs-item", { hasText: "brand-guidelines.pdf" })
    .getByRole("button", { name: "Retry" })
    .click();
  await page.waitForTimeout(260);
  assert.match((await brandRow.textContent()) || "", /processing|12%|Retrying/);
  for (let index = 0; index < 4; index += 1) {
    await archiveRow.getByRole("button", { name: "Advance" }).click();
    await page.waitForTimeout(180);
  }
  assert.match((await archiveRow.textContent()) || "", /Done/);
  await shot(page, "quiet-status-stack-success");
}
await check("Quiet Status Stack: job state drives notifications and retry", () => {});

frame = await openDetail(page, "liquid-segmented");
{
  const group = frame.getByRole("radiogroup", { name: "Layout density" });
  await group.getByRole("radio", { name: "Spacious" }).click();
  await page.waitForTimeout(380);
  assert.equal(
    await frame.locator(".dm-ls-root").getAttribute("data-density"),
    "spacious",
    "density state reaches the sample interface",
  );
  await group.getByRole("radio", { name: "Spacious" }).focus();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(340);
  assert.equal(
    await group.getByRole("radio", { name: "Comfortable" }).getAttribute("aria-checked"),
    "true",
    "arrow key moves selection",
  );
  await shot(page, "liquid-segmented");
}
await check("Liquid Segmented: real density change and keyboard", () => {});

frame = await openDetail(page, "focus-frame");
{
  const email = frame.getByLabel("Contact email");
  await email.fill("not-an-email");
  await email.blur();
  await page.waitForTimeout(180);
  assert.ok(await frame.getByText(/Enter a complete email/).isVisible(), "invalid email is explained");
  await email.fill("studio@loomandfield.co");
  await email.blur();
  await page.waitForTimeout(160);
  assert.equal(await frame.getByText(/Enter a complete email/).count(), 0, "error clears when valid");
  await frame.getByRole("button", { name: /Save changes/ }).click();
  await page.waitForTimeout(1100);
  assert.ok(await frame.getByText("Workspace profile saved just now.").isVisible(), "success banner appears");
  await shot(page, "focus-frame-saved");
  await page.getByLabel("Simulate save failure").check({ force: true });
  await page.waitForTimeout(120);
  await frame.getByRole("button", { name: /Save changes/ }).click();
  await page.waitForTimeout(1100);
  assert.ok(
    await frame.getByText(/could not be saved/).isVisible(),
    "simulated save failure is announced",
  );
  await shot(page, "focus-frame-error");
}
await check("Focus Frame: validation, save, failure, reset states", () => {});

frame = await openDetail(page, "edge-reveal");
{
  const card = frame.locator(".er-card").first();
  const box = await card.boundingBox();
  assert.ok(box, "portfolio card has a box");
  await page.mouse.move(box.x + box.width / 2, box.y + 4);
  await page.waitForTimeout(240);
  assert.equal(await card.getAttribute("data-open"), "true", "pointer at the top edge opens the layer");
  await shot(page, "edge-reveal-hover");
  await frame.getByRole("button", { name: "Save study" }).first().click();
  await page.waitForTimeout(120);
  assert.match((await frame.locator(".dm-er-count span").textContent()) || "", /01/);
  await page.mouse.move(10, 10);
  await page.waitForTimeout(320);
  await card.focus();
  await page.waitForTimeout(240);
  assert.equal(await card.getAttribute("data-open"), "true", "keyboard focus opens the layer");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(260);
  assert.equal(await card.getAttribute("data-open"), "false", "Escape closes the layer");
}
await check("Edge Reveal: direction, action, keyboard, escape", () => {});

frame = await openDetail(page, "number-drift");
{
  const metric = frame.locator(".dm-nd-metric", { hasText: "Monthly revenue" });
  const before = await metric.getByRole("img").count();
  const valueBefore = await metric.locator(".nd-root").getAttribute("data-changing");
  await metric.getByRole("button", { name: "Increase Monthly revenue" }).click();
  await page.waitForTimeout(480);
  const label = await metric.locator(".nd-sr").textContent();
  assert.match(label || "", /£13[0-9],900/);
  await frame.getByRole("button", { name: "Randomize" }).click();
  await page.waitForTimeout(420);
  assert.ok(await frame.getByText("The year in numbers.").isVisible());
  await shot(page, "number-drift-values");
  assert.equal(before, 0);
  assert.equal(valueBefore, "false");
}
await check("Number Drift: steppers change the formatted value", () => {});

frame = await openDetail(page, "shared-moment-gallery");
{
  const cards = frame.locator(".smg-card");
  const first = cards.first();
  await first.click();
  const dialog = frame.getByRole("dialog");
  await dialog.waitFor();
  const firstTitle = await dialog.getByRole("heading", { level: 2 }).textContent();
  await shot(page, "shared-moment-gallery-open");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(420);
  const secondTitle = await dialog.getByRole("heading", { level: 2 }).textContent();
  assert.notEqual(firstTitle, secondTitle, "arrow key moves to the next study");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await page.waitForTimeout(120);
  const restored = await page.evaluate(() => {
    const iframe = document.querySelector("iframe.component-preview-frame");
    return iframe.contentDocument?.activeElement?.classList.contains("smg-card");
  });
  assert.ok(restored, "focus returns to the source card");
  await shot(page, "shared-moment-gallery-closed");
}
await check("Shared Moment Gallery: open, next, escape, focus return", () => {});

frame = await openDetail(page, "lightfield-surface");
{
  const card = frame.locator(".lf-root").first();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.3);
  await page.waitForTimeout(260);
  const active = await card.evaluate((node) => ({
    x: node.style.getPropertyValue("--lf-x"),
    rx: node.style.getPropertyValue("--lf-rx"),
    ry: node.style.getPropertyValue("--lf-ry"),
  }));
  assert.ok(active.x && active.x !== "50%", "pointer updates the light position");
  await shot(page, "lightfield-surface-hover");
  await page.mouse.move(5, 5);
  await page.waitForTimeout(700);
  const settled = await card.evaluate((node) => ({
    rx: node.style.getPropertyValue("--lf-rx"),
    ry: node.style.getPropertyValue("--lf-ry"),
  }));
  assert.ok(Math.abs(parseFloat(settled.rx)) < 0.05, "tilt settles");
  assert.ok(Math.abs(parseFloat(settled.ry)) < 0.05, "tilt settles horizontally");
  await page.getByLabel("Lighting off").check({ force: true });
  await page.waitForTimeout(200);
  assert.equal(await frame.locator('.lf-root[data-disabled="true"]').count(), 3, "disabled finish is applied");
}
await check("Lightfield Surface: pointer light, settle, disabled", () => {});

/* Workbench controls: every component must respond to its configuration. */

let controls = page.locator(".preview-controls");

frame = await openDetail(page, "continuity-tabs");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "Calm" }).click();
await page.waitForTimeout(220);
assert.equal(await frame.locator(".ct-root").getAttribute("data-motion"), "fade");
await controls.getByLabel("Disable Access tab").check({ force: true });
await page.waitForTimeout(220);
assert.ok(await frame.getByRole("tab", { name: "Access" }).isDisabled(), "disabled tab control reaches the component");
await check("Controls: Continuity Tabs motion and disabled tab", () => {});

frame = await openDetail(page, "chapter-rail");
controls = page.locator(".preview-controls");
await controls.getByLabel("Chapter numbers").uncheck({ force: true });
await page.waitForTimeout(220);
assert.equal(await frame.locator(".cr-number").count(), 0, "chapter numbers can be removed");
await controls.locator(".control-seg button").filter({ hasText: "Full" }).click();
await page.waitForTimeout(220);
assert.ok(
  (await frame.getByRole("navigation", { name: "Chapters" }).getByRole("link", { name: "The shape of a pause" }).count()) > 0,
  "long rail labels reach the component",
);
await check("Controls: Chapter Rail numbers and labels", () => {});

frame = await openDetail(page, "elastic-sheet");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "Wide" }).click();
await controls.locator(".control-seg button").filter({ hasText: "Blocked" }).click();
await page.waitForTimeout(200);
await frame.getByRole("button", { name: /^Filters/ }).click();
const controlDialog = frame.getByRole("dialog");
await controlDialog.waitFor();
assert.equal(await frame.locator('.es-root[data-size="wide"]').count(), 1, "wide sheet option reaches the component");
await frame.locator(".es-backdrop").click({ position: { x: 30, y: 60 } });
await page.waitForTimeout(200);
assert.ok(await controlDialog.isVisible(), "blocked backdrop does not dismiss");
await page.keyboard.press("Escape");
await controlDialog.waitFor({ state: "hidden" });
await check("Controls: Elastic Sheet width and backdrop policy", () => {});

frame = await openDetail(page, "reflow-grid");
controls = page.locator(".preview-controls");
const gapSlider = controls.getByRole("slider", { name: "Grid gap" });
await gapSlider.focus();
await gapSlider.press("End");
await page.waitForTimeout(220);
assert.equal(
  (await frame.locator(".rg-root").evaluate((node) => getComputedStyle(node).getPropertyValue("--rg-gap").trim())),
  "24px",
  "grid gap control reaches the component",
);
await check("Controls: Reflow Grid gap", () => {});

frame = await openDetail(page, "spring-disclosure");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "Multiple" }).click();
await page.waitForTimeout(160);
await frame.getByRole("button", { name: /Specifications/ }).click();
await frame.getByRole("button", { name: /Care and repair/ }).click();
await page.waitForTimeout(300);
assert.equal(await frame.getByRole("button", { name: /Specifications/ }).getAttribute("aria-expanded"), "true");
assert.equal(await frame.getByRole("button", { name: /Care and repair/ }).getAttribute("aria-expanded"), "true");
await controls.getByLabel("Disable shipping panel").check({ force: true });
await page.waitForTimeout(200);
assert.ok(await frame.getByRole("button", { name: /Shipping restrictions/ }).isDisabled());
await check("Controls: Spring Disclosure open mode and disabled panel", () => {});

frame = await openDetail(page, "quiet-status-stack");
controls = page.locator(".preview-controls");
const noteSlider = controls.getByRole("slider", { name: "Visible notes" });
await noteSlider.focus();
await noteSlider.press("Home");
await page.waitForTimeout(300);
assert.ok((await frame.locator(".qs-item").count()) <= 1, "visible-note limit reaches the stack");
await check("Controls: Quiet Status Stack visible limit", () => {});

frame = await openDetail(page, "liquid-segmented");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "Small" }).click();
await controls.getByLabel("Disable Spacious").check({ force: true });
await page.waitForTimeout(240);
assert.equal(await frame.locator('.ls-root[data-size="sm"]').count(), 1, "size control reaches the component");
assert.ok(await frame.getByRole("radio", { name: "Spacious" }).isDisabled(), "disabled option reaches the component");
await check("Controls: Liquid Segmented size and disabled option", () => {});

frame = await openDetail(page, "focus-frame");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "On submit" }).click();
await page.waitForTimeout(160);
const submitEmail = frame.getByLabel("Contact email");
await submitEmail.fill("not-an-email");
await submitEmail.blur();
await page.waitForTimeout(180);
assert.equal(await frame.getByText(/Enter a complete email/).count(), 0, "submit timing delays validation");
await frame.getByRole("button", { name: /Save changes/ }).click();
await page.waitForTimeout(160);
assert.ok(await frame.getByText(/Enter a complete email/).isVisible(), "submit validation surfaces the error");
await check("Controls: Focus Frame validation timing", () => {});

frame = await openDetail(page, "edge-reveal");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "Light" }).click();
await controls.getByLabel("Show save action").uncheck({ force: true });
await page.waitForTimeout(240);
assert.equal(await frame.locator('.er-card[data-tone="light"]').count(), 6, "tone control reaches every card");
assert.equal(await frame.locator(".er-action").count(), 0, "action toggle removes the action");
await check("Controls: Edge Reveal tone and action", () => {});

frame = await openDetail(page, "number-drift");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "2 decimals" }).click();
await page.waitForTimeout(260);
assert.match((await frame.locator(".dm-nd-metric").first().locator(".nd-sr").textContent()) || "", /\.00/);
await controls.getByLabel("Compact large values").check({ force: true });
await page.waitForTimeout(260);
assert.match((await frame.locator(".dm-nd-metric").first().locator(".nd-sr").textContent()) || "", /k|m/i);
await controls.getByLabel("Show deltas").uncheck({ force: true });
await page.waitForTimeout(160);
assert.equal(await frame.locator(".dm-nd-delta").count(), 0, "delta toggle hides the chips");
await check("Controls: Number Drift precision, notation and deltas", () => {});

frame = await openDetail(page, "shared-moment-gallery");
controls = page.locator(".preview-controls");
await controls.locator(".control-seg button").filter({ hasText: "Uniform" }).click();
await controls.getByLabel("Show dates in grid").uncheck({ force: true });
await page.waitForTimeout(240);
assert.equal(await frame.locator('.smg-root[data-layout="uniform"]').count(), 1, "layout control reaches the gallery");
assert.equal(
  (await frame.locator(".smg-card-line").first().textContent())?.includes("2025"),
  false,
  "caption toggle removes the date",
);
await check("Controls: Shared Moment Gallery layout and captions", () => {});

frame = await openDetail(page, "lightfield-surface");
controls = page.locator(".preview-controls");
const intensity = controls.getByRole("slider", { name: "Light intensity" });
await intensity.focus();
await intensity.press("End");
const tilt = controls.getByRole("slider", { name: /Micro tilt/ });
await tilt.focus();
await tilt.press("End");
const highlight = controls.getByRole("slider", { name: "Highlight size" });
await highlight.focus();
await highlight.press("End");
await controls.locator(".control-seg button").filter({ hasText: "Gloss" }).click();
await page.waitForTimeout(260);
const surfaceStyle = await frame.locator(".lf-root").first().evaluate((node) => ({
  intensity: node.style.getPropertyValue("--lf-intensity"),
  tilt: node.style.getPropertyValue("--lf-tilt"),
  size: node.style.getPropertyValue("--lf-size"),
  finish: node.getAttribute("data-finish"),
}));
assert.equal(surfaceStyle.intensity, "1");
assert.equal(surfaceStyle.tilt, "6deg");
assert.equal(surfaceStyle.size, "90%");
assert.equal(surfaceStyle.finish, "gloss");
await check("Controls: Lightfield intensity, tilt, highlight and finish", () => {});

/* Narrow layouts and screenshots -------------------------------------- */

for (const slug of NEW_SLUGS) {
  await openDetail(page, slug);
  await page.getByRole("button", { name: "Narrow", exact: true }).click();
  await page.waitForTimeout(420);
  const frameInfo = await previewPage(page).evaluate(() => ({
    width: innerWidth,
    doc: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert.ok(frameInfo.width <= 392, `${slug}: narrow preview viewport is mobile-sized`);
  assert.ok(
    frameInfo.doc <= frameInfo.viewport + 1,
    `${slug}: no horizontal overflow at 390 (${frameInfo.doc} > ${frameInfo.viewport})`,
  );
  await assertNoOverflow(page, `${slug} narrow`);
  await shot(page, `${slug}-narrow`);
}
await check("Responsive: all 12 narrow previews fit without overflow", () => {});

/* Desktop screenshots ------------------------------------------------ */

for (const slug of NEW_SLUGS) {
  await openDetail(page, slug);
  await shot(page, `${slug}-desktop`);
}
await check("Visuals: desktop captures for all 12", () => {});

/* Real viewport matrix ----------------------------------------------- */

const viewports = [1440, 1024, 768, 390, 320];
for (const slug of NEW_SLUGS) {
  for (const width of viewports) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 });
    await page.goto(`${BASE}/preview/${slug}`, { waitUntil: "domcontentloaded" });
    await page.locator("#demo-root").waitFor({ timeout: 15000 });
    await page.waitForTimeout(140);
    assert.ok(await page.locator("#demo-root").isVisible(), `${slug} @ ${width}: renders`);
    const sizes = await previewPage(page).evaluate(() => ({
      width: innerWidth,
      doc: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    assert.equal(sizes.width, width, `${slug} @ ${width}: real viewport width`);
    assert.ok(
      sizes.doc <= sizes.viewport + 1,
      `${slug} @ ${width}: horizontal overflow ${sizes.doc} > ${sizes.viewport}`,
    );
    if (width === 768 || width === 320) {
      await shot(page, `${slug}-${width}`);
    }
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await check("Responsive: 1440 / 1024 / 768 / 390 / 320 real viewports", () => {});

/* Accessibility ------------------------------------------------------ */

const axeTargets = [...NEW_SLUGS];
const axeFailures = [];
for (const slug of axeTargets) {
  await openDetail(page, slug);
  const framePage = previewPage(page);
  try {
    const violations = await axeFrame(framePage);
    if (violations.length) axeFailures.push({ slug, violations });
  } catch (error) {
    axeFailures.push({ slug, error: error.message });
  }
}
await page.goto(`${BASE}/components`, { waitUntil: "domcontentloaded" });
await page.locator(".library-gallery .card").first().waitFor();
await page.waitForTimeout(400);
await page.addScriptTag({ content: axeSource });
const libraryAxe = await page.evaluate(async () => {
  const report = await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  });
  return report.violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact))
    .map((violation) => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.length }));
});
assert.deepEqual(axeFailures, [], `axe serious/critical violations: ${JSON.stringify(axeFailures)}`);
assert.deepEqual(libraryAxe, [], `library axe violations: ${JSON.stringify(libraryAxe)}`);
await check("Accessibility: no serious or critical axe findings", () => {});

/* Touch and coarse pointer ------------------------------------------- */

const touchContext = await browser.newContext({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
});
const touchPage = await touchContext.newPage();
touchPage.on("pageerror", (error) => consoleErrors.push(`touch pageerror: ${error.message}`));
await touchPage.goto(`${BASE}/preview/edge-reveal`, { waitUntil: "domcontentloaded" });
await touchPage.locator("#demo-root").waitFor();
const touchCard = touchPage.locator(".er-card").first();
await touchCard.tap();
await touchPage.waitForTimeout(220);
assert.equal(await touchCard.getAttribute("data-open"), "true", "tap opens the detail layer");
await shot(touchPage, "edge-reveal-touch");
await touchPage.getByRole("button", { name: "Save study" }).first().tap();
await touchPage.waitForTimeout(160);
assert.match((await touchPage.locator(".dm-er-count span").textContent()) || "", /01/);
assert.equal(
  await touchCard.getAttribute("data-open"),
  "true",
  "activating the overlay action does not also close the layer",
);

await touchPage.goto(`${BASE}/preview/lightfield-surface`, { waitUntil: "domcontentloaded" });
await touchPage.locator("#demo-root").waitFor();
const coarse = await touchPage.evaluate(() => ({
  pointer: matchMedia("(pointer: coarse)").matches,
  hover: matchMedia("(hover: none)").matches,
  transform: getComputedStyle(document.querySelector(".lf-plane")).transform,
}));
assert.ok(coarse.pointer || coarse.hover, "touch device reports a coarse pointer");
assert.equal(coarse.transform, "none", "coarse pointers use the static finish");
await touchContext.close();
await check("Touch: edge reveal tap/action and lightfield static finish", () => {});

/* Reduced motion ----------------------------------------------------- */

await context.close();
const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const reducedPage = await reducedContext.newPage();
reducedPage.on("pageerror", (error) => consoleErrors.push(`reduced pageerror: ${error.message}`));
for (const slug of NEW_SLUGS) {
  await reducedPage.goto(`${BASE}/experiments/${slug}`, { waitUntil: "domcontentloaded" });
  const frame = await previewFrame(reducedPage);
  await reducedPage.waitForTimeout(160);
  assert.ok(await frame.locator("#demo-root").isVisible(), `${slug}: renders under reduced motion`);
  const framePage = reducedPage.frames().find((item) => item.url().includes("/preview/"));
  const sizes = await framePage.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert.ok(sizes.doc <= sizes.viewport + 1, `${slug}: no overflow under reduced motion`);
}
await reducedPage.goto(`${BASE}/experiments/number-drift`, { waitUntil: "domcontentloaded" });
const reducedFrame = await previewFrame(reducedPage);
const reducedMetric = reducedFrame.locator(".dm-nd-metric", { hasText: "Monthly revenue" });
await reducedMetric.getByRole("button", { name: "Increase Monthly revenue" }).click();
await reducedPage.waitForTimeout(120);
assert.match((await reducedMetric.locator(".nd-sr").textContent()) || "", /£13[0-9],900/);
await reducedContext.close();
await check("Reduced motion: all 12 render and update without overflow", () => {});

/* Report ------------------------------------------------------------- */

await browser.close();

const report = {
  base: BASE,
  checkedAt: new Date().toISOString(),
  components: 32,
  newComponents: NEW_SLUGS.length,
  homepageCurated: ORIGINAL_HOME.length,
  results,
  failures,
  consoleErrors,
  screenshots: SHOTS,
};
await writeFile(join(OUT, "report.json"), JSON.stringify(report, null, 2));

console.log(`\n${results.length} checks passed`);
if (consoleErrors.length) {
  console.log("\nConsole/page errors captured:");
  for (const error of consoleErrors) console.log("  ·", error);
}
console.log(`screenshots: ${SHOTS}`);
if (failures.length || consoleErrors.length) {
  process.exitCode = 1;
}
