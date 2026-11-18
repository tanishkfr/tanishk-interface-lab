import Image from "next/image";
import Link from "next/link";
import { CodeBlock } from "@/components/shell/code-block";
import { Icon } from "@/components/playground/icons";

export const metadata = {
  title: "GRID CRIMES/",
  description:
    "GRID CRIMES/ is a procedural composition instrument for Figma. Six art directions, four editable variations, and a real crossbreed engine. A LAB/ development build.",
};

const directions = [
  {
    index: "A",
    name: "Brutalist",
    copy: "Monumental type, hard divisions and awkward, deliberate pressure. No apologies.",
  },
  {
    index: "B",
    name: "Swiss Editorial",
    copy: "A disciplined asymmetric column grid, editorial scale shifts and precise white space.",
  },
  {
    index: "C",
    name: "Radical Minimal",
    copy: "Negative space as the primary material. One decisive focal point, quiet support.",
  },
  {
    index: "D",
    name: "Maximalist",
    copy: "Layered colour, compressed rhythm and a loud but legible focal hierarchy.",
  },
  {
    index: "E",
    name: "Anti-grid",
    copy: "Coherent offsets, broken columns and tension produced by a system, not a dice roll.",
  },
  {
    index: "F",
    name: "Controlled Chaos",
    copy: "Hybrid grammars and spatial fractures that still pass containment and readability checks.",
  },
];

const installCode = `cd plugins/grid-crimes
pnpm install
pnpm run build`;

const testCode = `pnpm run typecheck
pnpm run test
pnpm run qa`;

export default async function GridCrimesProductPage() {
  return (
    <div className="v2-wrap section-page gc-product">
      <header className="gc-hero">
        <div>
          <p className="gc-eyebrow">LAB/ Product 02 · Figma instrument</p>
          <h1 className="gc-wordmark">
            <span>GRID</span>
            <span>CRIMES</span>
            <i aria-hidden="true">/</i>
          </h1>
          <p className="gc-tagline">
            Break the grid.
            <br />
            Keep the craft.
          </p>
          <p className="gc-lede">
            A procedural composition instrument for Figma. Select an existing
            composition, choose one of six art directions, and generate four
            new layouts that preserve the actual content as editable layers.
            Then crossbreed two directions into a third that neither would have
            produced alone.
          </p>
          <div className="gc-actions">
            <Link className="lab-button" href="#install">
              Local install <Icon />
            </Link>
            <Link className="gc-text-link" href="/play/grid-crimes">
              Open the browser experiment →
            </Link>
          </div>
          <div className="gc-statusbar" aria-label="Release status">
            <span>Development build</span>
            <span>v0.1.0</span>
            <span>Not yet published</span>
            <span>Figma Design only</span>
          </div>
        </div>
        <figure className="gc-cover">
          <Image
            src="/products/grid-crimes/cover-v2.png"
            alt="GRID CRIMES/ cover artwork: oversized type, acid slash and six generated layout directions."
            width={1600}
            height={900}
            priority
            sizes="(max-width: 980px) 90vw, 46vw"
            unoptimized
          />
          <figcaption>
            <span>GRID CRIMES / 0.1.0</span>
            <span>Community cover · development</span>
          </figcaption>
        </figure>
      </header>

      <dl className="gc-facts">
        <div className="gc-fact">
          <dt>Platform</dt>
          <dd>Figma Design</dd>
        </div>
        <div className="gc-fact">
          <dt>Engine</dt>
          <dd>Procedural, seeded</dd>
        </div>
        <div className="gc-fact">
          <dt>Output</dt>
          <dd>Native layers</dd>
        </div>
        <div className="gc-fact">
          <dt>Network</dt>
          <dd>None</dd>
        </div>
      </dl>

      <section className="gc-section" id="instrument">
        <div className="gc-section-label">01 / The instrument</div>
        <div>
          <h2>Not a random layout generator.</h2>
          <div className="gc-prose">
            <p>
              GRID CRIMES/ reads the selection as a composition: bounds, type
              sizes, text lengths, image fills, instances, auto-layout and layer
              names become a semantic block model. It infers roles, chooses a
              layout grammar, builds a plan, and scores the result before
              touching Figma.
            </p>
            <p>
              Four variations come from four different grammars inside the
              chosen direction. <strong>Chaos</strong> controls deviation from
              alignment and scale order. <strong>Density</strong> controls
              space and compression. <strong>Hierarchy</strong> controls the
              distance between the focal point and its support. Seeds make the
              result reproducible.
            </p>
            <p>
              The source is never edited. Every variation is its own frame,
              built by cloning the original layers, then repositioning and
              resizing them. Text stays text, images keep their fills, instances
              stay instances, and the whole batch is one native Figma undo away.
            </p>
          </div>
          <div className="gc-shot-grid">
            <figure className="gc-shot">
              <Image
                src="/products/grid-crimes/ui-configure-v2.png"
                alt="GRID CRIMES/ configuration panel: detected roles, six direction tiles, chaos, density and hierarchy controls."
                width={880}
                height={2000}
                sizes="(max-width: 650px) 90vw, 34vw"
                loading="eager"
                unoptimized
              />
              <figcaption>
                <b>Configure</b>
                <span>Built UI · top of panel</span>
              </figcaption>
            </figure>
            <figure className="gc-shot">
              <Image
                src="/products/grid-crimes/ui-results-v2.png"
                alt="GRID CRIMES/ results panel showing four generated variations with scores, seeds and edit actions."
                width={880}
                height={2000}
                sizes="(max-width: 650px) 90vw, 34vw"
                loading="eager"
                unoptimized
              />
              <figcaption>
                <b>Results</b>
                <span>Real exports · top of panel</span>
              </figcaption>
            </figure>
          </div>
          <p className="gc-shot-note">
            These are browser-rendered captures of the built interface and the
            real layout plans it produces. Native Figma frame QA is listed as
            pending below until the developer build has been loaded and tested
            inside Figma.
          </p>
        </div>
      </section>

      <section className="gc-section" id="directions">
        <div className="gc-section-label">02 / Six systems</div>
        <div>
          <h2>Six different creative directors.</h2>
          <div className="gc-prose">
            <p>
              Each direction owns its own composition grammars, spatial
              constraints, hierarchy relationships, colour strategy and
              preferred arrangements. The presets are not six palettes applied
              to one layout.
            </p>
          </div>
          <figure className="gc-directions-image">
            <Image
              src="/products/grid-crimes/directions-v2.png"
              alt="Direction sheet: one source composition and six generated layout directions."
              width={1600}
              height={900}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>One source · six engines · seed 2718</span>
              <span>Browser-rendered engine preview</span>
            </figcaption>
          </figure>
          <div className="gc-direction-list">
            {directions.map((direction) => (
              <div className="gc-direction" key={direction.index}>
                <span>{direction.index}/</span>
                <div>
                  <h3>{direction.name}</h3>
                  <p>{direction.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gc-section" id="crossbreed">
        <div className="gc-section-label">03 / Crossbreed</div>
        <div className="gc-split">
          <div>
            <h2>Two directions enter. A third leaves.</h2>
            <div className="gc-prose">
              <p>
                Crossbreed is not a coordinate average. Each variation stores
                its preset, seed, grammar and a small design DNA: margin,
                columns, asymmetry, rotation limit, scale contrast, decorative
                density, occupancy and alignment strategy.
              </p>
              <p>
                The inheritance slider mixes those values, chooses grammars by
                direction, then generates a fresh family through the normal
                planning and quality-scoring pipeline. The midpoint is a real
                hybrid, not a compromise rectangle.
              </p>
            </div>
            <div className="gc-mix" aria-label="Crossbreed inheritance diagram">
              <span>Brutalist</span>
              <b>×</b>
              <span>Swiss Editorial</span>
            </div>
            <p className="gc-note">
              <strong>Real behaviour:</strong> parent DNA and batch metadata are
              stored on generated frames. Reopen the plugin, select two
              compatible variations, and the instrument can crossbreed them
              again. Incompatible sources are explained, never silently merged.
            </p>
          </div>
          <figure className="gc-cross-shot">
            <Image
              src="/products/grid-crimes/ui-crossbreed-v2.png"
              alt="GRID CRIMES/ crossbreed workspace with two parents, inheritance slider and inherited design parameters."
              width={880}
              height={2000}
              sizes="(max-width: 650px) 90vw, 300px"
              loading="eager"
              unoptimized
            />
            <figcaption>Crossbreed / equal inheritance · top of panel</figcaption>
          </figure>
        </div>
      </section>

      <section className="gc-section" id="install">
        <div className="gc-section-label">04 / Install the build</div>
        <div>
          <h2>It runs locally. No Figma Community listing yet.</h2>
          <div className="gc-install">
            <div>
              <ol className="gc-steps">
                <li>
                  <strong>Build the plugin.</strong> From the repository root,
                  install the isolated workspace and run the build.
                </li>
                <li>
                  <strong>Import the manifest.</strong> In the Figma desktop
                  app, open <em>Plugins → Development → Import plugin from
                  manifest…</em> and choose{" "}
                  <code>plugins/grid-crimes/manifest.json</code>.
                </li>
                <li>
                  <strong>Run GRID CRIMES/.</strong> Select a frame, group or a
                  few sibling layers, or press <em>Try with sample</em> to
                  create an editable demonstration.
                </li>
                <li>
                  <strong>Generate.</strong> Pick a direction, adjust the three
                  controls, then press <em>Generate 4 variations</em>. The batch
                  appears beside the source in a 2×2 grid.
                </li>
              </ol>
              <p className="gc-note">
                The manifest intentionally has no plugin ID. Figma assigns a
                local development identity on import. If your Figma build
                requires an explicit ID, create one blank development plugin,
                copy its generated ID into this manifest, and keep it local. A
                real published ID is added only through Figma&apos;s Community
                registration flow.
              </p>
              <CodeBlock
                code={installCode}
                lang="bash"
                title="Build the development plugin"
              />
            </div>
            <div>
              <ul className="gc-status-list">
                <li>
                  <span>TypeScript / esbuild</span>
                  <span className="gc-pass">Passing</span>
                </li>
                <li>
                  <span>Engine + adapter tests</span>
                  <span className="gc-pass">35 passing</span>
                </li>
                <li>
                  <span>Browser UI QA</span>
                  <span className="gc-pass">9 / 9 cases</span>
                </li>
                <li>
                  <span>Native Figma manual QA</span>
                  <span className="gc-pending">Pending</span>
                </li>
                <li>
                  <span>Community publication</span>
                  <span className="gc-pending">Not submitted</span>
                </li>
              </ul>
              <CodeBlock code={testCode} lang="bash" title="Verify locally" />
              <p className="gc-note">
                The Figma-specific acceptance checklist is in the plugin README.
                It covers layered text, mixed fonts, image crops, instances,
                auto-layout modules, locked layers, batch cleanup and repeated
                generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="gc-section" id="notes">
        <div className="gc-section-label">05 / Release notes</div>
        <div>
          <h2>A real build, labelled honestly.</h2>
          <ul className="gc-log">
            <li>
              <time dateTime="2026-11-18">18 Nov 2026</time>
              <div>
                <h3>v0.1.0 — First development build</h3>
                <p>
                  Six direction engines and 24 layout grammars. Seeded planning
                  with constraint scoring. Chaos, density and hierarchy
                  controls. Four native editable variations per batch. Source
                  role detection and correction. Crossbreed with real DNA
                  inheritance. Versioned plugin metadata. Missing-font and dense
                  composition handling. Dense sources switch to an editorial
                  index layout. Local build, tests and browser QA.
                </p>
              </div>
            </li>
            <li>
              <time>Next</time>
              <div>
                <h3>Before any Community submission</h3>
                <p>
                  Native Figma verification on real documents, stress testing
                  with large mixed-font files, final Community listing copy,
                  support URL and privacy review. Publication requires the
                  owner&apos;s explicit approval.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="gc-section" id="privacy">
        <div className="gc-section-label">06 / Privacy & support</div>
        <div className="gc-meta-grid">
          <div>
            <h3>Data handling</h3>
            <p>
              No network access, no uploads, no analytics, no accounts. The
              plugin reads only the current selection and writes generated
              nodes, generation metadata and settings. Nothing leaves the Figma
              document. Generated metadata is visible only to this plugin.
            </p>
          </div>
          <div>
            <h3>Support</h3>
            <p>
              Development support and reproducible bug reports live in the{" "}
              <a
                className="gc-text-link"
                href="https://github.com/tanishkfr/tanishk-interface-lab/issues"
                target="_blank"
                rel="noreferrer"
              >
                LAB/ repository issues
              </a>
              . The browser experiment remains at{" "}
              <Link className="gc-text-link" href="/play/grid-crimes">
                /play/grid-crimes
              </Link>
              .
            </p>
          </div>
          <div>
            <h3>Licenses</h3>
            <p>
              Plugin source is part of the MIT-licensed LAB/ repository. Gulax
              (Velvetyne) and Apfel Grotezk (Collletttivo) are used under the
              SIL Open Font License. Font licenses ship in{" "}
              <code>public/fonts/</code> and{" "}
              <code>plugins/grid-crimes/assets/fonts/</code>.
            </p>
          </div>
          <div>
            <h3>Known limits</h3>
            <p>
              2–30 meaningful elements works best. More than 18 switch to the
              dense editorial index. Missing fonts keep their original
              formatting. Instance children are atomic. Very large image fills
              are preserved rather than re-encoded.
            </p>
          </div>
        </div>
      </section>

      <section className="gc-cta" aria-label="Try GRID CRIMES">
        <div>
          <h2>
            Break the grid.
            <br />
            Keep the craft.
          </h2>
          <p>
            The browser composition study is open now. The Figma build is ready
            for local development testing; publication is the next deliberate
            step.
          </p>
        </div>
        <div className="gc-cta-actions">
          <Link href="/play/grid-crimes">
            Open the experiment <span aria-hidden="true">↗</span>
          </Link>
          <Link href="#install">
            Read install steps <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

