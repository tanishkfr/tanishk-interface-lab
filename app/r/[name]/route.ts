import { experiments, getExperiment } from "@/lib/registry/experiments";
import { buildRegistryIndex, buildRegistryItem } from "@/lib/registry/build";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [
    { name: "registry.json" },
    ...experiments.map((experiment) => ({
      name: `${experiment.slug}.json`,
    })),
  ];
}

/**
 * The Lab's registry endpoint.
 *
 *   /r/registry.json      — the index of every experiment
 *   /r/<slug>.json        — one shadcn-compatible registry item
 *
 * `npx shadcn@latest add <origin>/r/<slug>.json` installs the
 * component and its styles into any configured project.
 */
export async function GET(_request: Request, ctx: RouteContext<"/r/[name]">) {
  const { name } = await ctx.params;

  if (name === "registry.json") {
    return Response.json(buildRegistryIndex(), { headers: CACHE });
  }

  const slug = name.endsWith(".json") ? name.slice(0, -5) : name;
  const experiment = getExperiment(slug);

  if (!experiment) {
    return Response.json(
      { error: `Unknown experiment: ${slug}` },
      { status: 404 },
    );
  }

  return Response.json(buildRegistryItem(experiment), { headers: CACHE });
}

const CACHE = {
  "cache-control": "public, max-age=0, s-maxage=3600",
  "access-control-allow-origin": "*",
} as const;
