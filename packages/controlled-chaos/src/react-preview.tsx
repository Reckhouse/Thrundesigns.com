"use client";

import { StubShell } from "./stub-shell";
import type { ControlledChaosEmbedConfig } from "./schemas";

export type ControlledChaosPreviewProps = {
  configuration?: ControlledChaosEmbedConfig;
};

export function ControlledChaosPreview({
  configuration,
}: ControlledChaosPreviewProps) {
  return (
    <StubShell label="Controlled Chaos — Preview" configuration={configuration} />
  );
}

export default ControlledChaosPreview;
