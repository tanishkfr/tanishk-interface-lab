/**
 * QA — Playwright walkthrough for the Interface Lab.
 *
 * Runs against a production build of the Lab and captures the still
 * screenshot set plus one walkthrough video, while smoke-checking every
 * experiment route (console errors, horizontal overflow, registry JSON).
 *
 * Usage:
 *   node scripts/qa.mjs                       # expects http://localhost:3100
 *   node scripts/qa.mjs --base-url=http://…   # against any origin
 */

import { mkdir, rm, rename, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = join(ROOT, "qa", "screenshots");
const VIDEO_DIR = join(ROOT, "qa", "video");

const arg = (name, fallback) => {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const BASE = arg("base-url", "http://localhost:3100").replace(/\/$/, "");

const DESKTOP = { width: 1440, height: 960 };
const MOBILE = { width: 390, height: 844 };

const problems = [];
const check = (condition, message) => {
  if (!condition) problems.push(message);
};

function attachConsoleWatch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`[console] ${label}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    problems.push(`[pageerror] ${label}: ${error.message}`);
  });
}

async function overflow(page, label) {
  const result = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(
    result.scrollWidth <= result.clientWidth + 1,
    `[overflow] ${label}: ${result.scrollWidth} > ${result.clientWidth}`,
  );
}

async function shot(page, name) {
  await page.screenshot({
    path: join(SHOTS, name),
    animations: "disabled",
  });
  console.log(`  · ${name}`);
}

async function settle(page, ms = 700) {
  await page.waitForTimeout(ms);
}

async function run() {
  await rm(SHOTS, { recursive: true, force: true });
  await rm(VIDEO_DIR, { recursive: true, force: true });
  await mkdir(SHOTS, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch();
  const started = Date.now();
  const step = (label) =>
    console.log(`[${String((Date.now() - started) / 1000).padStart(5)}s] ${label}`);

  /* the registry index is the source of truth for what must exist */
  const indexResponse = await fetch(`${BASE}/r/registry.json`);
  check(indexResponse.ok, "[registry] index is not served");
  const index = await indexResponse.json();
  const experiments = index.items ?? [];
  check(
    experiments.length >= 12,
    `[registry] only ${experiments.length} experiments published`,
  );
  check(
    new Set(experiments.map((item) => item.name)).size === experiments.length,
    "[registry] duplicate experiment names in the index",
  );
  for (const item of experiments) {
    check(
      typeof item.description === "string" && item.description.length > 10,
      `[registry] ${item.name}: missing description`,
    );
    check(
      Array.isArray(item.files) && item.files.length > 0,
      `[registry] ${item.name}: no files listed`,
    );
  }

  /* ---------------- smoke + stills ---------------- */
  const context = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 2,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  attachConsoleWatch(page, "desktop");

  step("home");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 900);
  await shot(page, "01-lab-home-desktop.png");
  await page.evaluate(() => window.scrollTo(0, 1400));
  await settle(page, 900);
  await shot(page, "02-lab-home-mid-scroll.png");

  for (const experiment of experiments) {
    const label = experiment.name;
    const title = experiment.title ?? label;
    step(`experiment ${label}`);
    await page.goto(`${BASE}/experiments/${label}`, {
      waitUntil: "networkidle",
    });
    await settle(page, 800);

    const h1 = await page.locator("h1").first().textContent();
    check(
      (h1 ?? "").toLowerCase().includes(title.toLowerCase()),
      `[heading] ${label}: expected “${title}”, found “${h1}”`,
    );
    check(
      (await page.locator("#install").count()) === 1,
      `[install] ${label}: install section missing`,
    );
    await overflow(page, label);

    /* the registry item must exist and carry the shipped source */
    const item = await page.evaluate(async (slug) => {
      const response = await fetch(`/r/${slug}.json`);
      return { ok: response.ok, body: await response.json() };
    }, label);
    check(item.ok, `[registry] ${label}: /r/${label}.json not ok`);
    check(
      Array.isArray(item.body.files) &&
        item.body.files.length > 0 &&
        item.body.files.every((file) => file.content.length > 0),
      `[registry] ${label}: registry item is missing file contents`,
    );
  }

  /* the still set the brief asks for */
  const stills = [
    ["04-signal-field.png", "signal-field", null],
    ["05-soft-snap.png", "soft-snap", null],
    ["06-evidence-carousel.png", "evidence-carousel", null],
    ["07-inverted-cursor.png", "inverted-cursor", null],
    ["08-adaptive-composer.png", "adaptive-composer", null],
    ["09-agent-review.png", "agent-review", null],
    ["10-evidence-source.png", "evidence-source", null],
    ["11-command-menu.png", "spatial-command", "menu"],
    ["12-morphing-metadata.png", "morphing-metadata", "expanded"],
    ["13-contextual-dock.png", "contextual-dock", null],
    ["14-extra-experiment-01.png", "hold-to-confirm", null],
    ["15-extra-experiment-02.png", "focus-stack", null],
  ];

  for (const [file, slug, mode] of stills) {
    await page.goto(`${BASE}/experiments/${slug}`, {
      waitUntil: "networkidle",
    });
    await settle(page, 800);

    if (mode === "menu") {
      const trigger = page
        .locator("#demo-root button", { hasText: /command/i })
        .first();
      if (await trigger.count()) {
        await trigger.click();
        await settle(page, 700);
        check(
          (await page.locator('[role="dialog"]').count()) > 0,
          "[command-menu] the dialog did not open",
        );
      } else {
        problems.push("[command-menu] no trigger button found in #demo-root");
      }
    }
    if (mode === "expanded") {
      const toggle = page
        .locator("#demo-root button", { hasText: /details/i })
        .first();
      if (await toggle.count()) {
        await toggle.click().catch(() => {});
        await settle(page, 600);
        check(
          (await page.locator("#demo-root dl").count()) > 0,
          "[morphing-metadata] expanding did not reveal a detail list",
        );
      } else {
        problems.push("[morphing-metadata] no expand button found");
      }
    }
    await shot(page, file);
  }

  step("install + code + smoke checks");
  await page.goto(`${BASE}/experiments/signal-field`, {
    waitUntil: "networkidle",
  });
  await settle(page, 600);

  /* behavioural smoke checks: the interactions must actually work */
  await page.goto(`${BASE}/experiments/evidence-carousel`, {
    waitUntil: "networkidle",
  });
  await settle(page, 700);
  const counterBefore = await page
    .locator(".lab-carousel-count")
    .first()
    .innerText();
  await page.locator(".lab-carousel-btn").nth(1).click();
  await settle(page, 900);
  const counterAfter = await page
    .locator(".lab-carousel-count")
    .first()
    .innerText();
  check(
    counterBefore.trim() !== counterAfter.trim(),
    `[carousel] next did not move the strip (${counterBefore} → ${counterAfter})`,
  );

  await page.goto(`${BASE}/experiments/signal-field`, {
    waitUntil: "networkidle",
  });
  await settle(page, 500);
  await page.locator("#install").scrollIntoViewIfNeeded();
  await settle(page, 500);
  await shot(page, "16-install-section.png");
  await page.locator("#source").scrollIntoViewIfNeeded();
  await settle(page, 400);
  const firstSource = page.locator("#source details").first();
  if (await firstSource.count()) {
    await firstSource.locator("summary").click();
    await settle(page, 600);
  }
  await shot(page, "17-code-section.png");
  await context.close();

  /* ---------------- mobile ---------------- */
  step("mobile");
  const mobile = await browser.newContext({
    viewport: MOBILE,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  mobilePage.setDefaultTimeout(15000);
  attachConsoleWatch(mobilePage, "mobile");
  await mobilePage.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(mobilePage, 900);
  await shot(mobilePage, "03-lab-home-mobile.png");
  await mobilePage.goto(`${BASE}/experiments/adaptive-composer`, {
    waitUntil: "networkidle",
  });
  await settle(mobilePage, 800);
  const deviceSwitch = mobilePage.locator(".device-switch button", {
    hasText: /mobile/i,
  });
  if (await deviceSwitch.count()) {
    await deviceSwitch.first().click().catch(() => {});
    await settle(mobilePage, 500);
  }
  await overflow(mobilePage, "mobile detail");
  await shot(mobilePage, "18-mobile-detail.png");
  await mobile.close();

  /* ---------------- reduced motion ---------------- */
  step("reduced motion");
  const calm = await browser.newContext({
    viewport: DESKTOP,
    reducedMotion: "reduce",
  });
  const calmPage = await calm.newPage();
  calmPage.setDefaultTimeout(15000);
  attachConsoleWatch(calmPage, "reduced-motion");
  await calmPage.goto(`${BASE}/experiments/signal-field`, {
    waitUntil: "networkidle",
  });
  await settle(calmPage, 900);
  const canvasWidth = await calmPage.evaluate(() => {
    const canvas = document.querySelector("canvas.lab-signal-field");
    return canvas ? canvas.width : -1;
  });
  check(canvasWidth !== 0, "[reduced-motion] signal field canvas is empty");
  await calm.close();

  /* ---------------- walkthrough video ---------------- */
  step("walkthrough video");
  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  });
  const walk = await videoContext.newPage();
  walk.setDefaultTimeout(15000);
  const beat = (ms = 1100) => walk.waitForTimeout(ms);

  await walk.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await beat(1800);
  await walk.evaluate(() => window.scrollTo({ top: 1100, behavior: "smooth" }));
  await beat(1600);
  await walk.evaluate(() => window.scrollTo({ top: 2400, behavior: "smooth" }));
  await beat(1600);

  await walk.goto(`${BASE}/experiments/signal-field`, { waitUntil: "networkidle" });
  await beat(1400);
  await walk.mouse.move(900, 300);
  for (let i = 0; i < 26; i++) {
    await walk.mouse.move(900 - i * 22, 300 + Math.sin(i / 3) * 120, {
      steps: 2,
    });
  }
  await beat(700);
  const modeChoice = walk.locator(".preview-controls .control-seg button", {
    hasText: /halftone/i,
  });
  if (await modeChoice.count()) {
    await modeChoice.first().click();
    await beat(1200);
  }

  await walk.goto(`${BASE}/experiments/adaptive-composer`, {
    waitUntil: "networkidle",
  });
  await beat(1200);
  const composer = walk.locator("#demo-root textarea").first();
  if (await composer.count()) {
    await composer.click();
    await composer.fill("review the deck with Ana on tue 2pm for 45m");
    await beat(1500);
  }

  await walk.goto(`${BASE}/experiments/agent-review`, { waitUntil: "networkidle" });
  await beat(1200);
  const accept = walk.locator("#demo-root button", { hasText: /accept/i }).first();
  if (await accept.count()) {
    await accept.click();
    await beat(1200);
  }

  await walk.goto(`${BASE}/experiments/spatial-command`, {
    waitUntil: "networkidle",
  });
  await beat(900);
  await walk.keyboard.press("Control+k");
  await beat(900);
  await walk.keyboard.type("case");
  await beat(900);
  await walk.keyboard.press("ArrowDown");
  await beat(700);
  await walk.keyboard.press("Escape");
  await beat(500);

  await walk.goto(`${BASE}/experiments/hold-to-confirm`, { waitUntil: "networkidle" });
  await beat(1000);
  const hold = walk.locator("#demo-root button", { hasText: /publish/i }).first();
  if (await hold.count()) {
    const box = await hold.boundingBox();
    if (box) {
      await walk.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await walk.mouse.down();
      await beat(1400);
      await walk.mouse.up();
      await beat(900);
    }
  }

  await walk.goto(`${BASE}/experiments/inline-diff`, { waitUntil: "networkidle" });
  await beat(1200);
  const reason = walk.locator("#demo-root button", { hasText: /reason/i }).first();
  if (await reason.count()) {
    await reason.click().catch(() => {});
    await beat(1000);
  }

  await walk.goto(`${BASE}/experiments/signal-field`, { waitUntil: "networkidle" });
  await beat(600);
  await walk.locator("#install").scrollIntoViewIfNeeded();
  await beat(1200);
  const copy = walk.locator("#install .copy-btn").first();
  if (await copy.count()) {
    await copy.click().catch(() => {});
    await beat(900);
  }
  await walk.locator("#source").scrollIntoViewIfNeeded();
  await beat(600);
  const details = walk.locator("#source details").first();
  if (await details.count()) {
    await details.locator("summary").click().catch(() => {});
    await beat(1400);
  }
  await walk.locator(".experiment-nav").scrollIntoViewIfNeeded();
  await beat(900);

  await walk.setViewportSize(MOBILE);
  await walk.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await beat(1600);
  await walk.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
  await beat(1400);

  await walk.close();
  await videoContext.close();

  const videoFiles = await readdir(VIDEO_DIR);
  const recorded = videoFiles.find((file) => file.endsWith(".webm"));
  if (recorded) {
    await rename(join(VIDEO_DIR, recorded), join(VIDEO_DIR, "interface-lab-v1.webm"));
    console.log(`  · interface-lab-v1.webm`);
  }

  await browser.close();

  console.log("\nQA complete");
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.log(`  ✗ ${problem}`);
    process.exitCode = 1;
  } else {
    console.log("No console errors, overflows or registry problems.");
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  process.exit(1);
});
