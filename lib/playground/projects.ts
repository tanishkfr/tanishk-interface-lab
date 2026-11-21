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
    slug: "text-desk",
    name: "Text Desk",
    category: "Tool",
    medium: "A little order for your words",
    description:
      "Clean pasted text, untangle whitespace, remove duplicate lines, and take a fresh copy with you.",
    color: "#e4e7dc",
    status: "Prototype",
    version: "0.1",
  },
  {
    slug: "sticker-city",
    name: "Sticker City",
    category: "Experiment",
    medium: "A wall with no rules",
    description:
      "Make a sticker. Claim a corner. Build a composition that looks like nobody asked for permission.",
    color: "#b4bce9",
    status: "Prototype",
    version: "0.1",
  },
  {
    slug: "almost-nothing",
    name: "Almost Nothing",
    category: "Experiment",
    medium: "An interface that knows when to leave",
    description:
      "A mark, a little time, and a surface that lets go. Keep only what is still here.",
    color: "#f8f7f0",
    status: "Prototype",
    version: "0.1",
  },
  {
    slug: "data-matter",
    status: "Prototype",
    version: "0.2",
    name: "Data Matter",
    category: "Experiment",
    medium: "Data as a physical material",
    description:
      "Give numbers a landscape. Shape, turn, and take home a sculpture made from your data.",
    color: "#d9cebc",
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
    slug: "grid-crimes",
    name: "Grid Crimes",
    category: "Experiment",
    medium: "Rules, temporarily",
    description:
      "Push a working editorial grid out of line. Change its rules and take the real composition home.",
    color: "#f4eee1",
    status: "Prototype",
    version: "0.1",
  },
  {
    slug: "brutal-exe",
    name: "BRUTAL.EXE",
    category: "Experiment",
    medium: "Four rooms. No velvet ropes.",
    description:
      "A spatial website with exposed structure. Edit the wall, rearrange the order, and leave a trace.",
    color: "#ff684f",
    status: "Prototype",
    version: "0.1",
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
