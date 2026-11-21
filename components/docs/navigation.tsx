"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { usePathname } from "next/navigation";
export type DocEntry = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  status: string;
  tags: string[];
  dependencies: number;
};
export function DocsNavigation({ entries }: { entries: DocEntry[] }) {
  const pathname = usePathname();
  const filterId = useId();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? entries.filter((entry) =>
        `${entry.name} ${entry.category} ${entry.tagline} ${entry.tags.join(" ")}`
          .toLowerCase()
          .includes(needle),
      )
    : entries;
  return (
    <nav className="docs-navigation" aria-label="Component navigation">
      <div className="docs-nav-filter">
        <label className="sr-only" htmlFor={filterId}>
          Filter components
        </label>
        <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          <circle cx="7.7" cy="7.7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11.2 11.2 15.8 15.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          id={filterId}
          type="search"
          value={query}
          placeholder="Filter components"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button type="button" aria-label="Clear component filter" onClick={() => setQuery("")}>
            ×
          </button>
        ) : null}
      </div>
      <p className="docs-nav-count" aria-live="polite">
        {needle ? `${filtered.length} of ${entries.length}` : `${entries.length} components`}
      </p>
      {["Motion", "Input", "Navigation", "Media", "Systems", "Agentic"].map(
        (category) => {
          const group = filtered.filter((entry) => entry.category === category);
          return group.length ? (
            <div className="docs-nav-group" key={category}>
              <span>{category}</span>
              {group.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/experiments/${entry.slug}`}
                  aria-current={
                    pathname.endsWith("/" + entry.slug) ? "page" : undefined
                  }
                >
                  {entry.name}
                </Link>
              ))}
            </div>
          ) : null;
        },
      )}
      {needle && filtered.length === 0 ? (
        <p className="docs-nav-empty">
          No components match that filter. <button type="button" onClick={() => setQuery("")}>Show all</button>
        </p>
      ) : null}
    </nav>
  );
}
export function DocsShell({
  entries,
  children,
}: {
  entries: DocEntry[];
  children: React.ReactNode;
}) {
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <DocsNavigation entries={entries} />
      </aside>
      <details className="docs-mobile-navigation">
        <summary>Browse components</summary>
        <DocsNavigation entries={entries} />
      </details>
      <div className="docs-content">{children}</div>
    </div>
  );
}
