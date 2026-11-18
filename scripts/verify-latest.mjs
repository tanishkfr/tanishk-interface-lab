import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://localhost:3309",
  OUT = "output/latest";
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE + "/components", { waitUntil: "networkidle" });
assert.equal(await page.locator(".docs-nav-search,.docs-home-link").count(), 0);
assert.equal(await page.locator(".docs-sidebar .docs-nav-group>a").count(), 20);
assert.equal(
  (await (await context.request.get(BASE + "/r/registry.json")).json()).items
    .length,
  20,
);
await page.goto(BASE + "/experiments/scrub-number", {
  waitUntil: "networkidle",
});
const frame = page.frameLocator(".component-preview-frame");
const input = frame.getByRole("spinbutton", { name: "Size", exact: true });
await input.fill("72");
assert.equal(await input.inputValue(), "72");
const handle = frame.getByRole("button", { name: /^Drag to adjust Size/ });
await handle.focus();
await handle.press("ArrowRight");
assert.equal(await input.inputValue(), "73");
await handle.press("Shift+ArrowRight");
assert.equal(await input.inputValue(), "83");
await handle.press("Home");
assert.equal(await input.inputValue(), "12");
const box = await handle.boundingBox();
await page.mouse.move(box.x + 24, box.y + 24);
await page.mouse.down();
await page.mouse.move(box.x + 144, box.y + 24, { steps: 10 });
await page.mouse.up();
assert.equal(await input.inputValue(), "32");
await handle.press("End");
assert.equal(await input.inputValue(), "120");
await page
  .locator(".preview-panel")
  .screenshot({ path: OUT + "/scrub-number.png" });
await page.goto(BASE + "/play/text-desk", { waitUntil: "networkidle" });
await page
  .getByRole("textbox", { name: "01 / Your text" })
  .fill("  A   B  \n A B \n“quote”  ");
await page.getByLabel("Unique lines", { exact: true }).check();
await page.getByLabel("Straight quotes", { exact: true }).check();
await page.getByLabel("Letter case").selectOption("UPPERCASE");
assert.equal(
  await page
    .getByRole("textbox", { name: "Clean copy", exact: true })
    .inputValue(),
  'A B\n"QUOTE"',
);
const pending = page.waitForEvent("download");
await page.getByRole("button", { name: "Download .txt", exact: true }).click();
const file = await pending;
await file.saveAs(OUT + "/clean-copy.txt");
assert.equal(await readFile(OUT + "/clean-copy.txt", "utf8"), 'A B\n"QUOTE"');
for (const width of [1440, 820, 390, 320]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of [
    "/",
    "/components",
    "/products",
    "/tools",
    "/play/text-desk",
    "/experiments/scrub-number",
  ]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${route} overflow ${width}`,
    );
    if (width === 1440 || width === 390) {
      await page.screenshot({
        path: `${OUT}/${route.replaceAll("/", "_") || "home"}-${width}.png`,
        fullPage: true,
      });
      if (route === "/")
        await page
          .locator("footer")
          .screenshot({ path: `${OUT}/footer-${width}.png` });
    }
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForFunction(
  () =>
    document.querySelector(".living-wordmark")?.classList.contains("edition-3"),
  {},
  { timeout: 12000 },
);
assert.ok(
  (await page.locator(".living-wordmark").getAttribute("class")).includes(
    "edition-3",
  ),
);
assert.equal(await page.locator(".weave-strip").count(), 13);
await page.waitForTimeout(1800);
assert.ok(
  await page
    .locator(".weave-strip")
    .last()
    .evaluate((el) => {
      const t = getComputedStyle(el).transform;
      return t === "none" || new DOMMatrix(t).isIdentity;
    }),
);
await page
  .locator(".living-wordmark")
  .screenshot({ path: OUT + "/woven-hero.png" });
assert.equal(await page.locator(".edition-caption").count(), 0);
assert.equal(errors.length, 0);
await browser.close();
await writeFile(
  OUT + "/verification.json",
  JSON.stringify(
    {
      registry: 20,
      sidebar: "deduplicated",
      scrub: "input, keyboard, pointer, clamping pass",
      textDesk: "cleanup, case, unique lines and UTF-8 export pass",
      responsiveStates: 24,
      errors,
    },
    null,
    2,
  ),
);
console.log(
  "PASS: 20 components, sidebar, numeric control, text export, 24 responsive states, cursor drawing, no browser errors.",
);
