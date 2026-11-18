import { build } from "esbuild";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const out = path.join(root, "qa/preview");
const fontDir = path.resolve(root, "../../public/fonts");

await mkdir(out, { recursive: true });

async function bundle(entry, name) {
  await build({
    entryPoints: [path.join(root, entry)],
    bundle: true,
    format: "iife",
    target: "es2019",
    platform: "browser",
    outfile: path.join(out, name),
    logLevel: "warning",
  });
}

await bundle("tools/preview/harness.ts", "harness.js");
await bundle("tools/preview/gallery.ts", "gallery.js");
await bundle("tools/preview/cover.ts", "cover.js");
await bundle("tools/preview/icon.ts", "icon.js");

await copyFile(path.join(root, "dist/ui.html"), path.join(out, "ui.html"));

const [gulax, regular, mittel, fett] = await Promise.all(
  ["gulax.woff2", "apfel-regular.woff2", "apfel-mittel.woff2", "apfel-fett.woff2"].map(
    async (file) => (await readFile(path.join(fontDir, file))).toString("base64"),
  ),
);

const fonts = `
@font-face{font-family:"Gulax";src:url("data:font/woff2;base64,${gulax}") format("woff2");font-weight:400;font-display:block}
@font-face{font-family:"Apfel";src:url("data:font/woff2;base64,${regular}") format("woff2");font-weight:400;font-display:block}
@font-face{font-family:"Apfel";src:url("data:font/woff2;base64,${mittel}") format("woff2");font-weight:500;font-display:block}
@font-face{font-family:"Apfel";src:url("data:font/woff2;base64,${fett}") format("woff2");font-weight:700;font-display:block}
`;

const harness = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>GRID CRIMES/ interface preview</title>
<style>
  html,body{margin:0;height:100%;background:#d9d6ca;overflow:hidden}
  .stage{width:100%;height:100%;display:grid;place-items:center}
  iframe{display:block;border:0;background:#f3f1e8;box-shadow:0 24px 80px -36px rgba(0,0,0,.55)}
</style>
</head>
<body>
<div class="stage"><iframe id="plugin" src="./ui.html" title="GRID CRIMES plugin interface"></iframe></div>
<script src="./harness.js"></script>
</body>
</html>`;
await writeFile(path.join(out, "harness.html"), harness, "utf8");

const gallery = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>GRID CRIMES/ direction sheet</title>
<style>
  ${fonts}
  :root{--paper:#f3f1e8;--ink:#23241f;--acid:#e5e94b;--coral:#ff795b;--violet:#5834d7}
  *{box-sizing:border-box}
  html,body{margin:0;background:var(--paper);color:var(--ink);font-family:Apfel,Arial,sans-serif}
  body{padding:46px 46px 34px}
  header{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;border-bottom:2px solid var(--ink);padding-bottom:18px;margin-bottom:22px}
  h1{margin:0;font-family:Gulax,Arial Black,sans-serif;font-size:68px;line-height:.82;letter-spacing:-.05em;text-transform:uppercase}
  header p{margin:0;max-width:36ch;font-size:13px;line-height:1.5;color:#62635a}
  .meta{font-family:monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#62635a;text-align:right;white-space:nowrap}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .card{border:1px solid rgba(35,36,31,.25);background:#fbfaf4;overflow:hidden}
  .card.source{grid-column:span 2;border:2px solid var(--ink)}
  .card.source .art{aspect-ratio:3.2}
  .art{aspect-ratio:1.55;background:#e8e5d8;overflow:hidden}
  .art img{display:block;width:100%;height:100%;object-fit:cover}
  .caption{display:flex;align-items:baseline;gap:8px;padding:9px 10px;border-top:1px solid rgba(35,36,31,.15);min-height:42px;flex-wrap:wrap}
  .caption .tag{font-family:monospace;font-size:8px;letter-spacing:.08em;background:var(--acid);padding:2px 4px}
  .caption strong{font-size:12px;letter-spacing:-.01em;text-transform:uppercase}
  .caption span:last-child{font-family:monospace;font-size:7.5px;letter-spacing:.03em;color:#62635a;margin-left:auto}
  footer{display:flex;justify-content:space-between;gap:24px;margin-top:18px;border-top:1px solid rgba(35,36,31,.25);padding-top:10px;font-family:monospace;font-size:8px;letter-spacing:.06em;text-transform:uppercase;color:#62635a}
</style>
</head>
<body>
  <header>
    <h1>Six ways<br/>to break<br/>the grid.</h1>
    <p>One hero composition, six independent layout systems. These are real plans from the GRID CRIMES engine, rendered for the browser. In Figma the same plans become editable native layers.</p>
    <div class="meta">LAB/ GRID CRIMES<br/>ENGINE OUTPUT<br/>SEED 2718</div>
  </header>
  <div class="grid" id="gallery"></div>
  <footer><span>Source composition remains untouched.</span><span>Browser-rendered engine preview · not a Figma screenshot</span></footer>
  <script src="./gallery.js"></script>
</body>
</html>`;
await writeFile(path.join(out, "gallery.html"), gallery, "utf8");

const cover = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>GRID CRIMES/ cover</title>
<style>
  ${fonts}
  *{box-sizing:border-box}
  html,body{margin:0;width:1600px;height:900px;overflow:hidden;background:#171714;color:#f3f1e8;font-family:Apfel,Arial,sans-serif}
  .cover{position:relative;width:1600px;height:900px;padding:46px 54px;overflow:hidden;background:
    linear-gradient(90deg,rgba(243,241,232,.06) 1px,transparent 1px) 0 0/160px 100%,
    linear-gradient(0deg,rgba(243,241,232,.045) 1px,transparent 1px) 0 0/100% 150px,
    #171714}
  .meta-top,.meta-bottom{position:absolute;left:54px;right:54px;display:flex;justify-content:space-between;gap:20px;font-family:monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(243,241,232,.62)}
  .meta-top{top:34px}
  .meta-bottom{bottom:30px;border-top:1px solid rgba(243,241,232,.2);padding-top:14px}
  .left{position:absolute;left:54px;top:112px;width:790px;z-index:2}
  h1{margin:0;font-family:Gulax,Arial Black,sans-serif;font-size:206px;line-height:.72;letter-spacing:-.045em;text-transform:uppercase}
  h1 span{display:block}
  h1 em{display:inline-grid;place-items:center;width:142px;height:142px;margin:14px 0 0 -2px;background:#e5e94b;color:#23241f;font-style:normal;font-family:Gulax,Arial Black,sans-serif;font-size:176px;line-height:1;transform:skewX(-8deg)}
  .tagline{margin:34px 0 0;font-family:Gulax,Arial Black,sans-serif;font-size:47px;line-height:.92;letter-spacing:-.035em;text-transform:uppercase;color:#e5e94b}
  .describe{max-width:48ch;margin:22px 0 0;font-size:16px;line-height:1.5;color:rgba(243,241,232,.72)}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:24px}
  .chips span{padding:5px 8px;border:1px solid rgba(243,241,232,.26);font-family:monospace;font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:rgba(243,241,232,.8)}
  .right{position:absolute;right:-40px;top:100px;width:720px;height:710px;z-index:1}
  .strip{display:grid;grid-template-columns:1fr 1fr;gap:12px;transform:rotate(-4deg)}
  .cell{margin:0;border:1px solid rgba(243,241,232,.22);background:#f3f1e8;overflow:hidden;box-shadow:0 18px 40px -20px rgba(0,0,0,.55)}
  .cell:nth-child(2n){transform:translateY(24px) rotate(1.5deg)}
  .cell img{display:block;width:100%;height:170px;object-fit:cover}
  .cell figcaption{font-family:monospace;font-size:8px;letter-spacing:.09em;padding:5px 6px;color:#23241f;background:#e5e94b;text-transform:uppercase}
  .slash{position:absolute;right:34px;bottom:-190px;font-family:Gulax,Arial Black,sans-serif;font-size:760px;line-height:1;color:#5834d7;opacity:.24;transform:rotate(7deg);z-index:0}
  .cell-3 figcaption,.cell-6 figcaption{background:#ff795b}
  .cell-2 figcaption,.cell-5 figcaption{background:#e8e5d8}
</style>
</head>
<body><div class="cover" id="cover"></div><script src="./cover.js"></script></body>
</html>`;
await writeFile(path.join(out, "cover.html"), cover, "utf8");

const icon = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>GRID CRIMES/ icon</title>
<style>
  ${fonts}
  *{box-sizing:border-box}
  html,body{margin:0;width:512px;height:512px;overflow:hidden}
  #icon{position:relative;width:512px;height:512px;background:#e5e94b;color:#23241f;overflow:hidden}
  .icon-grid{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;opacity:.16}
  .icon-grid span{border-right:1px solid #23241f;border-bottom:1px solid #23241f}
  .icon-type{position:absolute;left:22px;top:44px;display:flex;align-items:flex-start;font-family:Gulax,Arial Black,sans-serif;font-size:236px;line-height:.72;letter-spacing:-.07em}
  .icon-type b{font-weight:400}
  .icon-type em{display:inline-grid;place-items:center;width:116px;height:116px;margin:8px 0 0 2px;background:#23241f;color:#e5e94b;font-style:normal;font-size:150px;line-height:1;transform:skewX(-8deg)}
  .icon-foot{position:absolute;left:26px;bottom:26px;font-family:monospace;font-size:15px;line-height:1.4;letter-spacing:.07em}
  .icon-tag{position:absolute;right:24px;bottom:26px;background:#23241f;color:#e5e94b;font-family:monospace;font-size:14px;letter-spacing:.06em;padding:6px 8px}
  .icon-type::after{content:"";position:absolute;left:0;bottom:-14px;width:340px;height:5px;background:#ff795b}
</style>
</head>
<body><div id="icon"></div><script src="./icon.js"></script></body>
</html>`;
await writeFile(path.join(out, "icon.html"), icon, "utf8");

console.log(`Preview harness built → ${path.relative(root, out)}`);
