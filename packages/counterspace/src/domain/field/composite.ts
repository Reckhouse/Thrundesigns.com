import type { FieldConfig, FieldEmitter, Vec3, Vec3Like } from './types'
import { nFoldAngularForce } from './modifiers'
import { circular, counterspatial, normalizedOperatorWeights, radial, spatial } from './operators'
import { add, clampMagnitude, isFiniteVec3, scale, vec3 } from './vector'

export const DEFAULT_ACCELERATION_CLAMP = 12

export function sampleEmitterAcceleration(
  point: Vec3Like,
  emitter: FieldEmitter,
  time: number,
  normalizeWeights = true,
): Vec3 {
  const weights = normalizeWeights ? normalizedOperatorWeights(emitter.weights) : emitter.weights
  const context = { point, emitter }
  const spatialValue = spatial(context)
  const counterspatialValue = counterspatial(context)
  const circularValue = circular(context)
  const radialValue = radial(context, time, emitter)

  const blend = vec3(
    weights.spatial * spatialValue.x +
      weights.counterspatial * counterspatialValue.x +
      weights.circular * emitter.angularSpeed * circularValue.x +
      weights.radial * emitter.pressure * radialValue.x,
    weights.spatial * spatialValue.y +
      weights.counterspatial * counterspatialValue.y +
      weights.circular * emitter.angularSpeed * circularValue.y +
      weights.radial * emitter.pressure * radialValue.y,
    weights.spatial * spatialValue.z +
      weights.counterspatial * counterspatialValue.z +
      weights.circular * emitter.angularSpeed * circularValue.z +
      weights.radial * emitter.pressure * radialValue.z,
  )
  const signed = scale(blend, emitter.polarity * Math.max(0, emitter.strength))
  const contributionClamp = emitter.contributionClamp ?? DEFAULT_ACCELERATION_CLAMP
  return clampMagnitude(isFiniteVec3(signed) ? signed : vec3(), contributionClamp)
}

export function sampleFieldAcceleration(point: Vec3Like, config: FieldConfig, time: number): Vec3 {
  let total = vec3()
  for (const emitter of config.emitters) {
    total = add(total, sampleEmitterAcceleration(point, emitter, time, config.normalizeWeights ?? true))
  }
  if (config.symmetry) total = add(total, nFoldAngularForce(point, config.symmetry))
  return clampMagnitude(total, config.accelerationClamp)
}
