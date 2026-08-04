"use client";

import { StubShell } from "./stub-shell";
import type {
  ControlledChaosCreation,
  ControlledChaosEmbedConfig,
} from "./schemas";

export type ControlledChaosReplayProps = {
  configuration?: ControlledChaosEmbedConfig;
  creation?: ControlledChaosCreation;
  creationId?: string;
};

export function ControlledChaosReplay({
  configuration,
  creation,
  creationId,
}: ControlledChaosReplayProps) {
  return (
    <StubShell
      label="Controlled Chaos — Replay"
      configuration={configuration}
      creationId={creationId ?? creation?.title}
    >
      {creation?.title ? (
        <p style={{ margin: 0, color: "#c7c2b8", fontSize: "0.875rem" }}>
          Saved title: {creation.title}
        </p>
      ) : null}
    </StubShell>
  );
}

export default ControlledChaosReplay;
