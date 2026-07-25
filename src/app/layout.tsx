import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Libre_Baskerville } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
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

export const metadata: Metadata = {
  title: {
    default: "Thrun Design Co.",
    template: "%s · Thrun Design Co.",
  },
  description:
    "Strategic brand identity, website design, and marketing systems for businesses ready to move forward.",
  metadataBase: new URL("https://thrundesign.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libre.variable} ${plexSans.variable} ${plexMono.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        {children}
        <SanityLive />
      </body>
    </html>
  );
}
