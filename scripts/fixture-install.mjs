/**
 * FIXTURE INSTALL — proves the registry items install into a foreign
 * project through the shadcn CLI and that the result builds.
 *
 * Usage (with a Lab server already running):
 *   node scripts/fixture-install.mjs --base-url=http://localhost:3100
 *
 * It copies `scripts/fixture/template` into a temporary directory,
 * installs the sample set of experiments from the running Lab's
 * registry with `npx shadcn@latest add <origin>/r/<slug>.json`,
 * then type-checks and builds the fixture with Vite. Nothing is
 * written inside the Lab or the portfolio.
 */

import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, "fixture", "template");

const arg = (name, fallback) => {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const BASE = arg("base-url", "http://localhost:3100").replace(/\/$/, "");

/**
 * The sample set: a canvas engine, a drag/scroll carousel, a review
 * surface with structured diffs, a dialog with a global hotkey, a
 * component shipping a shared logic file, and the CSS snap lane.
 */
const SLUGS = [
  "signal-field",
  "evidence-carousel",
  "agent-review",
  "spatial-command",
  "adaptive-composer",
  "soft-snap",
];

const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    stdio: "pipe",
    shell: process.platform === "win32",
    encoding: "utf8",
  });

async function main() {
  const root = await mkdtemp(join(tmpdir(), "lab-fixture-"));
  console.log(`fixture: ${root}`);
  await cp(TEMPLATE, root, { recursive: true });

  console.log("installing dependencies (npm)…");
  run("npm", ["install", "--no-fund", "--no-audit"], root);

  const installed = [];
  const failed = [];
  for (const slug of SLUGS) {
    process.stdout.write(`shadcn add ${slug} … `);
    try {
      run(
        "npx",
        ["--yes", "shadcn@latest", "add", `${BASE}/r/${slug}.json`, "--yes"],
        root,
      );
      installed.push(slug);
      console.log("ok");
    } catch (error) {
      failed.push(slug);
      console.log("failed");
      console.log(error.stdout ?? error.message);
    }
  }

  const labDir = join(root, "src", "components", "lab");
  const files = (await readdir(labDir, { recursive: true })).filter((entry) =>
    /\.[a-z]+$/.test(entry),
  );
  console.log(`\nfiles installed: ${files.length}`);
  for (const file of files) console.log(`  · src/components/lab/${file}`);

  console.log("\nbuilding the fixture (tsc --noEmit && vite build)…");
  const output = run("npm", ["run", "build"], root);
  console.log(
    output
      .trim()
      .split("\n")
      .slice(-5)
      .join("\n"),
  );

  console.log(`\n✔ ${installed.length}/${SLUGS.length} experiments installed and built`);
  if (failed.length) {
    console.log(`✗ failed: ${failed.join(", ")}`);
    process.exitCode = 1;
  }
  console.log(`fixture kept at ${root}`);
}

main().catch(async (error) => {
  console.error("fixture install failed");
  console.error(error.stdout ?? error.message);
  process.exit(1);
});
