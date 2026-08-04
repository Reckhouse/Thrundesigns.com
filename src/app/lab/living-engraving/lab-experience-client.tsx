"use client";

import dynamic from "next/dynamic";
import type { LivingEngravingEmbedConfig } from "@thrun-design/living-engraving/schemas";
import { livingEngravingManifest } from "@thrun-design/living-engraving/manifest";
import { ExperienceErrorBoundary } from "@/components/experiences/ExperienceErrorBoundary";
import { trackExperienceEvent } from "@/experiences/analytics";
import { useEffect } from "react";

type LabExperienceClientProps = {
  configuration: LivingEngravingEmbedConfig;
};

const LivingEngravingDynamic = dynamic(
  () =>
    import("@thrun-design/living-engraving/react").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[70vh] items-center justify-center"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Loading Living Engraving…
        </p>
      </div>
    ),
  },
);

export function LabExperienceClient({
  configuration,
}: LabExperienceClientProps) {
  useEffect(() => {
    trackExperienceEvent("experience_initialized", {
      experienceKey: livingEngravingManifest.experienceKey,
      mode: configuration.mode,
    });
  }, [configuration.mode]);

  return (
    <ExperienceErrorBoundary>
      <div className="relative h-[calc(100vh-72px)] min-h-[640px] w-full">
        <LivingEngravingDynamic configuration={configuration} />
      </div>
    </ExperienceErrorBoundary>
  );
}
