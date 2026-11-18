"use client";
import { useEffect, useState } from "react";
import { DemoHost } from "@/components/demos/demo-host";
import type { PreviewControl, PreviewValue } from "@/lib/registry/types";
export function PreviewDocument({
  slug,
  defaults,
  controls,
}: {
  slug: string;
  defaults: Record<string, PreviewValue>;
  controls: PreviewControl[];
}) {
  const [values, setValues] = useState(defaults);
  useEffect(() => {
    function update(event: MessageEvent) {
      if (
        event.origin !== location.origin ||
        event.source !== parent ||
        event.data?.type !== "LAB_PREVIEW_CONFIG" ||
        event.data.slug !== slug
      )
        return;
      const raw = event.data.values;
      if (!raw || typeof raw !== "object") return;
      const next = { ...defaults };
      for (const c of controls) {
        const v = raw[c.id];
        if (c.kind === "slider" && typeof v === "number" && Number.isFinite(v))
          next[c.id] = Math.max(c.min, Math.min(c.max, v));
        else if (c.kind === "toggle" && typeof v === "boolean") next[c.id] = v;
        else if (c.kind === "choice" && c.options.some((o) => o.value === v))
          next[c.id] = v;
      }
      setValues(next);
    }
    window.addEventListener("message", update);
    parent.postMessage({ type: "LAB_PREVIEW_READY", slug }, location.origin);
    return () => window.removeEventListener("message", update);
  }, [slug, defaults, controls]);
  return (
    <div id="demo-root" className={`demo-document demo-document--${slug}`}>
      <DemoHost slug={slug} values={values} />
    </div>
  );
}
