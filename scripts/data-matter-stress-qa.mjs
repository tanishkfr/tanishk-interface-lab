import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 300));
});
await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
await page.waitForSelector(".dm-stage canvas");
await page.waitForTimeout(1800);

// Rapid relief changes.
const relief = page.getByRole("slider", { name: "Relief" });
for (let i = 0; i < 6; i++) {
  await relief.press(i % 2 ? "Home" : "End");
  await page.waitForTimeout(45);
}
await page.waitForTimeout(900);
console.log("rapid relief settled:", await relief.evaluate((el) => el.value));

// Rapid formation/material switches, end on Fossil + Blueprint.
for (const name of ["Fossil", "Terrain", "Fossil", "Blueprint", "Porcelain", "Blueprint"]) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(80);
}
await page.waitForTimeout(1700);
const finalState = await page.evaluate(() => ({
  formation: Array.from(document.querySelectorAll(".dm-choice-row button")).find((b) => b.getAttribute("aria-pressed") === "true")?.textContent,
  material: document.querySelector('.dm-material-grid button[aria-pressed="true"]')?.textContent?.trim(),
  canvas: document.querySelectorAll(".dm-stage canvas").length,
  fallback: !!document.querySelector(".dm-fallback"),
}));
console.log("rapid switches final:", finalState);

// Fossil + Blueprint SVG export.
const pending = page.waitForEvent("download", { timeout: 20000 });
await page.getByRole("button", { name: "Export SVG", exact: true }).click();
const item = await pending;
await item.saveAs("output/data-matter-v2/exports/fossil-blueprint-study.svg");
const svg = await readFile("output/data-matter-v2/exports/fossil-blueprint-study.svg", "utf8");
console.log("fossil blueprint svg:", {
  labelled: svg.includes("FOSSIL / BLUEPRINT"),
  vectors: svg.includes("<path"),
  noNaN: !svg.includes("NaN"),
});

// Resize through desktop/tablet/phone and back.
for (const [w, h] of [[900, 1000], [390, 844], [1440, 1000]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(500);
  const sizes = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    canvas: (() => {
      const c = document.querySelector(".dm-stage canvas");
      return c ? { client: c.clientWidth, buffer: c.width } : null;
    })(),
  }));
  console.log("resize", w, h, sizes);
}
console.log("errors", errors);
await browser.close();
