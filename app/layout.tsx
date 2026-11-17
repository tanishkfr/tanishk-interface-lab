import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { SITE_URL } from "@/lib/site";

const sans = localFont({
  src: "../public/fonts/instrument.ttf",
  variable: "--font-lab-sans",
  weight: "400 700",
  display: "swap",
});

const mono = localFont({
  src: "../public/fonts/plex.ttf",
  variable: "--font-lab-mono",
  display: "swap",
});
const display = localFont({
  src: "../public/fonts/bricolage.ttf",
  variable: "--font-lab-display",
  weight: "200 800",
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
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
