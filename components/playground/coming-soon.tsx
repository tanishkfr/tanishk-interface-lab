"use client";
import { useRef, useState } from "react";
const possibilities = [
  ["Plugins", "Inside the tools you already use."],
  ["Extensions", "Small powers for the browser."],
  ["AI tools", "New ways to work with an idea."],
  ["Independent software", "An experiment with a life of its own."],
];
export function ComingSoon() {
  const root = useRef<HTMLElement>(null),
    [selected, setSelected] = useState(0);
  return (
    <section
      ref={root}
      className="future-installation"
      onPointerMove={(e) => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--future-lean",
          `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`,
        );
      }}
      onPointerLeave={(e) =>
        e.currentTarget.style.setProperty("--future-lean", "0deg")
      }
    >
      <div className="future-heading">
        <h2>
          MORE
          <br />
          <span>COMING</span>
          <br />
          SOON<span className="future-period">.</span>
        </h2>
        <p>
          A few ideas are trying
          <br />
          to become their own thing.
          <br />
          <strong>Nothing to install. Yet.</strong>
        </p>
      </div>
      <div
        className="future-packages"
        aria-label="Possible future release formats"
      >
        {possibilities.map(([name], i) => (
          <button
            key={name}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
            className={`future-package future-package-${i}`}
          >
            <span className="future-package-mark" aria-hidden="true">
              {i === 0 ? "P/" : i === 1 ? "X/" : i === 2 ? "AI/" : "S/"}
            </span>
            <span>{name}</span>
            <span className="future-seal">UNRELEASED</span>
          </button>
        ))}
      </div>
      <div className="future-note" aria-live="polite">
        <h3>{possibilities[selected][0]}</h3>
        <p>
          {possibilities[selected][1]} These are directions for future work, not
          announced software or promised release dates.
        </p>
      </div>
    </section>
  );
}

