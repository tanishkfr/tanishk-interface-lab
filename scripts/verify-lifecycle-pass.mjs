import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  }),
  results = [];
await context.addInitScript(() => {
  const raf = requestAnimationFrame.bind(window),
    cancel = cancelAnimationFrame.bind(window),
    pending = new Set();
  window.__labFrames = { pending, stamps: [] };
  window.requestAnimationFrame = (callback) => {
    const id = raf((t) => {
      pending.delete(id);
      window.__labFrames.stamps.push(t);
      callback(t);
    });
    pending.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    pending.delete(id);
    cancel(id);
  };
});
const page = await context.newPage(),
  BASE = process.env.LAB_QA_URL || "http://127.0.0.1:3304";
for (const slug of ["browser-terrarium", "type-has-mass", "almost-nothing"]) {
  await page.goto(`${BASE}/play/${slug}`, { waitUntil: "networkidle" });
  if (slug === "almost-nothing")
    await page
      .getByRole("button", { name: "Make one small mark", exact: true })
      .click();
  await page.waitForTimeout(300);
  const active = await page.evaluate(() => window.__labFrames.pending.size);
  await page
    .getByRole("link", { name: "All experiments", exact: true })
    .click();
  await page.waitForURL("**/experiments");
  await page.waitForTimeout(450);
  const stopped = await page.evaluate(() => window.__labFrames.pending.size);
  assert.equal(stopped, 0, `${slug} leaked a frame after client navigation`);
  results.push({
    slug,
    activeFrames: active,
    framesAfterClientNavigation: stopped,
  });
  console.log(slug, "active", active, "after client navigation", stopped);
}
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
assert.equal(
  await page.evaluate(() => window.__labFrames.pending.size),
  0,
  "Hero should sleep at rest",
);
await page
  .getByRole("button", { name: "Make an impression", exact: true })
  .click();
await page.waitForTimeout(100);
assert.ok((await page.evaluate(() => window.__labFrames.pending.size)) > 0);
await page.waitForTimeout(3500);
const settled = await page.evaluate(() => window.__labFrames.pending.size);
assert.equal(settled, 0, "Hero should stop when settled");
results.push({
  slug: "hero-press",
  framesAtRest: 0,
  framesAfterSettling: settled,
});
await writeFile(
  "output/unreasonable/lifecycle.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
console.log("All scene frame loops clean up; hero sleeps when settled.");
