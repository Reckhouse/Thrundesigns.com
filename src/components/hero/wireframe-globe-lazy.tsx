"use client";

import dynamic from "next/dynamic";

export const WireframeGlobeLazy = dynamic(
  () =>
    import("@/components/hero/wireframe-globe").then((mod) => mod.WireframeGlobe),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[320px] w-full items-center justify-center"
        aria-hidden
      >
        <div className="size-[min(70%,280px)] border border-line/50 opacity-40" />
      </div>
    ),
  },
);
