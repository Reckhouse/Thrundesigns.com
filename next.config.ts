import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@thrun-design/controlled-chaos",
    "@thrun-design/counterspace",
    "@thrun-design/living-engraving",
  ],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      // Soft duplicate of homepage that returned 200 and diluted crawl signals.
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      // Production Vercel alias → canonical www (middleware is a second guard).
      {
        source: "/:path*",
        has: [{ type: "host", value: "thrundesigns-com.vercel.app" }],
        destination: "https://www.thrundesigns.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
};

export default nextConfig;
