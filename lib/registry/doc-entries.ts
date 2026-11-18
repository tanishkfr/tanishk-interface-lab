import { sortedExperiments } from "./experiments";
export function docEntries() {
  return sortedExperiments().map((e) => ({
    slug: e.slug,
    name: e.name,
    category: e.category,
    tagline: e.tagline,
    status: e.status,
    tags: e.tags,
    dependencies: e.dependencies.length,
  }));
}
