"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Experiments" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-head">
      <div className="shell site-head-inner">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true" />
          LAB
          <span className="wordmark-sub">/ Tanishk Interface Lab</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {LINKS.map((link) => {
            const current =
              link.href === "/"
                ? pathname === "/" || pathname.startsWith("/experiments")
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
