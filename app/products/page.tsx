import Link from "next/link";
import Image from "next/image";
import { VectorArtwork } from "@/components/playground/artwork";
import { Icon } from "@/components/playground/icons";
import { ComingSoon } from "@/components/playground/coming-soon";
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
      <article className="product-feature gc-feature">
        <div>
          <Image
            src="/products/grid-crimes/cover.png"
            alt="GRID CRIMES/ cover artwork with six generated composition directions."
            width={1600}
            height={900}
            sizes="(max-width: 980px) 90vw, 54vw"
          />
        </div>
        <div>
          <span className="status gc-feature-status">
            Figma development build · v0.1.0
          </span>
          <h2>GRID CRIMES/</h2>
          <p>
            A procedural composition instrument. Select a composition, choose
            one of six art directions, and generate four new layouts that keep
            the actual content as editable Figma layers.
          </p>
          <p>
            Then crossbreed two directions into a third with real design-DNA
            inheritance. Not published to Figma Community yet; the local
            development build and full build notes are ready.
          </p>
          <Link className="lab-button" href="/products/grid-crimes">
            Read the build notes <Icon />
          </Link>
          <div className="product-release gc-feature-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.1.0 · Figma development build</strong>
              <br />
              Six direction engines, 24 grammars, seeded layout planning,
              quality scoring, native editable output, crossbreed, missing-font
              handling, and a dense-composition fallback. Native Figma QA is
              pending; Community publication requires approval.
            </p>
          </div>
        </div>
      </article>
      <ComingSoon />
    </div>
  );
}
