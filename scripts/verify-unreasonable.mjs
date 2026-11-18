import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://127.0.0.1:3301",
  OUT = "output/unreasonable/verification";
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const results = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
async function test(name, fn) {
  try {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await fn();
    results.push({ name, pass: true });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, pass: false, error: e.stack });
    console.log("FAIL", name, e.message.slice(0, 250));
  }
}
const goto = async (route) => {
  assert.equal(
    (await page.goto(BASE + route, { waitUntil: "networkidle" })).status(),
    200,
  );
};
const click = (name) => page.getByRole("button", { name, exact: true }).click();
async function exported(button) {
  const pending = page.waitForEvent("download");
  await button.click();
  const d = await pending,
    p = `${OUT}/${d.suggestedFilename()}`;
  await d.saveAs(p);
  return { path: p, text: await readFile(p, "utf8") };
}
await test("Foundry fonts load locally, licenses included, reduced-motion printing still works", async () => {
  await goto("/");
  await page.evaluate(() => document.fonts.ready);
  assert.ok(
    await page.evaluate(() =>
      document.fonts.check(
        "400 32px " +
          getComputedStyle(document.querySelector(".v2-logo")).fontFamily.split(
            ",",
          )[0],
      ),
    ),
  );
  for (const path of [
    "/fonts/gulax.woff2",
    "/fonts/apfel-satt.woff2",
    "/fonts/apfel-OFL.txt",
    "/fonts/gulax-OFL.txt",
  ])
    assert.equal((await context.request.get(BASE + path)).status(), 200);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const hero = page.locator(".living-wordmark");
  const before = await hero.getAttribute("class");
  await page.waitForTimeout(3000);
  assert.equal(await hero.getAttribute("class"), before);
  assert.equal(await hero.locator("svg .living-letters text").count(), 4);
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
await test("Sticker creation, direct dragging, precise controls, layer order, undo/redo and self-contained export", async () => {
  await goto("/play/sticker-city");
  assert.equal(await page.locator("[data-sticker-id]").count(), 4);
  await page
    .getByRole("textbox", { name: "Your message" })
    .fill("NOT A TEMPLATE");
  await click("Print a sticker");
  assert.equal(await page.locator("[data-sticker-id]").count(), 5);
  await click("Undo");
  assert.equal(await page.locator("[data-sticker-id]").count(), 4);
  await click("Redo");
  assert.equal(await page.locator("[data-sticker-id]").count(), 5);
  await page
    .getByRole("slider", { name: "Rotation", exact: true })
    .press("End");
  await click("Foil");
  await click("To front");
  await click("To back");
  assert.equal(
    await page
      .locator("[data-sticker-id]")
      .first()
      .getAttribute("data-sticker-id"),
    "5",
  );
  const svg = (
    await exported(
      page.getByRole("button", { name: "Export SVG", exact: true }),
    )
  ).text;
  assert.ok(svg.includes("NOT A TEMPLATE"));
  assert.ok(svg.includes("data:font/woff2;base64,"));
  assert.ok(!svg.includes("data-editor-only"));
  const json = JSON.parse(
    (
      await exported(
        page.getByRole("button", { name: "Export the arrangement" }),
      )
    ).text,
  );
  assert.equal(json.items[0].angle, 180);
  assert.equal(json.items[0].foil, true);
  const target = page.locator('[data-sticker-id="3"]');
  const before = await target.getAttribute("transform");
  const box = await target.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 30,
    box.y + box.height / 2 + 20,
    { steps: 8 },
  );
  await page.mouse.up();
  assert.notEqual(await target.getAttribute("transform"), before);
  await page
    .locator(".sticker-wall")
    .screenshot({ path: `${OUT}/sticker-city-edited.png` });
  await page
    .getByRole("textbox", { name: "Your message" })
    .fill("WWWWWWWWWWWWWWWWWWWWWWWW");
  for (const [kind, limit] of [
    ["burst", 160],
    ["ticket", 230],
    ["disc", 160],
    ["tape", 260],
    ["eyes", 180],
  ]) {
    await page.getByLabel("Cut").selectOption(kind);
    await click("Print a sticker");
    const width = await page
      .locator("[data-sticker-id]")
      .last()
      .locator("[data-sticker-message]")
      .evaluate((el) => el.getBBox().width);
    // Ink bounds can overhang the SVG advance width; four units still retain
    // the cut's much larger paper inset on both sides.
    assert.ok(width <= limit + 4, `${kind} label escaped its cut: ${width}`);
  }
});
await test("Temporal ink fades, recalls, freezes under reduced motion and exports actual visible strokes", async () => {
  await goto("/play/almost-nothing");
  await click("Make one small mark");
  assert.ok(
    (
      await exported(page.getByRole("button", { name: "Keep what remains" }))
    ).text.includes("<path"),
  );
  await page.waitForTimeout(4500);
  assert.ok(
    !(
      await exported(page.getByRole("button", { name: "Keep what remains" }))
    ).text.includes("<path"),
  );
  await click("Recall the last mark");
  assert.ok(
    (
      await exported(page.getByRole("button", { name: "Keep what remains" }))
    ).text.includes("<path"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await click("Make one small mark");
  const c = page.locator(".almost-surface canvas"),
    before = await c.evaluate((el) => el.toDataURL());
  await page.waitForTimeout(300);
  assert.equal(await c.evaluate((el) => el.toDataURL()), before);
  await c.focus();
  await c.press("Space");
  await c.press("ArrowRight");
  await c.press("Space");
  await click("Clear");
  assert.ok(
    !(
      await exported(page.getByRole("button", { name: "Keep what remains" }))
    ).text.includes("<path"),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
await test("Grid rules change actual tracks, mutation restores and exported HTML works offline", async () => {
  await goto("/play/grid-crimes");
  const before = await page
    .locator(".crime-paper")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  await page.getByRole("slider", { name: "Column balance" }).press("End");
  assert.notEqual(
    await page
      .locator(".crime-paper")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns),
    before,
  );
  await click("Break a rule");
  assert.ok(await page.locator(".crime-mode-disobedience").count());
  await click("Before that happened");
  assert.ok(await page.locator(".crime-mode-order").count());
  const exp = await exported(
    page.getByRole("button", { name: "Export the composition" }),
  );
  assert.equal((exp.text.match(/@font-face/g) || []).length, 3);
  const offline = await context.newPage();
  await offline.goto(
    "file:///" + process.cwd().replaceAll("\\", "/") + "/" + exp.path,
  );
  await offline.evaluate(() => document.fonts.ready);
  assert.equal(
    await offline
      .locator(".composition")
      .evaluate((el) => getComputedStyle(el).display),
    "grid",
  );
  assert.equal(
    await offline
      .locator("h2")
      .evaluate((el) => getComputedStyle(el).fontWeight),
    "900",
  );
  await offline.screenshot({
    path: `OUT/grid-export.png`.replace("OUT", OUT),
    fullPage: true,
  });
  await offline.close();
});
await test("Spatial site navigates by map and keyboard; edits survive rooms and export is honest", async () => {
  await goto("/play/brutal-exe");
  await page
    .getByRole("textbox", { name: "THE WALL IS EDITABLE" })
    .fill("WE MADE THIS");
  await page.locator(".brutal-map button").nth(1).click();
  await click("LEAVE YOUR MARK");
  await click("LEAVE YOUR MARK");
  assert.equal(await page.locator(".brutal-stamps>span").count(), 2);
  await page.locator(".brutal-map button").nth(2).click();
  await page.locator(".brutal-order button").first().click();
  await page.locator(".brutal-map button").nth(3).click();
  const json = JSON.parse(
    (await exported(page.getByRole("button", { name: "PRINT THE RECEIPT" })))
      .text,
  );
  assert.equal(json.word, "WE MADE THIS");
  assert.equal(json.stamps.length, 2);
  assert.equal(json.order[0], "BREAK");
  await page.locator(".brutal-viewport").focus();
  await page.keyboard.press("ArrowUp");
  assert.equal(
    await page
      .locator(".brutal-map button")
      .nth(1)
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(await page.locator(".brutal-room:not([inert])").count(), 1);
  await click("INVERT THE WHOLE THING");
  assert.ok(await page.locator(".brutal-inverted").count());
});
await test("Fossil formation and inherited genome rules produce meaningful alternative structures", async () => {
  await goto("/play/data-matter");
  await click("Fossil");
  assert.equal(await page.locator(".data-scene svg path").count(), 32);
  const before = await page
    .locator(".data-scene svg path")
    .first()
    .getAttribute("d");
  await page.getByRole("slider", { name: "Relief" }).press("End");
  assert.notEqual(
    await page.locator(".data-scene svg path").first().getAttribute("d"),
    before,
  );
  assert.ok(
    (
      await exported(
        page.getByRole("button", { name: "Export SVG", exact: true }),
      )
    ).text.includes("Data Matter — a record in contours"),
  );
  await goto("/play/interface-genome");
  await click("Preserve this generation");
  await page.getByRole("slider", { name: "Information density" }).press("End");
  await click("Index");
  await click("Crossbreed with preserved variant");
  const json = JSON.parse(
    (await exported(page.getByRole("button", { name: "Export rules" }))).text,
  );
  assert.equal(json.density, 67);
  assert.equal(json.layout, "Index");
  assert.ok(await page.locator(".genome-layout-index").count());
});
await test("Library filtering, list, sidebar navigation, real narrow viewport and accessible config tabs", async () => {
  await goto("/components");
  await page
    .getByRole("searchbox", { name: "Search components", exact: true })
    .fill("carousel");
  await click("List");
  assert.equal(await page.locator(".library-list>a").count(), 1);
  await page.locator(".library-list>a").click();
  await page.waitForURL("**/experiments/evidence-carousel");
  const frame = page.frameLocator(".component-preview-frame");
  await frame.locator("#demo-root").waitFor();
  await click("Narrow");
  await page.waitForFunction(
    () => document.querySelector(".component-preview-frame").clientWidth <= 390,
  );
  const viewportWidth = await frame.locator("body").evaluate(() => innerWidth);
  assert.equal(
    viewportWidth,
    await page
      .locator(".component-preview-frame")
      .evaluate((el) => el.clientWidth),
  );
  assert.ok(viewportWidth >= 380 && viewportWidth <= 390);
  await page.getByRole("tab", { name: "Preview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: "Configuration" })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("Home");
  assert.equal(
    await page
      .getByRole("tab", { name: "Preview" })
      .getAttribute("aria-selected"),
    "true",
  );
  assert.ok(await page.locator("#install").count());
  assert.ok(await page.locator("#source").count());
});
await browser.close();
await writeFile(
  `${OUT}/results.json`,
  JSON.stringify({ results, errors }, null, 2),
);
console.log(
  `${results.filter((r) => r.pass).length}/${results.length} passed; ${errors.length} browser errors`,
);
if (results.some((r) => !r.pass) || errors.length) process.exitCode = 1;
