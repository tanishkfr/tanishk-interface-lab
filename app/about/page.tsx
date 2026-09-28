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
        <p className="mono-label">About the Lab</p>
        <h1>A small collection of interaction ideas, built properly.</h1>
        <p className="lede">
          {experimentCount} experiments, each one a behaviour rather than a
          skin: something that solves a real interaction problem and survives
          being copied into a real codebase.
        </p>
      </header>

      <div className="about-grid" style={{ marginTop: 44 }}>
        <div className="prose-block">
          <h2>What this is</h2>
          <p>
            The Lab is a workshop. Every experiment starts from a behavioural
            question — what should scrolling past a large card feel like, how
            should a system ask a person to review its work — and ends as a
            standalone component with the same obligations as production code:
            TypeScript, keyboard support, visible focus, reduced-motion
            behaviour, and no hidden services.
          </p>
          <p>
            It is deliberately small. Sixteen experiments that can each be
            defended beats sixty that cannot.
          </p>

          <h2>Rules every experiment follows</h2>
          <ul>
            <li>
              <strong>One behaviour, done well.</strong> No kitchen-sink
              components with eleven modes.
            </li>
            <li>
              <strong>Self-contained.</strong> Components install as a folder
              of files with relative imports and scoped CSS. Nothing reads from
              the Lab&apos;s own design tokens or state.
            </li>
            <li>
              <strong>Honest about cost.</strong> Dependencies are listed, and
              most experiments have none — browser APIs and CSS come first.
            </li>
            <li>
              <strong>Accessible by construction.</strong> Keyboard paths,
              ARIA where it is genuinely needed, and documented limitations
              where an interaction is inherently pointer-first.
            </li>
            <li>
              <strong>Tested in a realistic context.</strong> Previews are
              sample products, not empty boxes, and each component has been
              installed into a separate consumer project and built there.
            </li>
          </ul>

          <h2>How installation works</h2>
          <p>
            Every experiment is published as a shadcn-compatible registry item.
            The install command on each page points at this site&apos;s{" "}
            <code>/r/&lt;slug&gt;.json</code> endpoint, which serves the
            shipped source as JSON; the shadcn CLI writes the files into your
            project and installs any npm dependency the component needs.
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
              Every custom interaction has a keyboard path, or documents that
              it is pointer-first and renders safely without one.
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
              <li>Zero-config, copy-in files</li>
            </ul>
          </div>
          <div className="fact-card">
            <h3>Start here</h3>
            <p>
              <Link href="/experiments/signal-field">Signal Field</Link> for
              ambient motion, or{" "}
              <Link href="/experiments/agent-review">
                Agent Review Surface
              </Link>{" "}
              if you are building human-in-the-loop tools.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
