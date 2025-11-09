import seedrandom from "seedrandom";

export type RNG = seedrandom.PRNG;

export function createRng(seed: string | number): RNG {
  return seedrandom(String(seed));
}

export function randInt(rng: RNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickOne<T>(rng: RNG, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function pickMany<T>(rng: RNG, items: T[], count: number): T[] {
  const copy = [...items];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length; i += 1) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function chance(rng: RNG, probability: number): boolean {
  return rng() < probability;
}
