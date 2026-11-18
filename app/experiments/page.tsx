import { projects } from "@/lib/playground/projects";
import { ProjectCard, SurpriseButton } from "@/components/playground/home";
export const metadata = { title: "Experiments" };
export default function Experiments() {
  return (
    <div className="v2-wrap section-page">
      <h1>What happens if…</h1>
      <p className="section-lede">
        A question is a good enough reason to make something. These are a few of
        the places it led.
      </p>
      <SurpriseButton />
      <div className="exhibit-grid">
        {projects
          .filter((p) => p.category !== "Tool")
          .map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
      </div>
    </div>
  );
}
