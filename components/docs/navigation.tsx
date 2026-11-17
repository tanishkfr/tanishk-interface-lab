"use client";
import { useState } from "react";
import Link from "next/link";
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
  const pathname = usePathname(),
    [query, setQuery] = useState("");
  return (
    <nav className="docs-navigation" aria-label="Component navigation">
      <Link className="docs-home-link" href="/components">
        The component library <span aria-hidden="true">↗</span>
      </Link>
      <label className="docs-nav-search">
        <span className="sr-only">Find a component in navigation</span>
        <input
          type="search"
          value={query}
          placeholder="Find a component…"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {["Motion", "Input", "Navigation", "Media", "Systems", "Agentic"].map(
        (category) => {
          const filtered = entries.filter(
            (e) =>
              e.category === category &&
              `${e.name} ${e.tags.join(" ")}`
                .toLowerCase()
                .includes(query.toLowerCase()),
          );
          return filtered.length ? (
            <div className="docs-nav-group" key={category}>
              <span>{category}</span>
              {filtered.map((e) => (
                <Link
                  key={e.slug}
                  href={`/experiments/${e.slug}`}
                  aria-current={
                    pathname.endsWith("/" + e.slug) ? "page" : undefined
                  }
                >
                  {e.name}
                </Link>
              ))}
            </div>
          ) : null;
        },
      )}
      {entries.every(
        (e) =>
          !`${e.name} ${e.tags.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ) && <p className="docs-no-results">No matching components.</p>}
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
