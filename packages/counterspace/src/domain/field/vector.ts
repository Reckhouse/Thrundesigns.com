import type { Vec3, Vec3Like } from './types'

export const ZERO: Readonly<Vec3> = Object.freeze({ x: 0, y: 0, z: 0 })

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z }
}

export function add(a: Vec3Like, b: Vec3Like): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function subtract(a: Vec3Like, b: Vec3Like): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

export function scale(value: Vec3Like, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar }
}

export function dot(a: Vec3Like, b: Vec3Like): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function cross(a: Vec3Like, b: Vec3Like): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

export function magnitudeSquared(value: Vec3Like): number {
  return dot(value, value)
}

export function magnitude(value: Vec3Like): number {
  return Math.sqrt(magnitudeSquared(value))
}

export function normalize(value: Vec3Like, epsilon = 1e-12): Vec3 {
  const length = magnitude(value)
  if (!Number.isFinite(length) || length <= epsilon) return vec3()
  return scale(value, 1 / length)
}

export function clampMagnitude(value: Vec3Like, maximum: number): Vec3 {
  if (!Number.isFinite(maximum) || maximum <= 0) return vec3()
  const lengthSquared = magnitudeSquared(value)
  if (!Number.isFinite(lengthSquared)) return vec3()
  if (lengthSquared <= maximum * maximum) return vec3(value.x, value.y, value.z)
  return scale(value, maximum / Math.sqrt(lengthSquared))
}

export function isFiniteVec3(value: Vec3Like): boolean {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z)
}
