import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Libre_Baskerville } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/sanity/disable-draft-mode";
import { ConsentAwareAnalytics } from "@/components/site/consent-aware-analytics";
import { GoogleTag } from "@/components/site/google-tag";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { SanityLive } from "@/sanity/lib/live";
import { ScrollProgress } from "@/components/site/scroll-progress";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/seo";
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

/**
 * Site-wide defaults only. Do not set `alternates.canonical` here — a root
 * canonical of `/` can leak onto child routes that omit their own.
 * Each public page sets its canonical via `buildPageMetadata` or local metadata.
 */
export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "design",
  keywords: [
    "brand identity",
    "brand strategy",
    "web design",
    "website development",
    "graphic design",
    "startup branding",
    "Colorado Springs",
    "marketing audit",
    "print design",
    "Thrun Design Co.",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
      <head>
        <GoogleTag />
      </head>
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
        <ConsentAwareAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
