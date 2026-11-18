"use client";
import { useRef, useState } from "react";
import { VectorArtwork } from "./artwork";
import {
  ProjectHeading,
  Slider,
  Segments,
  ExportButton,
  download,
} from "./workbench";
import { DEFAULT_RECIPE, vectorSvg, type Recipe } from "@/lib/playground/math";
export default function VectorKitchen() {
  const [r, setR] = useState<Recipe>(DEFAULT_RECIPE),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Recipe>(key: K, value: Recipe[K]) =>
    setR((s) => ({ ...s, [key]: value }));
  return (
    <div className="project-world world-vector">
      <div className="v2-wrap">
        <ProjectHeading slug="vector-kitchen">
          <span className="project-stamp">
            Fresh vectors. No two servings alike.
          </span>
        </ProjectHeading>
        <div className="vector-workspace">
          <aside className="instrument-panel">
            <h2>The recipe</h2>
            <Segments
              label="Ingredient"
              options={["orbit", "ribbon", "petal"]}
              value={r.kind}
              onChange={(v) => set("kind", v)}
            />
            <Slider
              label="Repetitions"
              value={r.count}
              min={6}
              max={120}
              onChange={(v) => set("count", v)}
            />
            <Slider
              label="Divergence"
              value={r.twist}
              min={0}
              max={180}
              step={0.5}
              unit="°"
              onChange={(v) => set("twist", v)}
            />
            <Slider
              label="Spread"
              value={r.radius}
              min={40}
              max={220}
              onChange={(v) => set("radius", v)}
            />
            {r.kind === "petal" && (
              <Slider
                label="Petal width"
                value={r.petals}
                min={1}
                max={8}
                onChange={(v) => set("petals", v)}
              />
            )}
            <div className="color-pair">
              <label>
                Ink
                <input
                  type="color"
                  value={r.ink}
                  onChange={(e) => set("ink", e.target.value)}
                />
              </label>
              <label>
                Paper
                <input
                  type="color"
                  value={r.paper}
                  onChange={(e) => set("paper", e.target.value)}
                />
              </label>
            </div>
            <button
              className="lab-button secondary"
              onClick={() =>
                setR((s) => ({
                  ...s,
                  seed: s.seed + 1,
                  twist: Number((90 + Math.random() * 85).toFixed(1)),
                }))
              }
            >
              Another serving
            </button>
            <ExportButton
              onClick={() => download("vector-kitchen.svg", vectorSvg(r))}
            />
            <div className="instrument-divider" />
            <div className="recipe-actions">
              <button
                className="quiet-button"
                onClick={() =>
                  download(
                    "vector-kitchen.recipe.json",
                    JSON.stringify(r, null, 2),
                    "application/json",
                  )
                }
              >
                Save recipe
              </button>
              <button
                className="quiet-button"
                onClick={() => input.current?.click()}
              >
                Load recipe
              </button>
              <button
                className="quiet-button"
                onClick={() => {
                  setR(DEFAULT_RECIPE);
                  setError("");
                }}
              >
                Reset
              </button>
            </div>
            <input
              ref={input}
              type="file"
              hidden
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 8192) throw Error();
                  const x = JSON.parse(await file.text());
                  if (
                    !["orbit", "ribbon", "petal"].includes(x.kind) ||
                    !/^#[0-9a-f]{6}$/i.test(x.ink) ||
                    !/^#[0-9a-f]{6}$/i.test(x.paper)
                  )
                    throw Error();
                  for (const [k, min, max] of [
                    ["count", 6, 120],
                    ["twist", 0, 180],
                    ["radius", 40, 220],
                    ["petals", 1, 8],
                    ["seed", 0, 100000],
                  ] as const)
                    if (
                      typeof x[k] !== "number" ||
                      !Number.isFinite(x[k]) ||
                      x[k] < min ||
                      x[k] > max
                    )
                      throw Error();
                  if (!Number.isInteger(x.count)) throw Error();
                  setR({
                    kind: x.kind,
                    ink: x.ink,
                    paper: x.paper,
                    count: x.count,
                    twist: x.twist,
                    radius: x.radius,
                    petals: x.petals,
                    seed: x.seed,
                  });
                  setError("");
                } catch {
                  setError(
                    "That recipe is not valid. Load a JSON recipe exported by Vector Kitchen.",
                  );
                }
                e.target.value = "";
              }}
            />
            {error && (
              <p role="alert" className="instrument-error">
                {error}
              </p>
            )}
          </aside>
          <div className="vector-canvas" style={{ background: r.paper }}>
            <div className="scene-topline" style={{ color: r.ink }}>
              <span>Recipe {String(r.seed).padStart(3, "0")}</span>
              <span>1200 × 1200 / SVG</span>
            </div>
            <VectorArtwork recipe={r} />
            <div className="vector-recipe-flow" style={{ color: r.ink }}>
              <span>{r.kind}</span>
              <span aria-hidden="true">→</span>
              <span>repeat ×{r.count}</span>
              <span aria-hidden="true">→</span>
              <span>turn {r.twist}°</span>
            </div>
          </div>
        </div>
        <section className="project-notes">
          <h2>Keep the good accidents.</h2>
          <p>
            Shapes follow a phyllotactic spiral: each one turns by your
            divergence angle, and its distance from the center grows with the
            square root of its index. Near 137.5°, the arrangement resembles the
            packing of seeds in a sunflower.
          </p>
          <p>
            The export is real, editable SVG geometry. Recipes are small JSON
            files you can save, share, and load again. This is the browser
            prototype; no Figma plugin is published.
          </p>
        </section>
      </div>
    </div>
  );
}
