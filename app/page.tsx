import { PlaygroundHome } from "@/components/playground/home";
import { homeExperiments } from "@/lib/registry/experiments";

/**
 * The homepage receives only the curated component collection. The full
 * library lives at /components and must not leak into this index or its
 * search results. See HOME_FEATURED_SLUGS in the registry.
 */
export default function Home() {
  return (
    <PlaygroundHome
      components={homeExperiments().map((e) => ({
        slug: e.slug,
        name: e.name,
        description: e.tagline,
        category: e.category,
      }))}
    />
  );
}
