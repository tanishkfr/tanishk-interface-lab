import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experiments } from "./experiments";
import type { Experiment, RegistryFile } from "./types";

/**
 * REGISTRY BUILDER — turns registry records into shadcn-compatible
 * registry items, reading the real component sources from disk at
 * build time. The served JSON always reflects the shipped code.
 */

const ROOT = process.cwd();

/** Every shipped file lives under components/lab — the one literal root. */
const LAB_PREFIX = "components/lab/";

function shippedPath(path: string): string {
  if (!path.startsWith(LAB_PREFIX)) {
    throw new Error(
      `Registry file ${path} is outside ${LAB_PREFIX}; registry sources must live under components/lab.`,
    );
  }
  return join(
    ROOT,
    "components",
    "lab",
    path.slice(LAB_PREFIX.length),
  );
}

export type RegistryItemFile = {
  path: string;
  target: string;
  type: RegistryFile["type"];
  content: string;
};

export type RegistryItem = {
  $schema: string;
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  dependencies: string[];
  categories: string[];
  files: RegistryItemFile[];
};

export type RegistryIndexItem = Omit<RegistryItem, "$schema" | "files"> & {
  files: Omit<RegistryItemFile, "content">[];
};

function readSource(file: RegistryFile): RegistryItemFile {
  const content = readFileSync(shippedPath(file.path), "utf8");
  if (/from\s+["']@\//.test(content)) {
    throw new Error(
      `Registry file ${file.path} imports through the Lab alias "@/" — component files must be self-contained with relative imports.`,
    );
  }
  return {
    path: file.path,
    target: file.path,
    type: file.type,
    content,
  };
}

export function buildRegistryItem(experiment: Experiment): RegistryItem {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: experiment.slug,
    type: "registry:component",
    title: experiment.name,
    description: experiment.tagline,
    dependencies: experiment.dependencies,
    categories: [experiment.category.toLowerCase(), ...experiment.tags],
    files: experiment.files.map(readSource),
  };
}

export function buildRegistryIndex(): {
  $schema: string;
  name: string;
  items: RegistryIndexItem[];
} {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "tanishk-interface-lab",
    items: experiments.map((experiment) => ({
      name: experiment.slug,
      type: "registry:component" as const,
      title: experiment.name,
      description: experiment.tagline,
      dependencies: experiment.dependencies,
      categories: [experiment.category.toLowerCase(), ...experiment.tags],
      files: experiment.files.map((file) => ({
        path: file.path,
        target: file.path,
        type: file.type,
      })),
    })),
  };
}

/** Full source of one shipped file, for the detail page's code view. */
export function readExperimentFile(path: string): string {
  return readFileSync(shippedPath(path), "utf8");
}

/** All shipped files of an experiment with their contents, in order. */
export function readExperimentFiles(
  experiment: Experiment,
): { file: RegistryFile; content: string }[] {
  return experiment.files.map((file) => ({
    file,
    content: readSource(file).content,
  }));
}

/** A single concatenated source bundle, for the “copy all source” action. */
export function bundledSource(experiment: Experiment): string {
  return readExperimentFiles(experiment)
    .map(
      ({ file, content }) =>
        `// ─── ${file.path} ───\n\n${content.trim()}\n`,
    )
    .join("\n");
}
