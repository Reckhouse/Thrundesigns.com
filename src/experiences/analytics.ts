/**
 * Privacy-safe experience analytics adapter.
 * Does not accept or log user phrase, SVG, audio, creation state, or gestures.
 */

export type ExperienceAnalyticsEvent =
  | "poster_viewed"
  | "load_action_selected"
  | "experience_initialized"
  | "experience_failed"
  | "fullscreen_launch_selected"
  | "replay_loaded"
  | "export_completed"
  | "share_link_copied"
  | "creation_duplicated";

type ExperienceAnalyticsPayload = {
  experienceKey?: string;
  mode?: string;
  loadBehavior?: string;
  reason?: string;
};

export function trackExperienceEvent(
  event: ExperienceAnalyticsEvent,
  payload: ExperienceAnalyticsPayload = {},
): void {
  if (typeof console === "undefined") return;
  // Structured log only — swap for a product analytics SDK later.
  console.info("[experience-analytics]", event, {
    experienceKey: payload.experienceKey,
    mode: payload.mode,
    loadBehavior: payload.loadBehavior,
    reason: payload.reason,
  });
}
