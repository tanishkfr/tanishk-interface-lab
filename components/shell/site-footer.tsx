import Link from "next/link";
import { Icon } from "@/components/playground/icons";
export function SiteFooter() {
  return (
    <footer className="v2-footer">
      <div className="v2-wrap">
        <div className="v2-footer-top">
          <p>
            Made out of
            <br />
            <em>curiosity.</em>
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
        <div className="v2-footer-bottom">
          <Link href="/" className="v2-logo">
            LAB/
          </Link>
          <span>Always a work in play.</span>
          <Link href="/about">About this place</Link>
          <a href="https://tanishk.me" target="_blank" rel="noreferrer">
            tanishk.me <Icon width="14" height="14" />
          </a>
        </div>
      </div>
    </footer>
  );
}
