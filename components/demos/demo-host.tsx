"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { PreviewValue } from "@/lib/registry/types";

export type DemoProps = {
  values: Record<string, PreviewValue>;
};

/**
 * DEMO HOST — one lazy chunk per experiment, so a detail page loads
 * exactly the interaction it shows. The demo modules are the same
 * sample interfaces the catalog links into.
 */
const DEMOS: Record<string, ComponentType<DemoProps>> = {
  "signal-field": dynamic(() => import("@/components/demos/signal-field")),
  "soft-snap": dynamic(() => import("@/components/demos/soft-snap")),
  "evidence-carousel": dynamic(
    () => import("@/components/demos/evidence-carousel"),
  ),
  "inverted-cursor": dynamic(
    () => import("@/components/demos/inverted-cursor"),
  ),
  "adaptive-composer": dynamic(
    () => import("@/components/demos/adaptive-composer"),
  ),
  "agent-review": dynamic(() => import("@/components/demos/agent-review")),
  "evidence-source": dynamic(
    () => import("@/components/demos/evidence-source"),
  ),
  "spatial-command": dynamic(() => import("@/components/demos/spatial-command")),
  "morphing-metadata": dynamic(
    () => import("@/components/demos/morphing-metadata"),
  ),
  "contextual-dock": dynamic(
    () => import("@/components/demos/contextual-dock"),
  ),
  "hold-to-confirm": dynamic(
    () => import("@/components/demos/hold-to-confirm"),
  ),
  "progressive-action": dynamic(
    () => import("@/components/demos/progressive-action"),
  ),
  "trace-trail": dynamic(() => import("@/components/demos/trace-trail")),
  "focus-stack": dynamic(() => import("@/components/demos/focus-stack")),
  "inline-diff": dynamic(() => import("@/components/demos/inline-diff")),
  "lens-reveal": dynamic(() => import("@/components/demos/lens-reveal")),
};

export function DemoHost({ slug, values }: { slug: string; values: Record<string, PreviewValue> }) {
  const Demo = DEMOS[slug];
  if (!Demo) {
    return (
      <div className="demo-missing">No demo is registered for “{slug}”.</div>
    );
  }
  return <Demo values={values} />;
}
