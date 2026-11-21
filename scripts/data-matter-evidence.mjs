import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const OUT = "output/data-matter-v2";
await mkdir(`${OUT}/screenshots`, { recursive: true });
await mkdir(`${OUT}/exports`, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 300));
});
await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
await page.waitForSelector(".dm-stage canvas");
await page.waitForTimeout(2400);
await page.mouse.move(10, 10);
await page.screenshot({ path: `${OUT}/screenshots/final-desktop-full.png`, fullPage: true });

const stage = page.locator(".dm-stage");
await stage.screenshot({ path: `${OUT}/screenshots/final-stage.png` });

// Selection state
await page.locator(".dm-datum button").nth(5).click();
await page.waitForTimeout(500);
await page.screenshot({
  path: `${OUT}/screenshots/final-selected.png`,
  fullPage: false,
});
await page.locator(".dm-datum button").nth(5).hover();
await page.waitForTimeout(400);
await page.screenshot({
  path: `${OUT}/screenshots/final-hover.png`,
  fullPage: false,
});

// Fresh exports
async function download(name, action) {
  const pending = page.waitForEvent("download", { timeout: 30000 });
  await action();
  const item = await pending;
  const file = `${OUT}/exports/${name}`;
  await item.saveAs(file);
  return file;
}
const svgFile = await download("final-data-matter-2d-study.svg", () =>
  page.getByRole("button", { name: "Export SVG", exact: true }).click(),
);
const jsonFile = await download("final-data-matter.json", () =>
  page.getByRole("button", { name: "Export data + settings" }).click(),
);
const json = JSON.parse(await readFile(jsonFile, "utf8"));
const svg = await readFile(svgFile, "utf8");

// Capture / poster with the default weekly dataset
await page.getByRole("button", { name: "Enter capture mode" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/screenshots/final-capture.png` });
const pngFile = await download("final-data-matter-png.png", () =>
  page.getByRole("button", { name: "Download PNG" }).click(),
);
const posterFile = await download("final-data-matter-poster.png", () =>
  page.getByRole("button", { name: "Download poster" }).click(),
);
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

// Listing card
await page.goto(BASE + "/experiments", { waitUntil: "load" });
await page.waitForTimeout(800);
const card = page.locator(".exhibit--data-matter");
if (await card.count()) {
  await card.screenshot({ path: `${OUT}/screenshots/final-listing-card.png` });
}

const size = (buffer) =>
  buffer.toString("ascii", 1, 4) === "PNG"
    ? { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
    : null;
console.log(
  JSON.stringify(
    {
      errors,
      json: {
        rows: json.data.length,
        height: json.height,
        relief: json.relief,
        formation: json.formation,
        material: json.material,
        camera: json.camera,
      },
      svg: {
        bytes: svg.length,
        labelled: svg.includes("2D VECTOR STUDY"),
        consistsOfVectors: svg.includes("<polyline") && !svg.includes("<image"),
      },
      png: size(await readFile(pngFile)),
      poster: size(await readFile(posterFile)),
    },
    null,
    2,
  ),
);
await browser.close();
