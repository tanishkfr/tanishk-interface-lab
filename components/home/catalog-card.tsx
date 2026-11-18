"use client";

import Link from "next/link";
import type { Category, ExperimentStatus } from "@/lib/registry/types";
import { PREVIEWS } from "./previews/registry";

export type CatalogEntry = {
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  status: ExperimentStatus;
};

/**
 * CATALOG CARD — a window into the interaction, not a documentation
 * tile. The preview is the card; metadata is one quiet strip below it.
 */
export function CatalogCard({ entry }: { entry: CatalogEntry }) {
  const Preview = PREVIEWS[entry.slug];

  return (
    <article className="card group/preview">
      <div className="card-preview" aria-hidden="true" inert>
        {Preview ? <Preview /> : null}
      </div>
      <div className="card-strip">
        <div className="card-head">
          <h3 className="card-name">
            <Link href={`/experiments/${entry.slug}`}>{entry.name}</Link>
          </h3>
          <span className="card-cat">
            {entry.status === "experimental" ? "Exp · " : ""}
            {entry.category}
          </span>
        </div>
        <p className="card-line">{entry.tagline}</p>
      </div>
    </article>
  );
}
