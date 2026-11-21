"use client";

import { useMemo, useState } from "react";
import { ElasticSheet } from "@/components/lab/elastic-sheet/elastic-sheet";
import type { DemoProps } from "./demo-host";
import "./elastic-sheet-demo.css";

type Project = {
  id: string;
  name: string;
  client: string;
  category: string;
  year: number;
  status: "Active" | "Archived";
  tone: string;
};

const PROJECTS: Project[] = [
  { id: "morrow", name: "Morrow identity", client: "Morrow Coffee", category: "Brand", year: 2024, status: "Active", tone: "clay" },
  { id: "tidewater", name: "Tidewater annual", client: "Tidewater Press", category: "Editorial", year: 2025, status: "Active", tone: "sea" },
  { id: "atlas", name: "Atlas archive", client: "Atlas Institute", category: "Research", year: 2023, status: "Archived", tone: "ink" },
  { id: "salt", name: "Salt lamp packaging", client: "Salt & Co.", category: "Packaging", year: 2024, status: "Active", tone: "sand" },
  { id: "field", name: "Field notes app", client: "Field Office", category: "Product", year: 2025, status: "Active", tone: "moss" },
  { id: "fallow", name: "Fallow type", client: "Fallow Foundry", category: "Type", year: 2022, status: "Archived", tone: "plum" },
];

const CATEGORIES = ["All", "Brand", "Editorial", "Research", "Packaging", "Product", "Type"];
const YEARS = [2022, 2023, 2024, 2025];

type Filters = {
  query: string;
  category: string;
  status: "All" | "Active" | "Archived";
  from: string;
  to: string;
};

const EMPTY: Filters = {
  query: "",
  category: "All",
  status: "All",
  from: "",
  to: "",
};

function filterProjects(filters: Filters) {
  const query = filters.query.trim().toLowerCase();
  return PROJECTS.filter((project) => {
    if (filters.category !== "All" && project.category !== filters.category)
      return false;
    if (filters.status !== "All" && project.status !== filters.status)
      return false;
    if (filters.from && project.year < Number(filters.from)) return false;
    if (filters.to && project.year > Number(filters.to)) return false;
    if (
      query &&
      !`${project.name} ${project.client} ${project.category}`
        .toLowerCase()
        .includes(query)
    )
      return false;
    return true;
  });
}

export default function ElasticSheetDemo({ values }: DemoProps) {
  const closeOnBackdrop = String(values.backdrop ?? "dismiss") === "dismiss";
  const swipeToDismiss = Boolean(values.swipe);
  const size = String(values.size ?? "regular") as "regular" | "wide";

  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [touched, setTouched] = useState(false);

  const results = useMemo(() => filterProjects(applied), [applied]);
  const invalidRange =
    draft.from !== "" &&
    draft.to !== "" &&
    Number(draft.from) > Number(draft.to);
  const invalid = invalidRange || (draft.from !== "" && !YEARS.includes(Number(draft.from))) || (draft.to !== "" && !YEARS.includes(Number(draft.to)));
  const activeCount = [
    applied.category !== "All" ? 1 : 0,
    applied.status !== "All" ? 1 : 0,
    applied.from ? 1 : 0,
    applied.to ? 1 : 0,
    applied.query ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const launch = () => {
    setDraft(applied);
    setTouched(false);
    setOpen(true);
  };

  const apply = () => {
    setTouched(true);
    if (invalid) return;
    setApplied(draft);
    setOpen(false);
  };

  const reset = () => {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setTouched(false);
  };

  const remove = (key: keyof Filters) => {
    const next = { ...applied, [key]: EMPTY[key] };
    setApplied(next);
    setDraft(next);
  };

  return (
    <div className="dm-es-root">
      <header className="dm-es-head">
        <div>
          <p className="dm-es-kicker">FIELD OFFICE / PROJECT LIBRARY</p>
          <h2>Selected work</h2>
          <p className="dm-es-intro">
            Six projects, one archive. Filter the shelf without losing your
            place in it.
          </p>
        </div>
        <button type="button" className="dm-es-open" onClick={launch}>
          Filters
          {activeCount > 0 ? <span>{activeCount}</span> : null}
        </button>
      </header>

      <div className="dm-es-chips" aria-label="Active filters">
        <span className="dm-es-result-count">
          {results.length} of {PROJECTS.length} projects
        </span>
        {applied.category !== "All" ? (
          <button type="button" onClick={() => remove("category")}>
            {applied.category} <i aria-hidden="true">×</i>
          </button>
        ) : null}
        {applied.status !== "All" ? (
          <button type="button" onClick={() => remove("status")}>
            {applied.status} <i aria-hidden="true">×</i>
          </button>
        ) : null}
        {applied.from ? (
          <button type="button" onClick={() => remove("from")}>
            From {applied.from} <i aria-hidden="true">×</i>
          </button>
        ) : null}
        {applied.to ? (
          <button type="button" onClick={() => remove("to")}>
            To {applied.to} <i aria-hidden="true">×</i>
          </button>
        ) : null}
        {applied.query ? (
          <button type="button" onClick={() => remove("query")}>
            “{applied.query}” <i aria-hidden="true">×</i>
          </button>
        ) : null}
        {activeCount > 0 ? (
          <button type="button" className="dm-es-clear" onClick={reset}>
            Clear all
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="dm-es-empty">
          <h3>No projects on this shelf.</h3>
          <p>Loosen one of the filters, or reset the whole set.</p>
          <button type="button" onClick={reset}>
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="dm-es-grid">
          {results.map((project) => (
            <li key={project.id}>
              <article className="dm-es-card">
                <div className="dm-es-art" data-tone={project.tone} aria-hidden="true">
                  <span>{project.name.slice(0, 1)}</span>
                  <i />
                </div>
                <div className="dm-es-card-copy">
                  <p>{project.category}</p>
                  <h3>{project.name}</h3>
                  <div>
                    <span>{project.client}</span>
                    <span>{project.year}</span>
                  </div>
                </div>
                <span className="dm-es-status" data-archived={project.status === "Archived" ? "true" : "false"}>
                  {project.status}
                </span>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="dm-es-foot">
        A local sample library. Filters are real state; no project leaves this
        preview.
      </p>

      <ElasticSheet
        open={open}
        onOpenChange={setOpen}
        title="Filter projects"
        description="Narrow the library. Changes appear when you apply them."
        closeOnBackdrop={closeOnBackdrop}
        swipeToDismiss={swipeToDismiss}
        size={size}
      >
        <form
          className="dm-es-form"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <div className="dm-es-field">
            <label htmlFor="es-query">Search</label>
            <input
              id="es-query"
              type="search"
              value={draft.query}
              placeholder="Client, project or category"
              onChange={(event) =>
                setDraft((current) => ({ ...current, query: event.target.value }))
              }
            />
          </div>

          <fieldset className="dm-es-group">
            <legend>Category</legend>
            <div className="dm-es-pills">
              {CATEGORIES.map((category) => (
                <label key={category}>
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={draft.category === category}
                    onChange={() =>
                      setDraft((current) => ({ ...current, category }))
                    }
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="dm-es-group">
            <legend>Status</legend>
            <div className="dm-es-seg">
              {(["All", "Active", "Archived"] as const).map((status) => (
                <label key={status}>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={draft.status === status}
                    onChange={() =>
                      setDraft((current) => ({ ...current, status }))
                    }
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="dm-es-years">
            <div className="dm-es-field">
              <label htmlFor="es-from">From year</label>
              <input
                id="es-from"
                type="number"
                inputMode="numeric"
                min={2021}
                max={2026}
                value={draft.from}
                aria-invalid={invalidRange || undefined}
                aria-describedby={invalidRange ? "es-year-error" : undefined}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, from: event.target.value }))
                }
              />
            </div>
            <span aria-hidden="true">to</span>
            <div className="dm-es-field">
              <label htmlFor="es-to">To year</label>
              <input
                id="es-to"
                type="number"
                inputMode="numeric"
                min={2021}
                max={2026}
                value={draft.to}
                aria-invalid={invalidRange || undefined}
                aria-describedby={invalidRange ? "es-year-error" : undefined}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, to: event.target.value }))
                }
                onBlur={() => setTouched(true)}
              />
            </div>
          </div>

          {invalidRange ? (
            <p className="dm-es-error" id="es-year-error" role="alert">
              <span aria-hidden="true">!</span> The start year must come before
              the end year.
            </p>
          ) : touched && invalid ? (
            <p className="dm-es-error" id="es-year-error" role="alert">
              <span aria-hidden="true">!</span> Choose years between 2022 and
              2025.
            </p>
          ) : null}

          <div className="dm-es-form-foot">
            <button type="button" className="dm-es-reset" onClick={reset}>
              Reset filters
            </button>
            <button type="submit" className="dm-es-apply">
              Apply {activeCount > 0 ? `· ${activeCount} active` : ""}
            </button>
          </div>
          <p className="dm-es-form-note">
            Escape closes the sheet. {closeOnBackdrop ? "The backdrop also dismisses." : "The backdrop is set not to dismiss."}
            {swipeToDismiss ? " Swipe down on the handle to close." : ""}
          </p>
        </form>
      </ElasticSheet>
    </div>
  );
}
