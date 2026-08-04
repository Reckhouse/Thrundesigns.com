import {
  trackExperienceEvent,
  type ExperienceAnalyticsEvent,
} from "@/experiences/analytics";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";

/**
 * Package-facing analytics adapter for Controlled Chaos.
 * Translates internal experience events into the portfolio analytics system
 * without accepting user content payloads.
 */

export type ControlledChaosAnalyticsEvent =
  | "initialized"
  | "failed"
  | "export_completed"
  | "share_link_copied"
  | "creation_duplicated"
  | "replay_loaded";

const EVENT_MAP: Record<
  ControlledChaosAnalyticsEvent,
  ExperienceAnalyticsEvent
> = {
  initialized: "experience_initialized",
  failed: "experience_failed",
  export_completed: "export_completed",
  share_link_copied: "share_link_copied",
  creation_duplicated: "creation_duplicated",
  replay_loaded: "replay_loaded",
};

export function createControlledChaosAnalyticsAdapter(mode?: string) {
  return {
    track(
      event: ControlledChaosAnalyticsEvent,
      detail?: { reason?: string },
    ) {
      trackExperienceEvent(EVENT_MAP[event], {
        experienceKey: controlledChaosManifest.experienceKey,
        mode,
        reason: detail?.reason,
      });
    },
  };
}

export type ControlledChaosAnalyticsAdapter = ReturnType<
  typeof createControlledChaosAnalyticsAdapter
>;
