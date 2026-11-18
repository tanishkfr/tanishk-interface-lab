import Link from "next/link";
import { experimentCount } from "@/lib/registry/experiments";

export const metadata = {
  title: "About",
  description:
    "What Tanishk Interface Lab is, how experiments are built, and how to install them.",
};

export default function AboutPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <h1>A good place to follow a strange idea.</h1>
        <p className="lede">
          LAB/ is Tanishk&apos;s independent internet playground: experiments,
          creative instruments, interactive stories, and {experimentCount}{" "}
          reusable components. Some things are useful. Some things are here
          because they were interesting to make.
        </p>
      </header>

      <div className="about-grid" style={{ marginTop: 44 }}>
        <div className="prose-block">
          <h2>What this is</h2>
          <p>
            A space to make things without needing a case study to justify them.
            Numbers become a landscape. Words fall under gravity. A tiny world
            grows in the browser. Tools let you create motion and vectors of
            your own.
          </p>
          <p>
            Larger creations live under Experiments and Tools. The original
            component collection remains in Components, with every existing URL
            and registry installation link preserved. Products records
            prototypes honestly; no plugin or extension is presented as
            published before it exists.
          </p>

          <h2>The component library</h2>
          <ul>
            <li>
              <strong>One behaviour, done well.</strong> No kitchen-sink
              components with eleven modes.
            </li>
            <li>
              <strong>Self-contained.</strong> Components install as a folder of
              files with relative imports and scoped CSS. Nothing reads from the
              Lab&apos;s own design tokens or state.
            </li>
            <li>
              <strong>Honest about cost.</strong> Dependencies are listed, and
              most experiments have none — browser APIs and CSS come first.
            </li>
            <li>
              <strong>Accessible by construction.</strong> Keyboard paths, ARIA
              where it is genuinely needed, and documented limitations where an
              interaction is inherently pointer-first.
            </li>
            <li>
              <strong>Tested in a realistic context.</strong> Previews are
              sample products, not empty boxes, and a representative subset is
              installed and built in a separate consumer project.
            </li>
          </ul>

          <h2>How installation works</h2>
          <p>
            Every component is published as a shadcn-compatible registry item.
            The install command on each page points at this site&apos;s{" "}
            <code>/r/&lt;slug&gt;.json</code> endpoint, which serves the shipped
            source as JSON; the shadcn CLI writes the files into your project
            and installs any npm dependency the component needs.
          </p>
          <p>
            Nothing is hosted for you and nothing phones home. If you prefer,
            every file is readable and copyable from the Source section of each
            experiment.
          </p>

          <h2>Accessibility principles</h2>
          <ul>
            <li>
              Motion is an enhancement: <code>prefers-reduced-motion</code>{" "}
              removes easing, magnetism and settling — never information.
            </li>
            <li>
              Every custom interaction has a keyboard path, or documents that it
              is pointer-first and renders safely without one.
            </li>
            <li>
              Colour is never the only signal; statuses are written as words
              too.
            </li>
            <li>
              Components that run render loops pause offscreen, when the tab is
              hidden, and under reduced motion.
            </li>
          </ul>

          <h2>Experiment status</h2>
          <p>
            <strong>Stable</strong> marks an established API and documented
            behaviour in the Lab. <strong>Experimental</strong> means the
            interaction or API may change as it is refined. Neither label
            guarantees suitability for every project or environment.
          </p>

          <h2>Licence</h2>
          <p>
            The Lab&apos;s own code is MIT licensed. Parts of the Signal Field
            engine, the Inverted Cursor lifecycle and the Soft Snap settling
            rules were adapted from Tanishk Salagame&apos;s portfolio (the same
            copyright holder); the adaptations are generalised and relicensed
            under the same MIT terms. See <code>LICENSE</code> in the
            repository.
          </p>
        </div>

        <aside className="about-rail" aria-label="Quick facts">
          <div className="fact-card">
            <h3>Stack</h3>
            <ul>
              <li>Next.js 16 · React 19 · TypeScript</li>
              <li>Plain CSS per component</li>
              <li>No animation framework</li>
            </ul>
          </div>
          <div className="fact-card">
            <h3>Install model</h3>
            <ul>
              <li>shadcn-compatible registry</li>
              <li>One JSON item per experiment</li>
              <li>Copyable source files</li>
            </ul>
          </div>
          <div className="fact-card">
            <h3>Start here</h3>
            <p>
              <Link href="/experiments/signal-field">Signal Field</Link> for
              ambient motion, or{" "}
              <Link href="/experiments/agent-review">Agent Review Surface</Link>{" "}
              if you are building human-in-the-loop tools.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
