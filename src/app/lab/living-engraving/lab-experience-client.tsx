"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { LivingEngravingEmbedConfig } from "@thrun-design/living-engraving/schemas";
import { livingEngravingManifest } from "@thrun-design/living-engraving/manifest";
import { ExperienceErrorBoundary } from "@/components/experiences/ExperienceErrorBoundary";
import { getExperienceClientPlugin } from "@/experiences/registry.client";
import { trackExperienceEvent } from "@/experiences/analytics";

type LabExperienceClientProps = {
  configuration: LivingEngravingEmbedConfig;
};

export function LabExperienceClient({
  configuration,
}: LabExperienceClientProps) {
  const [Component, setComponent] = useState<ComponentType<{
    configuration?: LivingEngravingEmbedConfig;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const plugin = getExperienceClientPlugin(
      livingEngravingManifest.experienceKey,
    );
    const loader =
      configuration.mode === "preview"
        ? plugin?.loadPreview
        : plugin?.loadExperience;

    if (!loader) {
      setError("Living Engraving package loaders are not registered.");
      trackExperienceEvent("experience_failed", {
        experienceKey: livingEngravingManifest.experienceKey,
        mode: configuration.mode,
        reason: "missing_plugin",
      });
      return;
    }

    void loader()
      .then((mod) => {
        if (cancelled) return;
        setComponent(() => mod.default);
        trackExperienceEvent("experience_initialized", {
          experienceKey: livingEngravingManifest.experienceKey,
          mode: configuration.mode,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load the Living Engraving experience.");
        trackExperienceEvent("experience_failed", {
          experienceKey: livingEngravingManifest.experienceKey,
          mode: configuration.mode,
          reason: "dynamic_import",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [configuration.mode]);

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-col items-start justify-center gap-4 px-6 py-16"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Experience unavailable
        </p>
        <p className="font-sans text-[15px] leading-7 text-fg">{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div
        className="flex min-h-[70vh] items-center justify-center"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Loading Living Engraving…
        </p>
      </div>
    );
  }

  return (
    <ExperienceErrorBoundary>
      <div className="relative min-h-[calc(100vh-72px)] w-full">
        <Component configuration={configuration} />
      </div>
    </ExperienceErrorBoundary>
  );
}
