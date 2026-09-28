/**
 * REGISTRY TYPES — the shape every experiment publishes.
 *
 * One record per experiment drives the catalog, the detail page,
 * the preview sandbox and the shadcn-compatible registry
 * endpoints. Nothing about an experiment is authored twice.
 */

export const CATEGORIES = [
  "Motion",
  "Input",
  "Navigation",
  "Media",
  "Systems",
  "Agentic",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ExperimentStatus = "stable" | "experimental";

export type RegistryFile = {
  /** Path relative to the Lab repository root. */
  path: string;
  kind: "component" | "styles" | "logic";
  type: "registry:component" | "registry:file";
};

export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type SliderUnit = "percent" | "px" | "cells" | "multiplier" | "ms";

export type PreviewControl =
  | {
      kind: "slider";
      id: string;
      label: string;
      min: number;
      max: number;
      step: number;
      /** How the value is written next to the label. */
      unit?: SliderUnit;
    }
  | {
      kind: "choice";
      id: string;
      label: string;
      options: { value: string; label: string }[];
    }
  | { kind: "toggle"; id: string; label: string };

export type PreviewValue = string | number | boolean;

export type Experiment = {
  slug: string;
  name: string;
  /** One-line behavioural description for the catalog card. */
  tagline: string;
  /** Short paragraph: what it does, where it belongs. */
  summary: string;
  category: Category;
  tags: string[];
  status: ExperimentStatus;
  /** Platform notes: React, CSS, Canvas 2D, browser APIs… */
  tech: string[];
  /** npm packages the installed component needs (usually none). */
  dependencies: string[];
  files: RegistryFile[];
  preview: {
    devices: ("desktop" | "mobile")[];
    controls: PreviewControl[];
    defaults: Record<string, PreviewValue>;
    hint?: string;
  };
  props: PropDoc[];
  accessibility: string[];
  /** Copyable usage example. */
  usage: string;
  /** What the preview sandbox is showing. */
  demoNote: string;
  order: number;
};
