import { chromium } from "playwright";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
await page.waitForSelector(".dm-stage canvas");
await page.waitForTimeout(1500);
await page.locator(".dm-data-table-wrap > summary").click();
await page.waitForTimeout(400);
await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
const violations = await page.evaluate(async () => {
  const result = await window.axe.run(document.querySelector(".world-data"), {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  });
  return result.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
  }));
});
console.log(JSON.stringify(violations, null, 2));
await browser.close();
