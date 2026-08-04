"use client";

import { PosterLabShell } from "./shell/PosterLabShell";
import type {
  ControlledChaosCreation,
  ControlledChaosEmbedConfig,
} from "./schemas";
import type {
  ControlledChaosAnalyticsAdapter,
  ControlledChaosPersistenceAdapter,
} from "./adapters.types";

export type ControlledChaosReplayProps = {
  configuration?: ControlledChaosEmbedConfig;
  creation?: ControlledChaosCreation;
  creationId?: string;
  persistence?: ControlledChaosPersistenceAdapter;
  analytics?: ControlledChaosAnalyticsAdapter;
};

export function ControlledChaosReplay({
  configuration,
  creation,
  creationId,
  persistence,
  analytics,
}: ControlledChaosReplayProps) {
  return (
    <PosterLabShell
      variant="replay"
      configuration={configuration}
      persistence={persistence}
      analytics={analytics}
      creationId={creationId}
      creationTitle={creation?.title}
    />
  );
}

export default ControlledChaosReplay;
