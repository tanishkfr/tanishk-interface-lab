import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const out = "output/lab-v2/screenshots";
await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
for (const width of [1440, 820, 390]) {
  const p = await b.newPage({ viewport: { width, height: 1000 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    "/",
    "/play/data-matter",
    "/play/type-has-mass",
    "/play/vector-kitchen",
    "/play/browser-terrarium",
    "/play/interface-genome",
    "/play/motion-foundry",
    "/play/the-cost-of-a-click",
    "/components",
    "/products",
  ]) {
    try {
      const r = await p.goto("http://127.0.0.1:3300" + path, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await p.waitForTimeout(400);
      const name = path === "/" ? "home" : path.split("/").at(-1);
      await p.screenshot({
        path: `${out}/${name}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const metrics = await p.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        h1: document.querySelector("h1")?.textContent,
        body: getComputedStyle(document.body).fontFamily,
      }));
      results.push({
        path,
        width,
        status: r.status(),
        ...metrics,
        errors: [...errors],
      });
      console.log(
        width,
        path,
        r.status(),
        metrics.scroll > width ? "OVERFLOW" : "ok",
      );
    } catch (e) {
      results.push({ path, width, error: e.message });
      console.log(width, path, e.message.slice(0, 180));
    }
  }
  await p.close();
}
await writeFile(
  "output/lab-v2/inspection.json",
  JSON.stringify(results, null, 2),
);
await b.close();
if (results.some(result => result.error || result.status !== 200 || result.scroll > result.width || result.errors.length)) process.exitCode = 1;
