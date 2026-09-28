import { EvidenceCarousel } from "@/components/lab/evidence-carousel/evidence-carousel";
import type { CarouselItem } from "@/components/lab/evidence-carousel/evidence-carousel";
import "./evidence-carousel-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a case study's visual archive.
 *
 * Seven plates from a fictional survey project, built on real
 * public-domain photography: a topographic sheet, a 1921 mountain
 * reconnaissance camp, field-book pages, a 1912 street survey and three
 * geology outcrops. The captions describe the photographs; the case
 * study around them is invented. Credits live in public/archive.
 */

type Plate = {
  id: string;
  caption: string;
  meta: string;
  src: string;
  alt: string;
  position?: string;
};

const PLATES: Plate[] = [
  {
    id: "sheet",
    caption: "The traverse laid out on the topographic sheet",
    meta: "Plate 01",
    src: "/archive/topographic-sheet.jpg",
    alt: "A printed topographic map with contour lines, creeks, roads and the town of Hutchinson.",
  },
  {
    id: "camp",
    caption: "Reconnaissance camp below the north face, 1921",
    meta: "Plate 02",
    src: "/archive/north-face-camp.jpg",
    alt: "A sepia photograph of a canvas tent and three figures camped beneath a snow-covered mountain face.",
    position: "50% 64%",
  },
  {
    id: "field-book",
    caption: "Field-book pages describing the core samples",
    meta: "Plate 03",
    src: "/archive/field-book.jpg",
    alt: "Two ruled notebook pages filled with blue-ink handwriting and circled sample numbers.",
  },
  {
    id: "street",
    caption: "Level and staff on a street survey, 1912",
    meta: "Plate 04",
    src: "/archive/street-survey-1912.jpg",
    alt: "Three surveyors in suits with a transit on a tripod and a levelling staff on a city street.",
    position: "50% 55%",
  },
  {
    id: "outcrop",
    caption: "Outcrop at the formation contact",
    meta: "Plate 05",
    src: "/archive/formation-outcrop.jpg",
    alt: "A dark, blocky rock face with a geologist's hammer wedged into a crack.",
    position: "50% 42%",
  },
  {
    id: "ground-cover",
    caption: "Ground cover logged along the return leg",
    meta: "Plate 06",
    src: "/archive/ground-cover.jpg",
    alt: "A stand of trees over a meadow of small yellow flowers.",
    position: "50% 62%",
  },
  {
    id: "bed",
    caption: "The bentonite bed, exposed at the falls",
    meta: "Plate 07",
    src: "/archive/bentonite-bed.jpg",
    alt: "A layered rock ledge with a rock hammer resting against the lower band.",
    position: "50% 58%",
  },
];

const ITEMS: CarouselItem[] = PLATES.map((plate) => ({
  id: plate.id,
  caption: plate.caption,
  meta: plate.meta,
  content: (
    <div className="dm-ec-plate">
      {/* eslint-disable-next-line @next/next/no-img-element -- local archive scan, fixed frame */}
      <img
        className="dm-ec-photo"
        src={plate.src}
        alt={plate.alt}
        style={plate.position ? { objectPosition: plate.position } : undefined}
      />
    </div>
  ),
}));

export default function EvidenceCarouselDemo({ values }: DemoProps) {
  const peek = Boolean(values.peek ?? true);
  const count = Number(values.count ?? 5);
  const ratio = String(values.ratio ?? "16 / 10");
  const captions = Boolean(values.captions ?? true);
  const items = ITEMS.slice(0, count);

  return (
    <div className="dm-ec-root">
      <header className="dm-ec-head">
        <div>
          <p className="dm-ec-eyebrow">Case 014 · visual archive</p>
          <h2 className="dm-ec-title">Field survey, North Ridge</h2>
        </div>
        <p className="dm-ec-note">Public-domain photography</p>
      </header>

      <div className="dm-ec-stage">
        <EvidenceCarousel
          items={items}
          label="Field survey archive"
          ratio={ratio}
          peek={peek}
          captions={captions}
        />
      </div>

      <footer className="dm-ec-foot">
        <p>
          Seven plates from a fictional survey archive: the topographic
          sheet, a 1921 reconnaissance camp, field-book notes, a 1912 street
          survey and three geology outcrops. Every photograph is public
          domain or CC0, via Wikimedia Commons — credits in{" "}
          <code>public/archive/credits.json</code>.
        </p>
      </footer>
    </div>
  );
}
