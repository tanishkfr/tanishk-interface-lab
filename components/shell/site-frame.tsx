"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export function SiteFrame({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const preview = usePathname().startsWith("/preview/");
  if (preview) return <main className="preview-document">{children}</main>;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {header}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
