/**
 * AFTERCLICK Studio browser QA.
 * Expects the dev server or a production build on --base-url (default 3100).
 */
import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseRecording } from "../lib/afterclick/schema.ts";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};
const BASE = arg("base-url", "http://localhost:3100").replace(/\/$/, "");
const out = path.join(repo, "qa", "afterclick");
await mkdir(out, { recursive: true });

const failures = [];
const checks = [];
const check = (condition, message) => {
  checks.push(`${condition ? "PASS" : "FAIL"} ${message}`);
  if (!condition) failures.push(message);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  acceptDownloads: true,
});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

try {
  const response = await page.goto(`${BASE}/play/afterclick`, {
    waitUntil: "networkidle",
  });
  check(response?.ok(), "Studio route responds 200");
  await page.waitForSelector(".ac-map-column", { timeout: 15000 });
  check((await page.locator(".ac-map-column").count()) >= 4, "state map renders action columns");
  check((await page.locator(".ac-timeline-row").count()) > 10, "timeline renders events");
  check(
    (await page.locator(".ac-recording-title").innerText()).toLowerCase().includes("harbor"),
    "sample recording loaded",
  );

  await page.screenshot({
    path: path.join(out, "studio-desktop.png"),
    fullPage: true,
    animations: "disabled",
  });

  // Keyboard movement in the timeline
  const firstSelected = await page.locator(".ac-timeline-row[aria-selected='true']").first();
  await firstSelected.focus();
  const before = await firstSelected.getAttribute("data-event-id");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  const after = await page
    .locator(".ac-timeline-row[aria-selected='true']")
    .first()
    .getAttribute("data-event-id");
  check(after && after !== before, "timeline arrow-key selection moves");
  check(
    (await page.locator(".ac-inspector").innerText()).length > 80,
    "inspector updates with selection",
  );

  // End-to-end handoff: the JSON exported by the real extension in the
  // acceptance run must be importable before any Studio-created export exists.
  const extensionExport = existsSync(path.join(out, "exported-recording.json"))
    ? path.join(out, "exported-recording.json")
    : path.join(repo, "lib", "afterclick", "sample-recording.json");
  await page.locator("input[type=file]").setInputFiles(extensionExport);
  await page.waitForTimeout(500);
  check(
    (await page.locator(".ac-notice").innerText()).includes("Imported"),
    "extension-exported JSON imports into the Studio",
  );
  check(
    (await page.locator(".ac-recording-title").innerText()).toLowerCase().includes("harbor"),
    "extension-exported recording is readable",
  );

  // Select the lost action and verify the honest absence copy
  await page.getByRole("option", { name: /Clicked .*Save address/ }).click();
  await page.waitForTimeout(200);
  const inspectorText = await page.locator(".ac-inspector").innerText();
  check(inspectorText.includes("No observed DOM change"), "lost feedback state is explained");
  check(
    inspectorText.includes("measured absence"),
    "absence is not presented as proof",
  );

  // Annotation
  const note = "The save gave me no visible confirmation; I clicked it twice.";
  await page.locator("#ac-annotation-text").fill(note);
  await page.getByRole("button", { name: "Add annotation" }).click();
  await page.waitForTimeout(250);
  check(
    (await page.locator(".ac-annotation-list").innerText()).includes("no visible confirmation"),
    "annotation added to selected event",
  );

  // JSON export
  const jsonDownload = page.waitForEvent("download");
  await page.locator("details.ac-export summary").click();
  await page.getByRole("button", { name: "Export portable JSON recording" }).click();
  const json = await jsonDownload;
  const jsonPath = path.join(out, "studio-export.json");
  await json.saveAs(jsonPath);
  const parsed = parseRecording(JSON.parse(await readFile(jsonPath, "utf8")));
  check(parsed.ok, "exported JSON is a valid v1 recording");
  if (parsed.ok) {
    check(parsed.recording.annotations.length === 1, "exported JSON includes annotation");
  }

  // Import the same file back
  await page.locator("input[type=file]").setInputFiles(jsonPath);
  await page.waitForTimeout(500);
  check(
    (await page.locator(".ac-notice").innerText()).includes("Imported"),
    "valid recording import succeeds",
  );
  check(
    (await page.locator(".ac-recording-title").innerText()).toLowerCase().includes("harbor"),
    "imported recording replaces the sample",
  );

  // Malformed import must not lose the current recording
  await page.locator("input[type=file]").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{ this is not json"),
  });
  await page.waitForTimeout(400);
  check(
    (await page.locator(".ac-notice").innerText()).toLowerCase().includes("not valid json"),
    "malformed JSON produces a clear error",
  );
  check(
    (await page.locator(".ac-recording-title").innerText()).toLowerCase().includes("harbor"),
    "malformed import keeps the current recording",
  );

  // Unsupported version
  await page.locator("input[type=file]").setInputFiles({
    name: "future.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ schema: "afterclick.recording", version: 99, events: [] }),
    ),
  });
  await page.waitForTimeout(400);
  check(
    (await page.locator(".ac-notice").innerText()).toLowerCase().includes("newer"),
    "unknown schema version is rejected with guidance",
  );

  // PNG report
  const pngDownload = page.waitForEvent("download");
  await page.locator("details.ac-export summary").click();
  await page.getByRole("button", { name: "Export PNG report" }).click();
  const png = await pngDownload;
  const pngPath = path.join(out, "studio-report.png");
  await png.saveAs(pngPath);
  const pngBuffer = await readFile(pngPath);
  check(
    pngBuffer[0] === 0x89 && pngBuffer.toString("ascii", 1, 4) === "PNG",
    "PNG report is a real PNG",
  );
  check(pngBuffer.length > 50000, "PNG report contains rendered content");

  // HTML report
  const htmlDownload = page.waitForEvent("download");
  await page.locator("details.ac-export summary").click();
  await page.getByRole("button", { name: "Export self-contained HTML report" }).click();
  const html = await htmlDownload;
  const htmlPath = path.join(out, "studio-report.html");
  await html.saveAs(htmlPath);
  const htmlText = await readFile(htmlPath, "utf8");
  check(htmlText.includes("<!doctype html>"), "HTML report is a complete document");
  check(htmlText.includes("no visible confirmation"), "HTML report includes annotations");
  check(htmlText.includes("Consequence map"), "HTML report renders the consequence map");
  check(htmlText.includes("Full event table"), "HTML report preserves the full event table");
  check(!/<script/i.test(htmlText), "HTML report contains no scripts");
  check(!/<link[^>]+href="https?:/i.test(htmlText), "HTML report loads no remote styles");

  // Mobile review
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${BASE}/play/afterclick`, { waitUntil: "networkidle" });
  await mobile.waitForSelector(".ac-map-column");
  const overflow = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(overflow.scrollWidth <= overflow.clientWidth + 1, "mobile page has no horizontal overflow");
  await mobile.screenshot({
    path: path.join(out, "studio-mobile.png"),
    fullPage: true,
    animations: "disabled",
  });
  await mobile.locator(".ac-timeline-row").first().click();
  await mobile.waitForTimeout(800);
  check(
    await mobile.locator(".ac-inspector").isVisible(),
    "mobile inspector remains reachable",
  );

  // Accessibility audit
  const axeSource = await readFile(
    path.join(repo, "node_modules", "axe-core", "axe.min.js"),
    "utf8",
  );
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
  });
  const serious = (axe.violations ?? []).filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  check(
    serious.length === 0,
    `no serious/critical axe violations (${serious.map((item) => item.id).join(", ")})`,
  );
  await writeFile(
    path.join(out, "axe.json"),
    `${JSON.stringify(
      (axe.violations ?? []).map((item) => ({
        id: item.id,
        impact: item.impact,
        help: item.help,
        nodes: item.nodes.length,
        targets: item.nodes.slice(0, 20).map((node) => ({
          target: node.target,
          failure: node.failureSummary,
        })),
      })),
      null,
      2,
    )}\n`,
  );

  check(consoleErrors.length === 0, `no console errors (${consoleErrors.slice(0, 3).join(" | ")})`);
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  await browser.close();
}

await writeFile(
  path.join(out, "studio-qa.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), checks, failures }, null, 2)}\n`,
);
if (failures.length) {
  console.error("AFTERCLICK Studio QA FAILED");
  for (const check of checks) console.log(check);
  process.exitCode = 1;
} else {
  console.log(`AFTERCLICK Studio QA passed (${checks.length} checks)`);
  for (const check of checks) console.log(`  ${check}`);
}
