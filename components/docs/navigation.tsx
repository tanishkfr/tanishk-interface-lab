"use client";
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
  const pathname = usePathname();
  return (
    <nav className="docs-navigation" aria-label="Component navigation">
      {["Motion", "Input", "Navigation", "Media", "Systems", "Agentic"].map(
        (category) => {
          const filtered = entries.filter((e) => e.category === category);
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
