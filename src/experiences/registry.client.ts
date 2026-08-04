"use client";

import type {
  ExperienceComponentModule,
  PortfolioExperienceClientPlugin,
} from "@/experiences/types";

/**
 * Client-only experience loaders.
 * Dynamic imports live here so Server Components never pull WebGL runtimes.
 */

export const experienceRegistryClient = {
  "controlled-chaos-poster-lab": {
    loadPreview: () =>
      import("@thrun-design/controlled-chaos/react-preview") as Promise<ExperienceComponentModule>,
    loadExperience: () =>
      import("@thrun-design/controlled-chaos/react") as Promise<ExperienceComponentModule>,
    loadReplay: () =>
      import("@thrun-design/controlled-chaos/react-replay") as Promise<ExperienceComponentModule>,
  },
} as const satisfies Record<string, PortfolioExperienceClientPlugin>;

export type RegisteredClientExperienceKey =
  keyof typeof experienceRegistryClient;

export function getExperienceClientPlugin(
  experienceKey: string,
): PortfolioExperienceClientPlugin | null {
  if (experienceKey in experienceRegistryClient) {
    return experienceRegistryClient[
      experienceKey as RegisteredClientExperienceKey
    ];
  }
  return null;
}
