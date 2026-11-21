import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://127.0.0.1:3300";
const OUT = process.env.LAB_QA_OUT || "output/lab-v2";
await mkdir(`${OUT}/exports`, { recursive: true });
await mkdir(`${OUT}/screenshots`, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
const results = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const goto = async (path) => {
  const r = await page.goto(BASE + path, { waitUntil: "networkidle" });
  assert.equal(r.status(), 200);
};
const click = (name) => page.getByRole("button", { name, exact: true }).click();
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, pass: false, error: e.stack });
    console.log("FAIL", name, e.message.slice(0, 500));
  }
}
async function exported(name, button) {
  const pending = page.waitForEvent("download");
  await button.click();
  const d = await pending;
  await d.saveAs(`${OUT}/exports/${name}`);
  return readFile(`${OUT}/exports/${name}`, "utf8");
}
await check(
  "Search, category filters, complete index, empty state and wordmark",
  async () => {
    await goto("/");
    await click("Index");
    assert.equal(await page.locator(".project-index>a").count(), 32);
    await page
      .getByRole("searchbox", { name: "Search the collection" })
      .fill("carousel");
    assert.equal(await page.locator(".project-index>a").count(), 1);
    await page.getByRole("searchbox").fill("not-a-real-title");
    assert.ok(await page.getByText("Nothing here by that name.").isVisible());
    await click("Show everything");
    assert.equal(await page.locator(".project-index>a").count(), 32);
    await click("Tools3");
    assert.equal(await page.locator(".project-index>a").count(), 3);
    assert.equal(await page.locator(".living-letters text").count(), 4);
    assert.equal(
      await page.getByText("Open for play", { exact: true }).count(),
      0,
    );
  },
);
await check(
  "Data import, invalid-input recovery, meaningful geometry and SVG/data exports",
  async () => {
    await goto("/play/data-matter");
    await page.waitForSelector(".dm-stage canvas");
    const input = page.getByRole("textbox", { name: "Your numbers" });
    await page.getByText("Edit data or load a CSV").click();
    await input.fill("a,-1\nb,3");
    await click("Build this landscape");
    assert.ok(await page.locator(".instrument-error[role=alert]").isVisible());
    await input.fill("label,value\nMorning,10\nAfternoon,80\nEvening,35");
    await click("Build this landscape");
    assert.equal(
      await page.locator(".instrument-error[role=alert]").count(),
      0,
    );
    assert.equal(await page.locator(".data-values>div").count(), 3);
    const beforeSvg = await exported(
      "data-matter-relief-before.svg",
      page.getByRole("button", { name: "Export SVG", exact: true }),
    );
    await page.getByRole("slider", { name: /Relief/ }).press("End");
    const svg = await exported(
      "data-matter-2d-study.svg",
      page.getByRole("button", { name: "Export SVG", exact: true }),
    );
    assert.notEqual(svg, beforeSvg);
    assert.ok(svg.includes("<polyline"));
    assert.ok(svg.includes("Morning: 10"));
    const json = JSON.parse(
      await exported(
        "data-matter.json",
        page.getByRole("button", { name: "Export data + settings" }),
      ),
    );
    assert.equal(json.data[1].value, 80);
    assert.equal(json.height, 230);
    assert.equal(json.relief, 230);
  },
);
await check(
  "Vector geometry, controls, SVG and round-trip recipe import",
  async () => {
    await goto("/play/vector-kitchen");
    await click("petal");
    assert.equal(await page.locator(".vector-canvas svg path").count(), 42);
    await page.getByRole("slider", { name: /Repetitions/ }).press("Home");
    assert.equal(await page.locator(".vector-canvas svg path").count(), 6);
    const svg = await exported(
      "vector-kitchen.svg",
      page.getByRole("button", { name: "Export SVG" }),
    );
    assert.equal((svg.match(/<path /g) || []).length, 6);
    const recipe = await exported(
      "vector-kitchen.recipe.json",
      page.getByRole("button", { name: "Save recipe" }),
    );
    assert.equal(JSON.parse(recipe).kind, "petal");
    await click("Reset");
    await page
      .locator("input[type=file]")
      .setInputFiles(`${OUT}/exports/vector-kitchen.recipe.json`);
    await page.waitForFunction(
      () => document.querySelectorAll(".vector-canvas svg path").length === 6,
    );
    await page.locator("input[type=file]").setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"count":90000}'),
    });
    assert.ok(await page.locator(".instrument-error[role=alert]").isVisible());
  },
);
await check(
  "Motion playback, spring controls, and exact parameter exports",
  async () => {
    await goto("/play/motion-foundry");
    await click("Run the sequence");
    const delays = await page
      .locator("[data-motion-sample=spring]")
      .evaluateAll((nodes) =>
        nodes.map((el) => el.getAnimations()[0]?.effect.getTiming().delay),
      );
    const referenceDelays = await page
      .locator("[data-motion-sample=reference]")
      .evaluateAll((nodes) =>
        nodes.map((el) => el.getAnimations()[0]?.effect.getTiming().delay),
      );
    assert.deepEqual(delays, [0, 80, 160, 240]);
    assert.deepEqual(referenceDelays, delays);
    await page.waitForTimeout(180);
    const transform = await page
      .locator("[data-motion-sample=spring]")
      .first()
      .evaluate((el) => getComputedStyle(el).transform);
    assert.notEqual(transform, "none");
    assert.notEqual(transform, "matrix(1, 0, 0, 1, 0, 0)");
    await page.getByRole("slider", { name: /Stiffness/ }).press("End");
    const css = await exported(
      "motion-foundry.css",
      page.getByRole("button", { name: "Export CSS" }),
    );
    assert.ok(css.includes("stiffness 400"));
    assert.ok(css.includes("linear("));
    const json = JSON.parse(
      await exported(
        "motion-foundry.json",
        page.getByRole("button", { name: "Export spring settings" }),
      ),
    );
    assert.equal(json.stiffness, 400);
  },
);
await check(
  "Genome structural changes, functioning stories, preservation and export",
  async () => {
    await goto("/play/interface-genome");
    await click("Side");
    assert.ok(await page.locator(".genome-nav-side").isVisible());
    await click("Gallery");
    assert.ok(await page.locator(".genome-layout-gallery").isVisible());
    await page
      .getByRole("slider", { name: /Information density/ })
      .press("End");
    assert.equal(
      await page
        .locator(".generated-interface")
        .evaluate((el) => el.style.getPropertyValue("--genome-cols")),
      "3",
    );
    await page.getByRole("button", { name: "Save for later" }).first().click();
    await page.getByRole("button", { name: "Saved (1)" }).click();
    assert.equal(await page.locator(".generated-stories article").count(), 1);
    await click("Preserve this generation");
    await page
      .getByRole("checkbox", { name: "Compare with preserved variant" })
      .check();
    assert.equal(await page.locator(".generated-interface").count(), 2);
    await click("Mutate the interface");
    const json = JSON.parse(
      await exported(
        "interface-genome.json",
        page.getByRole("button", { name: "Export rules" }),
      ),
    );
    assert.equal(json.generation, 2);
  },
);
await check(
  "Typography pause, text editing, keyboard manipulation and embedded-font export",
  async () => {
    await goto("/play/type-has-mass");
    await click("Pause gravity");
    await page.getByRole("textbox", { name: "Your words" }).fill("PLAY");
    await page.waitForTimeout(100);
    assert.equal(await page.locator("[data-body]").count(), 4);
    const letter = page.locator("[data-body]").first();
    const before = await letter.getAttribute("style");
    await letter.focus();
    await letter.press("ArrowRight");
    assert.notEqual(await letter.getAttribute("style"), before);
    const held = await letter.getAttribute("style");
    await page.waitForTimeout(200);
    assert.equal(await letter.getAttribute("style"), held);
    const svg = await exported(
      "type-has-mass.svg",
      page.getByRole("button", { name: "Export SVG" }),
    );
    assert.ok(svg.includes("base64,"));
    assert.equal((svg.match(/<text /g) || []).length, 4);
  },
);
await check(
  "Terrarium plant, feed, weather, pause and real PNG snapshot",
  async () => {
    await goto("/play/browser-terrarium");
    const before = await page.locator("canvas").evaluate((c) => c.toDataURL());
    await click("Plant a mushroom");
    assert.ok(
      await page.getByText("8 plants · 9 curious residents").isVisible(),
    );
    await click("Feed");
    await click("Leave some food");
    assert.ok(
      await page
        .locator(".terrarium-bottom [role=status]")
        .getByText(/little food/)
        .isVisible(),
    );
    await click("Night");
    await click("Pause the world");
    const after = await page.locator("canvas").evaluate((c) => c.toDataURL());
    assert.notEqual(after, before);
    const pending = page.waitForEvent("download");
    await click("Take a snapshot");
    const d = await pending;
    await d.saveAs(`${OUT}/exports/browser-terrarium.png`);
    assert.equal(
      (await readFile(`${OUT}/exports/browser-terrarium.png`))
        .subarray(1, 4)
        .toString(),
      "PNG",
    );
  },
);
await check(
  "Interactive essay completes, reveals choices and exports honest observations",
  async () => {
    await goto("/play/the-cost-of-a-click");
    await click("Try three small choices");
    await page.getByRole("checkbox", { name: /Also send me/ }).uncheck();
    await click("Continue");
    await click("Open update");
    await click("quiet");
    await click("No thanks, I want to leave");
    assert.ok(
      await page
        .getByRole("heading", { name: "Really, really sure?" })
        .isVisible(),
    );
    await click("Yes, finish leaving");
    assert.ok(
      await page
        .getByRole("heading", { name: "The interface had a point of view." })
        .isVisible(),
    );
    const json = JSON.parse(
      await exported(
        "cost-of-a-click.json",
        page.getByRole("button", { name: "Keep your observations" }),
      ),
    );
    assert.equal(json.results.length, 3);
    assert.equal(json.kind, "illustrative-demo");
    assert.equal(json.results[0].choice, "Unchecked the option");
    assert.ok(json.results[1].detail.includes("1 competing"));
    await page.screenshot({
      path: `${OUT}/screenshots/essay-complete-1440.png`,
      fullPage: true,
    });
  },
);
await check(
  "All 19 original routes and registry payloads still work",
  async () => {
    const r = await context.request.get(BASE + "/r/registry.json");
    assert.equal(r.status(), 200);
    const index = await r.json();
    assert.equal(index.items.length, 20);
    for (const item of index.items) {
      const response = await context.request.get(
        `${BASE}/experiments/${item.name}`,
      );
      assert.equal(response.status(), 200, item.name);
      const registry = await context.request.get(`${BASE}/r/${item.name}.json`);
      assert.equal(registry.status(), 200);
      const json = await registry.json();
      assert.ok(json.files.length > 0);
      assert.ok(json.files.every((f) => f.content.length > 0));
    }
    for (const path of [
      "/about",
      "/experiments",
      "/tools",
      "/products",
      "/components",
    ])
      assert.equal((await context.request.get(BASE + path)).status(), 200);
    assert.equal(
      (await context.request.get(BASE + "/play/does-not-exist")).status(),
      404,
    );
  },
);
await check(
  "Phone navigation, responsive controls and reduced-motion static scenes",
  async () => {
    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await mobile.goto(BASE, { waitUntil: "networkidle" });
    await mobile.getByRole("button", { name: "Open navigation" }).click();
    await mobile.getByRole("link", { name: "Tools", exact: true }).click();
    await mobile.waitForURL("**/tools");
    assert.equal(
      await mobile.evaluate(() => document.documentElement.scrollWidth),
      390,
    );
    await mobile.close();
    const reduced = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const p = await reduced.newPage();
    await p.goto(BASE + "/play/type-has-mass", { waitUntil: "networkidle" });
    const before = await p.locator("[data-body]").first().getAttribute("style");
    await p.waitForTimeout(200);
    assert.equal(
      await p.locator("[data-body]").first().getAttribute("style"),
      before,
    );
    await p.screenshot({ path: `OUT/reduced-mass.png`.replace("OUT", OUT) });
    await reduced.close();
  },
);
await browser.close();
await writeFile(
  `${OUT}/verification.json`,
  JSON.stringify({ base: BASE, results, browserErrors: errors }, null, 2),
);
console.log(
  `${results.filter((r) => r.pass).length}/${results.length} checks passed. ${errors.length} browser errors.`,
);
if (results.some((r) => !r.pass) || errors.length) process.exitCode = 1;
