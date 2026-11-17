"use client";
import { ARTWORK_FONT } from "@/lib/playground/typography";
import { useEffect, useRef, type RefObject, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { projectBySlug } from "@/lib/playground/projects";
export function ProjectHeading({
  slug,
  children,
}: {
  slug: string;
  children?: ReactNode;
}) {
  const p = projectBySlug(slug)!;
  return (
    <header className="project-heading">
      <div>
        <Link
          className="project-back"
          href={p.category === "Tool" ? "/tools" : "/experiments"}
        >
          <span aria-hidden="true">←</span>{" "}
          {p.category === "Tool" ? "All tools" : "All experiments"}
        </Link>
        <h1>{p.name}</h1>
        <p>{p.description}</p>
        <span className="project-version">
          {p.status} · v{p.version}
        </span>
      </div>
      {children}
    </header>
  );
}
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <label className="instrument-slider">
      <span>
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export function Segments<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="instrument-segments">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
export function ExportButton({
  onClick,
  children = "Export SVG",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button className="lab-button" onClick={onClick}>
      <Icon name="download" />
      {children}
    </button>
  );
}
export function download(
  name: string,
  content: string,
  mime = "image/svg+xml",
) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export async function exportSvg(
  svg: SVGSVGElement,
  name: string,
  { font = false, background = "transparent" } = {},
) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-editor-only]").forEach((node) => node.remove());
  const box = svg.viewBox.baseVal;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(box.width || 900));
  clone.setAttribute("height", String(box.height || 560));
  clone.style.color = getComputedStyle(svg).color;
  clone.style.setProperty(
    "--sculpture-fill",
    getComputedStyle(svg).getPropertyValue("--sculpture-fill").trim() ||
      "#e7e8e4",
  );
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", background);
  clone.prepend(rect);
  if (font) {
    const buffer: ArrayBuffer = await (
      await fetch(ARTWORK_FONT.url)
    ).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent = `@font-face{font-family:LabExport;src:url(data:${ARTWORK_FONT.mime};base64,${btoa(binary)});font-weight:${ARTWORK_FONT.weight}}text{font-family:LabExport,sans-serif}`;
    clone.prepend(style);
  }
  download(name, new XMLSerializer().serializeToString(clone));
}
/** One visibility-aware RAF loop. Transient scene state stays outside React. */
export function useSceneLoop<T extends Element>(
  ref: RefObject<T | null>,
  draw: (dt: number, time: number) => void,
  paused = false,
) {
  const callback = useRef(draw);
  useEffect(() => {
    callback.current = draw;
  }, [draw]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0,
      last = 0,
      visible = true;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    function tick(time: number) {
      const dt = Math.min((time - last) / 1000 || 1 / 60, 1 / 30);
      last = time;
      callback.current(dt, time / 1000);
      if (!paused && visible && !document.hidden && !media.matches)
        frame = requestAnimationFrame(tick);
    }
    function update() {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden) {
        callback.current(0, 0);
        if (!paused && !media.matches) frame = requestAnimationFrame(tick);
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        update();
      },
      { rootMargin: "50px" },
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      media.removeEventListener("change", update);
    };
  }, [ref, paused]);
}
