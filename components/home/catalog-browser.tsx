"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/registry/types";
import { CatalogCard, type CatalogEntry } from "./catalog-card";

/**
 * CATALOG BROWSER — category filtering, and nothing more complicated
 * than that. Sixteen experiments do not need search.
 */
export function CatalogBrowser({
  entries,
  categories,
}: {
  entries: CatalogEntry[];
  categories: { category: Category; count: number }[];
}) {
  const [active, setActive] = useState<"All" | Category>("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? entries
        : entries.filter((entry) => entry.category === active),
    [entries, active],
  );

  return (
    <>
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
            ? `${entries.length} experiments`
            : `${filtered.length} in ${active}`}
        </p>
      </div>

      <div className="catalog" id="catalog">
        {filtered.map((entry) => (
          <CatalogCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </>
  );
}
