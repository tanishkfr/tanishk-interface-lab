"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTFOLIO_URL } from "@/lib/site";

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
        <a
          className="out-link"
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* the portfolio's own mark: the T from its favicon, taken as
              geometry so it inherits the Lab's signal violet */}
          <svg
            className="out-link-glyph"
            viewBox="0 0 64 64"
            width="15"
            height="15"
            aria-hidden="true"
            focusable="false"
          >
            <path fill="currentColor" d="M8 10h48v12H40v32H24V22H8z" />
          </svg>
          <span className="out-link-name">Portfolio</span>
          <span className="out-link-arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </header>
  );
}
