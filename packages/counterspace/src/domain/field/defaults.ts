import type { FieldConfig, FieldEmitter } from './types'

export const DEFAULT_EMITTER: Readonly<FieldEmitter> = Object.freeze({
  id: 'emitter-1',
  position: Object.freeze({ x: 0, y: 0, z: 0 }),
  axis: Object.freeze({ x: 0, y: 1, z: 0 }),
  polarity: 1,
  strength: 1,
  coreRadius: 0.08,
  reach: 1,
  falloff: 1,
  weights: Object.freeze({ spatial: 0, counterspatial: 0.5, circular: 0.5, radial: 0 }),
  angularSpeed: 1,
  pressure: 1,
  pulseWaveNumber: 2 * Math.PI,
  pulseFrequency: 1,
  phase: 0,
  contributionClamp: 12,
})

export const DEFAULT_FIELD_CONFIG: Readonly<FieldConfig> = Object.freeze({
  emitters: Object.freeze([DEFAULT_EMITTER]),
  accelerationClamp: 12,
  normalizeWeights: true,
})

export function createEmitter(overrides: Partial<FieldEmitter> = {}): FieldEmitter {
  return {
    ...DEFAULT_EMITTER,
    ...overrides,
    position: { ...DEFAULT_EMITTER.position, ...overrides.position },
    axis: { ...DEFAULT_EMITTER.axis, ...overrides.axis },
    weights: { ...DEFAULT_EMITTER.weights, ...overrides.weights },
  }
}
