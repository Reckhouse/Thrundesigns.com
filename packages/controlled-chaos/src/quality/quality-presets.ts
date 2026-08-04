export type QualityTier = "low" | "medium" | "high";

export type QualityBudget = {
  tier: QualityTier;
  particleCount: number;
  curveSegments: number;
  dprCap: number;
  shadows: boolean;
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

export function particleCountForDensity(
  budget: number,
  density: number,
): number {
  const clamped = Math.min(1, Math.max(0.15, density));
  return Math.max(1500, Math.floor(budget * clamped));
}
