"use client";
import { useState } from "react";
import Link from "next/link";
import { CatalogCard } from "@/components/home/catalog-card";
import { Icon } from "@/components/playground/icons";
import type { DocEntry } from "./navigation";
import type { Category, ExperimentStatus } from "@/lib/registry/types";
export function ComponentLibrary({ entries }: { entries: DocEntry[] }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [view, setView] = useState<"Gallery" | "List">("Gallery"),
    [dependencyFree, setDependencyFree] = useState(false);
  const categories = ["All", ...new Set(entries.map((e) => e.category))];
  const filtered = entries.filter(
    (e) =>
      (category === "All" || e.category === category) &&
      (!dependencyFree || e.dependencies === 0) &&
      `${e.name} ${e.tagline} ${e.tags.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="component-library">
      <header className="library-head">
        <div>
          <h1>
            Small details.
            <br />
            <em>Lasting impressions.</em>
          </h1>
          <p>
            {entries.length} thoughtful interactions. Real previews, independent
            source, and an installation command that gets you straight to
            making.
          </p>
        </div>
        <a
          className="library-license"
          href="https://github.com/tanishkfr/tanishk-interface-lab/blob/main/LICENSE"
        >
          MIT licensed <Icon width="15" height="15" />
        </a>
      </header>
      <div className="library-controls">
        <label className="library-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Search components"
            placeholder="Search names, behaviors, or tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="view-switch" aria-label="Component view">
          {(["Gallery", "List"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              <Icon name={v === "Gallery" ? "grid" : "list"} />
              {v}
            </button>
          ))}
        </div>
      </div>
      <div
        className="library-categories"
        aria-label="Filter component category"
      >
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
            <span>
              {c === "All"
                ? entries.length
                : entries.filter((e) => e.category === c).length}
            </span>
          </button>
        ))}
      </div>
      <div className="library-result-line">
        <span aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "component" : "components"}
        </span>
        <label>
          <input
            type="checkbox"
            checked={dependencyFree}
            onChange={(e) => setDependencyFree(e.target.checked)}
          />{" "}
          No extra npm dependencies
        </label>
      </div>
      {!filtered.length ? (
        <div className="collection-empty">
          <h2>No matching interactions.</h2>
          <p>Try a broader search or reset the filters.</p>
          <button
            className="lab-button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setDependencyFree(false);
            }}
          >
            Reset filters
          </button>
        </div>
      ) : view === "Gallery" ? (
        <div className="catalog library-gallery">
          {filtered.map((e) => (
            <CatalogCard
              key={e.slug}
              entry={{
                ...e,
                category: e.category as Category,
                status: e.status as ExperimentStatus,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="library-list">
          {filtered.map((e) => (
            <Link key={e.slug} href={`/experiments/${e.slug}`}>
              <strong>{e.name}</strong>
              <span>{e.tagline}</span>
              <small>{e.category}</small>
              <Icon />
            </Link>
          ))}
        </div>
      )}
      <div className="library-install-note">
        <span className="library-mini-mark">LAB/</span>
        <div>
          <h2>Take just what you need.</h2>
          <p>
            Every component installs independently through the shadcn registry.
            You get the TypeScript, styles, and documented public API. The rest
            of the Lab stays here.
          </p>
        </div>
        <Link className="text-link" href="/experiments/signal-field#install">
          How installation works <Icon />
        </Link>
      </div>
    </div>
  );
}
