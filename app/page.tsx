import { PlaygroundHome } from "@/components/playground/home";
import { sortedExperiments } from "@/lib/registry/experiments";
export default function Home() {
  return (
    <PlaygroundHome
      components={sortedExperiments().map((e) => ({
        slug: e.slug,
        name: e.name,
        description: e.tagline,
        category: e.category,
      }))}
    />
  );
}
