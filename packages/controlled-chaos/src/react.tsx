"use client";

import { PosterLabShell } from "./shell/PosterLabShell";
import type { ControlledChaosEmbedConfig } from "./schemas";
import type {
  ControlledChaosAnalyticsAdapter,
  ControlledChaosPersistenceAdapter,
} from "./adapters.types";

export type ControlledChaosExperienceProps = {
  configuration?: ControlledChaosEmbedConfig;
  persistence?: ControlledChaosPersistenceAdapter;
  analytics?: ControlledChaosAnalyticsAdapter;
};

export function ControlledChaosExperience({
  configuration,
  persistence,
  analytics,
}: ControlledChaosExperienceProps) {
  return (
    <PosterLabShell
      variant="lab"
      configuration={configuration}
      persistence={persistence}
      analytics={analytics}
    />
  );
}

export default ControlledChaosExperience;
