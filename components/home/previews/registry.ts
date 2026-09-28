"use client";

import type { ComponentType } from "react";
import SignalFieldPreview from "./signal-field";
import SoftSnapPreview from "./soft-snap";
import EvidenceCarouselPreview from "./evidence-carousel";
import InvertedCursorPreview from "./inverted-cursor";
import AdaptiveComposerPreview from "./adaptive-composer";
import AgentReviewPreview from "./agent-review";
import EvidenceSourcePreview from "./evidence-source";
import SpatialCommandPreview from "./spatial-command";
import MorphingMetadataPreview from "./morphing-metadata";
import ContextualDockPreview from "./contextual-dock";
import HoldToConfirmPreview from "./hold-to-confirm";
import ProgressiveActionPreview from "./progressive-action";
import TraceTrailPreview from "./trace-trail";
import FocusStackPreview from "./focus-stack";
import InlineDiffPreview from "./inline-diff";
import LensRevealPreview from "./lens-reveal";

/**
 * CATALOG PREVIEWS — each card gets a lightweight window into its
 * experiment. These are deliberately cheaper than the real components:
 * CSS compositions that respond to the card hover, so sixteen cards
 * never run sixteen animation loops.
 */
export const PREVIEWS: Record<string, ComponentType> = {
  "signal-field": SignalFieldPreview,
  "soft-snap": SoftSnapPreview,
  "evidence-carousel": EvidenceCarouselPreview,
  "inverted-cursor": InvertedCursorPreview,
  "adaptive-composer": AdaptiveComposerPreview,
  "agent-review": AgentReviewPreview,
  "evidence-source": EvidenceSourcePreview,
  "spatial-command": SpatialCommandPreview,
  "morphing-metadata": MorphingMetadataPreview,
  "contextual-dock": ContextualDockPreview,
  "hold-to-confirm": HoldToConfirmPreview,
  "progressive-action": ProgressiveActionPreview,
  "trace-trail": TraceTrailPreview,
  "focus-stack": FocusStackPreview,
  "inline-diff": InlineDiffPreview,
  "lens-reveal": LensRevealPreview,
};
