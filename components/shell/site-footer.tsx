import Link from "next/link";
import { Icon } from "@/components/playground/icons";
export function SiteFooter() {
  return (
    <footer className="v2-footer print-colophon">
      <div className="v2-wrap">
        <div className="v2-footer-top">
          <p>
            Still
            <br />
            <em>curious?</em>
          </p>
          <div>
            <span>An independent internet playground.</span>
            <span>Built, broken, and rebuilt by Tanishk.</span>
            <a
              href="https://github.com/tanishkfr/tanishk-interface-lab"
              target="_blank"
              rel="noreferrer"
            >
              Open source on GitHub <Icon width="15" height="15" />
            </a>
          </div>
        </div>
        <nav className="footer-directory" aria-label="Explore the Lab">
          {[
            ["01", "Experiments", "/experiments", "Follow a strange idea."],
            ["02", "Tools", "/tools", "Make something of your own."],
            ["03", "Components", "/components", "Take a detail with you."],
            ["04", "Software", "/software", "See what leaves the lab."],
          ].map(([n, title, url, description]) => (
            <Link href={url} key={url}>
              <span>{n}</span>
              <strong>
                {title}
                <Icon />
              </strong>
              <small>{description}</small>
            </Link>
          ))}
        </nav>
        <div className="v2-footer-bottom">
          <Link href="/" className="v2-logo">
            LAB/
          </Link>
          <span className="footer-edition">
            Independent by design.
            <br />
            Open by nature.
          </span>
          <Link href="/about">About this place</Link>
          <a href="https://tanishk.me" target="_blank" rel="noreferrer">
            tanishk.me <Icon width="14" height="14" />
          </a>
        </div>
      </div>
    </footer>
  );
}
