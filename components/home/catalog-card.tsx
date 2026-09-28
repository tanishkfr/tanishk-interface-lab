"use client";

import Link from "next/link";
import { InView } from "@/components/shell/in-view";
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
    <article className="card">
      <div className="card-preview group/preview" aria-hidden={Preview ? undefined : true}>
        <InView rootMargin="420px">
          {Preview ? <Preview /> : null}
        </InView>
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
        <span className="card-go" aria-hidden="true">
          Open <span className="card-go-arrow">→</span>
        </span>
      </div>
    </article>
  );
}
