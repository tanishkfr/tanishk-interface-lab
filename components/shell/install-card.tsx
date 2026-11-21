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
        <div className="install-card-head">
          <div className="install-title">
            <span className="install-mark" aria-hidden="true" />
            <h3>Registry install</h3>
          </div>
          <span className="install-chip">registry:component</span>
        </div>

        <p className="install-lede">
          Run this in a React project with <code>components.json</code>. The
          component and its stylesheet land in{" "}
          <code>components/lab/{slug}/</code>.
        </p>

        <div className="install-cmd" role="group" aria-label="Install command">
          <span className="install-prompt" aria-hidden="true">
            ›
          </span>
          <code tabIndex={0} aria-label="Install command">
            {command}
          </code>
          <CopyButton
            text={command}
            label="Copy"
            copiedLabel="Copied"
            dark
            title="install command"
            className="install-copy"
          />
        </div>

        <div className="install-lower">
          <div className="install-manual">
            <div className="install-subhead">
              <h4>Files included</h4>
              <span>{files.length}</span>
            </div>
            <ul className="install-files">
              {files.map((file) => {
                const split = file.path.lastIndexOf("/");
                const directory = file.path.slice(0, split + 1);
                const name = file.path.slice(split + 1);
                return (
                  <li key={file.path} title={file.path}>
                    <span className="install-file-icon" aria-hidden="true">
                      <svg viewBox="0 0 18 18" focusable="false">
                        <path
                          d="M4.5 2.5h6l3 3v10h-9Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.5 2.5v3h3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="install-file-path">
                      <span className="install-file-dir">{directory}</span>
                      <strong>{name}</strong>
                    </span>
                    <span className="file-kind">{file.kind}</span>
                  </li>
                );
              })}
            </ul>
            <p className="install-note">
              Manual install: copy each file into the same folder and preserve
              its relative imports.{" "}
              <a href="#source">Open the source</a>
            </p>
          </div>

          <aside className="install-meta" aria-label="Registry details">
            <div className="install-meta-row">
              <span>Dependencies</span>
              <strong>
                {dependencies.length > 0
                  ? dependencies.join(", ")
                  : "None declared"}
              </strong>
            </div>
            <div className="install-meta-row">
              <span>Registry item</span>
              <a
                href={`/r/${slug}.json`}
                target="_blank"
                rel="noreferrer"
              >
                /r/{slug}.json <span aria-hidden="true">↗</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
