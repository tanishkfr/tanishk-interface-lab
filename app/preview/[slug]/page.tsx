import { notFound } from "next/navigation";
import { getExperiment, sortedExperiments } from "@/lib/registry/experiments";
import { PreviewDocument } from "@/components/docs/preview-document";
export function generateStaticParams() {
  return sortedExperiments().map((e) => ({ slug: e.slug }));
}
export const metadata = {
  robots: { index: false, follow: false },
  title: "Component preview",
};
export default async function Preview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getExperiment(slug);
  if (!e) notFound();
  return (
    <PreviewDocument
      slug={slug}
      defaults={e.preview.defaults}
      controls={e.preview.controls}
    />
  );
}
