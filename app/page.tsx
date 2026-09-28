import { CatalogBrowser } from "@/components/home/catalog-browser";
import type { CatalogEntry } from "@/components/home/catalog-card";
import {
  experiments,
  experimentsByCategory,
  sortedExperiments,
} from "@/lib/registry/experiments";
import type { Category } from "@/lib/registry/types";

export default function Home() {
  const entries: CatalogEntry[] = sortedExperiments().map((experiment) => ({
    slug: experiment.slug,
    name: experiment.name,
    tagline: experiment.tagline,
    category: experiment.category,
    status: experiment.status,
  }));

  const categories = experimentsByCategory()
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      category: entry.category as Category,
      count: entry.count,
    }));

  const dependencyFree = experiments.filter(
    (experiment) => experiment.dependencies.length === 0,
  ).length;

  return (
    <div className="shell">
      <section className="hero">
        <p className="hero-eyebrow mono-label">
          <span className="dot" aria-hidden="true" />
          Tanishk Interface Lab — v1
        </p>
        <h1 className="hero-title">
          Interaction experiments for <em>real</em> interfaces.
        </h1>
        <p className="hero-lede">
          Reusable behaviours, not just components. Each experiment here solves
          one interaction problem properly — keyboard included, reduced motion
          respected, and installable on its own.
        </p>
        <div className="hero-meta">
          <span>
            <strong>{entries.length}</strong> experiments
          </span>
          <span>
            <strong>{categories.length}</strong> categories
          </span>
          <span>
            <strong>{dependencyFree}</strong> with zero dependencies
          </span>
          <span>
            <strong>MIT</strong> licensed
          </span>
        </div>
      </section>

      <CatalogBrowser entries={entries} categories={categories} />
    </div>
  );
}
