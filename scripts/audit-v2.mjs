import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const results = [];
for (const route of [
  "/",
  "/play/data-matter",
  "/play/vector-kitchen",
  "/play/interface-genome",
  "/play/motion-foundry",
  "/play/type-has-mass",
  "/play/browser-terrarium",
  "/play/the-cost-of-a-click",
  "/components",
  "/experiments/signal-field",
]) {
  await page.goto("http://127.0.0.1:3300" + route, {
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
await writeFile(
  "output/lab-v2/accessibility.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
if (results.some(result => result.violations.length)) process.exitCode = 1;
