import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/fonts", { recursive: true });
const files = [
  [
    "apfel-regular.woff2",
    "https://raw.githubusercontent.com/collletttivo/apfel-grotezk/main/fonts/ApfelGrotezk-Regular.woff2",
  ],
  [
    "apfel-fett.woff2",
    "https://raw.githubusercontent.com/collletttivo/apfel-grotezk/main/fonts/ApfelGrotezk-Fett.woff2",
  ],
  [
    "apfel-mittel.woff2",
    "https://raw.githubusercontent.com/collletttivo/apfel-grotezk/main/fonts/ApfelGrotezk-Mittel.woff2",
  ],
  [
    "apfel-satt.woff2",
    "https://raw.githubusercontent.com/collletttivo/apfel-grotezk/main/fonts/ApfelGrotezk-Satt.woff2",
  ],
  [
    "apfel-OFL.txt",
    "https://raw.githubusercontent.com/collletttivo/apfel-grotezk/main/LICENSE.txt",
  ],
];
for (const [name, url] of files) {
  const r = await fetch(url);
  if (!r.ok) throw Error(`${name}: HTTP ${r.status}`);
  await writeFile(
    `public/fonts/${name}`,
    new Uint8Array(await r.arrayBuffer()),
  );
  console.log(name);
}
const tree = await fetch(
  "https://gitlab.com/api/v4/projects/25502412/repository/tree?recursive=true&per_page=100",
).then((r) => r.json());
console.log(
  JSON.stringify(tree.filter?.((x) => /woff|license/i.test(x.path)) || tree),
);
