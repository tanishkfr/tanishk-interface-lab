import { experimentCount } from "@/lib/registry/experiments";

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="shell site-foot-inner">
        <p>
          Tanishk Interface Lab — {experimentCount} interaction experiments,
          MIT licensed
        </p>
        <p>
          Built with Next.js. Previews are fictional sample interfaces, not
          real products.
        </p>
      </div>
    </footer>
  );
}
