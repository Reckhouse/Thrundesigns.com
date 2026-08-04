"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { ControlledChaosCreation } from "@thrun-design/controlled-chaos/schemas";
import type { ControlledChaosEmbedConfig } from "@thrun-design/controlled-chaos/schemas";
import { ExperienceErrorBoundary } from "@/components/experiences/ExperienceErrorBoundary";
import { createControlledChaosAnalyticsAdapter } from "@/experiences/controlled-chaos/analyticsAdapter";
import { controlledChaosPersistenceAdapter } from "@/experiences/controlled-chaos/persistenceAdapter";
import { getExperienceClientPlugin } from "@/experiences/registry.client";
import { trackExperienceEvent } from "@/experiences/analytics";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";

type CreationReplayClientProps = {
  creationId: string;
  creation: ControlledChaosCreation;
  configuration: ControlledChaosEmbedConfig;
};

export function CreationReplayClient({
  creationId,
  creation,
  configuration,
}: CreationReplayClientProps) {
  const [Component, setComponent] = useState<ComponentType<{
    configuration?: ControlledChaosEmbedConfig;
    creation?: ControlledChaosCreation;
    creationId?: string;
    persistence?: typeof controlledChaosPersistenceAdapter;
    analytics?: ReturnType<typeof createControlledChaosAnalyticsAdapter>;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const plugin = getExperienceClientPlugin(
      controlledChaosManifest.experienceKey,
    );
    const loader = plugin?.loadReplay ?? plugin?.loadExperience;
    if (!loader) {
      setError("Replay loader is not registered.");
      return;
    }

    void loader()
      .then((mod) => {
        if (cancelled) return;
        setComponent(() => mod.default);
        trackExperienceEvent("replay_loaded", {
          experienceKey: controlledChaosManifest.experienceKey,
          mode: "replay",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load the replay experience.");
        trackExperienceEvent("experience_failed", {
          experienceKey: controlledChaosManifest.experienceKey,
          mode: "replay",
          reason: "dynamic_import",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = createControlledChaosAnalyticsAdapter("replay");

  if (error) {
    return (
      <div role="alert" className="border border-line bg-bg-raised p-8">
        <p className="font-sans text-[15px] text-fg">{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div
        className="flex min-h-[420px] items-center justify-center border border-line bg-bg-raised"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Loading replay…
        </p>
      </div>
    );
  }

  return (
    <ExperienceErrorBoundary
      onError={() => analytics.track("failed", { reason: "render_boundary" })}
    >
      <div className="min-h-[420px] w-full">
        <Component
          configuration={configuration}
          creation={creation}
          creationId={creationId}
          persistence={controlledChaosPersistenceAdapter}
          analytics={analytics}
        />
      </div>
    </ExperienceErrorBoundary>
  );
}
