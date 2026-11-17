import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://127.0.0.1:3300";
const OUT = process.env.LAB_AUDIT_OUT || "output/unreasonable/baseline";
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const request = await browser.newContext();
const index = await (
  await request.request.get(BASE + "/r/registry.json")
).json();
const queue = [...index.items];
const results = [];
async function audit(item) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(4000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const states = [];
  async function inspect(state) {
    const metrics = await page.evaluate(() => {
      const stage = document.querySelector(".preview-stage");
      const rect = stage.getBoundingClientRect();
      const elements = [
        ...stage.querySelectorAll("button,input,textarea,select,h1,h2,h3,p"),
      ].filter(
        (el) =>
          el.getClientRects().length &&
          getComputedStyle(el).visibility !== "hidden",
      );
      const clipped = elements
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width &&
            r.height &&
            (r.left < rect.left - 2 ||
              r.right > rect.right + 2 ||
              r.top < rect.top - 2 ||
              r.bottom > rect.bottom + 2)
          );
        })
        .map((el) => ({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 90),
          rect: el.getBoundingClientRect().toJSON(),
        }));
      return {
        width: innerWidth,
        document: document.documentElement.scrollWidth,
        clipped,
      };
    });
    states.push({ state, ...metrics });
    await page
      .locator(".preview-panel")
      .screenshot({
        path: `${OUT}/${item.name}-${state}.png`,
        animations: "disabled",
      });
  }
  try {
    const response = await page.goto(`${BASE}/experiments/${item.name}`, {
      waitUntil: "networkidle",
    });
    await page.locator("#demo-root").waitFor();
    await inspect("1440");
    const sliders = page.locator(".preview-controls input[type=range]");
    for (let i = 0; i < (await sliders.count()); i++) {
      await sliders.nth(i).focus();
      await sliders.nth(i).press("Home");
      await sliders.nth(i).press("End");
    }
    for (const group of await page
      .locator(".preview-controls .control-seg")
      .all())
      for (const b of await group.locator("button").all()) await b.click();
    for (const box of await page
      .locator(".preview-controls input[type=checkbox]")
      .all()) {
      await box.locator("..").click();
      await box.locator("..").click();
    }
    await inspect("controls-max");
    for (const s of await sliders.all()) {
      await s.focus();
      await s.press("Home");
    }
    await inspect("controls-min");
    if (
      await page
        .getByRole("button", { name: "Reset controls", exact: true })
        .count()
    )
      await page
        .getByRole("button", { name: "Reset controls", exact: true })
        .click();
    const actions = [];
    for (const button of (await page.locator("#demo-root button").all()).slice(
      0,
      8,
    )) {
      try {
        if ((await button.isVisible()) && (await button.isEnabled())) {
          const text = await button.innerText();
          await button.click({ timeout: 700 });
          actions.push(text);
          await page.keyboard.press("Escape");
        }
      } catch (e) {
        actions.push("unavailable: " + e.message.slice(0, 100));
      }
    }
    if (
      await page.getByRole("button", { name: "Narrow", exact: true }).count()
    ) {
      await page.getByRole("button", { name: "Narrow", exact: true }).click();
      await inspect("narrow");
      await page.getByRole("button", { name: "Wide", exact: true }).click();
    }
    for (const width of [820, 390, 320, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await inspect(String(width));
    }
    results.push({
      slug: item.name,
      status: response.status(),
      states,
      actions,
      errors,
    });
    console.log(
      item.name,
      states.reduce((n, s) => n + s.clipped.length, 0),
      "clipped candidates",
      errors.length,
      "errors",
    );
  } catch (e) {
    results.push({ slug: item.name, error: e.stack, states, errors });
    console.log("ERROR", item.name, e.message.slice(0, 120));
  } finally {
    await page.close();
  }
}
await Promise.all(
  [0, 1].map(async () => {
    while (queue.length) await audit(queue.shift());
  }),
);
await browser.close();
await writeFile(`${OUT}/inventory.json`, JSON.stringify(results, null, 2));
console.log(results.length, "components audited");
