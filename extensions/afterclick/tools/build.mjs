import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const repo = path.resolve(root, "../..");
const dist = path.join(root, "dist");
const fonts = path.join(repo, "public", "fonts");

async function loadEsbuild() {
  try {
    return await import("esbuild");
  } catch {
    const fallbackPackage = path.join(repo, "plugins", "grid-crimes", "package.json");
    if (!existsSync(fallbackPackage)) {
      throw new Error(
        "esbuild is not installed. Run pnpm install at the repository root (or in plugins/grid-crimes).",
      );
    }
    const requireFromWorkspace = createRequire(fallbackPackage);
    const resolved = requireFromWorkspace.resolve("esbuild");
    return await import(pathToFileURL(resolved).href);
  }
}

const { build } = await loadEsbuild();

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, "fonts"), { recursive: true });

  const common = {
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome116",
    legalComments: "none",
    logLevel: "warning",
  };

  await Promise.all([
    build({
      ...common,
      entryPoints: [path.join(root, "src/content.ts")],
      outfile: path.join(dist, "content.js"),
    }),
    build({
      ...common,
      entryPoints: [path.join(root, "src/background.ts")],
      outfile: path.join(dist, "background.js"),
    }),
    build({
      ...common,
      entryPoints: [path.join(root, "src/popup.ts")],
      outfile: path.join(dist, "popup.js"),
    }),
  ]);

  await copyFile(path.join(root, "src/popup.html"), path.join(dist, "popup.html"));
  await copyFile(path.join(root, "src/popup.css"), path.join(dist, "popup.css"));

  for (const font of [
    "gulax.woff2",
    "gulax-OFL.txt",
    "apfel-regular.woff2",
    "apfel-mittel.woff2",
    "apfel-fett.woff2",
    "apfel-OFL.txt",
  ]) {
    await copyFile(path.join(fonts, font), path.join(dist, "fonts", font));
  }

  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
  if (manifest.manifest_version !== 3) throw new Error("manifest must be MV3");
  if (manifest.version !== "0.1.0") throw new Error("manifest version must match the release");
  if (manifest.host_permissions) throw new Error("host_permissions are not allowed in v0.1.0");
  const permissions = [...(manifest.permissions ?? [])].sort();
  if (JSON.stringify(permissions) !== JSON.stringify(["activeTab", "scripting", "storage"])) {
    throw new Error(`unexpected permissions: ${permissions.join(", ")}`);
  }
  for (const file of [
    manifest.background?.service_worker,
    manifest.action?.default_popup,
    "content.js",
  ]) {
    if (!file || !existsSync(path.join(dist, file))) {
      throw new Error(`manifest points at a missing file: ${file}`);
    }
  }
  await writeFile(path.join(dist, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  await copyFile(path.join(root, "README.md"), path.join(dist, "README.txt"));
  await copyFile(path.join(root, "PRIVACY.md"), path.join(dist, "PRIVACY.txt"));
  const licensePath = path.join(repo, "LICENSE");
  if (existsSync(licensePath)) {
    await copyFile(licensePath, path.join(dist, "LICENSE.txt"));
  }

  const iconRun = spawnSync(process.execPath, [path.join(root, "tools/icons.mjs")], {
    stdio: "inherit",
  });
  if (iconRun.status !== 0) throw new Error("icon generation failed");

  const files = [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "README.txt",
    "PRIVACY.txt",
  ];
  let total = 0;
  for (const file of files) {
    total += (await stat(path.join(dist, file))).size;
  }
  console.log(
    `AFTERCLICK/ built dist (${files.length} core files, ${(total / 1024).toFixed(1)} kb, 4 icons, 6 font assets)`,
  );
}

await main();
