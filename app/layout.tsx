import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { SITE_URL } from "@/lib/site";
import { SiteFrame } from "@/components/shell/site-frame";
import { NewBar } from "@/components/shell/new-bar";

const sans = localFont({
  src: [
    { path: "../public/fonts/apfel-regular.woff2", weight: "400" },
    { path: "../public/fonts/apfel-mittel.woff2", weight: "500" },
    { path: "../public/fonts/apfel-fett.woff2", weight: "700" },
    { path: "../public/fonts/apfel-satt.woff2", weight: "900" },
  ],
  variable: "--font-lab-sans",
  display: "swap",
});

const mono = localFont({
  src: "../public/fonts/plex.ttf",
  variable: "--font-lab-mono",
  preload: false,
  weight: "400",
  display: "swap",
});
const display = localFont({
  src: "../public/fonts/gulax.woff2",
  variable: "--font-lab-display",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LAB/ — An internet playground by Tanishk",
    template: "%s — LAB/",
  },
  description:
    "An independent internet playground. Strange experiments, useful creative tools, and thoughtful components. Made to be played with.",
  applicationName: "Tanishk Interface Lab",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f1e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
    >
      <body>
        <SiteFrame
          header={
            <>
              <NewBar />
              <SiteHeader />
            </>
          }
          footer={<SiteFooter />}
        >
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
