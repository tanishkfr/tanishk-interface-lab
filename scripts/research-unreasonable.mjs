import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const OUT = "output/unreasonable/references";
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const urls = [
  "https://ui.shadcn.com/docs/components/button",
  "https://reactbits.dev/",
  "https://motion.dev/",
  "https://www.hover.dev/",
  "https://www.aceternity.com/",
  "https://pudding.cool/",
  "https://neal.fun/",
  "https://tympanus.net/codrops/hub/",
  "https://www.hoverstat.es/",
  "https://rauno.me/craft",
  "https://studionamma.com/",
  "https://akaru.fr/",
  "https://lyra.horse/",
  "https://www.awwwards.com/",
  "https://www.fffuel.co/",
  "https://www.collletttivo.it/typefaces/apfel-grotezk",
];
for (let i = 0; i < urls.length; i += 3)
  await Promise.all(
    urls.slice(i, i + 3).map(async (url, j) => {
      const p = await browser.newPage({
          viewport: { width: 1440, height: 1000 },
        }),
        id = i + j;
      try {
        await p.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
        await p.waitForTimeout(1600);
        await p.screenshot({ path: `${OUT}/${id}-desktop.png` });
        let action = "pointer exploration and scroll";
        await p.mouse.move(700, 450);
        const controls = p.locator("input[type=range]");
        if (await controls.count()) {
          await controls.first().focus();
          await controls.first().press("ArrowRight");
          action = "changed native range with keyboard";
        } else {
          await p.mouse.wheel(0, 650);
        }
        await p.waitForTimeout(700);
        await p.screenshot({ path: `${OUT}/${id}-interaction.png` });
        await p.setViewportSize({ width: 390, height: 844 });
        await p.screenshot({ path: `${OUT}/${id}-phone.png` });
        results.push({
          url,
          id,
          title: await p.title(),
          action,
          body: (await p.locator("body").innerText()).slice(0, 800),
        });
        console.log(id, url);
      } catch (e) {
        results.push({ url, id, error: e.message });
        console.log(id, "unavailable");
      } finally {
        await p.close();
      }
    }),
  );
await browser.close();
await writeFile(`${OUT}/sources.json`, JSON.stringify(results, null, 2));
