import type { Metadata } from "next";
import Afterclick from "@/components/playground/afterclick/afterclick";

export const metadata: Metadata = {
  title: "AFTERCLICK Studio",
  description:
    "Review a recorded website interaction as a state map, timeline, and inspectable sequence of observed consequences.",
};

export default function AfterclickPlayPage() {
  return <Afterclick />;
}
