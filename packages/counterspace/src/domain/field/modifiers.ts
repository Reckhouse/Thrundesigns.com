import type { SymmetryConfig, Vec3, Vec3Like } from './types'
import { cross, dot, normalize, scale, subtract, vec3 } from './vector'

/**
 * Bounded tangential force from U_N(theta) = beta [1 - cos(N theta + delta)].
 * The radial denominator is softened so the symmetry axis remains finite.
 */
export function nFoldAngularForce(point: Vec3Like, config: SymmetryConfig): Vec3 {
  const count = Math.min(12, Math.max(1, Math.round(config.count)))
  const strength = Number.isFinite(config.strength) ? config.strength : 0
  const phase = Number.isFinite(config.phase) ? (config.phase ?? 0) : 0
  const coreRadius = Number.isFinite(config.coreRadius) && (config.coreRadius ?? 0) > 0
    ? (config.coreRadius ?? 0.08)
    : 0.08
  const axis = normalize(config.axis ?? { x: 0, y: 1, z: 0 })
  if (strength === 0 || (axis.x === 0 && axis.y === 0 && axis.z === 0)) return vec3()

  const referenceSeed = Math.abs(axis.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 }
  const basisU = normalize(cross(referenceSeed, axis))
  const basisV = cross(axis, basisU)
  const axial = scale(axis, dot(point, axis))
  const planar = subtract(point, axial)
  const x = dot(planar, basisU)
  const y = dot(planar, basisV)
  const theta = Math.atan2(y, x)
  const radiusSquared = x * x + y * y
  const tangent = normalize(cross(axis, planar))
  const angularDerivative = -strength * count * Math.sin(count * theta + phase)
  const softenedScale = Math.sqrt(radiusSquared) / (radiusSquared + coreRadius * coreRadius)
  return scale(tangent, angularDerivative * softenedScale)
}

export const PHI = (1 + Math.sqrt(5)) / 2
export const GOLDEN_ANGLE = 2 * Math.PI * (1 - 1 / PHI)

/** One stable relaxation step toward outer / inner = phi. */
export function relaxPhiRatio(
  innerRadius: number,
  outerRadius: number,
  strength: number,
  step: number,
): number {
  if (!Number.isFinite(innerRadius) || innerRadius <= 0 || !Number.isFinite(outerRadius)) return outerRadius
  const blend = Math.min(1, Math.max(0, strength * step))
  return outerRadius + (innerRadius * PHI - outerRadius) * blend
}
