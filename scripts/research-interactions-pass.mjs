import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  results = [],
  OUT = "output/unreasonable/references";
for (const [id, url] of [
  ["shadcn-code", "https://ui.shadcn.com/docs/components/button"],
  ["text-pressure", "https://reactbits.dev/text-animations/text-pressure"],
  ["perfect-circle", "https://neal.fun/perfect-circle/"],
]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(2000);
    if (
      /Performing security verification|verify you are human/i.test(
        await page.locator("body").innerText(),
      )
    )
      throw Error(
        "Security verification prevented inspection of the interaction. No gameplay was inspected.",
      );
    if (id === "text-pressure") {
      const close = page.getByRole("button", { name: /close/i });
      if (await close.count()) await close.first().click();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: `${OUT}/${id}-before.png` });
    let action;
    if (id === "shadcn-code") {
      const view = page.getByRole("button", { name: "View Code", exact: true });
      if (await view.count()) {
        await view.first().click();
        action =
          "Opened View Code to inspect the transition from preview to source.";
      } else
        action =
          "View Code not available to automated interaction; inspected rendered installation tabs.";
    }
    if (id === "text-pressure") {
      const range = page.locator("input[type=range]");
      if (await range.count()) {
        await range.first().focus();
        await range.first().press("End");
        action =
          "Changed the first pressure control to its maximum, then moved the pointer through the specimen.";
      } else action = "Moved pointer through the live text-pressure specimen.";
      await page.mouse.move(500, 400);
      await page.mouse.move(1050, 600, { steps: 20 });
    }
    if (id === "perfect-circle") {
      const go = page.getByRole("button", { name: /go|start/i });
      if (await go.count()) await go.first().click();
      await page.mouse.move(850, 440);
      await page.mouse.down();
      for (let i = 0; i <= 100; i++) {
        const a = (i / 100) * Math.PI * 2;
        await page.mouse.move(720 + 130 * Math.cos(a), 440 + 130 * Math.sin(a));
      }
      await page.mouse.up();
      action =
        "Drew a complete circle with mouse input and inspected the immediate feedback.";
    }
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${id}-after.png` });
    results.push({
      id,
      url,
      action,
      body: (await page.locator("body").innerText()).slice(0, 2500),
    });
    console.log(id, action);
  } catch (e) {
    results.push({ id, url, error: e.message });
  } finally {
    await page.close();
  }
}
await browser.close();
await writeFile(
  `${OUT}/focused-interactions.json`,
  JSON.stringify(results, null, 2),
);
