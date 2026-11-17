"use client";
import dynamic from "next/dynamic";
const loading = () => (
  <div className="project-loading" role="status">
    Opening the experiment…
  </div>
);
const Data = dynamic(() => import("./data-matter"), { loading });
const Vector = dynamic(() => import("./vector-kitchen"), { loading });
const Motion = dynamic(() => import("./motion-foundry"), { loading });
const Mass = dynamic(() => import("./type-has-mass"), { loading });
const Terrarium = dynamic(() => import("./browser-terrarium"), { loading });
const Genome = dynamic(() => import("./interface-genome"), { loading });
const Click = dynamic(() => import("./cost-of-a-click"), { loading });
const Stickers = dynamic(() => import("./sticker-city"), { loading });
const Almost = dynamic(() => import("./almost-nothing"), { loading });
const Grid = dynamic(() => import("./grid-crimes"), { loading });
const Brutal = dynamic(() => import("./brutal-exe"), { loading });
export function ProjectHost({ slug }: { slug: string }) {
  switch (slug) {
    case "sticker-city": return <Stickers />;
    case "almost-nothing": return <Almost />;
    case "grid-crimes": return <Grid />;
    case "brutal-exe": return <Brutal />;
    case "data-matter":
      return <Data />;
    case "vector-kitchen":
      return <Vector />;
    case "motion-foundry":
      return <Motion />;
    case "type-has-mass":
      return <Mass />;
    case "browser-terrarium":
      return <Terrarium />;
    case "interface-genome":
      return <Genome />;
    case "the-cost-of-a-click":
      return <Click />;
    default:
      return null;
  }
}
