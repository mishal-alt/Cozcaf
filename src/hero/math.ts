export const TAU = Math.PI * 2;
export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
export const prog = (t: number, a: number, b: number): number => clamp((t - a) / (b - a));
export const smooth = (p: number): number => p * p * (3 - 2 * p);
export const easeInOut = (p: number): number => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOutCubic = (p: number): number => 1 - Math.pow(1 - p, 3);
export const easeOutExpo = (p: number): number => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
export const easeOutBack = (p: number, c = 1.2): number => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);

/** small seeded random generator (mulberry32): the same seed always gives the same scatter */
export function rng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
