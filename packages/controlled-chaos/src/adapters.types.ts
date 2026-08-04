export type ControlledChaosPersistenceAdapter = {
  save(creation: unknown): Promise<{ id: string; url: string }>;
  load(creationId: string): Promise<{ id: string; payload: unknown }>;
  duplicate(creationId: string): Promise<{ id: string; url: string }>;
};

export type ControlledChaosAnalyticsEvent =
  | "initialized"
  | "failed"
  | "export_completed"
  | "share_link_copied"
  | "creation_duplicated"
  | "replay_loaded";

export type ControlledChaosAnalyticsAdapter = {
  track(
    event: ControlledChaosAnalyticsEvent,
    detail?: { reason?: string },
  ): void;
};
