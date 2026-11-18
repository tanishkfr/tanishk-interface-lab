import type { ReactNode } from "react";
import { RouteStage } from "@/components/shell/route-stage";

export default function Template({ children }: { children: ReactNode }) {
  return <RouteStage>{children}</RouteStage>;
}
