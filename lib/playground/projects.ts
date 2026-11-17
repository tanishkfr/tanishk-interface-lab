export type Project = {
  slug: string;
  name: string;
  category: "Experiment" | "Tool" | "Story";
  medium: string;
  description: string;
  color: string;
  status: "Prototype" | "Released" | "Coming soon";
  version: string;
};
export const projects: Project[] = [
  {
    slug: "data-matter",
    status: "Prototype",
    version: "0.1",
    name: "Data Matter",
    category: "Experiment",
    medium: "Data as a physical material",
    description:
      "Give numbers a landscape. Shape, turn, and take home a sculpture made from your data.",
    color: "#e6e8ed",
  },
  {
    slug: "type-has-mass",
    status: "Prototype",
    version: "0.1",
    name: "Type Has Mass",
    category: "Experiment",
    medium: "A little gravitational poetry",
    description:
      "Words have weight. Pull a letter, change the gravity, and let the sentence fall where it may.",
    color: "#ff795b",
  },
  {
    slug: "vector-kitchen",
    status: "Prototype",
    version: "0.1",
    name: "Vector Kitchen",
    category: "Tool",
    medium: "Recipes for unexpected graphics",
    description:
      "A few ingredients. Infinite variations. Cook up a visual system and export the real vectors.",
    color: "#252737",
  },
  {
    slug: "browser-terrarium",
    status: "Prototype",
    version: "0.1",
    name: "Browser Terrarium",
    category: "Experiment",
    medium: "A small world, growing quietly",
    description:
      "Plant something. Make it rain. Meet the curious little creatures living in your browser.",
    color: "#dce9ae",
  },
  {
    slug: "interface-genome",
    status: "Prototype",
    version: "0.1",
    name: "Interface Genome",
    category: "Experiment",
    medium: "Interfaces that evolve",
    description:
      "Change the rules, not the pixels. Watch a functioning interface find a different form.",
    color: "#e8dff5",
  },
  {
    slug: "motion-foundry",
    status: "Prototype",
    version: "0.1",
    name: "Motion Foundry",
    category: "Tool",
    medium: "Find the feeling between states",
    description:
      "Tune a spring, build a sequence, compare the result, and bring the motion to your own interface.",
    color: "#292432",
  },
  {
    slug: "the-cost-of-a-click",
    status: "Prototype",
    version: "0.1",
    name: "The Cost of a Click",
    category: "Story",
    medium: "An essay you experience",
    description:
      "Three small choices. A demonstration of how an interface can quietly make them for you.",
    color: "#f6d959",
  },
];
export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

