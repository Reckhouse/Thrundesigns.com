/**
 * Deterministic mulberry32 PRNG from a string seed.
 * Server-safe — no DOM / Three.js.
 */

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type SeededRandom = {
  seed: string;
  next: () => number;
  nextRange: (min: number, max: number) => number;
  nextInt: (min: number, maxExclusive: number) => number;
  pick: <T>(items: readonly T[]) => T;
  bool: (probability?: number) => boolean;
};

export function createSeededRandom(seed: string): SeededRandom {
  let state = hashSeed(seed || "controlled-chaos");

  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    seed,
    next,
    nextRange(min, max) {
      return min + (max - min) * next();
    },
    nextInt(min, maxExclusive) {
      if (maxExclusive <= min) return min;
      return min + Math.floor(next() * (maxExclusive - min));
    },
    pick<T>(items: readonly T[]) {
      if (items.length === 0) {
        throw new Error("Cannot pick from an empty list");
      }
      return items[Math.floor(next() * items.length)]!;
    },
    bool(probability = 0.5) {
      return next() < probability;
    },
  };
}

export function createRandomSeed(source = createSeededRandom(String(Date.now()))): string {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[source.nextInt(0, alphabet.length)];
  }
  return out;
}
