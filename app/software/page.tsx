import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/playground/icons";
import { ComingSoon } from "@/components/playground/coming-soon";
export const metadata = { title: "Software" };
export default function Software() {
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
      <article className="product-feature vector-feature">
        <div>
          <Image
            src="/software/vector-kitchen-flat-lay.webp"
            alt="A print-studio flat lay of Vector Kitchen studies: swirling vector ribbons, geometric petal forms and recipe cards in violet, coral and acid yellow."
            width={1374}
            height={1145}
            sizes="(max-width: 980px) 90vw, 54vw"
            unoptimized
          />
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
            src="/software/grid-crimes/feature-still-life.webp"
            alt="Six printed composition sheets, registration marks and a black Grid Crimes card with an acid slash tile arranged on a studio table."
            width={1374}
            height={1145}
            sizes="(max-width: 980px) 90vw, 54vw"
            unoptimized
          />
        </div>
        <div>
          <span className="status gc-feature-status">
            Figma Plugin · v0.1.0
          </span>
          <h2>Grid Crimes</h2>
          <p>
            A procedural composition instrument. Select a composition, choose
            one of six art directions, and generate four new layouts that keep
            the actual content as editable Figma layers.
          </p>
          <p>
            Then crossbreed two directions into a third with real design-DNA
            inheritance. Not published to Figma Community yet; the Figma plugin
            and full build notes are ready.
          </p>
          <div className="gc-feature-actions">
            <a
              className="lab-button gc-download-button"
              href="/downloads/grid-crimes-v0.1.0.zip"
              download
            >
              Download v0.1.0 <Icon name="download" />
            </a>
            <Link className="lab-button" href="/software/grid-crimes">
              Read the build notes <Icon />
            </Link>
          </div>
          <div className="product-release gc-feature-release">
            <h3>Release notes</h3>
            <p>
              <strong>v0.1.0 · Figma Plugin</strong>
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

