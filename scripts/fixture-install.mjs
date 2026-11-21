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

import { execFileSync, spawn } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

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
for (const slug of arg("additional", "").split(",").filter(Boolean)) {
  if (!SLUGS.includes(slug)) SLUGS.push(slug);
}

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

  // Mount the new experiments when requested, so the Vite build bundles
  // their components and styles as well as type-checking installed files.
  const examples = {
    "undo-window": {
      imports: 'import { UndoWindow } from "@/components/lab/undo-window/undo-window";',
      element: '<UndoWindow entry={{ id: "fixture", label: "Sample", expiresAt: 4102444800000, status: "available" }} onUndo={() => {}} onExpire={() => {}} />',
    },
    "permission-scope": {
      imports: 'import { PermissionScopeInspector } from "@/components/lab/permission-scope/permission-scope";',
      element: '<PermissionScopeInspector request={{ id: "fixture", requester: "Assistant", purpose: "Review notes", resource: "Selected notes", requestedAccess: "read", denialEffect: "No access" }} status="request" onGrant={() => {}} onDeny={() => {}} />',
    },
    "failure-recovery": {
      imports: 'import { FailureRecoverySurface } from "@/components/lab/failure-recovery/failure-recovery";',
      element: '<FailureRecoverySurface title="Fixture export" phase="idle" steps={[{ id: "prepare", label: "Prepare", status: "pending" }]} preserved="No export started." retrySafety="unavailable" rollbackAvailable={false} />',
    },
    "continuity-tabs": {
      imports: 'import { ContinuityTabs } from "@/components/lab/continuity-tabs/continuity-tabs";',
      element: '<div data-fixture="continuity-tabs"><ContinuityTabs defaultValue="one" tabs={[{ id: "one", label: "One", content: <p>Overview panel</p> }, { id: "two", label: "Two", content: <p>Activity panel</p> }]} /></div>',
    },
    "chapter-rail": {
      imports: 'import { ChapterRail } from "@/components/lab/chapter-rail/chapter-rail";',
      element: '<div data-fixture="chapter-rail"><section id="fixture-chapter"><ChapterRail chapters={[{ id: "fixture-chapter", label: "Fixture chapter" }]} /></section></div>',
    },
    "elastic-sheet": {
      imports: 'import { ElasticSheet } from "@/components/lab/elastic-sheet/elastic-sheet";',
      element: '<ElasticSheet open title="Fixture sheet" onOpenChange={() => {}}><p>Sheet body</p></ElasticSheet>',
    },
    "reflow-grid": {
      imports: 'import { ReflowGrid } from "@/components/lab/reflow-grid/reflow-grid";',
      element: '<div data-fixture="reflow-grid"><ReflowGrid items={[{ id: "a", name: "Object A" }, { id: "b", name: "Object B" }]} getKey={(item) => item.id} renderItem={(item) => <article>{item.name}</article>} /></div>',
    },
    "spring-disclosure": {
      imports: 'import { SpringDisclosure } from "@/components/lab/spring-disclosure/spring-disclosure";',
      element: '<div data-fixture="spring-disclosure"><SpringDisclosure items={[{ id: "one", title: "Details", content: <p>Fixture details</p> }]} /></div>',
    },
    "quiet-status-stack": {
      imports: 'import { QuietStatusStack } from "@/components/lab/quiet-status-stack/quiet-status-stack";',
      element: '<div data-fixture="quiet-status-stack"><QuietStatusStack items={[{ id: "job", title: "Fixture job", status: "success", detail: "Complete" }]} onDismiss={() => {}} /></div>',
    },
    "liquid-segmented": {
      imports: 'import { LiquidSegmented } from "@/components/lab/liquid-segmented/liquid-segmented";',
      element: '<div data-fixture="liquid-segmented"><LiquidSegmented label="Fixture density" value="a" onChange={() => {}} options={[{ value: "a", label: "Compact" }, { value: "b", label: "Spacious" }]} /></div>',
    },
    "focus-frame": {
      imports: 'import { FocusFrame } from "@/components/lab/focus-frame/focus-frame";',
      element: '<div data-fixture="focus-frame"><FocusFrame label="Fixture field" value="" onChange={() => {}} hint="Fixture hint" /></div>',
    },
    "edge-reveal": {
      imports: 'import { EdgeReveal } from "@/components/lab/edge-reveal/edge-reveal";',
      element: '<div data-fixture="edge-reveal"><EdgeReveal title="Fixture" category="Study" detail="Fixture detail" media={<div style={{ height: "100%", background: "#222" }} />} action={<button type="button">Save</button>} /></div>',
    },
    "number-drift": {
      imports: 'import { NumberDrift } from "@/components/lab/number-drift/number-drift";',
      element: '<div data-fixture="number-drift"><NumberDrift value={1234} prefix="$" /></div>',
    },
    "shared-moment-gallery": {
      imports: 'import { SharedMomentGallery } from "@/components/lab/shared-moment-gallery/shared-moment-gallery";',
      element: '<div data-fixture="shared-moment-gallery"><SharedMomentGallery items={[{ id: "a", title: "Fixture study", category: "Study", date: "2026", caption: "Fixture caption", alt: "Fixture visual", visual: <div style={{ height: "100%", background: "#ddd" }} /> }]} /></div>',
    },
    "lightfield-surface": {
      imports: 'import { LightfieldSurface } from "@/components/lab/lightfield-surface/lightfield-surface";',
      element: '<div data-fixture="lightfield-surface"><LightfieldSurface><article style={{ padding: 16 }}>Fixture surface</article></LightfieldSurface></div>',
    },
  };
  const mounted = installed.filter((slug) => Object.hasOwn(examples, slug));
  if (mounted.length) {
    const source = `${mounted.map((slug) => examples[slug].imports).join("\n")}\n\nexport function AdditionalExamples() {\n  return <>${mounted.map((slug) => examples[slug].element).join("\n")}</>;\n}\n`;
    await writeFile(join(root, "src", "additional-examples.tsx"), source);
    const appPath = join(root, "src", "App.tsx");
    const app = await readFile(appPath, "utf8");
    await writeFile(appPath, `import { AdditionalExamples } from "./additional-examples";\n${app.replace("      <h1", "      <AdditionalExamples />\n      <h1")}`);
    console.log(`Mounted for consumer build: ${mounted.join(", ")}`);
  }

  console.log("\nbuilding the fixture (tsc --noEmit && vite build)…");
  const output = run("npm", ["run", "build"], root);
  console.log(
    output
      .trim()
      .split("\n")
      .slice(-5)
      .join("\n"),
  );

  /* Render proof: serve the built fixture and inspect every mounted root. */
  const port = 4319;
  const preview = spawn(
    "npm",
    ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: root,
      shell: process.platform === "win32",
      stdio: "ignore",
    },
  );
  const stopPreview = () => {
    if (!preview.pid) return;
    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/pid", String(preview.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } catch {
        preview.kill();
      }
    } else {
      preview.kill();
    }
  };

  try {
    const origin = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        const response = await fetch(origin);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* server still starting */
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error("fixture preview server did not start");

    const selectors = {
      "continuity-tabs": '[data-fixture="continuity-tabs"] .ct-root',
      "chapter-rail": '[data-fixture="chapter-rail"] .cr-root',
      "elastic-sheet": ".es-panel",
      "reflow-grid": '[data-fixture="reflow-grid"] .rg-root',
      "spring-disclosure": '[data-fixture="spring-disclosure"] .sd-root',
      "quiet-status-stack": '[data-fixture="quiet-status-stack"] .qs-root',
      "liquid-segmented": '[data-fixture="liquid-segmented"] .ls-root',
      "focus-frame": '[data-fixture="focus-frame"] .ff-root',
      "edge-reveal": '[data-fixture="edge-reveal"] .er-card',
      "number-drift": '[data-fixture="number-drift"] .nd-root',
      "shared-moment-gallery": '[data-fixture="shared-moment-gallery"] .smg-root',
      "lightfield-surface": '[data-fixture="lightfield-surface"] .lf-root',
    };

    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(origin, { waitUntil: "networkidle" });
    const title = await page.title();
    if (!title.includes("Lab fixture consumer")) {
      throw new Error(`fixture preview served the wrong app (${title})`);
    }
    const rendered = [];
    for (const slug of installed.filter((entry) => selectors[entry])) {
      const locator = page.locator(selectors[slug]).first();
      const count = await locator.count();
      const box = count ? await locator.boundingBox() : null;
      if (!box || box.height < 2) {
        throw new Error(`installed ${slug} did not render a sized root`);
      }
      rendered.push(slug);
    }
    if (errors.length) {
      throw new Error(`fixture runtime errors: ${errors.slice(0, 3).join(" | ")}`);
    }
    console.log(
      `\nrendered in the fixture: ${rendered.join(", ")}`,
    );
    console.log(
      `✔ ${rendered.length} installed components render outside the Lab`,
    );
    await browser.close();
  } finally {
    stopPreview();
  }

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
