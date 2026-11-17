import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const results = [];
const BASE = process.env.LAB_QA_URL || "http://127.0.0.1:3300";
const OUT = process.env.LAB_QA_OUT || "output/lab-v2";
const registry=await(await page.request.get(BASE+'/r/registry.json')).json();
for (const route of [
  "/",
  "/play/data-matter",
  "/play/vector-kitchen",
  "/play/interface-genome",
  "/play/motion-foundry",
  "/play/type-has-mass",
  "/play/browser-terrarium",
  "/play/the-cost-of-a-click",
  "/play/sticker-city",
  "/play/almost-nothing",
  "/play/grid-crimes",
  "/play/brutal-exe",
  "/components",
  "/experiments/signal-field",
  ...registry.items.map(item=>`/preview/${item.name}`),
]) {
  await page.goto(BASE + route, {
    waitUntil: "networkidle",
  });
  await page.addScriptTag({
    path: require.resolve("axe-core/axe.min.js"),
  });
  const axe = await page.evaluate(() =>
    axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
    }),
  );
  const violations = axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      summary: n.failureSummary,
    })),
  }));
  results.push({ route, violations });
  console.log(route, JSON.stringify(violations));
}
await writeFile(`${OUT}/accessibility.json`, JSON.stringify(results, null, 2));
await browser.close();
if (results.some((result) => result.violations.length)) process.exitCode = 1;
