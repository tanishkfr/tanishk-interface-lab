"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeroPress } from "./hero-press";
import { projects, type Project } from "@/lib/playground/projects";
import { Icon } from "./icons";
import { ProjectArtwork, Rosette } from "./artwork";
type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  category: string;
};
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
          <span>
            <span className="live-dot" /> Open for play
          </span>
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
            <div className="exhibit-grid">
              {selected.map((p) => (
                <ProjectCard
                  key={p.slug}
                  project={p}
                  prominent={
                    filter === "Everything" && !q && p.slug === "data-matter"
                  }
                />
              ))}
            </div>
            {matches.length > 0 && (
              <div className="component-collection">
                <div>
                  <h2>
                    Small interactions.
                    <br />
                    <em>Considered in detail.</em>
                  </h2>
                  <p>
                    19 components for the moments between clicks.
                    <br />
                    Real previews. Source included. Yours to make your own.
                  </p>
                  <Link className="text-link" href="/components">
                    Inside the component library <Icon />
                  </Link>
                </div>
                <div className="component-links">
                  {matches
                    .slice(0, filter === "Components" || q ? 19 : 5)
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
      <div className="home-colophon v2-wrap">
        <Rosette />
        <p>
          A space for useful things,
          <br />
          strange things, and the things
          <br />
          <em>somewhere in between.</em>
        </p>
        <Link href="/about" className="text-link">
          Why this place exists <Icon />
        </Link>
      </div>
    </div>
  );
}
