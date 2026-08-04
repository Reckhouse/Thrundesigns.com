"use client";

import dynamic from "next/dynamic";
import type { HorseParticlesProps } from "@/components/hero/horse-particles";

const HorseParticlesDynamic = dynamic(
  () =>
    import("@/components/hero/horse-particles").then(
      (mod) => mod.HeroHorseParticles,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[320px] w-full items-center justify-center"
        aria-hidden
      >
        <div className="size-[min(70%,280px)] border border-line/30 opacity-25" />
      </div>
    ),
  },
);

export function HorseParticlesLazy(props: HorseParticlesProps) {
  return <HorseParticlesDynamic {...props} />;
}
