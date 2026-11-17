import Link from "next/link";
import { VectorArtwork } from "@/components/playground/artwork";
import { Icon } from "@/components/playground/icons";
export const metadata = { title: "Products" };
export default function Products() {
  return (
    <div className="v2-wrap section-page">
      <h1>
        From a small idea
        <br />
        to its own thing.
      </h1>
      <p className="section-lede">
        Some experiments want a life outside the Lab. A home for the software
        that might get there.
      </p>
      <article className="product-feature">
        <div>
          <VectorArtwork />
        </div>
        <div>
          <span className="status">Browser prototype · v0.1</span>
          <h2>Vector Kitchen</h2>
          <p>
            A recipe-based visual instrument. Combine shapes, divergence,
            repetition, and color to make editable graphics.
          </p>
          <p>
            The browser prototype is ready to play with. A future Figma plugin
            is a possibility, not a published product.
          </p>
          <Link className="lab-button" href="/play/vector-kitchen">
            Open the prototype <Icon />
          </Link>
          <div className="product-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.1 · Browser prototype</strong>
              <br />
              Orbit, ribbon, and petal recipes. Adjustable generation, shareable
              recipe files, and editable SVG exports.
            </p>
          </div>
        </div>
      </article>
      <div className="product-release">
        <h3>Room to grow.</h3>
        <p>
          Future plugins, integrations, extensions, and standalone apps will
          live here when they exist. No downloads are published yet.
        </p>
      </div>
    </div>
  );
}
