import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
await mkdir("output/data-matter-v2/screenshots", { recursive: true });
const BASE = process.env.LAB_QA_URL || "http://localhost:3000";
const OUT = "output/data-matter-v2/screenshots";

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

// Mobile
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
   deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: `${OUT}/mobile-390-full.png`,
    fullPage: true,
  });
  const layout = await page.evaluate(() => {
    const stage = document.querySelector(".dm-stage")?.getBoundingClientRect();
    const panel = document.querySelector(".dm-panel")?.getBoundingClientRect();
    return {
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      stage: stage ? { top: stage.top, height: stage.height } : null,
      panel: panel ? { top: panel.top } : null,
      stripWidth: document.querySelector(".dm-data-strip")?.scrollWidth,
      stripClient: document.querySelector(".dm-data-strip")?.clientWidth,
    };
  });
  check("mobile has no horizontal page overflow", layout.overflowX <= 1, `${layout.overflowX}px`);
  check("mobile places the sculpture before the controls", (layout.stage?.top ?? 0) < (layout.panel?.top ?? 0));
  await page.locator(".dm-datum button").nth(4).tap();
  await page.waitForTimeout(500);
  check(
    "mobile tap selects a datum and opens the editor",
    (await page.getByRole("spinbutton", { name: "Value for Fri" }).count()) === 1,
  );
  await page.screenshot({ path: `${OUT}/mobile-390-selected.png` });
  check("mobile has no runtime errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// Tablet
{
  const context = await browser.newContext({ viewport: { width: 834, height: 1112 } });
  const page = await context.newPage();
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: `${OUT}/tablet-834-full.png`,
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("tablet has no horizontal page overflow", overflow <= 1, `${overflow}px`);
  await context.close();
}

// Reduced motion
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/desktop-reduced-motion.png` });
  check("reduced motion still renders the sculpture", (await page.locator(".dm-stage canvas").count()) === 1);
  check("reduced motion has no runtime errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// No WebGL fallback
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      ) {
        return null;
      }
      return original.call(this, type, ...args);
    };
  });
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-fallback", { timeout: 20000 });
  await page.waitForTimeout(800);
  const fallback = await page.evaluate(() => ({
    study: !!document.querySelector(".dm-fallback-study"),
    message: document.querySelector(".dm-availability")?.textContent ?? null,
    captureDisabled: document
      .querySelector(".dm-capture-button")
      ?.hasAttribute("disabled"),
    strip: document.querySelectorAll(".dm-datum").length,
  }));
  check("no-WebGL shows the vector study fallback", fallback.study);
  check("no-WebGL keeps the data strip available", fallback.strip === 7);
  check("no-WebGL disables 3D capture truthfully", fallback.captureDisabled === true);
  await page.screenshot({
    path: `${OUT}/no-webgl-fallback.png`,
    fullPage: true,
  });
  await context.close();
}

// Large dataset
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(1800);
  await page.getByText("Edit data or load a CSV").click();
  const rows = Array.from({ length: 64 }, (_, i) => `Point ${i + 1},${Math.round(30 + Math.abs(Math.sin(i / 6)) * 55 + (i % 7) * 6)}`).join("\n");
  await page.getByRole("textbox", { name: "Your numbers" }).fill(`label,value\n${rows}`);
  await page.getByRole("button", { name: "Build this landscape" }).click();
  await page.waitForTimeout(1600);
  await page.locator(".dm-data-table-wrap > summary").click();
  await page.waitForTimeout(250);
  const state = await page.evaluate(() => ({
    count: document.querySelectorAll(".dm-datum").length,
    tableRows: document.querySelectorAll(".dm-data-table tbody tr").length,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    stripScrollable:
      (document.querySelector(".dm-data-strip")?.scrollWidth ?? 0) >
      (document.querySelector(".dm-data-strip")?.clientWidth ?? 0),
  }));
  check("64-value dataset updates strip and table", state.count === 64 && state.tableRows === 64, JSON.stringify(state));
  check("64-value dataset does not break the page width", state.overflowX <= 1);
  check("64-value strip is horizontally scrollable", state.stripScrollable);
  await page.screenshot({
    path: `${OUT}/desktop-64-values-full.png`,
    fullPage: true,
  });
  await page.locator(".dm-stage").screenshot({
    path: `${OUT}/desktop-64-values-stage.png`,
  });
  await context.close();
}

// Context-loss recovery
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Blueprint", exact: true }).click();
  await page.waitForTimeout(500);
  await page.locator(".dm-datum button").nth(5).click();
  const recoveryEditor = page.getByRole("spinbutton", { name: "Value for Sat" });
  await recoveryEditor.fill("122");
  await recoveryEditor.press("Enter");
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const canvas = document.querySelector(".dm-stage canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await page.waitForTimeout(3000);
  const recovered = await page.evaluate(() => ({
    canvas: document.querySelectorAll(".dm-stage canvas").length,
    fallback: !!document.querySelector(".dm-fallback"),
    material:
      document
        .querySelector('.dm-material-grid button[aria-pressed="true"]')
        ?.textContent?.trim() ?? null,
    values: Array.from(document.querySelectorAll(".dm-datum strong")).map(
      (node) => node.textContent,
    ),
  }));
  check(
    "WebGL context loss recovers with a fresh renderer",
    recovered.canvas === 1 && recovered.fallback === false,
    JSON.stringify({ canvas: recovered.canvas, fallback: recovered.fallback }),
  );
  check(
    "context recovery preserves the current material and edited data",
    recovered.material === "Blueprint" && recovered.values?.[5] === "122",
    JSON.stringify({ material: recovered.material, sat: recovered.values?.[5] }),
  );
  await context.close();
}

// Performance approximation
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(BASE + "/play/data-matter", { waitUntil: "load" });
  await page.waitForSelector(".dm-stage canvas", { timeout: 20000 });
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    window.__frames = [];
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) =>
      original((time) => {
        window.__frames.push(time);
        callback(time);
      });
  });
  const box = await page.locator(".dm-stage").boundingBox();
  const cx = box.x + box.width * 0.58;
  const cy = box.y + box.height * 0.55;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const start = Date.now();
  for (let i = 0; i < 50; i++) {
    await page.mouse.move(cx + Math.sin(i / 5) * 60, cy + Math.cos(i / 7) * 15);
    await page.waitForTimeout(16);
  }
  const elapsed = Date.now() - start;
  await page.mouse.up();
  const frames = await page.evaluate(() => window.__frames.length);
  const fps = Math.round((frames / elapsed) * 1000);
  check("orbit interaction renders continuously", frames > 20, `${frames} frames / ${elapsed}ms`);
  console.log(`PERF approximate interaction rAF rate: ${fps} fps (headless, indicative only)`);
  await context.close();
}

console.log("\nREPORT", JSON.stringify(results, null, 2));
await browser.close();
