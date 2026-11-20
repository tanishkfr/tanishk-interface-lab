/**
 * Capture real AFTERCLICK Studio screens and compose the two product plates.
 * Requires the extension acceptance artefact at qa/afterclick/popup-recording.png.
 *
 *   node scripts/afterclick-art.mjs
 */
import { chromium } from "playwright";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(repo, "public", "software", "afterclick");
const qa = path.join(repo, "qa", "afterclick");
const base = (process.argv.find((value) => value.startsWith("--base-url="))?.slice(11) ?? "http://localhost:3100").replace(/\/$/, "");
await mkdir(out, { recursive: true });

const font = async (name) =>
  (await readFile(path.join(repo, "public", "fonts", name))).toString("base64");
const [gulax, regular, mittel, fett] = await Promise.all([
  font("gulax.woff2"),
  font("apfel-regular.woff2"),
  font("apfel-mittel.woff2"),
  font("apfel-fett.woff2"),
]);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") console.error("console:", message.text());
});
await page.goto(`${base}/play/afterclick`, { waitUntil: "networkidle" });
await page.waitForSelector(".ac-map-panel");

const mapPng = await page.locator(".ac-map-panel").screenshot({ animations: "disabled" });
await writeFile(path.join(out, "studio-map.png"), mapPng);
await writeFile(path.join(qa, "studio-map.png"), mapPng);

await page.getByRole("option", { name: /Clicked .*Save address/ }).click();
await page.waitForTimeout(300);
await page.locator("#ac-annotation-text").fill(
  "The Save address control gave no visible confirmation. I clicked it again to check.",
);
await page.getByRole("button", { name: "Add annotation" }).click();
await page.waitForTimeout(400);
await page.evaluate(() => {
  document
    .querySelector(".ac-timeline-panel")
    ?.scrollIntoView({ block: "start", behavior: "instant" });
  window.scrollBy(0, -90);
});
await page.waitForTimeout(300);
const workbenchPng = await page.locator(".ac-lower").screenshot({
  animations: "disabled",
});
await writeFile(path.join(out, "studio-workbench.png"), workbenchPng);
await writeFile(path.join(qa, "studio-workbench.png"), workbenchPng);

// Generate a real HTML report for the docs.
const downloadPromise = page.waitForEvent("download");
await page.locator("details.ac-export summary").click();
await page.getByRole("button", { name: "Export self-contained HTML report" }).click();
const download = await downloadPromise;
const reportPath = path.join(qa, "art-report.html");
await download.saveAs(reportPath);
const reportPage = await context.newPage();
await reportPage.setViewportSize({ width: 1440, height: 1100 });
await reportPage.goto(`file:///${reportPath.replace(/\\/g, "/")}`, {
  waitUntil: "load",
});
await reportPage.screenshot({
  path: path.join(out, "report-html.png"),
  fullPage: false,
  animations: "disabled",
});
await reportPage.screenshot({
  path: path.join(qa, "report-html.png"),
  fullPage: false,
  animations: "disabled",
});
await reportPage.close();

// Mobile proof
const mobile = await context.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${base}/play/afterclick`, { waitUntil: "networkidle" });
await mobile.waitForSelector(".ac-map-panel");
await mobile.evaluate(() => {
  document.querySelector(".ac-map-panel")?.scrollIntoView({ block: "start", behavior: "instant" });
  window.scrollBy(0, -60);
});
await mobile.waitForTimeout(300);
await mobile.screenshot({
  path: path.join(out, "studio-mobile.png"),
  fullPage: false,
  animations: "disabled",
});
await mobile.close();

if (existsSync(path.join(qa, "popup-recording.png"))) {
  await copyFile(
    path.join(qa, "popup-recording.png"),
    path.join(out, "extension-popup.png"),
  );
} else {
  console.warn("popup-recording.png missing; run scripts/afterclick-acceptance.mjs first");
}

const mapBase64 = mapPng.toString("base64");

const baseCss = `
@font-face{font-family:AfterGulax;src:url(data:font/woff2;base64,${gulax}) format("woff2");font-weight:400}
@font-face{font-family:AfterSans;src:url(data:font/woff2;base64,${regular}) format("woff2");font-weight:400}
@font-face{font-family:AfterSans;src:url(data:font/woff2;base64,${mittel}) format("woff2");font-weight:500}
@font-face{font-family:AfterSans;src:url(data:font/woff2;base64,${fett}) format("woff2");font-weight:700}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#d9d6ca}
.cover{position:relative;overflow:hidden;background:#161813;color:#edeade;font-family:AfterSans,sans-serif}
.cover:before{content:"";position:absolute;inset:0;background-image:linear-gradient(to right,rgba(237,234,222,.055) 1px,transparent 1px),linear-gradient(to bottom,rgba(237,234,222,.055) 1px,transparent 1px);background-size:46px 46px;pointer-events:none}
.cover:after{content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:#dce94b}
.mono{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.rule{height:1px;background:rgba(237,234,222,.22)}
.acid{color:#dce94b}.coral{color:#ef6649}.bone{color:#edeade}
.shot{display:block;width:100%;height:100%;object-fit:cover;object-position:top left;background:#f3f1e8}
`;

function stateLine(delay, label, tone = "") {
  return `<div class="state ${tone}"><span class="state-delay">${delay}</span><span class="state-label">${label}</span></div>`;
}

const buildCover = `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss}
.cover{width:1600px;height:900px;padding:36px 42px 30px;display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:46px}
.top{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid rgba(237,234,222,.26);position:relative;z-index:2}
h1{position:relative;z-index:2;margin-top:44px;font-family:AfterGulax,sans-serif;font-size:126px;line-height:.76;letter-spacing:-.05em;text-transform:uppercase}
.tagline{position:relative;z-index:2;margin-top:20px;font-size:26px;line-height:1.02;text-transform:uppercase;font-weight:700;max-width:18ch}
.lede{position:relative;z-index:2;margin-top:14px;font-size:14px;line-height:1.5;color:#c8c7ba;max-width:38ch}
.trace{position:relative;z-index:2;margin-top:22px;border-top:1px solid rgba(237,234,222,.22);padding-top:10px;max-width:510px}
.action{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px;background:#dce94b;color:#161813;padding:5px 7px;font-family:ui-monospace,Consolas,monospace;font-size:9px;letter-spacing:.05em;text-transform:uppercase}
.states{border-left:1px solid rgba(237,234,222,.4);margin-left:14px;padding-left:15px}
.state{display:grid;grid-template-columns:58px minmax(0,1fr);gap:8px;padding:5px 0;border-bottom:1px solid rgba(237,234,222,.15);font-family:ui-monospace,Consolas,monospace;font-size:8px;letter-spacing:.05em;text-transform:uppercase}
.state-delay{color:#ef6649}.state.lost .state-delay,.state.lost .state-label{color:#ef6649}
.shot-frame{position:relative;z-index:2;align-self:center;background:#f3f1e8;border:1px solid #edeade;box-shadow:12px 12px 0 #dce94b;transform:rotate(1deg)}
.shot-frame img{display:block;width:100%;height:560px;object-fit:cover;object-position:top left}
.shot-frame figcaption{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-top:1px solid #161813;background:#fbf8ee;color:#5d6156;font-family:ui-monospace,Consolas,monospace;font-size:8px;letter-spacing:.06em;text-transform:uppercase}
.foot{position:absolute;left:42px;right:42px;bottom:22px;display:flex;justify-content:space-between;color:#a9ac9f;z-index:3}
</style></head><body><div class="cover" id="cover">
  <div class="top"><span class="mono acid">LAB/ Software 03 · interface flight recorder</span><span class="mono">Chrome extension + Studio · v0.1.0</span></div>
  <div>
    <h1>AFTER<br>CLICK</h1>
    <p class="tagline">What happened<br>after you clicked?</p>
    <p class="lede">A local-first recorder for the space between an action and the interface response. Real events, measured delays, visible uncertainty.</p>
    <div class="trace">
      <div class="action"><span>A01</span><span>Place order</span><span>Click</span></div>
      <div class="states">
        ${stateLine("+52ms", "Control disabled")}
        ${stateLine("+128ms", "Loading appears")}
        ${stateLine("+1.58s", "Success feedback")}
      </div>
    </div>
  </div>
  <figure class="shot-frame"><img src="data:image/png;base64,${mapBase64}" alt=""><figcaption><span>State map / real Studio capture</span><span>Five actions · 29 events · one lost feedback state</span></figcaption></figure>
  <div class="foot"><span class="mono">Record · inspect · annotate · export</span><span class="mono">No AI · no account · no backend</span></div>
</div></body></html>`;

async function shot(html, width, height, file) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);
  await page.locator("#cover").screenshot({
    path: file,
    animations: "disabled",
  });
  await page.close();
}

await shot(buildCover, 1600, 900, path.join(out, "cover.png"));

console.log("AFTERCLICK art written to public/software/afterclick");
for (const file of [
  "cover.png",
  "studio-map.png",
  "studio-workbench.png",
  "report-html.png",
  "studio-mobile.png",
  "extension-popup.png",
]) {
  if (existsSync(path.join(out, file))) console.log(`  · ${file}`);
}

await browser.close();
