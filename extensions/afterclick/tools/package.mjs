import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const repo = path.resolve(root, "../..");
const dist = path.join(root, "dist");
const downloads = path.join(repo, "public", "downloads");
const zip = path.join(downloads, "afterclick-v0.1.0.zip");

await mkdir(downloads, { recursive: true });
await rm(zip, { force: true });

const command = [
  "$ErrorActionPreference = 'Stop';",
  `Compress-Archive -Path '${dist.replace(/'/g, "''")}\\*' -DestinationPath '${zip.replace(/'/g, "''")}' -CompressionLevel Optimal`,
].join(" ");

const result = spawnSync(
  "powershell.exe",
  ["-NoProfile", "-NonInteractive", "-Command", command],
  { stdio: "inherit" },
);
if (result.status !== 0) {
  throw new Error("Could not create the AFTERCLICK extension ZIP.");
}
console.log(`AFTERCLICK/ package written to ${path.relative(repo, zip)}`);
