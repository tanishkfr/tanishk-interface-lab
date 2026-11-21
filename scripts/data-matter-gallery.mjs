import { chromium } from "playwright";
const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const OUT = "output/data-matter-v2/screenshots";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
await page.waitForSelector(".dm-stage canvas");
await page.waitForTimeout(2200);
await page.mouse.move(20, 20);
const shots = [];
async function shoot(name) {
  await page.waitForTimeout(650);
  await page.locator(".dm-stage").screenshot({ path: `${OUT}/${name}@2x.png` });
  shots.push(name);
}
await shoot("gallery-terrain-strata");
for (const [label, file] of [
  ["Porcelain", "gallery-terrain-porcelain"],
  ["Blueprint", "gallery-terrain-blueprint"],
]) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await shoot(file);
}
await page.getByRole("button", { name: "Strata", exact: true }).click();
await page.getByRole("button", { name: "Fossil", exact: true }).click();
await page.waitForTimeout(1300);
await shoot("gallery-fossil-strata");
for (const [label, file] of [
  ["Porcelain", "gallery-fossil-porcelain"],
  ["Blueprint", "gallery-fossil-blueprint"],
]) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await shoot(file);
}
await page.getByRole("button", { name: "Strata", exact: true }).click();
await page.getByRole("button", { name: "Terrain", exact: true }).click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Enter capture mode" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/gallery-capture@2x.png` });
console.log(shots.join("\n"));
await browser.close();
