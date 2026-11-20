/**
 * AFTERCLICK listing + build-notes + regression QA.
 * Run against a production server:
 *   node scripts/afterclick-product-qa.mjs --base-url=http://localhost:3300
 */
import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};
const BASE = arg("base-url", "http://localhost:3300").replace(/\/$/, "");
const out = path.join(repo, "qa", "afterclick");
await mkdir(out, { recursive: true });

const checks = [];
const failures = [];
const check = (condition, message) => {
  checks.push(`${condition ? "PASS" : "FAIL"} ${message}`);
  if (!condition) failures.push(message);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const consoleErrors = [];
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

try {
  // Software listing
  const software = await page.goto(`${BASE}/software`, { waitUntil: "networkidle" });
  check(software?.ok(), "software page responds");
  const softwareText = await page.locator("body").innerText();
  const order = ["Vector Kitchen", "Grid Crimes", "AFTERCLICK", "MORE", "COMING", "SOON"];
  const indexes = order.map((label) => softwareText.indexOf(label));
  check(indexes.every((index) => index >= 0), "software page contains every expected listing");
  check(
    indexes[0] < indexes[1] && indexes[1] < indexes[2] && indexes[2] < indexes[3],
    "AFTERCLICK sits after Grid Crimes and before More Coming Soon",
  );
  const afterclickFeature = page.locator(".ac-feature");
  check((await afterclickFeature.count()) === 1, "AFTERCLICK uses one product feature block");
  check(
    (await afterclickFeature.locator(".ac-feature-actions a").count()) === 3,
    "AFTERCLICK listing has exactly three CTAs",
  );
  const hrefs = await afterclickFeature.locator(".ac-feature-actions a").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  check(hrefs.includes("/downloads/afterclick-v0.1.0.zip"), "listing download points at the ZIP");
  check(hrefs.includes("/play/afterclick"), "listing play points at the Studio");
  check(hrefs.includes("/software/afterclick"), "listing notes point at the build notes");
  const featureImage = afterclickFeature.locator("img");
  check(
    await featureImage.evaluate((image) => image.complete && image.naturalWidth > 100),
    "listing cover image loads",
  );
  check(
    (await page.locator(".gc-feature").count()) === 1 &&
      (await page.locator(".vector-feature").count()) === 1,
    "existing Vector Kitchen and Grid Crimes listings remain",
  );
  const listingButtonHeight = await afterclickFeature
    .locator(".lab-button")
    .first()
    .evaluate((element) => element.getBoundingClientRect().height);
  check(listingButtonHeight >= 44, "listing buttons meet the 44px target");
  await page.screenshot({
    path: path.join(out, "software-prod.png"),
    fullPage: true,
    animations: "disabled",
  });

  // Build notes
  const product = await page.goto(`${BASE}/software/afterclick`, { waitUntil: "networkidle" });
  check(product?.ok(), "build notes respond");
  check((await page.title()).includes("AFTERCLICK"), "build notes title identifies AFTERCLICK");
  check((await page.locator(".ac-section").count()) === 7, "build notes has seven numbered sections");
  check(
    (await page.locator(".ac-product .ac-download-button").count()) >= 2,
    "build notes exposes the download in hero and CTA",
  );
  const imageFailures = await page.locator(".ac-product img").evaluateAll((images) =>
    images
      .filter((image) => !image.complete || image.naturalWidth < 50)
      .map((image) => image.getAttribute("src")),
  );
  check(imageFailures.length === 0, `build notes images load (${imageFailures.join(", ")})`);
  await page.screenshot({
    path: path.join(out, "product-prod.png"),
    fullPage: true,
    animations: "disabled",
  });

  // Every internal link resolves. Hash links are checked against the document.
  const internal = await page.evaluate(() =>
    [...document.querySelectorAll(".ac-product a[href]")]
      .map((anchor) => anchor.getAttribute("href"))
      .filter((href) => href && !href.startsWith("http") && !href.startsWith("mailto")),
  );
  const unique = [...new Set(internal)];
  for (const href of unique) {
    if (href.startsWith("#")) {
      const exists = await page.evaluate((id) => Boolean(document.querySelector(id)), href);
      check(exists, `anchor target exists: ${href}`);
      continue;
    }
    const response = await context.request.get(`${BASE}${href}`, { maxRedirects: 3 });
    check(response.ok(), `internal link resolves: ${href} → ${response.status()}`);
    if (href.endsWith(".zip")) {
      const body = await response.body();
      check(body[0] === 0x50 && body[1] === 0x4b, "download ZIP has a PK signature");
      check(body.length > 100000, "download ZIP is a real build");
    }
  }

  // Accessibility
  const axeSource = await readFile(path.join(repo, "node_modules", "axe-core", "axe.min.js"), "utf8");
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () =>
    await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    }),
  );
  const serious = (axe.violations ?? []).filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  check(
    serious.length === 0,
    `build notes has no serious axe violations (${serious.map((item) => item.id).join(", ")})`,
  );

  // Mobile
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${BASE}/software/afterclick`, { waitUntil: "networkidle" });
  await mobile.evaluate(async () => {
    for (const image of document.querySelectorAll("img")) {
      image.loading = "eager";
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  const overflow = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(overflow.scrollWidth <= overflow.clientWidth + 1, "build notes has no mobile overflow");
  await mobile.screenshot({
    path: path.join(out, "product-mobile-prod.png"),
    fullPage: true,
    animations: "disabled",
  });

  const listingMobile = await context.newPage();
  await listingMobile.setViewportSize({ width: 390, height: 844 });
  await listingMobile.goto(`${BASE}/software`, { waitUntil: "networkidle" });
  const listingOverflow = await listingMobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(
    listingOverflow.scrollWidth <= listingOverflow.clientWidth + 1,
    "software listing has no mobile overflow",
  );
  check(
    await listingMobile.locator(".ac-feature-actions a").first().evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.height >= 44 && rect.width > 100;
    }),
    "AFTERCLICK listing CTA remains legible on mobile",
  );
  await listingMobile.screenshot({
    path: path.join(out, "software-mobile-prod.png"),
    fullPage: true,
    animations: "disabled",
  });
  await listingMobile.close();
  await mobile.close();

  // The Studio is a software product route, not a home collection item.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const homeText = await page.locator("body").innerText();
  check(
    !homeText.toLowerCase().includes("afterclick"),
    "AFTERCLICK is absent from the home collection",
  );

  // Regression smoke: existing product pages and experiences
  for (const [route, expected] of [
    ["/play/vector-kitchen", "Vector Kitchen"],
    ["/play/grid-crimes", "Grid Crimes"],
    ["/play/afterclick", "AFTERCLICK"],
    ["/software/grid-crimes", "Grid Crimes"],
  ]) {
    const response = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    check(response?.ok(), `regression route responds: ${route}`);
    const text = await page.locator("body").innerText();
    check(text.toLowerCase().includes(expected.toLowerCase()), `regression route still has content: ${route}`);
  }

  check(consoleErrors.length === 0, `no console errors (${consoleErrors.slice(0, 3).join(" | ")})`);
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  await browser.close();
}

await writeFile(
  path.join(out, "product-qa.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), checks, failures }, null, 2)}\n`,
);
if (failures.length) {
  console.error("AFTERCLICK product QA FAILED");
  for (const check of checks) console.log(check);
  process.exitCode = 1;
} else {
  console.log(`AFTERCLICK product QA passed (${checks.length} checks)`);
  for (const check of checks) console.log(`  ${check}`);
}
