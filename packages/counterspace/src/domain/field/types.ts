export interface Vec3Like {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface OperatorWeights {
  spatial: number
  counterspatial: number
  circular: number
  radial: number
}

export interface FieldEmitter {
  id: string
  position: Vec3Like
  axis: Vec3Like
  polarity: number
  strength: number
  coreRadius: number
  reach: number
  falloff: number
  weights: OperatorWeights
  angularSpeed: number
  pressure: number
  pulseWaveNumber: number
  pulseFrequency: number
  phase: number
  contributionClamp?: number
}

export interface SymmetryConfig {
  count: number
  strength: number
  phase?: number
  axis?: Vec3Like
  coreRadius?: number
}

export interface FieldConfig {
  emitters: readonly FieldEmitter[]
  accelerationClamp: number
  normalizeWeights?: boolean
  symmetry?: SymmetryConfig
}

export interface OperatorContext {
  point: Vec3Like
  emitter: Pick<FieldEmitter, 'position' | 'axis' | 'coreRadius' | 'reach' | 'falloff'>
}

export interface ParticleInitializationOptions {
  count: number
  seed: number | string
  radius?: number
  center?: Vec3Like
  initialSpeed?: number
}

export interface ParticleInitialState {
  readonly positions: Float32Array
  readonly velocities: Float32Array
  readonly memory: Float32Array
}
