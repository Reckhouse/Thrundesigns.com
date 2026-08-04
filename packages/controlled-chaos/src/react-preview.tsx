"use client";

import { PosterLabShell } from "./shell/PosterLabShell";
import type { ControlledChaosEmbedConfig } from "./schemas";
import type {
  ControlledChaosAnalyticsAdapter,
  ControlledChaosPersistenceAdapter,
} from "./adapters.types";

export type ControlledChaosPreviewProps = {
  configuration?: ControlledChaosEmbedConfig;
  persistence?: ControlledChaosPersistenceAdapter;
  analytics?: ControlledChaosAnalyticsAdapter;
};

/**
 * Case-study / inline preview — canvas with minimal chrome.
 * Full editor controls stay on the lab route.
 */
export function ControlledChaosPreview({
  configuration,
  persistence,
  analytics,
}: ControlledChaosPreviewProps) {
  return (
    <PosterLabShell
      variant="preview"
      configuration={configuration}
      persistence={persistence}
      analytics={analytics}
    />
  );
}

export default ControlledChaosPreview;
