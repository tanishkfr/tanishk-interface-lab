import Image from "next/image";
import Link from "next/link";
import { CodeBlock } from "@/components/shell/code-block";
import { Icon } from "@/components/playground/icons";

export const metadata = {
  title: "AFTERCLICK",
  description:
    "AFTERCLICK is a local-first interface flight recorder: a Chrome extension that records real interactions and a Studio that turns them into state maps, annotations, and reports.",
};

const testCode = `node extensions/afterclick/tools/build.mjs
node extensions/afterclick/tools/package.mjs
node --test tests/afterclick.test.ts
node scripts/afterclick-acceptance.mjs
node scripts/afterclick-studio-qa.mjs`;

const permissions = `{
  "permissions": ["activeTab", "scripting", "storage"]
}`;

export default function AfterclickProductPage() {
  return (
    <div className="v2-wrap section-page ac-product">
      <header className="ac-hero">
        <div>
          <p className="ac-eyebrow">LAB/ Software 03 · Browser extension + Studio</p>
          <h1 className="ac-wordmark">
            <span>After</span>
            <span>Click</span>
          </h1>
          <p className="ac-tagline">
            What happened
            <br />
            after you clicked?
          </p>
          <p className="ac-lede">
            An interface flight recorder. Record a real website interaction with
            a local Chrome extension, then read the action-to-state
            relationships in a Studio built for inspection, annotation, and
            evidence.
          </p>
          <div className="ac-actions">
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
            <Link className="ac-text-link" href="#install">
              Install the build →
            </Link>
          </div>
          <div className="ac-statusbar" aria-label="Release status">
            <span>Chrome MV3</span>
            <span>v0.1.0</span>
            <span>Developer build</span>
            <span>Local-only</span>
          </div>
        </div>
        <figure className="ac-cover">
          <Image
            src="/software/afterclick/cover.png"
            alt="AFTERCLICK cover: oversized wordmark, a recorded action leading to disabled, loading and error states, and a real Studio state map."
            width={1600}
            height={900}
            priority
            sizes="(max-width: 980px) 90vw, 46vw"
            loading="eager"
            unoptimized
          />
          <figcaption>
            <span>AFTERCLICK / 0.1.0</span>
            <span>State map · real sample recording</span>
          </figcaption>
        </figure>
      </header>

      <dl className="ac-facts">
        <div>
          <dt>Platform</dt>
          <dd>Chrome MV3</dd>
        </div>
        <div>
          <dt>Captures</dt>
          <dd>DOM + ARIA</dd>
        </div>
        <div>
          <dt>Storage</dt>
          <dd>Local Chrome</dd>
        </div>
        <div>
          <dt>Network</dt>
          <dd>None</dd>
        </div>
      </dl>

      <section className="ac-section" id="instrument">
        <div className="ac-section-label">01 / The instrument</div>
        <div>
          <h2>Not a bug tracker. A record of consequence.</h2>
          <div className="ac-prose">
            <p>
              AFTERCLICK exists for one question designers and developers ask
              constantly: <strong>what happened after I clicked?</strong> It
              records the action, opens a measured observation window, and
              captures the interface states that follow. The result is not a
              screen recording or a generic analytics dashboard. It is a
              sequence of actions, observed DOM/ARIA changes, measured delays,
              and honest gaps.
            </p>
            <p>
              The extension records one tab at a time, only after you press
              Start and confirm consent. The Studio is a separate local
              workspace: import the exported JSON, inspect the timeline and the
              state map, add annotations, and export a report. Files move
              between the two experiences as portable JSON. There is no account,
              backend, or hidden live connection.
            </p>
            <p>
              The bundled sample is a real capture from a local checkout
              fixture: five actions, 29 events, three pieces of feedback, and
              one action that produced no observed DOM change. The last one is
              not a failure to hide. It is the finding.
            </p>
          </div>

          <div className="ac-proof">
            <figure className="ac-shot ac-shot-popup">
              <Image
                src="/software/afterclick/extension-popup.png"
                alt="Built AFTERCLICK popup during a real local recording: elapsed time, 27 events, five actions, activity tape, pause and stop controls, and a manual checkpoint field."
                width={384}
                height={600}
                sizes="(max-width: 700px) 70vw, 300px"
                loading="eager"
                unoptimized
              />
              <figcaption>
                <b>Recorder</b>
                <span>Built popup · active local recording</span>
              </figcaption>
            </figure>
            <figure className="ac-shot ac-shot-wide">
              <Image
                src="/software/afterclick/studio-workbench.png"
                alt="Built AFTERCLICK Studio timeline and inspector showing a selected Save address click with no observed DOM change, a 4.00s measurement window, and an annotation field."
                width={1312}
                height={652}
                sizes="(max-width: 980px) 94vw, 58vw"
                loading="eager"
                unoptimized
              />
              <figcaption>
                <b>Studio</b>
                <span>Built interface · sample recording</span>
              </figcaption>
            </figure>
          </div>
          <p className="ac-shot-note">
            These are browser-rendered captures of the built interfaces. The
            popup capture comes from the automated Chromium acceptance run
            against the local fixture. The Studio capture uses the bundled
            sample recording.
          </p>

          <div className="ac-boundary">
            <div>
              <span>Observed fact</span>
              <p>
                A click occurred. A button gained <code>disabled</code>. An
                alert appeared in the DOM. The path changed to{" "}
                <code>/receipt</code>.
              </p>
            </div>
            <div>
              <span>Inferred label</span>
              <p>
                “Success feedback” from live-region text or an error class is a
                heuristic. It is dashed in the map and marked inferred in the
                inspector. It can be wrong.
              </p>
            </div>
            <div>
              <span>Manual note</span>
              <p>
                A checkpoint or annotation is a person’s judgment. It is stored
                separately, survives export, and is never presented as something
                the recorder detected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ac-section" id="recording">
        <div className="ac-section-label">02 / Recording</div>
        <div>
          <h2>A narrow pipeline with explicit edges.</h2>
          <div className="ac-split">
            <div>
              <div className="ac-prose">
                <p>
                  Starting a recording injects one content script into the
                  active tab using <code>activeTab</code> and{" "}
                  <code>scripting</code>. A background service worker owns the
                  session, assigns sequence numbers, measures each event against
                  the start time, and persists the active recording in{" "}
                  <code>chrome.storage.session</code>. The completed recording
                  is kept in <code>chrome.storage.local</code> until you clear it
                  or export it.
                </p>
                <p>
                  The content script captures capture-phase clicks and form
                  submits, focus changes between interactive controls, and
                  keyboard shortcuts only when they include Ctrl, Meta, or Alt,
                  plus Escape. There is no character-key listener. Typed content
                  is never read. SPA route changes are detected by watching the
                  URL, not by claiming access to framework internals.
                </p>
                <p>
                  A MutationObserver watches attributes and subtree changes while
                  an action’s observation window is open. It records disabled and
                  enabled transitions,{" "}
                  <code>aria-busy</code>, progress indicators, dialogs, live
                  regions, short control labels, and classification-ready
                  feedback. Other mutations are ignored rather than logged
                  indiscriminately.
                </p>
              </div>
              <div className="ac-timing-note">
                <strong>What the timing means.</strong>
                <p>
                  “+1.59s” means 1.59 seconds elapsed between the action and the
                  first qualifying DOM/ARIA change that the recorder observed. It
                  is not network latency, frame time, input latency, or perceived
                  responsiveness. The popup displays wall-clock elapsed time,
                  including pauses, and the timeline keeps pause/resume events.
                </p>
              </div>
            </div>
            <aside className="ac-permission-panel">
              <div className="ac-permission-head">
                <span>Permission boundary</span>
                <span>manifest.json</span>
              </div>
              <CodeBlock code={permissions} lang="json" title="Requested permissions" />
              <ul className="ac-permission-list">
                <li>
                  <strong>activeTab</strong>
                  <span>Only the tab you explicitly start.</span>
                </li>
                <li>
                  <strong>scripting</strong>
                  <span>Inject the recorder into that tab.</span>
                </li>
                <li>
                  <strong>storage</strong>
                  <span>Keep the active and last completed recording locally.</span>
                </li>
              </ul>
              <p className="ac-permission-note">
                No <code>host_permissions</code>, no all-sites{" "}
                <code>content_scripts</code>, no webRequest, no tabs permission,
                no downloads permission, no screenshots.
              </p>
            </aside>
          </div>
          <div className="ac-capture-grid">
            <div>
              <span>Captured</span>
              <ul>
                <li>Clicks, form submits, modifier shortcuts, focus</li>
                <li>Navigation and same-document route changes</li>
                <li>Disabled, loading, dialog, label and feedback states</li>
                <li>Manual checkpoints</li>
              </ul>
            </div>
            <div>
              <span>Not captured</span>
              <ul>
                <li>Form values, passwords, typed characters</li>
                <li>Cookies, headers, network payloads</li>
                <li>Screenshots (not implemented in v0.1.0)</li>
                <li>Canvas/WebGL pixels, iframe interiors, closed shadow DOM</li>
              </ul>
            </div>
            <div>
              <span>Status edge</span>
              <ul>
                <li>Cross-origin navigation can end capture</li>
                <li>The partial recording stays exportable</li>
                <li>Tab close finalises the recording</li>
                <li>Browser settings pages are blocked</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="ac-section ac-section-map" id="state-map">
        <div className="ac-section-label">03 / The state map</div>
        <div>
          <h2>A map of consequence, not a chart of clicks.</h2>
          <div className="ac-prose">
            <p>
              Every action becomes a column. Its observed states stay in
              measured order, each with a short delay bar scaled to the
              observation window. The first column is not the most important
              one; it is simply the one that happened. Selection is shared with
              the timeline and inspector, so the map is a working index rather
              than an illustration.
            </p>
          </div>
          <figure className="ac-map-figure">
            <Image
              src="/software/afterclick/studio-map.png"
              alt="Real AFTERCLICK state map with five action columns: Apply promo, Save address, Place order, Download invoice and View receipt. Each action lists its observed states with measured delay bars; Save address shows a no-observed-change state."
              width={1312}
              height={399}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>Sample recording · 5 actions · 29 events</span>
              <span>Built Studio · browser capture</span>
            </figcaption>
          </figure>
          <div className="ac-map-readout">
            <div>
              <span>01 / Action</span>
              <h3>The gesture opens a window.</h3>
              <p>
                A click, submit, or modifier shortcut starts a four-second
                observation period. The action keeps its real target label,
                tag, role and a short structural selector.
              </p>
            </div>
            <div>
              <span>02 / Delay</span>
              <h3>Time becomes a bar.</h3>
              <p>
                Each state carries a delay bar scaled to the observation window.
                The printed <code>+ms</code> label is the measurement; the bar is
                a quick visual comparison, not a precision instrument.
              </p>
            </div>
            <div>
              <span>03 / Evidence</span>
              <h3>Uncertainty has a texture.</h3>
              <p>
                Solid borders are observed facts. Dashed coral borders are
                inferred labels. A dashed stem ending in “0 observed DOM
                changes” is a measured absence.
              </p>
            </div>
          </div>
          <div className="ac-map-callout">
            <span>In the bundled sample</span>
            <p>
              “Save address” produced no qualifying DOM change across four
              seconds. The map does not invent a success state. It shows the
              absence and sends you to the inspector, where an annotation can
              record what the missing feedback meant.
            </p>
          </div>
          <p className="ac-map-limit">
            <strong>What the map refuses to say:</strong> correlation is not
            causation. An unrelated toast during the window can be attached to
            the action. The recording marks its evidence and leaves the judgment
            to the person reading it.
          </p>
        </div>
      </section>

      <section className="ac-section" id="studio">
        <div className="ac-section-label">04 / The Studio</div>
        <div>
          <h2>Import the evidence. Argue with it.</h2>
          <div className="ac-prose">
            <p>
              The Studio is a standalone browser interface. It opens with a real
              sample recording, so the timeline and state map are useful before
              the extension is installed. Importing a file replaces the sample.
              A malformed file, a future schema version, or an empty recording
              is explained without destroying the recording already on screen.
            </p>
            <p>
              Selecting a node in the map, a row in the timeline, or a
              consequence in the inspector keeps all three in sync. Arrow keys
              move through the timeline; Home and End jump to its edges; the
              annotation field submits with Ctrl/⌘ + Enter. On mobile the map
              scrolls horizontally and the inspector stays reachable.
            </p>
          </div>
          <div className="ac-studio-proof">
            <figure className="ac-shot ac-shot-studio">
              <Image
                src="/software/afterclick/studio-workbench.png"
                alt="Studio timeline and inspector with a demo annotation on the Save address action, showing no observed DOM change."
                width={1312}
                height={652}
                sizes="(max-width: 980px) 94vw, 62vw"
                loading="eager"
                unoptimized
              />
              <figcaption>
                <b>Timeline + inspector</b>
                <span>Lost feedback selected · annotation visible</span>
              </figcaption>
            </figure>
            <figure className="ac-phone">
              <Image
                src="/software/afterclick/studio-mobile.png"
                alt="AFTERCLICK Studio on a 390px viewport with the state map and a horizontally scrollable action strip."
                width={390}
                height={844}
                sizes="(max-width: 980px) 60vw, 240px"
                loading="eager"
                unoptimized
              />
              <figcaption>Mobile review · 390px</figcaption>
            </figure>
          </div>

          <div className="ac-export-grid">
            <div>
              <span>JSON</span>
              <h3>Portable recording</h3>
              <p>
                Schema-versioned, with stable event IDs, timestamps, observed
                changes, evidence labels, consent metadata, and annotations.
                Imports round-trip through the Studio parser.
              </p>
            </div>
            <div>
              <span>PNG</span>
              <h3>Interaction report</h3>
              <p>
                Rendered from the recording on an offscreen canvas: action
                ledger, measured delays, evidence texture, annotations, and a
                privacy footer. No screenshot montage.
              </p>
            </div>
            <div>
              <span>HTML</span>
              <h3>Self-contained report</h3>
              <p>
                A single file with inline CSS, the consequence map, annotations,
                and the full event table. No scripts, remote styles, fonts, or
                images are loaded.
              </p>
            </div>
          </div>

          <figure className="ac-report-figure">
            <Image
              src="/software/afterclick/report-html.png"
              alt="Generated self-contained HTML report for the Harbor & Pine sample, showing summary metrics and the consequence map."
              width={1440}
              height={1100}
              sizes="(max-width: 980px) 94vw, 74vw"
              loading="eager"
              unoptimized
            />
            <figcaption>
              <span>Generated HTML report · actual output</span>
              <span>No remote resources</span>
            </figcaption>
          </figure>
          <p className="ac-shot-note">
            The sample is stored as a portable recording, not a fabricated
            screenshot. Its source is the local Harbor &amp; Pine fixture and its
            form values are deliberately fake; automated privacy checks confirm
            those values are absent from the exported JSON.
          </p>
        </div>
      </section>

      <section className="ac-section" id="install">
        <div className="ac-section-label">05 / Install the build</div>
        <div>
          <h2>Load it unpacked. Keep it local.</h2>
          <div className="ac-install">
            <div>
              <ol className="ac-steps">
                <li>
                  <strong>Download and extract.</strong> Get{" "}
                  <a href="/downloads/afterclick-v0.1.0.zip" download>
                    afterclick-v0.1.0.zip
                  </a>{" "}
                  and unzip it into a folder you can keep. The folder must
                  contain <code>manifest.json</code>.
                </li>
                <li>
                  <strong>Open the extensions page.</strong> Go to{" "}
                  <code>chrome://extensions</code> in Chrome or another
                  Chromium browser.
                </li>
                <li>
                  <strong>Enable Developer mode.</strong> Turn it on in the
                  top-right corner, then choose <em>Load unpacked</em>.
                </li>
                <li>
                  <strong>Select the extracted folder.</strong> AFTERCLICK v0.1.0
                  appears in the list. Pin it to the toolbar for the reliable
                  start path.
                </li>
                <li>
                  <strong>Record and export.</strong> Open a normal{" "}
                  <code>https://</code> page, open AFTERCLICK, confirm consent,
                  and press Start. Pause, checkpoint, or stop from the popup.
                  Export the JSON and import it in the Studio.
                </li>
              </ol>
              <CodeBlock code={testCode} lang="bash" title="Build and verify from source" />
              <p className="ac-note">
                The ZIP is a developer build. It is not signed, not submitted to
                the Chrome Web Store, and not tested in Firefox or Safari. A
                human toolbar-install pass is still required before any store
                submission.
              </p>
            </div>
            <div>
              <ul className="ac-status-list">
                <li>
                  <span>TypeScript + Next production build</span>
                  <span className="ac-pass">Passing</span>
                </li>
                <li>
                  <span>AFTERCLICK unit tests</span>
                  <span className="ac-pass">15 passing</span>
                </li>
                <li>
                  <span>Studio browser QA</span>
                  <span className="ac-pass">30 / 30</span>
                </li>
                <li>
                  <span>Extension acceptance</span>
                  <span className="ac-pass">35 checks</span>
                </li>
                <li>
                  <span>Listing + docs browser QA</span>
                  <span className="ac-pass">36 / 36</span>
                </li>
                <li>
                  <span>Manual toolbar install</span>
                  <span className="ac-pending">Not automated</span>
                </li>
                <li>
                  <span>Chrome Web Store</span>
                  <span className="ac-pending">Not submitted</span>
                </li>
              </ul>
              <div className="ac-zip-contents">
                <span>ZIP contents</span>
                <ul>
                  <li><code>manifest.json</code><em>MV3</em></li>
                  <li><code>background.js</code><em>service worker</em></li>
                  <li><code>content.js</code><em>recorder</em></li>
                  <li><code>popup.html/css/js</code><em>interface</em></li>
                  <li><code>icons/</code><em>4 sizes</em></li>
                  <li><code>fonts/</code><em>OFL assets</em></li>
                  <li><code>README.txt</code><em>install</em></li>
                  <li><code>PRIVACY.txt</code><em>data</em></li>
                </ul>
              </div>
              <p className="ac-note">
                <strong>Test method, stated plainly.</strong> Chromium does not
                expose its toolbar to Playwright, so the acceptance harness
                loads a copy of the build with a localhost-only host permission.
                The shipped manifest remains minimal. The capture pipeline,
                background worker, popup state, export, and privacy checks were
                exercised; the physical toolbar click was not automated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ac-section" id="notes">
        <div className="ac-section-label">06 / Release notes</div>
        <div>
          <h2>A real v0.1.0, labelled honestly.</h2>
          <ul className="ac-log">
            <li>
              <time dateTime="2026-11-20">20 Nov 2026</time>
              <div>
                <h3>v0.1.0 · Chrome extension + Studio</h3>
                <p>
                  Manifest V3 extension with explicit per-recording consent.
                  One-tab capture of clicks, form submits, modifier shortcuts,
                  focus, navigation, and SPA route changes. Mutation-based
                  observation of disabled, loading, dialog, label and feedback
                  states. Manual checkpoints. Pause/resume. Session and last
                  recording local storage. Portable JSON export.
                </p>
                <p>
                  Studio with a real sample recording, action-consequence state
                  map, keyboard timeline, event inspector, annotations, malformed
                  and incompatible file handling, JSON round-trip, PNG canvas
                  report, and self-contained HTML report. Automated capture,
                  privacy, state-machine, import/export, accessibility, and
                  responsive checks.
                </p>
              </div>
            </li>
            <li>
              <time>Not in this build</time>
              <div>
                <h3>Deliberate omissions</h3>
                <p>
                  No screenshots, no form values, no character keystrokes, no
                  cross-tab capture, no cloud sync, no accounts, no AI analysis,
                  no Chrome Web Store listing, and no live extension-to-Studio
                  bridge. The JSON file is the handoff.
                </p>
              </div>
            </li>
            <li>
              <time>Next</time>
              <div>
                <h3>Before any public listing</h3>
                <p>
                  Manual toolbar-install QA in current Chrome, Edge, Brave, and
                  Arc; a privacy review of exported UI labels; larger-session
                  stress tests; final store screenshots and listing copy; and the
                  owner’s explicit publication approval.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="ac-section" id="privacy">
        <div className="ac-section-label">07 / Privacy & support</div>
        <div className="ac-meta-grid">
          <div>
            <h3>What stays local</h3>
            <p>
              Active recordings live in <code>chrome.storage.session</code>. The
              last completed recording lives in{" "}
              <code>chrome.storage.local</code> until you clear it. Uninstalling
              the extension removes its storage. Studio files are read in the
              browser tab and exported by your browser.
            </p>
          </div>
          <div>
            <h3>What is sent</h3>
            <p>
              Nothing. The extension contains no network calls, analytics,
              accounts, or upload endpoint. Studio does not transmit recording
              data. This is a claim about AFTERCLICK’s code, not a claim that no
              web server ever sees a page request.
            </p>
          </div>
          <div>
            <h3>Safe capture defaults</h3>
            <p>
              Form values, password fields, typed characters, cookies, headers,
              and network payloads are never collected. Feedback text from live
              regions is off by default; when enabled it is short, bounded, and
              passes through redaction for emails, numbers, cards, and tokens.
            </p>
          </div>
          <div>
            <h3>Exports can be sensitive</h3>
            <p>
              A recording still contains the page path, page title, UI labels,
              structural selectors, event timing, optional feedback text, and
              your annotations. Review the JSON, PNG, or HTML before sharing it.
              Redaction is a last line of defence, not a guarantee.
            </p>
          </div>
          <div>
            <h3>Known limits</h3>
            <p>
              One tab at a time. Full navigation across origins can end capture.
              Iframe interiors, closed shadow DOM, canvas/WebGL pixels, and
              network activity are outside the observation. Only one completed
              recording is retained. No screenshots in v0.1.0.
            </p>
          </div>
          <div>
            <h3>Support</h3>
            <p>
              Reproducible bugs and install notes belong in the{" "}
              <a
                className="ac-text-link"
                href="https://github.com/tanishkfr/tanishk-interface-lab/issues"
                target="_blank"
                rel="noreferrer"
              >
                LAB/ repository issues
              </a>
              . The build notes ship with the source; the extension ZIP includes
              its own <code>README.txt</code> and <code>PRIVACY.txt</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="ac-cta" aria-label="Try AFTERCLICK">
        <div>
          <h2>
            Record the click.
            <br />
            Read the consequence.
          </h2>
          <p>
            The developer build and the Studio are ready now. Import the sample,
            inspect a real missing-feedback state, and export the evidence.
          </p>
        </div>
        <div className="ac-cta-actions">
          <a
            className="lab-button ac-download-button"
            href="/downloads/afterclick-v0.1.0.zip"
            download
          >
            Download v0.1.0 <Icon name="download" />
          </a>
          <Link href="/play/afterclick">
            Open the Studio <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/software">
            All software <span aria-hidden="true">←</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
