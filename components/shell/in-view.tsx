"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * IN VIEW — mounts its children only when the wrapper approaches the
 * viewport, and unmounts them again when they leave. The catalog uses
 * this so sixteen live previews never run at once.
 */
export function InView({
  children,
  rootMargin = "320px",
  className,
  placeholder,
}: {
  children: ReactNode;
  rootMargin?: string;
  className?: string;
  placeholder?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe with no render-time equivalent
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setNear(entry.isIntersecting);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {near ? children : (placeholder ?? null)}
    </div>
  );
}
