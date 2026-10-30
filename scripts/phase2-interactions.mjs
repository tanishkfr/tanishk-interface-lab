import assert from "node:assert/strict";
import { chromium } from "playwright";

const arg = (name, fallback) => process.argv.find((v) => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const base = arg("base-url", "http://localhost:3100");
const executablePath = arg("browser-executable", undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
try {
  await page.goto(`${base}/experiments/adaptive-composer`);
  const composer = page.locator(".ac-input");
  await composer.fill("review the plan tomorrow at 2pm; send the notes");
  assert.match(await page.locator(".ac-structure").innerText(), /more than one action/);
  await composer.fill("meet Ana tomorrow");
  assert.match(await page.locator(".ac-structure").innerText(), /missing a recognised day or time/);
  await composer.fill("translate this note into Japanese");
  assert.match(await page.locator(".ac-structure").innerText(), /No supported structure/);
  assert.equal(await composer.inputValue(), "translate this note into Japanese");

  await page.goto(`${base}/experiments/agent-review`);
  await page.locator(".ar-btn", { hasText: "Reject" }).click();
  assert.match(await page.locator(".ar-banner").innerText(), /rejected/i);
  assert.equal(await page.locator(".ar-root").evaluate((el) => el === document.activeElement), true);
  assert.equal(await page.locator(".ar-action-row").count(), 0);

  await page.goto(`${base}/experiments/progressive-action`);
  await page.getByText("Simulate a failure on the next run").click();
  await page.locator(".pa-main").click();
  await page.locator(".pa-action", { hasText: "Retry" }).waitFor();
  assert.match(await page.locator(".dm-pa-status").first().innerText(), /Simulated failure/);
  await page.locator(".pa-action", { hasText: "Retry" }).click();
  await page.locator(".pa-review").waitFor();
  await page.locator(".pa-review-actions .pa-action", { hasText: "Accept" }).click();
  await page.locator(".pa-action", { hasText: "Run again" }).click();
  assert.match(await page.locator(".dm-pa-status").first().innerText(), /Ready to run/);
  await page.locator(".pa-main").click();
  await page.locator(".pa-action", { hasText: "Cancel" }).click();
  assert.match(await page.locator(".dm-pa-status").first().innerText(), /Simulation stopped/);

  await page.goto(`${base}/experiments/spatial-command`);
  await page.locator("#demo-root button").first().click();
  await page.locator('[role="combobox"]').fill("zzzznotfound");
  assert.match(await page.locator(".cm-empty").innerText(), /No commands match/);
  assert.match(await page.locator(".cm-preview-body").innerText(), /No preview/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator('[role="dialog"]').count(), 0);

  await page.goto(`${base}/experiments/focus-stack`);
  assert.match(await page.locator(".fs-position").innerText(), /1 of 5/);
  await page.locator('[role="tab"][aria-selected="true"]').focus();
  await page.keyboard.press("ArrowRight");
  assert.match(await page.locator(".fs-position").innerText(), /2 of 5/);

  await page.goto(`${base}/experiments/lens-reveal`);
  const lens = page.locator(".lr-reveal");
  await lens.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await lens.getAttribute("data-focused"), "true");
  console.log("Phase 2 interaction checks passed");
} finally {
  await browser.close();
}
