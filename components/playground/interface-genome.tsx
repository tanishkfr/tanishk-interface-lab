"use client";
import { useState } from "react";
import {
  ProjectHeading,
  Slider,
  Segments,
  ExportButton,
  download,
} from "./workbench";
type Genome = {
  density: number;
  hierarchy: number;
  navigation: "Top" | "Side";
  layout: "Journal" | "Gallery" | "Index";
  generation: number;
};
const INITIAL: Genome = {
  density: 38,
  hierarchy: 65,
  navigation: "Top",
  layout: "Journal",
  generation: 1,
};
const stories = [
  {
    title: "The space between things",
    type: "Observation",
    text: "An interface is also the silence around its elements.",
  },
  {
    title: "A color with a memory",
    type: "Field note",
    text: "Why some combinations feel like places we have already been.",
  },
  {
    title: "Learning to look again",
    type: "Conversation",
    text: "A slower approach to making things on a fast internet.",
  },
  {
    title: "A useful little accident",
    type: "Observation",
    text: "Some of the best ideas arrive before the explanation does.",
  },
  {
    title: "Notes from the edges",
    type: "Field note",
    text: "Small discoveries from a week spent paying attention.",
  },
  {
    title: "Nothing is finished",
    type: "Conversation",
    text: "Leaving room for what comes next.",
  },
];
export default function InterfaceGenome() {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [preserved, setPreserved] = useState(0);
  const [g, setG] = useState<Genome>(INITIAL),
    [saved, setSaved] = useState<Genome[]>([]),
    [history, setHistory] = useState<Genome[]>([INITIAL]),
    [compare, setCompare] = useState(false),
    [tab, setTab] = useState("All"),
    [opened, setOpened] = useState<number | null>(null),
    [favorites, setFavorites] = useState<number[]>([]),
    [status, setStatus] = useState("");
  function update<K extends keyof Genome>(key: K, value: Genome[K]) {
    setG((s) => ({ ...s, [key]: value }));
  }
  function mutate() {
    const n: Genome = {
      density: Math.round(Math.random() * 70 + 15),
      hierarchy: Math.round(Math.random() * 80 + 20),
      navigation: Math.random() > 0.5 ? "Top" : "Side",
      layout: (["Journal", "Gallery", "Index"] as const)[
        Math.floor(Math.random() * 3)
      ],
      generation:
        Math.max(g.generation, ...history.map((h) => h.generation)) + 1,
    };
    setHistory((h) => [...h.slice(-11), n]);
    setG(n);
    setStatus(`Generation ${n.generation} created.`);
  }
  function surface(genome: Genome, mini = false) {
    const visible = stories
      .map((s, i) => ({ ...s, i }))
      .filter(
        (s) =>
          tab === "All" ||
          (tab === "Saved" ? favorites.includes(s.i) : s.type === tab),
      );
    return (
      <div
        className={`generated-interface genome-nav-${genome.navigation.toLowerCase()} genome-layout-${genome.layout.toLowerCase()}${mini ? " genome-mini" : ""}`}
        style={
          {
            "--genome-gap": `${Math.round(40 - genome.density * 0.3)}px`,
            "--genome-title": `${24 + genome.hierarchy * 0.45}px`,
            "--genome-cols": genome.density > 65 ? 3 : 2,
          } as React.CSSProperties
        }
      >
        <nav aria-label={mini ? "Compared interface" : "Generated interface"}>
          <strong>
            FIELD
            <br />
            NOTES
          </strong>
          <div>
            {["All", "Observation", "Field note", "Saved"].map((t) => (
              <button
                key={t}
                aria-pressed={tab === t}
                onClick={() => {
                  setTab(t);
                  setOpened(null);
                }}
              >
                {t === "Saved" ? `Saved (${favorites.length})` : t}
              </button>
            ))}
          </div>
          <span>Ideas worth keeping.</span>
        </nav>
        <div className="generated-content">
          <header>
            <h2>
              Ideas grow
              <br />
              <em>in the gaps.</em>
            </h2>
            <p>
              An imaginary independent journal.
              <br />A real, evolving interface.
            </p>
          </header>
          <div className="generated-stories">
            {visible.map((s) => (
              <article
                key={s.i}
                className={opened === s.i ? "is-expanded" : ""}
              >
                <div
                  className={`generated-art generated-art-${s.i % 3}`}
                  aria-hidden="true"
                >
                  <span />
                </div>
                <span className="generated-type">{s.type}</span>
                <h3>
                  <button
                    onClick={() => setOpened(opened === s.i ? null : s.i)}
                    aria-expanded={opened === s.i}
                  >
                    {s.title}
                  </button>
                </h3>
                {(genome.density < 60 || opened === s.i) && <p>{s.text}</p>}
                {opened === s.i && (
                  <p>
                    Notice how this story changes position and emphasis as you
                    adjust the rules. Navigation, reading order, and grouping
                    all follow the genome.
                  </p>
                )}
                <button
                  className="generated-save"
                  aria-pressed={favorites.includes(s.i)}
                  onClick={() =>
                    setFavorites((f) =>
                      f.includes(s.i)
                        ? f.filter((n) => n !== s.i)
                        : [...f, s.i],
                    )
                  }
                >
                  {favorites.includes(s.i) ? "Saved" : "Save for later"}{" "}
                  <span aria-hidden="true">+</span>
                </button>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <p className="generated-empty">
              Your saved shelf is empty. Open All and save a story.
            </p>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="project-world world-genome">
      <div className="v2-wrap">
        <ProjectHeading slug="interface-genome">
          <button className="lab-button" onClick={mutate}>
            Mutate the interface
          </button>
        </ProjectHeading>
        <button
          className="lab-button secondary genome-mobile-toggle"
          aria-expanded={rulesOpen}
          aria-controls="genome-rules"
          onClick={() => setRulesOpen(!rulesOpen)}
        >
          {rulesOpen ? "Close the rules" : "Edit the rules"}
        </button>
        <div className={`genome-workspace${rulesOpen ? " rules-open" : ""}`}>
          <aside id="genome-rules" className="instrument-panel">
            <h2>The underlying rules</h2>
            <p className="instrument-note">
              Generation {g.generation}. Every control changes structure, not
              just appearance.
            </p>
            <Slider
              label="Information density"
              value={g.density}
              min={10}
              max={95}
              onChange={(v) => update("density", v)}
            />
            <Slider
              label="Hierarchy contrast"
              value={g.hierarchy}
              min={10}
              max={100}
              onChange={(v) => update("hierarchy", v)}
            />
            <Segments
              label="Navigation"
              options={["Top", "Side"]}
              value={g.navigation}
              onChange={(v) => update("navigation", v)}
            />
            <Segments
              label="Composition"
              options={["Journal", "Gallery", "Index"]}
              value={g.layout}
              onChange={(v) => update("layout", v)}
            />
            <button
              className="lab-button secondary"
              onClick={() => {
                setSaved((s) => [g, ...s].slice(0, 5));
                setPreserved(0);
                setStatus("Variant preserved for this session.");
              }}
            >
              Preserve this generation
            </button>
            <label className="compare-label">
              <input
                type="checkbox"
                checked={compare}
                disabled={!saved.length}
                onChange={(e) => setCompare(e.target.checked)}
              />{" "}
              Compare with preserved variant
            </label>
            {saved.length > 0 && (
              <label className="instrument-field">
                Preserved variants
                <select
                  value={preserved}
                  onChange={(e) => setPreserved(Number(e.target.value))}
                >
                  {saved.map((variant, i) => (
                    <option key={i} value={i}>
                      Variant {saved.length - i} · generation{" "}
                      {variant.generation}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              className="lab-button secondary"
              disabled={!saved.length}
              onClick={() => {
                const parent = saved[preserved];
                if (!parent) return;
                const child: Genome = {
                  density: Math.round((g.density + parent.density) / 2),
                  hierarchy: Math.round((g.hierarchy + parent.hierarchy) / 2),
                  navigation: parent.navigation,
                  layout: g.layout,
                  generation:
                    Math.max(
                      g.generation,
                      ...history.map((h) => h.generation),
                    ) + 1,
                };
                setG(child);
                setHistory((h) => [...h.slice(-11), child]);
                setStatus(
                  `Generation ${child.generation} crossbred: averaged density and hierarchy, inherited preserved navigation and current composition.`,
                );
              }}
            >
              Crossbreed with preserved variant
            </button>
            <label className="instrument-field">
              Previous mutations
              <select
                value={history.findIndex((h) => h.generation === g.generation)}
                onChange={(e) => setG(history[Number(e.target.value)])}
              >
                {history.map((h, i) => (
                  <option key={h.generation} value={i}>
                    Generation {h.generation}
                  </option>
                ))}
              </select>
            </label>
            <ExportButton
              onClick={() =>
                download(
                  "interface-genome.json",
                  JSON.stringify({ version: 1, ...g }, null, 2),
                  "application/json",
                )
              }
            >
              Export rules
            </ExportButton>
            <p role="status" className="instrument-note">
              {status ||
                "Try the generated navigation. Open a story. Save it to your shelf."}
            </p>
          </aside>
          <div
            className={
              compare ? "genome-surfaces comparing" : "genome-surfaces"
            }
          >
            <div>
              <div className="genome-surface-label">
                Current · generation {g.generation}
              </div>
              {surface(g)}
            </div>
            {compare && saved[preserved] && (
              <div>
                <div className="genome-surface-label">
                  Preserved · generation {saved[preserved].generation}
                </div>
                {surface(saved[preserved], true)}
              </div>
            )}
          </div>
        </div>
        <section className="project-notes">
          <h2>Change the constraints.</h2>
          <p>
            Density changes column count, spacing, and how much summary text is
            revealed. Hierarchy changes title scale and emphasis. Navigation
            switches the information architecture between a horizontal
            publication and a persistent rail. Journal privileges a lead story;
            Gallery distributes attention evenly.
          </p>
          <p>
            Mutation samples a new set of rules. Up to five variants and twelve
            generations remain available during this session. Exported JSON
            describes the rules; it is not an application source-code export.
          </p>
        </section>
      </div>
    </div>
  );
}
