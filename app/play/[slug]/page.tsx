import { notFound } from "next/navigation";
import { projects, projectBySlug } from "@/lib/playground/projects";
import { ProjectHost } from "@/components/playground/project-host";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: PageProps<"/play/[slug]">) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  return p ? { title: p.name, description: p.description } : {};
}
export default async function Play({ params }: PageProps<"/play/[slug]">) {
  const { slug } = await params;
  if (!projectBySlug(slug)) notFound();
  return <ProjectHost slug={slug} />;
}
