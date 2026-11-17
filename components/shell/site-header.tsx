"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/playground/icons";
const links = [
  ["/experiments", "Experiments"],
  ["/tools", "Tools"],
  ["/components", "Components"],
  ["/products", "Products"],
] as const;
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="v2-header">
      <div className="v2-header-inner">
        <Link
          href="/"
          className="v2-logo"
          aria-label="LAB home"
          onClick={() => setOpen(false)}
        >
          LAB<span>/</span>
        </Link>
        <nav
          id="primary-navigation"
          aria-label="Primary"
          className={open ? "v2-nav is-open" : "v2-nav"}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href ||
                (href === "/components" && pathname.startsWith("/experiments/"))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/#collection" className="v2-index-link">
          Explore the index <Icon name="arrow" width="15" height="15" />
        </Link>
        <button
          className="v2-menu"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          <Icon name={open ? "close" : "list"} />
        </button>
      </div>
    </header>
  );
}
