import { chromium } from "playwright";
import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const OUT = "output/data-matter-v2";
const SHOTS = `${OUT}/screenshots`;
const EXPORTS = `${OUT}/exports`;
await mkdir(SHOTS, { recursive: true });
await mkdir(EXPORTS, { recursive: true });

const results = [];
const errors = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push("PAGEERROR " + error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push("CONSOLE " + message.text().slice(0, 400));
});

async function open() {
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(2200);
}

async function download(name, action) {
  const pending = page.waitForEvent("download", { timeout: 30000 });
  await action();
  const item = await pending;
  const file = path.join(EXPORTS, name);
  await item.saveAs(file);
  return file;
}

async function readPngSize(file) {
  const buffer = await readFile(file);
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

await open();
check("desktop loads with one WebGL canvas", (await page.locator(".dm-stage canvas").count()) === 1);
check("no console errors on load", errors.length === 0, errors.join(" | "));
await page.screenshot({ path: `${SHOTS}/desktop-full.png`, fullPage: true });
await page.locator(".dm-stage").screenshot({ path: `${SHOTS}/desktop-terrain-strata.png` });

// Data strip hover + selection
await page.locator(".dm-datum button").nth(5).hover();
await page.waitForTimeout(350);
const pill = await page.locator(".dm-datum-pill").innerText().catch(() => "");
const pillVisible = await page.locator('.dm-datum-pill[data-visible="true"]').count();
check("hovering a data value highlights its pin", pillVisible === 1, pill.replace(/\n/g, " "));
await page.locator(".dm-datum button").nth(5).click();
await page.waitForTimeout(300);
check(
  "selecting a value opens the synchronized editor",
  (await page.getByRole("spinbutton", { name: "Value for Sat" }).count()) === 1,
);
await page.locator(".dm-stage").screenshot({ path: `${SHOTS}/desktop-selected.png` });

// Numeric edit
const editor = page.getByRole("spinbutton", { name: "Value for Sat" });
await editor.fill("122");
await editor.press("Enter");
await page.waitForTimeout(900);
const stripValues = await page.locator(".dm-datum strong").allInnerTexts();
check("numeric edit updates the canonical value", stripValues[5] === "122", stripValues.join(","));
check("undo becomes available after an edit", (await page.getByRole("button", { name: "Undo" }).isEnabled()));

await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(900);
const afterUndo = await page.locator(".dm-datum strong").allInnerTexts();
check("undo restores the previous value", afterUndo[5] === "110", afterUndo.join(","));
await page.getByRole("button", { name: "Redo" }).click();
await page.waitForTimeout(900);
const afterRedo = await page.locator(".dm-datum strong").allInnerTexts();
check("redo reapplies the edit", afterRedo[5] === "122", afterRedo.join(","));
await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(900);

// Keyboard
await page.locator(".dm-stage").focus();
await page.keyboard.press("Home");
await page.waitForTimeout(250);
const keyboardLabel = await page.locator(".dm-inspector-name").innerText();
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(250);
const nextLabel = await page.locator(".dm-inspector-name").innerText();
await page.keyboard.press("ArrowUp");
await page.waitForTimeout(700);
const keyboardAfter = await page.locator(".dm-datum strong").allInnerTexts();
check("keyboard selects a datum", keyboardLabel === "Mon" && nextLabel === "Tue", `${keyboardLabel}->${nextLabel}`);
check("keyboard adjusts the selected value", Number(keyboardAfter[1]) === 59, keyboardAfter.join(","));
await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(700);

// Direct sculpt
await page.getByRole("button", { name: "Sculpt" }).click();
await page.waitForTimeout(300);
const stageBox = await page.locator(".dm-stage").boundingBox();
const before = (await page.locator(".dm-datum strong").allInnerTexts()).reduce(
  (sum, value) => sum + Number(value.replace(/,/g, "")),
  0,
);
const px = stageBox.x + stageBox.width * 0.58;
const py = stageBox.y + stageBox.height * 0.55;
await page.mouse.move(px, py);
await page.waitForTimeout(250);
await page.mouse.down();
await page.mouse.move(px, py - 70, { steps: 16 });
await page.mouse.up();
await page.waitForTimeout(1200);
const after = (await page.locator(".dm-datum strong").allInnerTexts()).reduce(
  (sum, value) => sum + Number(value.replace(/,/g, "")),
  0,
);
check("direct drag changes a datum continuously", after > before, `${before} -> ${after}`);
const selectedAfterSculpt = await page.locator(".dm-inspector-name").innerText().catch(() => "");
check("direct drag selects the affected datum", selectedAfterSculpt.length > 0, selectedAfterSculpt);
await page.screenshot({ path: `${SHOTS}/desktop-after-sculpt.png` });
await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(900);
const restored = (await page.locator(".dm-datum strong").allInnerTexts()).reduce(
  (sum, value) => sum + Number(value.replace(/,/g, "")),
  0,
);
check("undo restores a whole drag gesture", restored === before, `${restored} vs ${before}`);
await page.getByRole("button", { name: "Orbit" }).click();
await page.waitForTimeout(300);

// Material and formation gallery
const materialShots = [
  ["Porcelain", "porcelain"],
  ["Blueprint", "blueprint"],
];
for (const [label, file] of materialShots) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(800);
  await page.locator(".dm-stage").screenshot({ path: `${SHOTS}/terrain-${file}.png` });
}
await page.getByRole("button", { name: "Strata", exact: true }).click();
await page.waitForTimeout(700);

const formationShots = [
  ["Porcelain", "fossil-porcelain"],
  ["Blueprint", "fossil-blueprint"],
  ["Strata", "fossil-strata"],
];
await page.getByRole("button", { name: "Fossil", exact: true }).click();
await page.waitForTimeout(1300);
for (const [label, file] of formationShots) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(800);
  await page.locator(".dm-stage").screenshot({ path: `${SHOTS}/${file}.png` });
}
await page.screenshot({ path: `${SHOTS}/desktop-fossil.png`, fullPage: true });
await page.getByRole("button", { name: "Terrain", exact: true }).click();
await page.waitForTimeout(1200);

// Preset
await page.getByLabel("Example sculpture").selectOption("needles");
await page.waitForTimeout(1400);
check("preset switches the canonical row count", (await page.locator(".dm-datum").count()) === 12);
await page.locator(".dm-stage").screenshot({ path: `${SHOTS}/terrain-needles.png` });
await page.getByLabel("Example sculpture").selectOption("week");
await page.waitForTimeout(1200);

// CSV validation and apply
await page.getByText("Edit data or load a CSV").click();
const csv = page.getByRole("textbox", { name: "Your numbers" });
await csv.fill("a,-1\nb,3");
await page.getByRole("button", { name: "Build this landscape" }).click();
check("invalid CSV shows an accessible error", (await page.locator('.instrument-error[role="alert"]').count()) === 1);
await csv.fill("label,value\nMorning,10\nAfternoon,80\nEvening,35");
await page.getByRole("button", { name: "Build this landscape" }).click();
await page.waitForTimeout(1200);
check("valid CSV rebuilds the canonical dataset", (await page.locator(".dm-datum").count()) === 3);
check("CSV error clears", (await page.locator('.instrument-error[role="alert"]').count()) === 0);

// Exports
const svgFile = await download("data-matter-2d-study.svg", () =>
  page.getByRole("button", { name: "Export SVG", exact: true }).click(),
);
const svg = await readFile(svgFile, "utf8");
check(
  "SVG export is labelled 2D and contains real vectors",
  svg.includes("2D VECTOR STUDY") && svg.includes("<polyline") && svg.includes("Morning: 10") && !svg.includes("NaN"),
);
const jsonFile = await download("data-matter.json", () =>
  page.getByRole("button", { name: "Export data + settings" }).click(),
);
const json = JSON.parse(await readFile(jsonFile, "utf8"));
check(
  "JSON export carries the same rows, relief, formation, material and camera",
  json.data[1].value === 80 && json.height === 170 && json.formation === "Terrain" && json.material === "Strata" && json.camera,
);

// Capture mode
await page.getByRole("button", { name: "Enter capture mode" }).click();
await page.waitForTimeout(900);
check("capture mode becomes a full-screen studio", (await page.locator(".world-data.is-capture").count()) === 1);
check("capture mode hides the instrument panel", (await page.locator(".dm-panel").count()) === 0);
await page.screenshot({ path: `${SHOTS}/capture-mode.png` });
const pngFile = await download("data-matter-capture.png", () =>
  page.getByRole("button", { name: "Download PNG" }).click(),
);
const pngSize = await readPngSize(pngFile);
check("high-resolution PNG exports", pngSize?.width === 2400 && pngSize?.height === 1600, JSON.stringify(pngSize));
const posterFile = await download("data-matter-poster.png", () =>
  page.getByRole("button", { name: "Download poster" }).click(),
);
const posterSize = await readPngSize(posterFile);
check("poster exports at print composition", posterSize?.width === 2000 && posterSize?.height === 2500, JSON.stringify(posterSize));
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
check("Escape leaves capture mode", (await page.locator(".world-data.is-capture").count()) === 0);

// Idle render check
await page.waitForTimeout(2200);
await page.evaluate(() => {
  window.__dmRaf = 0;
  const original = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    window.__dmRaf += 1;
    return original(callback);
  };
});
await page.waitForTimeout(1200);
const idleRaf = await page.evaluate(() => window.__dmRaf);
check("idle scene stops requesting animation frames", idleRaf === 0, `${idleRaf} frames / 1.2s`);

// A11y
const axePath = require.resolve("axe-core/axe.min.js");
await page.addScriptTag({ path: axePath });
const axe = await page.evaluate(async () => {
  const results = await window.axe.run(document.querySelector(".world-data"), {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  });
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
    help: violation.help,
  }));
});
check("no serious or critical automated accessibility violations", !axe.some((v) => v.impact === "serious" || v.impact === "critical"), JSON.stringify(axe));

console.log("\nERRORS", JSON.stringify(errors, null, 2));
console.log("\nREPORT", JSON.stringify(results, null, 2));
await browser.close();
