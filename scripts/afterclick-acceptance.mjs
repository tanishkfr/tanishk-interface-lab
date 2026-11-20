/**
 * AFTERCLICK extension acceptance.
 *
 * This exercises the real built extension in Chromium against a local fixture:
 * start, capture, checkpoint, stop, export, and privacy checks. Chromium cannot
 * grant `activeTab` without a real toolbar invocation, so this harness loads a
 * copy of the build with a localhost-only host permission. The production
 * manifest in dist/ (and the downloadable ZIP) keeps the minimal permission
 * set; `tests/afterclick.test.ts` validates that separately.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseRecording, serializeRecording } from "../lib/afterclick/schema.ts";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(repo, "extensions", "afterclick", "dist");
const qa = path.join(repo, "qa", "afterclick");
const testExtension = path.join(qa, "test-extension");
const profile = path.join(qa, "profile");
const reportPath = path.join(qa, "acceptance.json");
const samplePath = path.join(repo, "lib", "afterclick", "sample-recording.json");

const failures = [];
const notes = [];
const check = (condition, message) => {
  if (condition) notes.push(`PASS ${message}`);
  else failures.push(message);
};

if (!existsSync(path.join(dist, "manifest.json"))) {
  throw new Error("Build the extension first: pnpm --dir extensions/afterclick run build");
}

const fixture = await readFile(
  path.join(repo, "extensions", "afterclick", "qa", "fixture.html"),
  "utf8",
);
const server = createServer((request, response) => {
  if (request.url === "/" || request.url?.startsWith("/receipt")) {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture);
    return;
  }
  response.writeHead(404);
  response.end("Not found");
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const fixtureUrl = `http://127.0.0.1:${port}/`;

await rm(qa, { recursive: true, force: true });
await mkdir(qa, { recursive: true });
await cp(dist, testExtension, { recursive: true });
const testManifest = JSON.parse(await readFile(path.join(testExtension, "manifest.json"), "utf8"));
testManifest.host_permissions = ["http://127.0.0.1/*"];
await writeFile(
  path.join(testExtension, "manifest.json"),
  `${JSON.stringify(testManifest, null, 2)}\n`,
);
await cp(
  path.join(repo, "node_modules", "axe-core", "axe.min.js"),
  path.join(testExtension, "axe.min.js"),
);

const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 1440, height: 960 },
  args: [
    `--disable-extensions-except=${testExtension}`,
    `--load-extension=${testExtension}`,
    "--no-first-run",
    "--no-default-browser-check",
  ],
});

try {
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent("serviceworker", { timeout: 20000 });
  const extensionId = new URL(worker.url()).host;
  check(Boolean(extensionId), "MV3 service worker loaded");

  const page = await context.newPage();
  await page.goto(fixtureUrl);
  await page.waitForLoadState("domcontentloaded");
  check((await page.title()).includes("Harbor"), "fixture page loaded");

  const tabId = await worker.evaluate(async (url) => {
    const tabs = await chrome.tabs.query({});
    return tabs.find((tab) => tab.url === url)?.id ?? null;
  }, fixtureUrl);
  check(typeof tabId === "number", "fixture tab identified");

  const extensionPage = await context.newPage();
  await extensionPage.setViewportSize({ width: 384, height: 600 });
  await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`);
  try {
    await extensionPage.waitForSelector("#view-error:not([hidden])", { timeout: 5000 });
  } catch {
    // The assertion below reports the failure with context.
  }
  check(
    await extensionPage.locator("#view-error").isVisible(),
    "popup refuses an unsupported page with an explicit error state",
  );

  const refused = await extensionPage.evaluate(
    async (id) =>
      chrome.runtime.sendMessage({
        type: "AFTERCLICK_START",
        tabId: id,
        consent: false,
        feedbackText: true,
      }),
    tabId,
  );
  check(refused?.ok === false, "start without consent is rejected");

  const started = await extensionPage.evaluate(
    async (id) =>
      chrome.runtime.sendMessage({
        type: "AFTERCLICK_START",
        tabId: id,
        consent: true,
        feedbackText: true,
      }),
    tabId,
  );
  check(started?.ok === true, "recording started through the built background worker");
  check(started?.state?.active?.status === "recording", "popup state reports recording");

  // Accessibility audit of the built popup in its live recording state.
  // axe ships only in the test copy; the production build stays minimal and
  // its CSP correctly rejects inline injection.
  await extensionPage.addScriptTag({ url: "axe.min.js" });
  const popupAxe = await extensionPage.evaluate(async () =>
    await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    }),
  );
  const popupSerious = (popupAxe.violations ?? []).filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  check(
    popupSerious.length === 0,
    `popup has no serious axe violations (${popupSerious.map((item) => item.id).join(", ")})`,
  );
  await writeFile(
    path.join(qa, "popup-axe.json"),
    `${JSON.stringify(
      (popupAxe.violations ?? []).map((item) => ({
        id: item.id,
        impact: item.impact,
        nodes: item.nodes.length,
      })),
      null,
      2,
    )}\n`,
  );

  await page.bringToFront();
  await page.focus("#email");
  await page.waitForTimeout(250);

  await page.click("#apply-promo");
  await page.waitForTimeout(1200);

  await page.click("#save-address");
  await page.waitForTimeout(400);

  await page.click("#place-order");
  await page.waitForTimeout(2000);

  await page.click("#download-invoice");
  await page.waitForTimeout(2700);

  const checkpoint = await extensionPage.evaluate(async () =>
    chrome.runtime.sendMessage({
      type: "AFTERCLICK_CHECKPOINT",
      note: "Success state reached",
    }),
  );
  check(checkpoint?.ok === true, "manual checkpoint accepted");

  await page.click("#view-receipt");
  await page.waitForTimeout(900);

  await extensionPage.screenshot({
    path: path.join(qa, "popup-recording.png"),
    animations: "disabled",
  });

  const stopped = await extensionPage.evaluate(async () =>
    chrome.runtime.sendMessage({ type: "AFTERCLICK_STOP" }),
  );
  check(stopped?.ok === true, "recording stopped and saved");
  await extensionPage.waitForTimeout(1000);
  await extensionPage.screenshot({
    path: path.join(qa, "popup-complete.png"),
    animations: "disabled",
  });

  const exported = stopped?.state?.saved?.recording;
  check(Boolean(exported), "completed recording returned to the popup");
  const parsed = parseRecording(exported);
  check(parsed.ok, "completed recording passes the Studio parser");
  if (!parsed.ok) throw new Error(parsed.error);

  const recording = parsed.recording;
  const kinds = new Set(recording.events.map((event) => event.kind));
  check(kinds.has("click"), "clicks captured");
  check(kinds.has("focus"), "focus captured");
  check(kinds.has("control-disabled"), "disabled control state captured");
  check(kinds.has("loading-appeared"), "loading state captured");
  check(kinds.has("feedback-appeared"), "feedback state captured");
  check(kinds.has("route-change"), "SPA route change captured");
  check(kinds.has("checkpoint"), "manual checkpoint in the recording");

  const feedbackTypes = recording.events
    .filter((event) => event.kind === "feedback-appeared")
    .map((event) => event.data?.messageType);
  check(feedbackTypes.includes("error"), "error feedback inferred");
  check(feedbackTypes.includes("success"), "success feedback inferred");

  const serialized = serializeRecording(recording);
  for (const forbidden of [
    "mira@example.com",
    "hunter2-not-recorded",
    "SPRING24",
    "14 Harbour Walk",
    "hunter2",
  ]) {
    check(!serialized.includes(forbidden), `private value absent from recording: ${forbidden}`);
  }
  check(recording.capture.formValues === false, "manifest/recording declares no form values");
  check(recording.capture.keystrokes === false, "manifest/recording declares no keystrokes");
  check(recording.capture.screenshots === false, "recording declares no screenshots");

  const saveClick = recording.events.find(
    (event) => event.kind === "click" && event.target?.label === "Save address",
  );
  check(Boolean(saveClick), "silent action captured");
  const saveConsequences = recording.events.filter(
    (event) => saveClick && event.afterActionId === saveClick.id,
  );
  check(saveConsequences.length === 0, "silent action has no invented consequence");

  const orderClick = recording.events.find(
    (event) => event.kind === "click" && (event.target?.label ?? "").includes("Place order"),
  );
  check(Boolean(orderClick), "order action captured");
  if (orderClick) {
    const first = recording.events.find((event) => event.afterActionId === orderClick.id);
    check(Boolean(first && first.t > orderClick.t), "observed delay recorded from action");
  }

  const route = recording.events.find((event) => event.kind === "route-change");
  check(route?.data?.path === "/receipt", "route path observed as /receipt");

  recording.title = "Harbor & Pine — checkout review";
  recording.notes =
    "Sample captured from the local Harbor & Pine test fixture with the built v0.1.0 extension. The fixture contains fake values; the recording verifies they were not stored. The Save address and Download invoice controls intentionally omit feedback.";
  await writeFile(samplePath, serializeRecording(recording), "utf8");

  const downloadPromise = extensionPage.waitForEvent("download", { timeout: 15000 });
  await extensionPage.click("#export");
  const download = await downloadPromise;
  const downloadPath = path.join(qa, "exported-recording.json");
  await download.saveAs(downloadPath);
  const downloadedText = await readFile(downloadPath, "utf8");
  check(downloadedText.includes('"schema": "afterclick.recording"'), "extension JSON export downloaded");

  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        extensionId,
        testManifest: "dist copy + localhost host permission for automation",
        durationMs: recording.durationMs,
        eventCount: recording.events.length,
        actionCount: recording.events.filter((event) =>
          ["click", "shortcut", "submit"].includes(event.kind),
        ).length,
        feedbackTypes,
        checks: notes,
        failures,
      },
      null,
      2,
    )}\n`,
  );
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  await context.close();
  server.close();
}

if (failures.length) {
  console.error("AFTERCLICK acceptance FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`AFTERCLICK acceptance passed (${notes.length} checks)`);
  for (const note of notes) console.log(`  ${note}`);
  console.log(`  sample: ${path.relative(repo, samplePath)}`);
}
