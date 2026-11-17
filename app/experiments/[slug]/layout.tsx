import {DocsShell} from '@/components/docs/navigation';import {docEntries} from '@/lib/registry/doc-entries';
export default function ComponentLayout({children}:{children:React.ReactNode}){return <DocsShell entries={docEntries()}>{children}</DocsShell>}
