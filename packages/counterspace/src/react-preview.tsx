"use client";

import { CounterspaceExperience } from "./react";
import type { CounterspaceEmbedConfig } from "./schemas";

export type CounterspacePreviewProps = {
  configuration?: CounterspaceEmbedConfig;
};

/**
 * Preview entry — same laboratory renderer; case studies typically pair this
 * with a poster and a fullscreen lab launch.
 */
export function CounterspacePreview({
  configuration,
}: CounterspacePreviewProps) {
  return <CounterspaceExperience configuration={configuration} />;
}

export default CounterspacePreview;
