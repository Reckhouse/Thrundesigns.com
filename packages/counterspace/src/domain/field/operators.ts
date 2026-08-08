import type { FieldEmitter, OperatorContext, Vec3 } from './types'
import { cross, magnitude, normalize, scale, subtract, vec3 } from './vector'

export interface LocalFieldFrame {
  readonly radial: Vec3
  readonly normal: Vec3
  readonly axis: Vec3
  readonly softenedDistance: number
  readonly envelope: number
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

/** Builds the shared softened emitter-local frame used by every basis operator. */
export function localFieldFrame({ point, emitter }: OperatorContext): LocalFieldFrame {
  const coreRadius = positiveFinite(emitter.coreRadius, 1e-4)
  const reach = positiveFinite(emitter.reach, coreRadius)
  const falloff = Math.min(2, Math.max(0, Number.isFinite(emitter.falloff) ? emitter.falloff : 1))
  const radial = subtract(point, emitter.position)
  const softenedDistance = Math.sqrt(
    radial.x * radial.x + radial.y * radial.y + radial.z * radial.z + coreRadius * coreRadius,
  )
  const normal = scale(radial, 1 / softenedDistance)
  const axis = normalize(emitter.axis)
  const denominator = softenedDistance ** falloff + coreRadius ** falloff
  const envelope = Math.exp(-((softenedDistance / reach) ** 2)) / denominator
  return { radial, normal, axis, softenedDistance, envelope }
}

/** Positive radial projection. */
export function spatial(context: OperatorContext): Vec3 {
  const frame = localFieldFrame(context)
  return scale(frame.normal, frame.envelope)
}

/** Negative radial projection. */
export function counterspatial(context: OperatorContext): Vec3 {
  return scale(spatial(context), -1)
}

/** Tangential flow orthogonal to both the emitter axis and radial direction. */
export function circular(context: OperatorContext): Vec3 {
  const frame = localFieldFrame(context)
  const tangent = normalize(cross(frame.axis, frame.normal))
  return scale(tangent, frame.envelope)
}

/** Alternating shell-normal pressure. */
export function radial(
  context: OperatorContext,
  time: number,
  pulse: Pick<FieldEmitter, 'pulseWaveNumber' | 'pulseFrequency' | 'phase'>,
): Vec3 {
  const frame = localFieldFrame(context)
  const oscillation = Math.cos(
    pulse.pulseWaveNumber * frame.softenedDistance - pulse.pulseFrequency * time + pulse.phase,
  )
  return scale(frame.normal, frame.envelope * oscillation)
}

/** Convenience sampler for field inspectors and parity probes. */
export function sampleOperators(
  context: OperatorContext,
  time: number,
  pulse: Pick<FieldEmitter, 'pulseWaveNumber' | 'pulseFrequency' | 'phase'>,
): Readonly<Record<'spatial' | 'counterspatial' | 'circular' | 'radial', Vec3>> {
  return {
    spatial: spatial(context),
    counterspatial: counterspatial(context),
    circular: circular(context),
    radial: radial(context, time, pulse),
  }
}

export function operatorWeightL1(weights: FieldEmitter['weights']): number {
  return (
    Math.abs(weights.spatial) +
    Math.abs(weights.counterspatial) +
    Math.abs(weights.circular) +
    Math.abs(weights.radial)
  )
}

export function normalizedOperatorWeights(weights: FieldEmitter['weights']): FieldEmitter['weights'] {
  const total = operatorWeightL1(weights)
  if (!Number.isFinite(total) || total <= 1e-12) {
    return { spatial: 0, counterspatial: 0, circular: 0, radial: 0 }
  }
  return {
    spatial: weights.spatial / total,
    counterspatial: weights.counterspatial / total,
    circular: weights.circular / total,
    radial: weights.radial / total,
  }
}

export function finiteOperatorResult(value: Vec3): Vec3 {
  return Number.isFinite(magnitude(value)) ? value : vec3()
}
