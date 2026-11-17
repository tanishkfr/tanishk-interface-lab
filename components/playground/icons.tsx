import type { SVGProps } from "react";
export function Icon({
  name = "arrow",
  ...props
}: SVGProps<SVGSVGElement> & {
  name?:
    | "arrow"
    | "shuffle"
    | "grid"
    | "list"
    | "search"
    | "download"
    | "close"
    | "play"
    | "reset"
    | "plus";
}) {
  const paths = {
    arrow: "M5 19 19 5M5 5h14v14",
    shuffle:
      "M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6m3-5c1-1 2-1 3-1h3m-4-4 4 4-4 4",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    list: "M4 6h16M4 12h16M4 18h16",
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
    close: "m6 6 12 12M6 18 18 6",
    play: "m8 4 12 8-12 8z",
    reset: "M4 11a8 8 0 1 1 1 6M4 4v7h7",
    plus: "M12 4v16M4 12h16",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
