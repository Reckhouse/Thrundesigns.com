export type QualityTier = "low" | "medium" | "high";

export type QualityBudget = {
  tier: QualityTier;
  particleCount: number;
  curveSegments: number;
  dprCap: number;
  shadows: boolean;
};

export type PostprocessingBudget = {
  tier: QualityTier;
  enabled: boolean;
  multisampling: number;
  resolutionScale: number;
  scanlineDensity: number;
  scanlineScale: number;
  grainScale: number;
  chromaticScale: number;
  bloomScale: number;
  allowChromatic: boolean;
  allowBloom: boolean;
};

const PARTICLE_BUDGETS: Record<QualityTier, number> = {
  low: 10_000,
  medium: 28_000,
  high: 70_000,
};

export function resolveQualityTier(
  quality: "auto" | QualityTier,
  hints?: {
    mobile?: boolean;
    reducedMotion?: boolean;
    hardwareConcurrency?: number;
  },
): QualityTier {
  if (quality !== "auto") return quality;
  if (hints?.reducedMotion) return "low";
  if (hints?.mobile) return "low";
  const cores = hints?.hardwareConcurrency ?? 8;
  if (cores <= 4) return "medium";
  return "high";
}

export function qualityBudget(
  quality: "auto" | QualityTier,
  hints?: {
    mobile?: boolean;
    reducedMotion?: boolean;
    hardwareConcurrency?: number;
  },
): QualityBudget {
  const tier = resolveQualityTier(quality, hints);
  return {
    tier,
    particleCount: PARTICLE_BUDGETS[tier],
    curveSegments: tier === "low" ? 3 : tier === "high" ? 8 : 5,
    dprCap: tier === "high" ? 2 : tier === "medium" ? 1.5 : 1,
    shadows: tier !== "low",
  };
}

export function postprocessingBudget(
  quality: "auto" | QualityTier,
  hints?: {
    mobile?: boolean;
    reducedMotion?: boolean;
    hardwareConcurrency?: number;
  },
): PostprocessingBudget {
  const tier = resolveQualityTier(quality, hints);
  if (tier === "low") {
    return {
      tier,
      enabled: true,
      multisampling: 0,
      resolutionScale: 0.65,
      scanlineDensity: 0.85,
      scanlineScale: 0.7,
      grainScale: 0.55,
      chromaticScale: 0.25,
      bloomScale: 0,
      allowChromatic: false,
      allowBloom: false,
    };
  }
  if (tier === "medium") {
    return {
      tier,
      enabled: true,
      multisampling: 0,
      resolutionScale: 0.85,
      scanlineDensity: 1.05,
      scanlineScale: 0.9,
      grainScale: 0.85,
      chromaticScale: 0.75,
      bloomScale: 0.55,
      allowChromatic: true,
      allowBloom: !hints?.reducedMotion,
    };
  }
  return {
    tier,
    enabled: true,
    multisampling: 4,
    resolutionScale: 1,
    scanlineDensity: 1.2,
    scanlineScale: 1,
    grainScale: 1,
    chromaticScale: 1,
    bloomScale: 1,
    allowChromatic: true,
    allowBloom: true,
  };
}

export function particleCountForDensity(
  budget: number,
  density: number,
): number {
  const clamped = Math.min(1, Math.max(0.15, density));
  return Math.max(1500, Math.floor(budget * clamped));
}
