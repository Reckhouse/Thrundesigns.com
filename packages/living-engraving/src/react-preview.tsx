"use client";

import { LivingEngravingExperience } from "./react";
import type { LivingEngravingEmbedConfig } from "./schemas";

export type LivingEngravingPreviewProps = {
  configuration?: LivingEngravingEmbedConfig;
};

/**
 * Preview entry — same renderer, typically paired with interaction load
 * behavior and a poster fallback on the case study.
 */
export function LivingEngravingPreview({
  configuration,
}: LivingEngravingPreviewProps) {
  return <LivingEngravingExperience configuration={configuration} />;
}

export default LivingEngravingPreview;
