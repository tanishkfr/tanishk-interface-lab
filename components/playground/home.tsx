"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { HeroPress } from "./living-wordmark";
import {
  projects,
  projectBySlug,
  type Project,
} from "@/lib/playground/projects";
import { Icon } from "./icons";
import { ProjectArtwork } from "./artwork";
type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  category: string;
};

/**
 * The full-collection gallery is a curated editorial sequence rather than a
 * uniform card grid. Each spread shares an art height so rows close cleanly
 * while spans, ratios and reading rhythm keep changing. Filtered and searched
 * results fall back to the neutral clustered arrangement below.
 */
type GalleryCell = {
  slug: string;
  span: number;
  ratio: number;
};

const GALLERY_LAYOUT: GalleryCell[][] = [
  [
    { slug: "text-desk", span: 5, ratio: 1.09 },
    { slug: "sticker-city", span: 7, ratio: 1.55 },
  ],
  [
    { slug: "data-matter", span: 8, ratio: 1.6 },
    { slug: "almost-nothing", span: 4, ratio: 0.78 },
  ],
  [
    { slug: "grid-crimes", span: 7, ratio: 1.45 },
    { slug: "type-has-mass", span: 5, ratio: 1 },
  ],
  [
    { slug: "vector-kitchen", span: 4, ratio: 0.78 },
    { slug: "motion-foundry", span: 8, ratio: 1.6 },
  ],
  [
    { slug: "interface-genome", span: 5, ratio: 0.92 },
    { slug: "browser-terrarium", span: 7, ratio: 1.3 },
  ],
  [
    { slug: "brutal-exe", span: 7, ratio: 1.35 },
    { slug: "the-cost-of-a-click", span: 5, ratio: 0.9 },
  ],
];

const CURATED_SLUGS = new Set(
  GALLERY_LAYOUT.flat().map((cell) => cell.slug),
);

function galleryCellStyle(cell: GalleryCell): CSSProperties {
  return {
    "--gallery-span": cell.span,
    "--gallery-ratio": cell.ratio,
  } as CSSProperties;
}

export function SurpriseButton() {
  const router = useRouter();
  return (
    <button
      className="surprise-button"
      onClick={() => {
        router.push(
          `/play/${projects[Math.floor(Math.random() * projects.length)].slug}`,
        );
      }}
    >
      Surprise me <Icon name="shuffle" width="17" height="17" />
    </button>
  );
}
export function ProjectCard({
  project,
  prominent = false,
}: {
  project: Project;
  prominent?: boolean;
}) {
  return (
    <article
      className={`exhibit exhibit--${project.slug}${prominent ? " exhibit--prominent" : ""}`}
    >
      <Link href={`/play/${project.slug}`} className="exhibit-link">
        <div className="exhibit-art" style={{ background: project.color }}>
          <span className="exhibit-medium">{project.medium}</span>
          <ProjectArtwork slug={project.slug} />
          <span className="exhibit-open">
            <Icon />
            <span className="sr-only">Open {project.name}</span>
          </span>
          {prominent && (
            <span className="exhibit-art-caption">
              NUMBERS, WITH A DIFFERENT KIND OF WEIGHT.
            </span>
          )}
        </div>
        <div className="exhibit-caption">
          <div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </div>
          <span className="exhibit-category">
            {project.category}
            <small>{project.status}</small>
          </span>
        </div>
      </Link>
    </article>
  );
}
export function PlaygroundHome({
  components,
}: {
  components: ComponentEntry[];
}) {
  const [view, setView] = useState<"gallery" | "index">("gallery");
  const [filter, setFilter] = useState("Everything");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const selected = projects.filter(
    (p) =>
      (filter === "Everything" ||
        (filter === "Experiments" &&
          (p.category === "Experiment" || p.category === "Story")) ||
        (filter === "Tools" && p.category === "Tool")) &&
      `${p.name} ${p.description} ${p.medium}`.toLowerCase().includes(q),
  );
  const matches = components.filter(
    (c) =>
      (filter === "Everything" || filter === "Components") &&
      `${c.name} ${c.description} ${c.category}`.toLowerCase().includes(q),
  );
  const curated = filter === "Everything" && q === "";
  const extras = curated
    ? selected.filter((project) => !CURATED_SLUGS.has(project.slug))
    : [];
  return (
    <div className="v2-home">
      <section className="v2-wrap playground-hero">
        <div className="hero-intro">
          <p>
            A playground for things
            <br />
            that don’t need to exist.
            <br />
            <span>But we’re glad they do.</span>
          </p>
          <div className="hero-note">
            <span>Experiments. Tools. Happy accidents.</span>
            <span>
              Made by <a href="https://tanishk.me">Tanishk</a>, for the curious.
            </span>
          </div>
        </div>
        <HeroPress />
        <div className="hero-floor">
          <a href="#collection">
            A few things to get lost in <span aria-hidden="true">↓</span>
          </a>
          <SurpriseButton />
        </div>
      </section>
      <section className="v2-wrap collection" id="collection">
        <div className="collection-title">
          <h2>
            Follow your curiosity<span>.</span>
          </h2>
          <div className="view-switch" aria-label="Collection view">
            <button
              aria-pressed={view === "gallery"}
              onClick={() => setView("gallery")}
            >
              <Icon name="grid" width="15" height="15" />
              Gallery
            </button>
            <button
              aria-pressed={view === "index"}
              onClick={() => setView("index")}
            >
              <Icon name="list" width="17" height="17" />
              Index
            </button>
          </div>
        </div>
        <div className="collection-toolbar">
          <div className="collection-filters">
            {["Everything", "Experiments", "Tools", "Components"].map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
                <sup>
                  {f === "Everything"
                    ? projects.length + components.length
                    : f === "Experiments"
                      ? projects.filter((p) => p.category !== "Tool").length
                      : f === "Tools"
                        ? projects.filter((p) => p.category === "Tool").length
                        : components.length}
                </sup>
              </button>
            ))}
          </div>
          <label className="collection-search">
            <Icon name="search" width="17" height="17" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find something…"
              aria-label="Search the collection"
            />
          </label>
        </div>
        <p className="sr-only" aria-live="polite">
          {selected.length + matches.length} results
        </p>
        {selected.length === 0 && matches.length === 0 ? (
          <div className="collection-empty">
            <h3>Nothing here by that name.</h3>
            <p>Try a different word, or start again.</p>
            <button
              className="lab-button"
              onClick={() => {
                setQuery("");
                setFilter("Everything");
              }}
            >
              Show everything
            </button>
          </div>
        ) : view === "index" ? (
          <div className="project-index">
            {selected.map((p) => (
              <Link key={p.slug} href={`/play/${p.slug}`}>
                <span className="index-dot" style={{ background: p.color }} />
                <strong>{p.name}</strong>
                <span>{p.medium}</span>
                <small>{p.category}</small>
                <Icon />
              </Link>
            ))}
            {matches.map((c) => (
              <Link key={c.slug} href={`/experiments/${c.slug}`}>
                <span className="index-dot" />
                <strong>{c.name}</strong>
                <span>{c.description}</span>
                <small>Component</small>
                <Icon />
              </Link>
            ))}
          </div>
        ) : (
          <>
            {curated ? (
              <div className="staggered-gallery gallery-curated">
                {GALLERY_LAYOUT.map((spread, spreadIndex) => (
                  <div className="gallery-spread" key={spreadIndex}>
                    {spread.map((cell) => {
                      const project = projectBySlug(cell.slug);
                      if (!project) return null;
                      return (
                        <div
                          className={`gallery-cell gallery-cell--${cell.slug}`}
                          key={cell.slug}
                          style={galleryCellStyle(cell)}
                        >
                          <ProjectCard project={project} />
                        </div>
                      );
                    })}
                  </div>
                ))}
                {extras.length > 0 && (
                  <div className="gallery-spread gallery-spread--extras">
                    {extras.map((project) => (
                      <div
                        className={`gallery-cell gallery-cell--${project.slug}`}
                        key={project.slug}
                        style={galleryCellStyle({
                          slug: project.slug,
                          span: 6,
                          ratio: 1.35,
                        })}
                      >
                        <ProjectCard project={project} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="staggered-gallery">
                {Array.from(
                  { length: Math.ceil(selected.length / 5) },
                  (_, group) => {
                    const items = selected.slice(group * 5, group * 5 + 5);
                    return (
                      <div className="gallery-cluster" key={group}>
                        <div className="gallery-column">
                          {[items[0], items[3]].filter(Boolean).map((p) => (
                            <ProjectCard key={p.slug} project={p} />
                          ))}
                        </div>
                        <div className="gallery-column">
                          {[items[1], items[2]].filter(Boolean).map((p) => (
                            <ProjectCard key={p.slug} project={p} />
                          ))}
                        </div>
                        {items[4] && (
                          <div className="gallery-wide">
                            <ProjectCard project={items[4]} />
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
            {matches.length > 0 && (
              <div className="component-collection">
                <div>
                  <h2>
                    Small interactions.
                    <br />
                    <em>Considered in detail.</em>
                  </h2>
                  <p>
                    {components.length} components for the moments between
                    clicks.
                    <br />
                    Real previews. Source included. Yours to make your own.
                  </p>
                  <Link className="text-link" href="/components">
                    Inside the component library <Icon />
                  </Link>
                </div>
                <div className="component-links">
                  {matches
                    .slice(
                      0,
                      filter === "Components" || q ? components.length : 5,
                    )
                    .map((c) => (
                      <Link key={c.slug} href={`/experiments/${c.slug}`}>
                        <span>
                          {c.name}
                          <small>{c.category}</small>
                        </span>
                        <Icon width="17" height="17" />
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
