"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/registry/types";
import { CatalogCard, type CatalogEntry } from "./catalog-card";

/**
 * CATALOG BROWSER — category filtering, and nothing more complicated
 * than that. The collection does not need search.
 */
export function CatalogBrowser({
  entries,
  categories,
}: {
  entries: CatalogEntry[];
  categories: { category: Category; count: number }[];
}) {
  const [active, setActive] = useState<"All" | Category>("All");
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      (active === "All"
        ? entries
        : entries.filter((entry) => entry.category === active)).filter(entry=>`${entry.name} ${entry.tagline} ${entry.category}`.toLowerCase().includes(query.trim().toLowerCase())),
    [entries, active, query],
  );

  return (
    <>
      <label className="catalog-search"><span>Find an interaction</span><input type="search" aria-label="Search components" placeholder="Try keyboard, carousel, review…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <div className="catalog-bar">
        <button
          type="button"
          className="chip"
          aria-pressed={active === "All"}
          onClick={() => setActive("All")}
        >
          All
          <span className="chip-count">{entries.length}</span>
        </button>
        {categories.map(({ category, count }) => (
          <button
            key={category}
            type="button"
            className="chip"
            aria-pressed={active === category}
            onClick={() => setActive(category)}
          >
            {category}
            <span className="chip-count">{count}</span>
          </button>
        ))}
        <p className="catalog-note" aria-live="polite">
          {active === "All"
            ? `${filtered.length} components`
            : `${filtered.length} in ${active}`}
        </p>
      </div>

      <div className="catalog" id="catalog">
        {filtered.map((entry) => (
          <CatalogCard key={entry.slug} entry={entry} />
        ))}
      </div>
      {filtered.length===0&&<p role="status">No components found. Try another search or category.</p>}
    </>
  );
}
