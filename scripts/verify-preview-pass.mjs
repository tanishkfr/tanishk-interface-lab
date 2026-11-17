import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://127.0.0.1:3301",
  OUT = "output/unreasonable/components";
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
const index = await (
  await context.request.get(BASE + "/r/registry.json")
).json();
const queue = [...index.items],
  results = [];
async function audit(item) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  page.setDefaultTimeout(20000);
  const errors = [],
    states = [],
    actions = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  try {
    await page.goto(`${BASE}/experiments/${item.name}`, {
      waitUntil: "networkidle",
    });
    const frame = page.frameLocator(".component-preview-frame");
    await frame.locator("#demo-root").waitFor();
    async function inspect(state) {
      const outer = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        clippedControls: [
          ...document.querySelectorAll(
            ".preview-controls button,.preview-controls input",
          ),
        ]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.width && r.height && (r.left < 0 || r.right > innerWidth + 1)
            );
          })
          .map((el) => el.textContent),
      }));
      const inner = await frame
        .locator("body")
        .evaluate(() => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
          rootScroll: document.querySelector("#demo-root").scrollWidth,
          height: document.querySelector("#demo-root").scrollHeight,
        }));
      states.push({ state, outer, inner });
      await page
        .locator(".preview-panel")
        .screenshot({
          path: `${OUT}/${item.name}-${state}.png`,
          animations: "disabled",
        });
    }
    await inspect("1440");
    for (const range of await page
      .locator(".preview-controls input[type=range]")
      .all()) {
      await range.press("End");
      await range.press("Home");
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
    await inspect("extreme");
    if (
      await page
        .getByRole("button", { name: "Reset controls", exact: true })
        .count()
    )
      await page
        .getByRole("button", { name: "Reset controls", exact: true })
        .click();
    await page.getByRole("tab", { name: "Configuration", exact: true }).click();
    const configuration = await page.locator(".preview-config").innerText();
    if (!configuration.includes("{"))
      throw Error("Configuration did not expose live values");
    await page.getByRole("tab", { name: "Preview", exact: true }).click();
    for (const button of (await frame.locator("#demo-root button").all()).slice(
      0,
      8,
    )) {
      try {
        if ((await button.isVisible()) && (await button.isEnabled())) {
          actions.push(await button.innerText());
          await button.click({ timeout: 1200 });
          await page.keyboard.press("Escape");
        }
      } catch (e) {
        actions.push("not reachable: " + e.message.slice(0, 80));
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
    results.push({ slug: item.name, states, actions, errors });
    console.log(
      item.name,
      errors.length,
      "errors",
      states.some(
        (s) => s.outer.scroll > s.outer.width || s.outer.clippedControls.length,
      )
        ? "OUTER OVERFLOW"
        : "bounded",
    );
  } catch (e) {
    results.push({ slug: item.name, error: e.stack, states, actions, errors });
    console.log("FAIL", item.name, e.message.slice(0, 180));
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
if (
  results.some(
    (r) =>
      r.error ||
      r.errors.length ||
      r.states.some(
        (s) =>
          s.outer.scroll > s.outer.width + 1 || s.outer.clippedControls.length,
      ),
  )
)
  process.exitCode = 1;
