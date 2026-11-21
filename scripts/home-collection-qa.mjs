import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push("PAGEERROR " + error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push("CONSOLE " + message.text().slice(0, 400));
});
await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector(".gallery-spread");
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(900);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

const count = async (selector) => page.locator(selector).count();
const snapshot = async () => ({
  cells: await count(".gallery-cell"),
  clusters: await count(".gallery-cluster"),
  exhibits: await count(".staggered-gallery .exhibit"),
  spreads: await count(".gallery-spread"),
  indexRows: await count(".project-index > a"),
  empty: await count(".collection-empty"),
  componentRows: await count(".component-links > a"),
});

const results = { default: await snapshot() };

await page.getByRole("button", { name: /^Tools/ }).click();
await page.waitForTimeout(250);
results.tools = await snapshot();
await page.getByRole("button", { name: /^Experiments/ }).click();
await page.waitForTimeout(250);
results.experiments = await snapshot();
await page.getByRole("button", { name: /^Components/ }).click();
await page.waitForTimeout(250);
results.components = await snapshot();
await page.getByRole("button", { name: /^Everything/ }).click();
await page.getByLabel("Search the collection").fill("data");
await page.waitForTimeout(250);
results.searchData = await snapshot();
await page.getByRole("button", { name: "Index" }).click();
await page.waitForTimeout(250);
results.indexData = await snapshot();
await page.getByRole("button", { name: "Gallery" }).click();
await page.getByLabel("Search the collection").fill("");
await page.waitForTimeout(350);
results.reset = await snapshot();

await page.addScriptTag({ content: axeSource });
const axe = await page.evaluate(async () => {
  const results = await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  });
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
    help: violation.help,
    targets: violation.nodes.slice(0, 4).map((node) => node.target.join(" ")),
  }));
});
console.log(JSON.stringify({ results, axe, errors }, null, 2));
await browser.close();
