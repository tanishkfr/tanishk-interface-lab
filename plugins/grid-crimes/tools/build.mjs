import { build as esbuild, context } from "esbuild";
import { mkdir, readFile, writeFile, watch } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const fontDir = path.resolve(root, "../../public/fonts");

const isWatch = process.argv.includes("--watch");

async function fontBase64(name) {
  const file = path.join(fontDir, name);
  if (!existsSync(file)) {
    throw new Error(`Missing licensed font asset: ${file}`);
  }
  return (await readFile(file)).toString("base64");
}

async function buildAll() {
  await mkdir(dist, { recursive: true });

  await esbuild({
    entryPoints: [path.join(root, "src/main/code.ts")],
    bundle: true,
    format: "iife",
    target: "es2017",
    platform: "browser",
    outfile: path.join(dist, "code.js"),
    logLevel: "warning",
    sourcemap: false,
  });

  const uiResult = await esbuild({
    entryPoints: [path.join(root, "src/ui/main.ts")],
    bundle: true,
    format: "iife",
    target: "es2018",
    platform: "browser",
    write: false,
    outfile: path.join(dist, "ui.js"),
    logLevel: "warning",
    sourcemap: false,
  });
  const uiJs = uiResult.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

  const [gulax, regular, mittel, fett] = await Promise.all([
    fontBase64("gulax.woff2"),
    fontBase64("apfel-regular.woff2"),
    fontBase64("apfel-mittel.woff2"),
    fontBase64("apfel-fett.woff2"),
  ]);

  const cssRaw = await readFile(path.join(root, "src/ui/styles.css"), "utf8");
  const css = cssRaw
    .replace("__FONT_GULAX__", gulax)
    .replace("__FONT_APFEL_REGULAR__", regular)
    .replace("__FONT_APFEL_MITTEL__", mittel)
    .replace("__FONT_APFEL_FETT__", fett);

  const template = await readFile(path.join(root, "src/ui/index.html"), "utf8");
  const html = template
    .replace("/*__UI_CSS__*/", css)
    .replace("/*__UI_JS__*/", uiJs);
  await writeFile(path.join(dist, "ui.html"), html, "utf8");

  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
  if (!manifest.main || !manifest.ui) {
    throw new Error("manifest.json must declare main and ui");
  }
  if (manifest.documentAccess !== "dynamic-page") {
    throw new Error("manifest.json must use documentAccess: dynamic-page");
  }

  const codeSize = (await readFile(path.join(dist, "code.js"))).byteLength;
  const uiSize = Buffer.byteLength(html, "utf8");
  console.log(
    `GRID CRIMES/ built → dist/code.js (${(codeSize / 1024).toFixed(1)} kb), dist/ui.html (${(
      uiSize / 1024
    ).toFixed(1)} kb)`,
  );
}

await buildAll();

if (isWatch) {
  console.log("Watching src/ and styles…");
  let timer = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      buildAll().catch((error) => console.error(error));
    }, 120);
  };
  await watch(path.join(root, "src"), { recursive: true }, schedule);
  await watch(path.join(root, "manifest.json"), schedule);
}
