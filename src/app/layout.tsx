import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Libre_Baskerville } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/sanity/disable-draft-mode";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { SanityLive } from "@/sanity/lib/live";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const libre = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "Thrun Design Co.",
    template: "%s · Thrun Design Co.",
  },
  description:
    "Strategic brand systems, websites, marketing audits, and print & digital assets for founders and owners facing a rebrand, launch, or outdated site.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Thrun Design Co.",
    title: "Thrun Design Co.",
    description:
      "Strategic brand systems, websites, marketing audits, and print & digital assets for founders and owners.",
    images: [
      {
        url: "/images/hero-mountain.jpg",
        width: 1600,
        height: 1000,
        alt: "Snow-capped mountain ridge under a pale dawn sky",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thrun Design Co.",
    description:
      "Strategic brand systems, websites, marketing audits, and print & digital assets for founders and owners.",
    images: ["/images/hero-mountain.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraft = (await draftMode()).isEnabled;

  return (
    <html
      lang="en"
      className={`${libre.variable} ${plexSans.variable} ${plexMono.variable} dark h-full`}
    >
      <body className="relative flex min-h-full flex-col bg-bg-deep text-fg">
        <SiteJsonLd />
        <ScrollProgress />
        {children}
        <SanityLive />
        {isDraft ? (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        ) : null}
      </body>
    </html>
  );
}
