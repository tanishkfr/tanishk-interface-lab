"use client";
import { useEffect, useRef, useState } from "react";
const editions = [
  "Ink",
  "Blueprint",
  "Glass",
  "Weave",
  "Blocks",
  "Chromatic",
  "Outline",
  "Shadow",
  "Stencil",
  "Neon",
  "Chrome",
  "Halftone",
  "Wireframe",
  "Cutout",
  "Offset",
  "Scanline",
  "Pixels",
  "Ribbon",
  "Stamp",
  "Chalk",
];
export function HeroPress() {
  const [edition, setEdition] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = true;
    const update = () => {
      clearInterval(timer);
      if (visible && !document.hidden && !media.matches)
        timer = setInterval(() => {
          if (!media.matches && visible && !document.hidden)
            setEdition((n) => (n + 1) % editions.length);
        }, 2800);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (root.current) observer.observe(root.current);
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      clearInterval(timer);
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <div ref={root} className={`living-wordmark edition-${edition}`}>
      <h1 className="sr-only">LAB/ — An internet playground.</h1>
      <svg
        key={edition}
        viewBox="0 0 1200 440"
        role="img"
        aria-label="LAB, a changing typographic edition"
      >
        <defs>
          <mask
            id="lab-weave-reveal"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1200"
            height="440"
          >
            <rect width="1200" height="440" fill="black" />
            {Array.from({ length: 13 }, (_, i) => (
              <rect
                key={i}
                className={`weave-strip ${i % 2 ? "from-right" : "from-left"}`}
                x="0"
                y={i * 34}
                width="1200"
                height="35"
                fill="white"
                style={{ "--row": i } as React.CSSProperties}
              />
            ))}
          </mask>
          <pattern
            id="lab-weave"
            width="1200"
            height="68"
            patternUnits="userSpaceOnUse"
          >
            <rect width="1200" height="34" fill="#513969" />
            <rect y="34" width="1200" height="34" fill="#8e5d7d" />
            <path d="M0 33H1200M0 67H1200" stroke="#f8e6cd" strokeWidth="1.5" />
          </pattern>
          <pattern
            id="lab-cursors"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="m4 3 3 19 5-6 8-2Z"
              fill="#f0efdc"
              stroke="#252620"
              strokeWidth="1.2"
            />
            <path d="m19 18 2 8 2-3 4-1Z" fill="#f36b50" />
          </pattern>
          <pattern
            id="lab-dots"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="5" cy="5" r="3.7" fill="currentColor" />
          </pattern>
          <pattern
            id="lab-wires"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0H12V12H0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="lab-pixels"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <rect x="1" y="1" width="13" height="13" fill="currentColor" />
          </pattern>
          <pattern
            id="lab-lines"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 2H8" stroke="currentColor" strokeWidth="3" />
          </pattern>
          <linearGradient id="lab-chrome" x2="0" y2="1">
            <stop stopColor="#f9fcff" />
            <stop offset=".4" stopColor="#929eae" />
            <stop offset=".48" stopColor="#fff" />
            <stop offset=".52" stopColor="#202d45" />
            <stop offset=".8" stopColor="#c5d8e8" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <mask id="lab-stencil">
            <rect width="1200" height="440" fill="white" />
            <path
              d="M0 205H1200M260 0V440M800 0V440"
              stroke="black"
              strokeWidth="12"
            />
          </mask>
          <linearGradient id="lab-glass" x2="1" y2="1">
            <stop stopColor="#fff" stopOpacity=".9" />
            <stop offset=".45" stopColor="#fff" stopOpacity=".13" />
            <stop offset=".55" stopColor="#d4ffff" stopOpacity=".65" />
            <stop offset="1" stopColor="#fff" stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="lab-spectrum">
            <stop stopColor="#ff604e" />
            <stop offset=".45" stopColor="#6534e8" />
            <stop offset="1" stopColor="#008f80" />
          </linearGradient>
          <pattern
            id="lab-blueprint"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path d="M30 0H0V30" fill="none" stroke="#ffffff24" />
          </pattern>
        </defs>
        {edition === 1 && (
          <rect width="1200" height="440" fill="url(#lab-blueprint)" />
        )}
        <g
          className="living-letters"
          mask={edition === 3 ? "url(#lab-weave-reveal)" : undefined}
        >
          {"LAB/".split("").map((letter, i) => (
            <text
              key={i}
              x={70 + i * 270}
              y="355"
              textLength={letter === "/" ? 180 : 250}
              lengthAdjust="spacingAndGlyphs"
              style={{ "--letter": i } as React.CSSProperties}
            >
              {letter}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
