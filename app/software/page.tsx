import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/playground/icons";
import { ComingSoon } from "@/components/playground/coming-soon";
export const metadata = { title: "Software" };
export default function Software() {
  return (
    <div className="v2-wrap section-page">
      <h1>
        From a small idea
        <br />
        to its own thing.
      </h1>
      <p className="section-lede">
        Some experiments want a life outside the Lab. A home for the software
        that might get there.
      </p>
      <article className="product-feature vector-feature">
        <div>
          <Image
            src="/software/vector-kitchen-flat-lay.webp"
            alt="A print-studio flat lay of Vector Kitchen studies: swirling vector ribbons, geometric petal forms and recipe cards in violet, coral and acid yellow."
            width={1374}
            height={1145}
            sizes="(max-width: 980px) 90vw, 54vw"
            unoptimized
          />
        </div>
        <div>
          <span className="status">Browser prototype · v0.1</span>
          <h2>Vector Kitchen</h2>
          <p>
            A recipe-based visual instrument. Combine shapes, divergence,
            repetition, and color to make editable graphics.
          </p>
          <p>
            The browser prototype is ready to play with. A future Figma plugin
            is a possibility, not a published product.
          </p>
          <Link className="lab-button" href="/play/vector-kitchen">
            Open the prototype <Icon />
          </Link>
          <div className="product-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.1 · Browser prototype</strong>
              <br />
              Orbit, ribbon, and petal recipes. Adjustable generation, shareable
              recipe files, and editable SVG exports.
            </p>
          </div>
        </div>
      </article>
      <article className="product-feature gc-feature">
        <div>
          <Image
            src="/software/grid-crimes/feature-still-life.webp"
            alt="Six printed composition sheets, registration marks and a black Grid Crimes card with an acid slash tile arranged on a studio table."
            width={1374}
            height={1145}
            sizes="(max-width: 980px) 90vw, 54vw"
            unoptimized
          />
        </div>
        <div>
          <span className="status gc-feature-status">
            Figma Plugin · v0.1.0
          </span>
          <h2>Grid Crimes</h2>
          <p>
            A procedural composition instrument. Select a composition, choose
            one of six art directions, and generate four new layouts that keep
            the actual content as editable Figma layers.
          </p>
          <p>
            Then crossbreed two directions into a third with real design-DNA
            inheritance. Not published to Figma Community yet; the Figma plugin
            and full build notes are ready.
          </p>
          <div className="gc-feature-actions">
            <a
              className="lab-button gc-download-button"
              href="/downloads/grid-crimes-v0.1.0.zip"
              download
            >
              Download v0.1.0 <Icon name="download" />
            </a>
            <Link className="lab-button" href="/software/grid-crimes">
              Read the build notes <Icon />
            </Link>
          </div>
          <div className="product-release gc-feature-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.1.0 · Figma Plugin</strong>
              <br />
              Six direction engines, 24 grammars, seeded layout planning,
              quality scoring, native editable output, crossbreed, missing-font
              handling, and a dense-composition fallback. Native Figma QA is
              pending; Community publication requires approval.
            </p>
          </div>
        </div>
      </article>
      <article className="product-feature ac-feature">
        <div>
          <Image
            src="/software/afterclick/feature-cover.jpg"
            alt="AFTERCLICK cover artwork: four browser-state cards connected across a timed interaction strip, with a stopwatch and printed index cards."
            width={1374}
            height={1145}
            sizes="(max-width: 980px) 90vw, 54vw"
            unoptimized
          />
        </div>
        <div>
          <span className="status ac-feature-status">
            Browser Extension + Studio · v0.1.0
          </span>
          <h2>AFTERCLICK</h2>
          <p>
            An interface flight recorder. Capture what happens after a click,
            turn interactions into visual state maps, and see where feedback
            gets lost.
          </p>
          <p>
            Record real website interactions with a local browser extension.
            Inspect timing, states, and transitions in a companion Studio, then
            annotate and export the results.
          </p>
          <div className="ac-feature-actions">
            <a
              className="lab-button ac-download-button"
              href="/downloads/afterclick-v0.1.0.zip"
              download
            >
              Download v0.1.0 <Icon name="download" />
            </a>
            <Link className="lab-button" href="/play/afterclick">
              Play with the Studio <Icon />
            </Link>
            <Link
              className="lab-button secondary"
              href="/software/afterclick"
            >
              Read the build notes <Icon />
            </Link>
          </div>
          <div className="product-release ac-feature-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.1.0 · Chrome extension + Studio</strong>
              <br />
              One-tab recording with explicit consent, clicks, modifier
              shortcuts, focus, SPA route changes, manual checkpoints, and
              observed disabled, loading, dialog and feedback states. Studio
              state map, keyboard timeline, event inspector, annotations, and
              JSON, PNG and self-contained HTML exports. A real sample recording
              is included. No screenshots, no form values, no keystrokes, and no
              network requests.
            </p>
          </div>
        </div>
      </article>
      <article className="product-feature fs-feature">
        <div>
          <Image
            src="/software/fix-storage/feature-cover.webp"
            alt="An art-directed LAB/ print flat lay for fix-storage — Windows: a specification card with violet storage bars and a folder tree, surrounded by an opened hard drive, violet chart cards, swatches and a steel ruler on warm paper."
            width={1374}
            height={1145}
            sizes="(max-width: 980px) 90vw, 54vw"
            unoptimized
          />
        </div>
        <div>
          <span className="status fs-feature-status">
            Windows utility · v0.2.0 Beta
          </span>
          <h2>fix-storage — Windows</h2>
          <p>
            A terminal-based tool for figuring out what is taking up space on a
            Windows machine. It scans read-only, sorts the total into the
            categories you recognize, and follows the largest folders down to
            the files responsible.
          </p>
          <p>
            Review the evidence before anything moves. Every cleanup candidate
            is an individual file with an exact path, a size and a reason; real
            Recycle Bin recycling is a separate opt-in, never the default.
          </p>
          <div className="fs-feature-actions">
            <a
              className="lab-button fs-download-button"
              href="https://github.com/tanishkfr/fix-storage-windows/releases/download/v0.2.0-windows-beta/fix-storage-windows-beta-0.2.0.zip"
              target="_blank"
              rel="noreferrer"
            >
              Download for Windows <Icon name="download" />
            </a>
            <a
              className="lab-button secondary"
              href="https://github.com/tanishkfr/fix-storage-windows"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <Icon />
            </a>
            <Link className="lab-button secondary" href="/software/fix-storage">
              Read the build notes <Icon />
            </Link>
          </div>
          <div className="fs-feature-meta">
            Open source / MIT · Windows 11 x64 · Free
          </div>
          <div className="product-release fs-feature-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.2.0 Beta · Windows 11 x64</strong>
              <br />
              Read-only scan and categorized disk map, culprit finder,
              preview-first cleanup planner, and explicit opt-in Recycle Bin
              recycling. Node.js 20.11+ required; Windows 10 and ARM64 are
              unverified. An independent Windows port of govijr/fix-storage,
              not an official upstream release.
            </p>
          </div>
        </div>
      </article>
      <ComingSoon />
    </div>
  );
}

