import Link from "next/link";
import { notFound } from "next/navigation";
import { PreviewSandbox } from "@/components/shell/preview-sandbox";
import { InstallCard } from "@/components/shell/install-card";
import { CodeBlock, SourceDetails } from "@/components/shell/code-block";
import { CopyButton } from "@/components/shell/copy-button";
import { bundledSource, readExperimentFiles } from "@/lib/registry/build";
import {
  getExperiment,
  neighbours,
  sortedExperiments,
} from "@/lib/registry/experiments";
import type { CodeLang } from "@/lib/code";

export function generateStaticParams() {
  return sortedExperiments().map((experiment) => ({
    slug: experiment.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<"/experiments/[slug]">,
) {
  const { slug } = await props.params;
  const experiment = getExperiment(slug);
  if (!experiment) return {};
  return {
    title: experiment.name,
    description: experiment.tagline,
  };
}

const LANG_FOR: Record<string, CodeLang> = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".css": "css",
};

function langOf(path: string): CodeLang {
  const extension = path.slice(path.lastIndexOf("."));
  return LANG_FOR[extension] ?? "tsx";
}

export default async function ExperimentPage(
  props: PageProps<"/experiments/[slug]">,
) {
  const { slug } = await props.params;
  const experiment = getExperiment(slug);
  if (!experiment) notFound();

  const files = readExperimentFiles(experiment);
  const bundle = bundledSource(experiment);
  const { previous, next } = neighbours(experiment.slug);
  const related = sortedExperiments()
    .filter(
      (candidate) =>
        candidate.slug !== experiment.slug &&
        candidate.category === experiment.category,
    )
    .slice(0, 3);

  const totalLines = files.reduce(
    (sum, entry) => sum + entry.content.split("\n").length,
    0,
  );

  return (
    <div className="shell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Experiments</Link>
        <span className="sep" aria-hidden="true">
          /
        </span>
        <span aria-current="page">{experiment.name}</span>
      </nav>

      <header className="detail-head">
        <div>
          <div className="meta-row">
            <span className="meta-chip meta-chip--accent">
              <strong>{experiment.category}</strong>
            </span>
            <span className="meta-chip">
              <strong>{experiment.status}</strong>
            </span>
            {experiment.tech.map((tech) => (
              <span className="meta-chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
          <h1>{experiment.name}</h1>
          <p className="tagline">{experiment.tagline}</p>
        </div>
      </header>

      <PreviewSandbox
        slug={experiment.slug}
        controls={experiment.preview.controls}
        defaults={experiment.preview.defaults}
        devices={experiment.preview.devices}
        hint={experiment.preview.hint}
      />

      <div className="detail-body">
        <div className="detail-main">
          <section className="detail-section">
            <h2>
              <span className="section-index">01</span>What it does
            </h2>
            <p>{experiment.summary}</p>
            <p className="demo-note">
              <span className="demo-note-label">In this preview</span>
              {experiment.demoNote}
            </p>
          </section>

          <InstallCard
            slug={experiment.slug}
            dependencies={experiment.dependencies}
            files={experiment.files}
            index="02"
          />

          <section className="detail-section" aria-labelledby="usage-heading">
            <h2 id="usage-heading">
              <span className="section-index">03</span>Usage
            </h2>
            <CodeBlock
              code={experiment.usage}
              lang="tsx"
              title={`${experiment.slug}.usage.tsx`}
            />
          </section>

          <section className="detail-section" aria-labelledby="props-heading">
            <h2 id="props-heading">
              <span className="section-index">04</span>Props
            </h2>
            <table className="props-table">
              <caption className="sr-only">
                Props accepted by {experiment.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Prop</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {experiment.props.map((prop) => (
                  <tr key={prop.name}>
                    <td>
                      <code>{prop.name}</code>
                    </td>
                    <td>
                      <code>{prop.type}</code>
                    </td>
                    <td className="props-default">
                      {prop.default ?? "—"}
                    </td>
                    <td>{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="detail-section" aria-labelledby="a11y-heading">
            <h2 id="a11y-heading">
              <span className="section-index">05</span>Accessibility
            </h2>
            <ul className="notes">
              {experiment.accessibility.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="detail-section" id="source" aria-labelledby="source-heading">
            <h2 id="source-heading">
              <span className="section-index">06</span>Source
            </h2>
            <div className="source-head">
              <p>
                {files.length} files, {totalLines} lines. Nothing private, no
                configuration required.
              </p>
              <CopyButton
                text={bundle}
                label="Copy all source"
                title={`${experiment.name} source`}
              />
            </div>
            <div className="source-list">
              {files.map(({ file, content }) => (
                <SourceDetails
                  key={file.path}
                  code={content}
                  lang={langOf(file.path)}
                  title={file.path}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-rail" aria-label="Experiment details">
          <div className="fact-card">
            <h3>At a glance</h3>
            <ul>
              <li>Category · {experiment.category}</li>
              <li>Status · {experiment.status}</li>
              {experiment.dependencies.length > 0 ? (
                <li>Dependencies · {experiment.dependencies.join(", ")}</li>
              ) : (
                <li>Dependencies · none</li>
              )}
              <li>Built with · {experiment.tech.join(", ")}</li>
            </ul>
          </div>

          <div className="fact-card">
            <h3>Tags</h3>
            <p>{experiment.tags.join(" · ")}</p>
          </div>

          {related.length > 0 ? (
            <div className="fact-card">
              <h3>More {experiment.category}</h3>
              <ul>
                {related.map((entry) => (
                  <li key={entry.slug}>
                    <Link href={`/experiments/${entry.slug}`}>
                      {entry.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      <nav className="experiment-nav" aria-label="Experiment navigation">
        {previous ? (
          <Link className="prev" href={`/experiments/${previous.slug}`}>
            <span className="dir">← Previous</span>
            <span className="name">{previous.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="next" href={`/experiments/${next.slug}`}>
            <span className="dir">Next →</span>
            <span className="name">{next.name}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
