import { CatalogBrowser } from "@/components/home/catalog-browser";
import {
  sortedExperiments,
  experimentsByCategory,
} from "@/lib/registry/experiments";
import type { Category } from "@/lib/registry/types";
export const metadata = {
  title: "Components",
  description:
    "19 independently installable interactions. Live previews, controls, source, usage and accessible behavior.",
};
export default function Components() {
  const entries = sortedExperiments().map((e) => ({
    slug: e.slug,
    name: e.name,
    tagline: e.tagline,
    category: e.category,
    status: e.status,
  }));
  return (
    <div className="shell section-page">
      <div className="components-heading">
        <div>
          <h1>
            Details make
            <br />
            the difference.
          </h1>
          <p>
            Thoughtful interactions for real interfaces. Play with the preview,
            adjust the behavior, then take the source home.
          </p>
        </div>
        <span>19 components · MIT licensed</span>
      </div>
      <CatalogBrowser
        entries={entries}
        categories={experimentsByCategory()
          .filter((e) => e.count > 0)
          .map((e) => ({ category: e.category as Category, count: e.count }))}
      />
    </div>
  );
}
