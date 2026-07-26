"use client";

import dynamic from "next/dynamic";

export const HorseParticlesLazy = dynamic(
  () =>
    import("@/components/hero/horse-particles").then((mod) => mod.HorseParticles),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[320px] w-full items-center justify-center"
        aria-hidden
      >
        <div className="size-[min(70%,280px)] border border-line/40 opacity-35" />
      </div>
    ),
  },
);
