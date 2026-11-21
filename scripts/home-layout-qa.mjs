import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const OUT = "output/home-layout";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const results = {};

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["tablet", 834, 1000],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(`${name} PAGEERROR ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error")
      errors.push(`${name} CONSOLE ${message.text().slice(0, 300)}`);
  });
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector(".gallery-spread");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}-home-full.png`, fullPage: true });
  if (name === "desktop") {
    await page.locator(".collection").screenshot({ path: `${OUT}/desktop-collection.png` });
    await page.locator(".gallery-spread").nth(1).screenshot({ path: `${OUT}/desktop-data-matter-row.png` });
  }
  const spreadCount = await page.locator(".gallery-spread").count();
  for (let index = 0; index < spreadCount; index += 1) {
    await page
      .locator(".gallery-spread")
      .nth(index)
      .screenshot({ path: `${OUT}/${name}-spread-${index + 1}.png` });
  }
  results[name] = await page.evaluate(() => {
    const spreads = Array.from(document.querySelectorAll(".gallery-spread")).map(
      (spread) => {
        const cells = Array.from(spread.querySelectorAll(".gallery-cell")).map((cell) => {
          const exhibit = cell.querySelector(".exhibit");
          const art = exhibit.querySelector(".exhibit-art");
          const image = art.querySelector("img");
          const r = exhibit.getBoundingClientRect();
          return {
            slug: exhibit.className.match(/exhibit--([\w-]+)/)?.[1],
            width: Math.round(r.width),
            height: Math.round(r.height),
            artHeight: Math.round(art.getBoundingClientRect().height),
            ratio: getComputedStyle(art).aspectRatio,
            imageLoaded: image ? image.complete && image.naturalWidth > 0 : null,
          };
        });
        return cells;
      },
    );
    const dataMatter = document.querySelector(".gallery-cell--data-matter .exhibit");
    const dataRect = dataMatter?.getBoundingClientRect();
    return {
      spreads,
      pageHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      dataMatterTop: dataRect ? Math.round(dataRect.top + window.scrollY) : null,
      image: (() => {
        const image = document.querySelector(".data-sculpture-preview");
        return image
          ? {
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              displayedWidth: Math.round(image.getBoundingClientRect().width),
              displayedHeight: Math.round(image.getBoundingClientRect().height),
            }
          : null;
      })(),
    };
  });
  await page.close();
}

console.log(JSON.stringify({ results, errors }, null, 2));
await browser.close();
