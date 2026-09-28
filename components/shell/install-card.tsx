import { CopyButton } from "./copy-button";
import { SITE_URL } from "@/lib/site";
import type { RegistryFile } from "@/lib/registry/types";

/**
 * INSTALL CARD — the real thing: the command points at the Lab's own
 * published registry endpoint, which serves a shadcn-compatible item
 * built from the shipped source. The canonical origin is fixed, so the
 * copied command installs from the deployed Lab rather than from
 * whatever host this page happens to be open on.
 */
export function InstallCard({
  slug,
  dependencies,
  files,
  index = "02",
}: {
  slug: string;
  dependencies: string[];
  files: RegistryFile[];
  index?: string;
}) {
  const command = `npx shadcn@latest add ${SITE_URL}/r/${slug}.json`;

  return (
    <section className="detail-section" id="install" aria-labelledby="install-heading">
      <h2 id="install-heading">
        <span className="section-index">{index}</span>Install
      </h2>
      <div className="install-card">
        <h3>Registry install</h3>
        <p className="hint">
          Works with the shadcn CLI in any project that has a{" "}
          <code>components.json</code>. The component lands in{" "}
          <code>components/lab/{slug}/</code> with its stylesheet beside it.
        </p>
        <div className="install-cmd">
          <code>{command}</code>
          <CopyButton text={command} label="Copy" title="install command" />
        </div>
        <p className="install-alt">
          {dependencies.length > 0 ? (
            <>
              Installs one package:{" "}
              <strong>{dependencies.join(", ")}</strong>.{" "}
            </>
          ) : (
            <>No npm packages are installed — the component is self-contained. </>
          )}
          <>
            Prefer manual copying? Every file is below under{" "}
            <a href="#source">Source</a>.
          </>
        </p>
        <ul className="install-files">
          {files.map((file) => (
            <li key={file.path}>
              <span>{file.path}</span>
              <span className="file-kind">{file.kind}</span>
            </li>
          ))}
        </ul>
        <p className="install-alt">
          Machine-readable item:{" "}
          <a href={`/r/${slug}.json`} target="_blank" rel="noreferrer">
            /r/{slug}.json ↗
          </a>
        </p>
      </div>
    </section>
  );
}
