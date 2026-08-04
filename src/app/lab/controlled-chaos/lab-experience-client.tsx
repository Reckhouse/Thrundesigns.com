"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { ControlledChaosEmbedConfig } from "@thrun-design/controlled-chaos/schemas";
import { ExperienceErrorBoundary } from "@/components/experiences/ExperienceErrorBoundary";
import { createControlledChaosAnalyticsAdapter } from "@/experiences/controlled-chaos/analyticsAdapter";
import { controlledChaosPersistenceAdapter } from "@/experiences/controlled-chaos/persistenceAdapter";
import { getExperienceClientPlugin } from "@/experiences/registry.client";
import { trackExperienceEvent } from "@/experiences/analytics";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";

type LabExperienceClientProps = {
  configuration: ControlledChaosEmbedConfig;
};

export function LabExperienceClient({
  configuration,
}: LabExperienceClientProps) {
  const [Component, setComponent] = useState<ComponentType<{
    configuration?: ControlledChaosEmbedConfig;
    persistence?: typeof controlledChaosPersistenceAdapter;
    analytics?: ReturnType<typeof createControlledChaosAnalyticsAdapter>;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const plugin = getExperienceClientPlugin(
      controlledChaosManifest.experienceKey,
    );
    const loader =
      configuration.mode === "preview"
        ? plugin?.loadPreview
        : configuration.mode === "replay"
          ? plugin?.loadReplay ?? plugin?.loadExperience
          : plugin?.loadExperience;

    if (!loader) {
      setError("Controlled Chaos package loaders are not registered.");
      trackExperienceEvent("experience_failed", {
        experienceKey: controlledChaosManifest.experienceKey,
        mode: configuration.mode,
        reason: "missing_plugin",
      });
      return;
    }

    void loader()
      .then((mod) => {
        if (cancelled) return;
        setComponent(() => mod.default);
        trackExperienceEvent(
          configuration.mode === "replay"
            ? "replay_loaded"
            : "experience_initialized",
          {
            experienceKey: controlledChaosManifest.experienceKey,
            mode: configuration.mode,
          },
        );
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load the Controlled Chaos experience.");
        trackExperienceEvent("experience_failed", {
          experienceKey: controlledChaosManifest.experienceKey,
          mode: configuration.mode,
          reason: "dynamic_import",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [configuration.mode]);

  const analytics = createControlledChaosAnalyticsAdapter(configuration.mode);

  if (error) {
    return (
      <div
        role="alert"
        className="flex min-h-[60vh] flex-col items-start justify-center gap-3 border border-line bg-bg-raised p-8"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Lab unavailable
        </p>
        <p className="max-w-lg font-sans text-[15px] leading-7 text-fg">{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center border border-line bg-bg-raised"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Loading Poster Lab…
        </p>
      </div>
    );
  }

  return (
    <ExperienceErrorBoundary
      onError={() =>
        analytics.track("failed", { reason: "render_boundary" })
      }
    >
      <div className="min-h-[calc(100vh-72px)] w-full">
        <Component
          configuration={configuration}
          persistence={controlledChaosPersistenceAdapter}
          analytics={analytics}
        />
      </div>
    </ExperienceErrorBoundary>
  );
}
