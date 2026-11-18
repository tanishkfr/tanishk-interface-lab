"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A route-level motion boundary. Templates remount on navigation, so the
 * wrapper can replay a short print-like reveal without any navigation delay.
 * Preview documents are left untouched so iframe captures stay exact.
 */
export function RouteStage({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/preview/")) return <>{children}</>;

  return (
    <div className="route-stage" key={pathname}>
      <span className="route-registration" aria-hidden="true" />
      {children}
    </div>
  );
}
