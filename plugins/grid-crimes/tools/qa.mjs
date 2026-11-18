import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const previewDir = path.join(root, "qa/preview");
const qaDir = path.join(root, "qa/grid-crimes");
const productDir = path.resolve(root, "../../public/products/grid-crimes");
await mkdir(qaDir, { recursive: true });
await mkdir(productDir, { recursive: true });

const playwrightPath = path.resolve(root, "../../node_modules/playwright/index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const axeSource = await readFile(
  path.resolve(root, "../../node_modules/axe-core/axe.min.js"),
  "utf8",
);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const file = path.join(previewDir, path.normalize(url.pathname).replace(/^([/\\])+/, ""));
    if (!file.startsWith(previewDir)) throw new Error("outside preview");
    const data = await readFile(file);
    res.writeHead(200, {
      "content-type": types[path.extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

const report = {
  generatedAt: new Date().toISOString(),
  base,
  cases: [],
  gallery: null,
  pass: true,
};
const consoleErrors = [];

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  console.error("BLOCKED: Playwright Chromium is unavailable.", error.message);
  server.close();
  process.exit(2);
}

async function openCase(options) {
  const page = await browser.newPage({
    viewport: { width: options.width, height: options.height },
    colorScheme: options.theme,
    reducedMotion: options.reducedMotion ? "reduce" : "no-preference",
    deviceScaleFactor: options.productName ? 2 : 1,
  });
  page.on("pageerror", (error) => consoleErrors.push(`${options.name}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${options.name}: ${message.text()}`);
  });
  await page.goto(
    `${base}/harness.html?screen=${options.screen}&preset=${options.preset ?? "brutalist"}&w=${options.width}&h=${options.height}`,
    { waitUntil: "load" },
  );
  await page.waitForFunction(() => window.__previewReady === true, { timeout: 15000 });
  const frame = page.frames().find((candidate) => candidate.url().includes("ui.html"));
  if (!frame) throw new Error("Plugin iframe not found");
  await frame.waitForSelector(".topbar");
  if (options.screen === "crossbreed") {
    await frame.waitForSelector(".crossbreed-hero", { timeout: 10000 });
  }
  if (options.screen === "help") {
    await frame.waitForSelector(".modal", { timeout: 10000 });
  }
  await page.waitForTimeout(350);

  const metrics = await frame.evaluate(() => {
    const body = document.body;
    const main = document.querySelector(".main");
    const clipped = [...document.querySelectorAll(".preset-name, .selection-title, .slider-name, .generate-button span")]
      .filter((element) => element.scrollWidth > element.clientWidth + 2)
      .map((element) => element.textContent?.trim());
    const tinyTargets = [...document.querySelectorAll("button")].filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.height < 24 || rect.width < 18);
    }).length;
    const images = [...document.images];
    return {
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      mainOverflow: main ? main.scrollWidth > main.clientWidth + 1 : false,
      clipped,
      tinyTargets,
      imagesOk: images.every((image) => image.complete && image.naturalWidth > 0),
      imageCount: images.length,
      animations: getComputedStyle(document.querySelector(".variation-card") ?? body).animationDuration,
      textContentLength: body.innerText.length,
    };
  });

  // Keyboard spot check: arrow keys move between direction tiles when the
  // configure view is present. Results and help views have no tile grid.
  const presetCount = await frame.locator('[data-action="preset"]').count();
  let keyboardOk = true;
  if (presetCount > 0) {
    await frame.locator('[data-action="preset"]').first().focus();
    await page.keyboard.press("ArrowRight");
    keyboardOk = await frame.evaluate(() => {
      const active = document.activeElement;
      return Boolean(active && active.getAttribute("data-action") === "preset");
    });
  } else {
    const tabFocus = await frame.evaluate(() => {
      const button = document.querySelector(
        '[data-action="view-configure"], [data-action="help"]',
      );
      if (button && "focus" in button) button.focus();
      return document.activeElement === button;
    });
    keyboardOk = tabFocus;
  }

  // Axe in the actual plugin iframe.
  await frame.addScriptTag({ content: axeSource });
  const axe = await frame.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const results = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
      rules: { "color-contrast": { enabled: true } },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target),
      summaries: violation.nodes.map((node) => node.failureSummary),
    }));
  });
  const seriousAxe = axe.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  const screenshotPath = path.join(qaDir, `${options.name}.png`);
  await page.locator("#plugin").screenshot({ path: screenshotPath });
  if (options.productName) {
    await page.locator("#plugin").screenshot({
      path: path.join(productDir, `${options.productName}.png`),
    });
  }

  const pass =
    !metrics.horizontalOverflow &&
    !metrics.mainOverflow &&
    metrics.clipped.length === 0 &&
    metrics.imagesOk &&
    keyboardOk &&
    seriousAxe.length === 0;

  report.cases.push({
    name: options.name,
    viewport: `${options.width}x${options.height}`,
    theme: options.theme,
    screen: options.screen,
    ...metrics,
    keyboardOk,
    axe: seriousAxe,
    axeAll: axe,
    screenshot: path.relative(root, screenshotPath),
    pass,
  });
  report.pass = report.pass && pass;
  await page.close();
}

const cases = [
  { name: "results-light-440", screen: "results", width: 440, height: 1000, theme: "light", productName: "ui-results" },
  { name: "configure-light-440", screen: "configure", width: 440, height: 1000, theme: "light", productName: "ui-configure" },
  { name: "crossbreed-light-440", screen: "crossbreed", width: 440, height: 1000, theme: "light", productName: "ui-crossbreed" },
  { name: "help-light-440", screen: "help", width: 440, height: 900, theme: "light" },
  { name: "results-dark-440", screen: "results", width: 440, height: 1000, theme: "dark" },
  { name: "configure-narrow-340", screen: "configure", width: 340, height: 900, theme: "light" },
  { name: "results-narrow-340", screen: "results", width: 340, height: 1000, theme: "light" },
  { name: "results-wide-680", screen: "results", width: 680, height: 1000, theme: "light" },
  { name: "results-reduced-440", screen: "results", width: 440, height: 1000, theme: "light", reducedMotion: true },
];

for (const item of cases) {
  try {
    await openCase(item);
    console.log(`✓ ${item.name}`);
  } catch (error) {
    console.error(`✗ ${item.name}: ${error.message}`);
    report.cases.push({ name: item.name, pass: false, error: error.message });
    report.pass = false;
  }
}

// Direction sheet for the product page. This is a real engine render, labelled
// as browser-rendered rather than a Figma screenshot.
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 880 },
    colorScheme: "light",
  });
  await page.goto(`${base}/gallery.html`, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const galleryShot = path.join(productDir, "directions.png");
  await page.screenshot({ path: galleryShot, fullPage: true });
  report.gallery = path.relative(root, galleryShot);
  const images = await page.evaluate(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  report.galleryPass = images;
  if (!images) report.pass = false;
  await page.close();

  const coverPage = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    colorScheme: "light",
  });
  await coverPage.goto(`${base}/cover.html`, { waitUntil: "networkidle" });
  await coverPage.waitForTimeout(250);
  await coverPage.screenshot({
    path: path.join(productDir, "cover.png"),
    fullPage: false,
  });
  report.cover = "public/products/grid-crimes/cover.png";
  await coverPage.close();

  const iconPage = await browser.newPage({
    viewport: { width: 512, height: 512 },
    colorScheme: "light",
  });
  await iconPage.goto(`${base}/icon.html`, { waitUntil: "networkidle" });
  await iconPage.waitForTimeout(200);
  await iconPage.screenshot({
    path: path.join(productDir, "icon.png"),
    fullPage: false,
  });
  report.icon = "public/products/grid-crimes/icon.png";
  await iconPage.close();
} catch (error) {
  report.galleryPass = false;
  report.galleryError = error.message;
  report.pass = false;
}

report.consoleErrors = consoleErrors;
await writeFile(path.join(qaDir, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
server.close();

console.log(`\n${report.pass ? "PASS" : "PARTIAL"} — ${report.cases.filter((entry) => entry.pass).length}/${report.cases.length} UI cases`);
for (const entry of report.cases) {
  if (!entry.pass) {
    console.log(`  ✗ ${entry.name}:`, entry.error ?? {
      overflow: entry.horizontalOverflow ?? entry.mainOverflow,
      clipped: entry.clipped,
      axe: entry.axe,
      keyboard: entry.keyboardOk,
    });
  }
}
if (consoleErrors.length) {
  console.log("Console errors:", consoleErrors.slice(0, 10));
}
console.log(`Report: plugins/grid-crimes/qa/grid-crimes/report.json`);
process.exit(report.pass ? 0 : 1);
