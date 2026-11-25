import Image from "next/image";
import Link from "next/link";
import { CodeBlock } from "@/components/shell/code-block";
import { Icon } from "@/components/playground/icons";

export const metadata = {
  title: "fix-storage — Windows",
  description:
    "fix-storage — Windows is a terminal-based, read-only disk space analyzer with preview-first cleanup and explicit opt-in Recycle Bin recycling. An independently maintained Windows port of govijr/fix-storage.",
};

const REPO = "https://github.com/tanishkfr/fix-storage-windows";
const RELEASE =
  "https://github.com/tanishkfr/fix-storage-windows/releases/tag/v0.2.0-windows-beta";
const ZIP =
  "https://github.com/tanishkfr/fix-storage-windows/releases/download/v0.2.0-windows-beta/fix-storage-windows-beta-0.2.0.zip";
const CHECKSUM =
  "https://github.com/tanishkfr/fix-storage-windows/releases/download/v0.2.0-windows-beta/fix-storage-windows-beta-0.2.0.zip.sha256";
const UPSTREAM = "https://github.com/govijr/fix-storage";
const CHECKSUM_VALUE =
  "f9332c8562fc28fc31e4244316b173b3d194b2c2bdc569b5da7860000423c551";

const runCode = `# synthetic disk; reads nothing
.\\fix-storage.cmd --demo

# live scan; read-only, preview only
.\\fix-storage.cmd --scan

# scripted summaries; still read-only
.\\fix-storage.cmd --plain --scan
.\\fix-storage.cmd --json --scan

# detected volumes; read-only
.\\fix-storage.cmd --drives

# real recycling for this launch only
.\\fix-storage.cmd --scan --recycle`;

const checksumCode = `certutil -hashfile fix-storage-windows-beta-0.2.0.zip SHA256

# Expected v0.2.0 value:
${CHECKSUM_VALUE}`;

const developmentCode = `npm install
npm run typecheck
npm test
npm run package:beta
node scripts/verify-beta.mjs`;

export default function FixStorageProductPage() {
  return (
    <div className="v2-wrap section-page fs-product">
      <header className="fs-hero">
        <div>
          <p className="fs-eyebrow">LAB/ Software 04 · Windows utility</p>
          <h1 className="fs-wordmark">
            <span>fix-</span>
            <span>
              storage
              <span className="fs-cursor" aria-hidden="true" />
            </span>
          </h1>
          <p className="fs-tagline">
            Find the weight.
            <br />
            Keep the file.
          </p>
          <p className="fs-lede">
            A terminal-based tool for figuring out what is taking up space on a
            Windows machine. Explore large folders, read the reasons, and review
            individual files before anything moves.
          </p>
          <div className="fs-actions">
            <a
              className="lab-button fs-download-button"
              href={ZIP}
              target="_blank"
              rel="noreferrer"
            >
              Download for Windows <Icon name="download" />
            </a>
            <a
              className="lab-button secondary"
              href={REPO}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <Icon />
            </a>
            <Link className="fs-text-link" href="#install">
              Install &amp; verify →
            </Link>
          </div>
          <div className="fs-statusbar" aria-label="Release status">
            <span>Windows utility</span>
            <span>v0.2.0 Beta</span>
            <span>Windows 11 x64</span>
            <span>Open source / MIT</span>
            <span>Free</span>
          </div>
        </div>
        <figure className="fs-cover">
          <Image
            src="/software/fix-storage/main-120x30.png"
            alt="Built fix-storage terminal interface on a demo disk: a dot-matrix disk meter, category totals, and a folder view following the largest items."
            width={1900}
            height={1200}
            priority
            sizes="(max-width: 980px) 90vw, 46vw"
            unoptimized
          />
          <figcaption>
            <span>fix-storage / 0.2.0</span>
            <span>Built terminal UI · demo disk</span>
          </figcaption>
        </figure>
      </header>

      <dl className="fs-facts">
        <div>
          <dt>Platform</dt>
          <dd>Windows 11 x64</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>Node.js 20.11+</dd>
        </div>
        <div>
          <dt>Scan</dt>
          <dd>Read-only</dd>
        </div>
        <div>
          <dt>Cleanup</dt>
          <dd>Opt-in only</dd>
        </div>
      </dl>

      <section className="fs-section" id="tool">
        <div className="fs-section-label">01 / The tool</div>
        <div>
          <h2>A disk warning is not a diagnosis.</h2>
          <div className="fs-prose">
            <p>
              Windows can tell you a volume is almost full. It rarely tells you
              which folder, which cache, or which forgotten installer is
              responsible. fix-storage measures the volume, groups the result
              into categories people recognize, and follows the largest child
              folder until the culprit is small enough to inspect. The point is
              not a prettier storage chart. It is a route to the thing taking up
              the room.
            </p>
            <p>
              This is a Windows port of{" "}
              <a href={UPSTREAM} target="_blank" rel="noreferrer">
                fix-storage
              </a>
              , the macOS and Linux terminal disk analyzer by govijr. The
              upstream project supplied the terminal-first reading, categories,
              labels and culprit search. The Windows work existed in contributed
              branches but was not an official release. This port closes that
              gap, integrates the branches with the current upstream structure,
              and adds a deliberately narrow Recycle Bin cleanup path.
            </p>
            <p>
              It is independently maintained. It is not an official upstream
              release, and it is not an entirely original application. The
              upstream MIT licence and attribution travel with it.
            </p>
          </div>
          <p className="fs-note">
            <strong>No fabricated screens.</strong> The terminal captures on
            this page come from the repository’s{" "}
            <code>docs/screenshots/</code> directory and show the built
            interface on a demo disk. The demo paths and sizes are synthetic.
          </p>
        </div>
      </section>

      <section className="fs-section" id="scan">
        <div className="fs-section-label">02 / The scan</div>
        <div>
          <h2>Measure first. Follow the weight.</h2>
          <div className="fs-prose">
            <p>
              On launch, the tool discovers mounted volumes and walks the
              selected drive read-only. It reports logical bytes, allocated
              bytes and filesystem usage separately. Category totals are scan
              estimates; the headline and the dot-matrix meter use the
              filesystem’s own figures, so the sum can differ when data is
              shared or unmeasured.
            </p>
            <p>
              Categories are Apps, Developer, Photos, Videos, Documents, Music,
              System data, Caches and Recycle Bin. Inside a folder, items carry
              a label: junk, unused, system, or no label when the item is yours
              and in use. The one-line reason matters more than the label: a
              cache that rebuilds itself, an installer left behind, or data a
              tool manages.
            </p>
            <p>
              The culprit search runs one pass over the folder, then follows the
              biggest child while it holds more than half of its parent. When no
              single item dominates, it shows the three biggest instead. It
              stops at things that are already one unit, such as a package
              cache, and descends to a single file when one file is the folder.
              <code>f</code> reduces the view to junk and unused; <code>g</code>{" "}
              jumps to the current culprit.
            </p>
          </div>
          <figure className="fs-shot">
            <Image
              src="/software/fix-storage/main-80x24.png"
              alt="fix-storage at 80 columns: categories, a folder view, labels, sizes and the keyboard bar remain visible."
              width={1900}
              height={1100}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>Built terminal UI · 80 × 24</span>
              <span>Demo disk · synthetic data</span>
            </figcaption>
          </figure>
          <p className="fs-note">
            <strong>Accounting is not hidden.</strong> Measured totals can
            exceed filesystem usage when hard links are counted more than once.
            The port keeps upstream’s measured-versus-filesystem accounting
            visible instead of forcing the numbers to agree.
          </p>
        </div>
      </section>

      <section className="fs-section" id="interface">
        <div className="fs-section-label">03 / The interface</div>
        <div>
          <h2>Keyboard first. Mouse optional.</h2>
          <div className="fs-prose">
            <p>
              The terminal is the interface, not a wrapper around a hidden
              window. Move with arrows or <code>j</code>/<code>k</code>; open
              with Enter or <code>→</code>; go back with Esc or <code>←</code>;
              switch panes with Tab. <code>v</code> cycles drives,{" "}
              <code>1</code>–<code>9</code> selects one directly,{" "}
              <code>p</code> opens the cleanup planner, <code>x</code> cancels a
              scan, and <code>q</code> quits.
            </p>
            <p>
              The layout targets 80, 120 and 160 columns in Windows Terminal. It
              keeps exact paths, counts and byte accounting visible at each
              width, and adds narrow and short modes rather than squeezing a
              desktop sidebar onto a small console. It uses ANSI and UTF-8; a
              terminal without those conventions is not the target.
            </p>
          </div>

          <table className="fs-keys">
            <caption>Browsing</caption>
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>↑</kbd> <kbd>↓</kbd> / <kbd>j</kbd> <kbd>k</kbd>
                </td>
                <td>Move through categories, folders or rows.</td>
              </tr>
              <tr>
                <td>
                  <kbd>→</kbd> / <kbd>Enter</kbd>
                </td>
                <td>Open a folder or look inside a category.</td>
              </tr>
              <tr>
                <td>
                  <kbd>←</kbd> / <kbd>Esc</kbd>
                </td>
                <td>Go back a level.</td>
              </tr>
              <tr>
                <td>
                  <kbd>g</kbd>
                </td>
                <td>Jump to the current culprit.</td>
              </tr>
              <tr>
                <td>
                  <kbd>f</kbd>
                </td>
                <td>Show only junk and unused items.</td>
              </tr>
              <tr>
                <td>
                  <kbd>o</kbd> / <kbd>Space</kbd>
                </td>
                <td>Reveal the item in File Explorer.</td>
              </tr>
              <tr>
                <td>
                  <kbd>p</kbd>
                </td>
                <td>Open the cleanup planner.</td>
              </tr>
              <tr>
                <td>
                  <kbd>v</kbd> / <kbd>1</kbd>–<kbd>9</kbd>
                </td>
                <td>Next drive, or that drive directly.</td>
              </tr>
              <tr>
                <td>
                  <kbd>Tab</kbd>
                </td>
                <td>Switch panes.</td>
              </tr>
              <tr>
                <td>
                  <kbd>x</kbd>
                </td>
                <td>Cancel a running scan.</td>
              </tr>
              <tr>
                <td>
                  <kbd>r</kbd> / <kbd>q</kbd>
                </td>
                <td>Rescan / quit.</td>
              </tr>
            </tbody>
          </table>

          <table className="fs-keys">
            <caption>Cleanup planner</caption>
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>↑</kbd> <kbd>↓</kbd> / <kbd>j</kbd> <kbd>k</kbd>
                </td>
                <td>Move through candidates.</td>
              </tr>
              <tr>
                <td>
                  <kbd>Space</kbd> / <kbd>a</kbd>
                </td>
                <td>Add or remove the highlighted individual file.</td>
              </tr>
              <tr>
                <td>
                  <kbd>i</kbd>
                </td>
                <td>Show more or less detail.</td>
              </tr>
              <tr>
                <td>
                  <kbd>o</kbd>
                </td>
                <td>Reveal in File Explorer.</td>
              </tr>
              <tr>
                <td>
                  <kbd>r</kbd>
                </td>
                <td>Arm, then confirm within four seconds.</td>
              </tr>
              <tr>
                <td>
                  <kbd>Esc</kbd> / <kbd>x</kbd>
                </td>
                <td>Cancel the current confirmation.</td>
              </tr>
              <tr>
                <td>
                  <kbd>p</kbd> / <kbd>q</kbd>
                </td>
                <td>Close the planner / quit.</td>
              </tr>
            </tbody>
          </table>

          <p className="fs-note">
            <strong>Mouse is not required.</strong> The Windows build supports
            console mouse input, but every browsing and cleanup action has a
            keyboard path.
          </p>
        </div>
      </section>

      <section className="fs-section" id="preview">
        <div className="fs-section-label">04 / Preview first</div>
        <div>
          <h2>Nothing moves until you say so twice.</h2>
          <div className="fs-prose">
            <p>
              A normal <code>--scan</code> launch is read-only.{" "}
              <code>p</code> opens the cleanup planner for the current category
              or folder. Every candidate is an individual regular file, and
              every row says why it is eligible or blocked. Folders are blocked;
              open the folder and select files inside it.
            </p>
            <p>
              Press <code>space</code> to add the highlighted file. Press{" "}
              <code>r</code> once to arm. The review lists every exact path and
              shows logical and allocated bytes. Nothing has moved. Press{" "}
              <code>r</code> again within four seconds to run, or <code>esc</code>{" "}
              to cancel. The result separates successful, rejected, canceled
              and uncertain outcomes.
            </p>
            <p>
              Preview is the default. The planner says{" "}
              <code>PREVIEW MODE · NO FILE IS CHANGED</code>; confirming it runs
              a local simulation and reports{" "}
              <code>actual disk space recovered: 0 B</code>. That is not a
              failed cleanup. Recycled files remain in the Recycle Bin, so their
              bytes are not free space until the bin is emptied outside this
              beta.
            </p>
          </div>
          <figure className="fs-shot">
            <Image
              src="/software/fix-storage/cleanup-review-80x24.png"
              alt="Cleanup planner at 80 columns: a preview banner, one selectable file, blocked folder rows, and reasons for each candidate."
              width={1900}
              height={1100}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>Built planner · 80 × 24</span>
              <span>Preview mode · no file is changed</span>
            </figcaption>
          </figure>
          <p className="fs-note">
            <strong>The scope is narrow on purpose.</strong> Non-elevated, local
            volumes only. Allowlisted user cache roots and Downloads files that
            pass individual review. No folders, reparse points, shared hard
            links, cloud placeholders, system paths or other users’
            profiles.
          </p>
        </div>
      </section>

      <section className="fs-section" id="recycle">
        <div className="fs-section-label">05 / Opt-in recycling</div>
        <div>
          <h2>Real recycling is a separate decision.</h2>
          <div className="fs-prose">
            <p>
              <code>.\\fix-storage.cmd --scan --recycle</code> is the only
              product path that enables real cleanup, and only for that launch.
              It requires a live scan, a non-elevated session, the reviewed
              helper and the two-press approval. It is rejected with{" "}
              <code>--demo</code>, <code>--plain</code>, <code>--json</code>,{" "}
              <code>--drives</code> or <code>--dry-run</code>.
            </p>
            <p>
              Files move to the Windows Recycle Bin. Nothing is permanently
              deleted. The beta never removes a folder recursively, never empties
              the bin, never falls back to permanent deletion, and never retries
              after an uncertain result. Results separate recycled, rejected,
              canceled, uncertain and skipped outcomes. A durable append-only
              journal records every operation; startup reconciliation is
              read-only and never restores files automatically.
            </p>
            <p>
              The reviewed production helper is included in the package and
              pinned by SHA-256{" "}
              <code>fb4995d0b1a4820ebc80cd8f34e963fe7363cd9f368a58c8a063b0521d9fda64</code>
              . The app refuses a QA helper, a rebuilt-unreviewed helper or a
              changed file. The helper also refuses elevation.
            </p>
          </div>

          <aside className="fs-safety">
            <h3>Known limitation · the Shell race</h3>
            <p>
              The Windows Shell recycle call is path-based and not atomic. A
              same-user process with write/delete access to the parent folder
              can rename the validated file and substitute another between the
              last check and the Shell call. The helper detects a mismatch
              afterwards and reports <strong>uncertain</strong>; it cannot
              prevent it. Do not use this beta on a shared or hostile same-user
              desktop, and do not describe the operation as atomic.
            </p>
          </aside>

          <figure className="fs-shot">
            <Image
              src="/software/fix-storage/recycle-confirm-120x30.png"
              alt="Real recycling confirmation at 120 columns: the header says REAL RECYCLING ENABLED and RECYCLE BIN ONLY, with one exact path and a second press required."
              width={1900}
              height={1200}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>Built planner · 120 × 30</span>
              <span>Explicit opt-in · recycle bin only</span>
            </figcaption>
          </figure>
          <figure className="fs-shot">
            <Image
              src="/software/fix-storage/cleanup-result-120x30.png"
              alt="Cleanup result at 120 columns: simulated completion, one reviewed file, blocked folders, and actual disk space recovered reported as 0 B."
              width={1900}
              height={1200}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>Built result · 120 × 30</span>
              <span>Actual recovered: 0 B</span>
            </figcaption>
          </figure>
          <p className="fs-note">
            <strong>Recycled is not deleted.</strong> Recycled bytes are in the
            Recycle Bin, not free disk space. Actual recovered space stays{" "}
            <code>0 B</code> until the bin is emptied outside this beta.
          </p>
        </div>
      </section>

      <section className="fs-section" id="implementation">
        <div className="fs-section-label">06 / Under the hood</div>
        <div>
          <h2>A Windows surface around a Unix idea.</h2>
          <div className="fs-prose">
            <p>
              fix-storage — Windows is TypeScript on Node.js 20.11 or newer. The
              interactive renderer is character-based: a layout layer keeps
              panes, rows and the disk meter aligned, and the Windows runtime
              switches to it instead of the pixel renderer used on macOS and
              Linux. Drive discovery, known-folder lookup, user identity,{" "}
              <code>$Recycle.Bin</code> parsing and the Shell helper live in the
              Windows core. A C#/PowerShell directory lister accelerates scans,
              with a plain Node fallback.
            </p>
            <p>
              The port keeps upstream’s measured-versus-filesystem
              accounting and long-list viewport behaviour, and adds
              Windows-specific narrow and short modes. Windows consoles can
              report a larger buffer than the visible window, so the renderer
              draws within a conservative cell viewport;{" "}
              <code>FIX_STORAGE_MAX_COLUMNS</code> and{" "}
              <code>FIX_STORAGE_MAX_ROWS</code> override it. The pixel dependency
              is optional so a Windows install succeeds even though its native
              runtime is not built for win32.
            </p>
            <p>
              The production Recycle Bin helper is compiled and shipped with the
              beta, not rebuilt on the user’s machine. Its SHA-256 is
              pinned in{" "}
              <code>src/core/cleanup/production/helper.ts</code>; the package
              build refuses a helper that does not match the pin.
            </p>
          </div>

          <CodeBlock
            code={developmentCode}
            lang="bash"
            title="Build and verify from source"
          />

          <ul className="fs-limits">
            <li>
              <strong>Accounting</strong>
              <span>
                Current upstream measured-versus-filesystem accounting was kept
                instead of the Windows branch’s older model.
              </span>
            </li>
            <li>
              <strong>Viewport</strong>
              <span>
                Long-list scrolling, row basis and right padding were restored;
                narrow and short modes were added for Windows consoles.
              </span>
            </li>
            <li>
              <strong>Safety rules</strong>
              <span>
                Private-data subtree protection and tool-managed labels from PR
                #7 were adapted into the current scan and store structure.
              </span>
            </li>
            <li>
              <strong>Executor</strong>
              <span>
                Direct filesystem mutation stays compiled off. The reviewed
                production Recycle Bin executor is reachable only through{" "}
                <code>--scan --recycle</code>.
              </span>
            </li>
          </ul>
          <p className="fs-note">
            <strong>No benchmark claims.</strong> The repository does not
            publish a scan-speed comparison, and this page does not invent one.
          </p>
        </div>
      </section>

      <section className="fs-section" id="install">
        <div className="fs-section-label">07 / Install</div>
        <div>
          <h2>Download, verify, unpack, run.</h2>
          <div className="fs-prose">
            <p>
              The v0.2.0 beta is a pre-release ZIP, not an installer. It requires
              Node.js 20.11 or newer and a Windows Terminal with ANSI and UTF-8
              support. No administrator rights and no elevation are needed.
            </p>
          </div>

          <div className="fs-install">
            <div>
              <ol className="fs-steps">
                <li>
                  <strong>Download the beta.</strong> Get{" "}
                  <a href={ZIP} target="_blank" rel="noreferrer">
                    fix-storage-windows-beta-0.2.0.zip
                  </a>{" "}
                  (840,242 bytes) from the{" "}
                  <a href={RELEASE} target="_blank" rel="noreferrer">
                    v0.2.0 release
                  </a>
                  .
                </li>
                <li>
                  <strong>Verify the checksum.</strong> Download the{" "}
                  <a href={CHECKSUM} target="_blank" rel="noreferrer">
                    published <code>.sha256</code> asset
                  </a>{" "}
                  and compare it with the local file.
                </li>
                <li>
                  <strong>Unpack it.</strong> Extract the ZIP anywhere you can
                  write. The folder contains <code>fix-storage.cmd</code>.
                </li>
                <li>
                  <strong>Open Windows Terminal in that folder.</strong> Run the
                  demo first; it reads nothing.
                </li>
                <li>
                  <strong>Scan read-only.</strong> Try <code>--scan</code> before
                  considering the planner. Real recycling stays off unless you
                  explicitly add <code>--recycle</code>.
                </li>
              </ol>
              <CodeBlock
                code={checksumCode}
                lang="bash"
                title="Verify the ZIP"
              />
              <p className="fs-note">
                The attached <code>.sha256</code> file is the authority. The
                value printed here matches the v0.2.0 release asset at the time
                of writing; verify the file you actually downloaded.
              </p>
            </div>
            <div>
              <CodeBlock
                code={runCode}
                lang="bash"
                title="Run from the unpacked folder"
              />
              <div className="fs-meta-grid">
                <div>
                  <h3>Tested</h3>
                  <p>Windows 11 x64 with Windows Terminal.</p>
                </div>
                <div>
                  <h3>Unverified</h3>
                  <p>
                    Windows 10 and ARM64. They may work; treat them as untested.
                  </p>
                </div>
                <div>
                  <h3>Runtime</h3>
                  <p>Node.js 20.11 or newer. Node.js is not bundled.</p>
                </div>
                <div>
                  <h3>Privileges</h3>
                  <p>Ordinary user. The helper refuses elevation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fs-section" id="limits">
        <div className="fs-section-label">08 / Beta limits</div>
        <div>
          <h2>A beta with the edges drawn on purpose.</h2>
          <div className="fs-prose">
            <p>
              This is a pre-release for one narrow job on one tested platform.
              The boundaries below are part of the product, not a temporary
              disclaimer to skim past.
            </p>
          </div>
          <ul className="fs-limits">
            <li>
              <strong>Platform</strong>
              <span>
                Windows 11 x64 was tested. Windows 10 and ARM64 are unverified.
              </span>
            </li>
            <li>
              <strong>Runtime</strong>
              <span>Node.js 20.11 or newer is required.</span>
            </li>
            <li>
              <strong>Cleanup scope</strong>
              <span>
                Recycle Bin only. No permanent deletion, permanent fallback,
                recursive folder removal, bulk cleanup, bin emptying or
                automatic cleanup.
              </span>
            </li>
            <li>
              <strong>Targets</strong>
              <span>
                Individual regular files only. No folders, reparse points,
                shared hard links, cloud placeholders, or system and protected
                paths.
              </span>
            </li>
            <li>
              <strong>Privileges</strong>
              <span>Non-elevated sessions and local volumes only.</span>
            </li>
            <li>
              <strong>Atomicity</strong>
              <span>
                The Shell recycle call is path-based and not atomic. A
                substitution is detected afterwards as uncertain, not prevented.
              </span>
            </li>
            <li>
              <strong>Accounting</strong>
              <span>
                Actual disk space recovered stays <code>0 B</code> until the
                Recycle Bin is emptied outside this beta.
              </span>
            </li>
            <li>
              <strong>Failure</strong>
              <span>
                Uncertain outcomes stop the batch. There is no automatic retry;
                reconcile from the journal before doing anything else.
              </span>
            </li>
            <li>
              <strong>Environment</strong>
              <span>
                One ordinary user account. Not a shared or hostile same-user
                desktop.
              </span>
            </li>
            <li>
              <strong>Distribution</strong>
              <span>
                Pre-release, independently maintained, and not an official
                upstream release.
              </span>
            </li>
          </ul>
          <p className="fs-note">
            <strong>&ldquo;Unverified&rdquo; means untested.</strong> It does not
            mean &ldquo;probably fine.&rdquo;
          </p>
        </div>
      </section>

      <section className="fs-section" id="notes">
        <div className="fs-section-label">09 / Release notes</div>
        <div>
          <h2>A real beta, labelled honestly.</h2>
          <ul className="fs-log">
            <li>
              <time dateTime="2026-11-24">24 Nov 2026</time>
              <div>
                <h3>v0.2.0 · Windows Beta</h3>
                <p>
                  Read-only scan, category and folder views, culprit finder,
                  preview-first cleanup planner, explicit opt-in Recycle Bin
                  recycling, reviewed helper pinned by SHA-256, and a durable
                  recovery journal. Windows 11 x64 tested; Windows 10 and ARM64
                  unverified.
                </p>
              </div>
            </li>
            <li>
              <time dateTime="2026-11-22">22 Nov 2026</time>
              <div>
                <h3>Windows port audit</h3>
                <p>
                  Upstream Windows branches integrated with the current main
                  structure, character renderer, hard-link-aware totals,
                  private-data and tool-managed safety rules, and the long-list
                  viewport fixes.
                </p>
              </div>
            </li>
            <li>
              <time>Not in this build</time>
              <div>
                <h3>Deliberate omissions</h3>
                <p>
                  No permanent deletion, permanent fallback, recursive folder
                  removal, bulk cleanup, bin emptying, automatic retry,
                  installer, or official upstream release.
                </p>
              </div>
            </li>
          </ul>
          <p className="fs-note">
            The release is a GitHub pre-release. The version is v0.2.0 Beta, not
            a stable 1.0.
          </p>
        </div>
      </section>

      <section className="fs-section" id="upstream">
        <div className="fs-section-label">10 / Upstream &amp; licence</div>
        <div>
          <h2>Built on someone else’s work, with the receipts.</h2>
          <div className="fs-prose">
            <p>
              The upstream fix-storage project is MIT licensed. This Windows
              port reuses MIT-licensed code and design from the upstream project
              and its contributed Windows branches. The{" "}
              <a href={`${REPO}/blob/main/NOTICE`} target="_blank" rel="noreferrer">
                NOTICE
              </a>{" "}
              credits Wally Magill for the private-data and tool-managed safety
              rules (PR #7), pyjeebz for explicit OS handling and the Windows
              core and renderer (PR #9, #10, #11), and the upstream authors and
              contributors, including the Linux and drive work merged as #8 and
              #13 and fixes in #6, #15, #19 and #21.
            </p>
            <p>
              No upstream repository was modified, pushed to or relicensed by
              this port. The Windows repository keeps the{" "}
              <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
                MIT licence
              </a>
              , the NOTICE and the{" "}
              <a
                href={`${REPO}/blob/main/docs/windows/UPSTREAM_AUDIT.md`}
                target="_blank"
                rel="noreferrer"
              >
                upstream audit
              </a>
              .
            </p>
          </div>

          <div className="fs-meta-grid">
            <div>
              <h3>Licence</h3>
              <p>
                MIT. The upstream licence and copyright notice are retained in
                the Windows repository.
              </p>
            </div>
            <div>
              <h3>Upstream</h3>
              <p>
                <a href={UPSTREAM} target="_blank" rel="noreferrer">
                  govijr/fix-storage
                </a>{" "}
                supplied the original macOS and Linux tool. It was not modified
                by this port.
              </p>
            </div>
            <div>
              <h3>This port</h3>
              <p>
                <a href={REPO} target="_blank" rel="noreferrer">
                  tanishkfr/fix-storage-windows
                </a>{" "}
                is independently maintained and is not an official upstream
                release.
              </p>
            </div>
            <div>
              <h3>Cover</h3>
              <p>
                LAB/ cover artwork for fix-storage — Windows, supplied by the
                site owner. A print-studio flat lay built around a real opened
                hard drive; not an application screenshot.
              </p>
            </div>
          </div>
          <p className="fs-credit">
            Cover artwork supplied for LAB/. Source and replacement note
            recorded locally at{" "}
            <code>public/software/fix-storage/CREDITS.md</code>. Terminal
            screenshots: repository <code>docs/screenshots/</code>.
          </p>
        </div>
      </section>

      <section className="fs-cta" aria-label="Download fix-storage for Windows">
        <div>
          <h2>
            See the weight.
            <br />
            Keep the file.
          </h2>
          <p>
            The beta is ready for Windows 11 x64. Start with the demo, scan
            read-only, and opt into recycling only when the paths and sizes make
            sense.
          </p>
        </div>
        <div className="fs-cta-actions">
          <a
            className="lab-button fs-download-button"
            href={ZIP}
            target="_blank"
            rel="noreferrer"
          >
            Download for Windows <Icon name="download" />
          </a>
          <a
            className="lab-button secondary"
            href={REPO}
            target="_blank"
            rel="noreferrer"
          >
            Open the repository <Icon />
          </a>
          <Link href="/software">
            All software <span aria-hidden="true">←</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
