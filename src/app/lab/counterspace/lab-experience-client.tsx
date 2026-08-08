"use client";

import dynamic from "next/dynamic";
import type { CounterspaceEmbedConfig } from "@thrun-design/counterspace/schemas";
import { counterspaceManifest } from "@thrun-design/counterspace/manifest";
import { ExperienceErrorBoundary } from "@/components/experiences/ExperienceErrorBoundary";
import { trackExperienceEvent } from "@/experiences/analytics";
import { useEffect } from "react";

type LabExperienceClientProps = {
  configuration: CounterspaceEmbedConfig;
};

const CounterspaceDynamic = dynamic(
  () =>
    import("@thrun-design/counterspace/react").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[70vh] items-center justify-center bg-[#f9f6ef]"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#68655f]">
          Loading Counterspace Field Laboratory…
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
      experienceKey: counterspaceManifest.experienceKey,
      mode: configuration.mode,
    });
  }, [configuration.mode]);

  return (
    <ExperienceErrorBoundary>
      <div className="relative h-[calc(100vh-72px)] min-h-[640px] w-full">
        <CounterspaceDynamic configuration={configuration} />
      </div>
    </ExperienceErrorBoundary>
  );
}
