"use client";

/**
 * Homepage hero adapter — Living Engraving package with hero layout defaults.
 * Particle buffers load from `/experiences/living-engraving`.
 */

export {
  HorseParticles,
  type HorseParticlesProps,
} from "@thrun-design/living-engraving/horse-particles";

import {
  HorseParticles as LivingEngravingHorse,
  type HorseParticlesProps,
} from "@thrun-design/living-engraving/horse-particles";

/** Convenience wrapper that defaults to the homepage hero offset layout. */
export function HeroHorseParticles(props: HorseParticlesProps) {
  return <LivingEngravingHorse layout="hero" {...props} />;
}
