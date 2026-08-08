import type { ParticleInitialState, ParticleInitializationOptions } from './types'

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function normalizeSeed(seed: number | string): number {
  if (typeof seed === 'string') return hashString(seed)
  if (!Number.isFinite(seed)) return 0
  return Math.trunc(seed) >>> 0
}

/** Mulberry32: compact, reproducible, and deliberately not cryptographic. */
export function createSeededRandom(seed: number | string): () => number {
  let state = normalizeSeed(seed)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** Creates packed xyz arrays with a uniform-volume spherical distribution. */
export function initializeParticleState(options: ParticleInitializationOptions): ParticleInitialState {
  const count = Math.max(0, Math.floor(options.count))
  const radius = Number.isFinite(options.radius) && (options.radius ?? 0) > 0 ? (options.radius ?? 1) : 1
  const center = options.center ?? { x: 0, y: 0, z: 0 }
  const speed = Number.isFinite(options.initialSpeed) ? Math.max(0, options.initialSpeed ?? 0) : 0
  const random = createSeededRandom(options.seed)
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  const memory = new Float32Array(count * 3)

  for (let particle = 0; particle < count; particle += 1) {
    const offset = particle * 3
    const azimuth = 2 * Math.PI * random()
    const cosine = 2 * random() - 1
    const sine = Math.sqrt(Math.max(0, 1 - cosine * cosine))
    const distance = radius * Math.cbrt(random())
    const directionX = sine * Math.cos(azimuth)
    const directionY = cosine
    const directionZ = sine * Math.sin(azimuth)
    positions[offset] = center.x + directionX * distance
    positions[offset + 1] = center.y + directionY * distance
    positions[offset + 2] = center.z + directionZ * distance

    if (speed > 0) {
      const velocityAzimuth = 2 * Math.PI * random()
      const velocityCosine = 2 * random() - 1
      const velocitySine = Math.sqrt(Math.max(0, 1 - velocityCosine * velocityCosine))
      velocities[offset] = speed * velocitySine * Math.cos(velocityAzimuth)
      velocities[offset + 1] = speed * velocityCosine
      velocities[offset + 2] = speed * velocitySine * Math.sin(velocityAzimuth)
    }
  }

  return { positions, velocities, memory }
}
