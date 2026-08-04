"use client";

import { StubShell } from "./stub-shell";
import type { ControlledChaosEmbedConfig } from "./schemas";

export type ControlledChaosExperienceProps = {
  configuration?: ControlledChaosEmbedConfig;
};

export function ControlledChaosExperience({
  configuration,
}: ControlledChaosExperienceProps) {
  return (
    <StubShell
      label="Controlled Chaos — Poster Lab"
      configuration={configuration}
    />
  );
}

export default ControlledChaosExperience;
