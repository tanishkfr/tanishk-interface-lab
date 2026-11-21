"use client";

import { useMemo, useRef, useState } from "react";
import { ReflowGrid } from "@/components/lab/reflow-grid/reflow-grid";
import type { DemoProps } from "./demo-host";
import "./reflow-grid-demo.css";

type Kind = "pendant" | "chair" | "vessel" | "shelf" | "textile" | "mirror" | "table" | "lamp";
type Tone = "amber" | "sea" | "moss" | "clay" | "lilac" | "bone";

type Obj = {
  id: string;
  name: string;
  maker: string;
  year: number;
  category: "Lighting" | "Seating" | "Storage" | "Tabletop";
  kind: Kind;
  tone: Tone;
  note: string;
};

const SEED: Obj[] = [
  { id: "halo", name: "Halo pendant", maker: "Studio Ovo", year: 2024, category: "Lighting", kind: "pendant", tone: "amber", note: "Spun aluminium, 42 cm" },
  { id: "beam", name: "Beam sconce", maker: "Field & Sons", year: 2023, category: "Lighting", kind: "lamp", tone: "sea", note: "Opal glass, unlacquered brass" },
  { id: "taper", name: "Taper stool", maker: "Marrow Works", year: 2023, category: "Seating", kind: "chair", tone: "moss", note: "Ash, oiled" },
  { id: "fold", name: "Fold vessel", maker: "Ceramic Field", year: 2025, category: "Tabletop", kind: "vessel", tone: "clay", note: "Stoneware, celadon" },
  { id: "lattice", name: "Lattice shelf", maker: "Common Form", year: 2022, category: "Storage", kind: "shelf", tone: "bone", note: "Powder-coated steel" },
  { id: "quilt", name: "Quilt no. 4", maker: "Mend House", year: 2021, category: "Tabletop", kind: "textile", tone: "lilac", note: "Recycled wool" },
  { id: "arc", name: "Arc mirror", maker: "Studio Ovo", year: 2023, category: "Tabletop", kind: "mirror", tone: "sea", note: "Polished stainless" },
  { id: "dune", name: "Dune chair", maker: "Marrow Works", year: 2024, category: "Seating", kind: "chair", tone: "amber", note: "Bouclé, oak" },
  { id: "pin", name: "Pin table", maker: "Common Form", year: 2025, category: "Tabletop", kind: "table", tone: "bone", note: "Travertine, 90 cm" },
  { id: "grain", name: "Grain cabinet", maker: "Field & Sons", year: 2022, category: "Storage", kind: "shelf", tone: "clay", note: "Douglas fir" },
];

const EXTRA: Obj[] = [
  { id: "ridge", name: "Ridge tray", maker: "Ceramic Field", year: 2025, category: "Tabletop", kind: "vessel", tone: "sea", note: "Hand-thrown stoneware" },
  { id: "moss", name: "Moss lamp", maker: "Studio Ovo", year: 2025, category: "Lighting", kind: "lamp", tone: "moss", note: "Opal glass, brass" },
  { id: "line", name: "Line mirror", maker: "Field & Sons", year: 2024, category: "Storage", kind: "mirror", tone: "lilac", note: "Reclaimed oak" },
];

const CATEGORIES = ["All", "Lighting", "Seating", "Storage", "Tabletop"] as const;
const SORTS = [
  { value: "recent", label: "Newest first" },
  { value: "name", label: "Name A–Z" },
  { value: "category", label: "Category" },
] as const;

function ObjectArt({ kind, tone }: { kind: Kind; tone: Tone }) {
  return (
    <svg
      className="dm-rg-art"
      data-tone={tone}
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="200" height="160" fill="var(--rg-art-bg)" />
      <circle cx="100" cy="80" r="58" fill="var(--rg-art-glow)" opacity="0.5" />
      {kind === "pendant" && (
        <>
          <path d="M100 0v40" stroke="var(--rg-art-line)" strokeWidth="1" />
          <path d="M64 72c0-22 16-38 36-38s36 16 36 38H64Z" fill="var(--rg-art-a)" />
          <path d="M64 72h72" stroke="var(--rg-art-line)" strokeWidth="1.5" />
          <circle cx="100" cy="92" r="7" fill="var(--rg-art-b)" opacity="0.85" />
        </>
      )}
      {kind === "chair" && (
        <>
          <path d="M64 36h20v60H64Z" fill="var(--rg-art-a)" />
          <path d="M84 88h58v18H84Z" fill="var(--rg-art-b)" />
          <path d="M64 36v82M124 88v30M90 106v24M134 106v24" stroke="var(--rg-art-line)" strokeWidth="1.5" />
          <path d="M84 88h40" stroke="var(--rg-art-line)" strokeWidth="1" opacity="0.5" />
        </>
      )}
      {kind === "vessel" && (
        <>
          <path d="M84 44h32l-4 20c18 14 20 54 2 64H86c-18-10-16-50 2-64l-4-20Z" fill="var(--rg-art-a)" />
          <ellipse cx="100" cy="44" rx="16" ry="5" fill="var(--rg-art-b)" />
          <path d="M88 58c-11 24-8 46 2 56" stroke="var(--rg-art-glow)" strokeWidth="2" opacity="0.6" fill="none" />
        </>
      )}
      {kind === "shelf" && (
        <>
          <rect x="52" y="32" width="96" height="96" fill="none" stroke="var(--rg-art-line)" strokeWidth="1.5" />
          <rect x="52" y="62" width="96" height="2" fill="var(--rg-art-line)" />
          <rect x="52" y="92" width="96" height="2" fill="var(--rg-art-line)" />
          <rect x="100" y="32" width="1.5" height="96" fill="var(--rg-art-line)" />
          <rect x="62" y="72" width="16" height="18" fill="var(--rg-art-a)" />
          <rect x="114" y="40" width="22" height="20" fill="var(--rg-art-b)" />
          <rect x="66" y="102" width="24" height="24" fill="var(--rg-art-glow)" />
        </>
      )}
      {kind === "textile" && (
        <>
          {Array.from({ length: 7 }, (_, index) => (
            <path
              key={index}
              d={`M56 ${44 + index * 12}c22 ${index % 2 ? -8 : 8} 52 ${index % 2 ? 8 : -8} 88 0`}
              fill="none"
              stroke={index % 3 === 0 ? "var(--rg-art-a)" : "var(--rg-art-line)"}
              strokeWidth={index % 3 === 0 ? 2 : 1}
              opacity="0.8"
            />
          ))}
          <rect x="56" y="36" width="88" height="88" fill="none" stroke="var(--rg-art-line)" strokeWidth="1" opacity="0.4" />
        </>
      )}
      {kind === "mirror" && (
        <>
          <circle cx="100" cy="76" r="42" fill="var(--rg-art-b)" />
          <circle cx="100" cy="76" r="42" fill="none" stroke="var(--rg-art-line)" strokeWidth="2" />
          <path d="M76 48c-10 12-14 26-10 40" stroke="var(--rg-art-glow)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M100 118v20" stroke="var(--rg-art-line)" strokeWidth="2" />
          <path d="M82 138h36" stroke="var(--rg-art-line)" strokeWidth="2" />
        </>
      )}
      {kind === "table" && (
        <>
          <path d="M50 66h100v10H50Z" fill="var(--rg-art-a)" />
          <path d="M64 76v56M136 76v56" stroke="var(--rg-art-line)" strokeWidth="3" />
          <path d="M58 66c0-12 16-18 42-18s42 6 42 18" fill="none" stroke="var(--rg-art-glow)" strokeWidth="2" opacity="0.7" />
          <circle cx="100" cy="104" r="18" fill="var(--rg-art-b)" opacity="0.5" />
        </>
      )}
      {kind === "lamp" && (
        <>
          <path d="M78 52h44l-8 34H86Z" fill="var(--rg-art-a)" />
          <path d="M100 86v38" stroke="var(--rg-art-line)" strokeWidth="2" />
          <path d="M78 126h44v6H78Z" fill="var(--rg-art-b)" />
          <circle cx="100" cy="68" r="12" fill="var(--rg-art-glow)" opacity="0.8" />
        </>
      )}
    </svg>
  );
}

export default function ReflowGridDemo({ values }: DemoProps) {
  const animate = values.animate === undefined ? true : Boolean(values.animate);
  const gap = Number(values.gap ?? 14);
  const [added, setAdded] = useState<Obj[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("recent");
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [notice, setNotice] = useState("Ten objects from the studio archive.");
  const pool = useRef(0);

  const all = useMemo(() => [...SEED, ...added], [added]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((name) => [
          name,
          name === "All"
            ? all.length
            : all.filter((item) => item.category === name).length,
        ]),
      ) as Record<(typeof CATEGORIES)[number], number>,
    [all],
  );

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = all.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (
        needle &&
        !`${item.name} ${item.maker} ${item.category} ${item.note}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
    return result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "category")
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      return b.year - a.year || a.name.localeCompare(b.name);
    });
  }, [all, category, query, sort]);

  const reset = () => {
    setAdded([]);
    setSaved(new Set());
    setQuery("");
    setCategory("All");
    setSort("recent");
    setMode("grid");
    setNotice("Archive reset to the original ten objects.");
  };

  const addObject = () => {
    const next = EXTRA[pool.current % EXTRA.length];
    pool.current += 1;
    const copyNumber = Math.floor((pool.current - 1) / EXTRA.length);
    const item = {
      ...next,
      id: `${next.id}-${pool.current}`,
      name: copyNumber ? `${next.name} ${copyNumber + 1}` : next.name,
      year: 2026,
    };
    setAdded((current) => [...current, item]);
    setNotice(`${item.name} added to the archive.`);
  };

  const toggleSaved = (id: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="dm-rg-root">
      <header className="dm-rg-head">
        <div>
          <p className="dm-rg-kicker">OBJECT ARCHIVE / 2021—2026</p>
          <h2>Useful things, quietly kept.</h2>
          <p className="dm-rg-intro">
            A working index of furniture, lighting and small objects. Filter
            the shelf and the objects move; nothing is rebuilt from scratch.
          </p>
        </div>
        <div className="dm-rg-saved">
          <span>{saved.size}</span>
          saved
        </div>
      </header>

      <div className="dm-rg-toolbar">
        <label className="dm-rg-search">
          <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <circle cx="7.6" cy="7.6" r="4.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11.3 11.3 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Search the archive</span>
          <input
            type="search"
            value={query}
            placeholder="Search objects, makers, materials"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="dm-rg-sort">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as (typeof SORTS)[number]["value"])
            }
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="dm-rg-view" role="group" aria-label="Layout">
          {(["grid", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              <span aria-hidden="true">{option === "grid" ? "▦" : "☰"}</span>
              {option === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
      </div>

      <div className="dm-rg-filters" aria-label="Filter by category">
        {CATEGORIES.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name}
            <span>{counts[name]}</span>
          </button>
        ))}
        <button type="button" className="dm-rg-add" onClick={addObject}>
          + Add object
        </button>
      </div>

      <div className="dm-rg-result">
        <span aria-live="polite">
          {items.length} {items.length === 1 ? "object" : "objects"}
        </span>
        <span>{notice}</span>
        {query || category !== "All" || sort !== "recent" ? (
          <button type="button" onClick={reset}>
            Reset
          </button>
        ) : null}
      </div>

      <ReflowGrid
        items={items}
        getKey={(item) => item.id}
        mode={mode}
        animate={animate}
        gap={gap}
        label="Object archive"
        empty={
          <div className="dm-rg-empty">
            <strong>No objects in this cut.</strong>
            <span>Try a different category or clear the search.</span>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        }
        renderItem={(item) => {
          const isSaved = saved.has(item.id);
          return (
            <article className="dm-rg-card" data-mode={mode}>
              <div className="dm-rg-art-wrap">
                <ObjectArt kind={item.kind} tone={item.tone} />
                <span className="dm-rg-cat">{item.category}</span>
              </div>
              <div className="dm-rg-copy">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.maker} · {item.year}</p>
                </div>
                <p className="dm-rg-note">{item.note}</p>
                <button
                  type="button"
                  className="dm-rg-save"
                  aria-pressed={isSaved}
                  onClick={() => toggleSaved(item.id)}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path
                      d="M8 2.6l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 10.8l-3.2 1.7.6-3.6L2.8 6.4l3.6-.5L8 2.6Z"
                      fill={isSaved ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </article>
          );
        }}
      />
      <p className="dm-rg-foot">
        Motion is measured from the actual grid. The controls above drive real
        state; no objects are sent anywhere.
      </p>
    </div>
  );
}
