import { projects } from "@/lib/playground/projects";
import { ProjectCard } from "@/components/playground/home";
export const metadata = { title: "Tools" };
export default function Tools() {
  return (
    <div className="v2-wrap section-page">
      <h1>
        Make something
        <br />
        <em>of your own.</em>
      </h1>
      <p className="section-lede">
        Small creative instruments for big rabbit holes. Work in your browser,
        find something you love, export it.
      </p>
      <div className="exhibit-grid">
        {projects
          .filter((p) => p.category === "Tool")
          .map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
      </div>
    </div>
  );
}
