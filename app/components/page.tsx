import { ComponentLibrary } from "@/components/docs/library";
import { DocsShell } from "@/components/docs/navigation";
import { docEntries } from "@/lib/registry/doc-entries";
export const metadata = {
  title: "Components",
  description:
    "19 independently installable interactions. Real responsive previews, controls, installation, props and source.",
};
export default function Components() {
  const entries = docEntries();
  return (
    <DocsShell entries={entries}>
      <ComponentLibrary entries={entries} />
    </DocsShell>
  );
}
