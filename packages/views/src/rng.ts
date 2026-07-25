/**
 * The sanctioned replacement for `Math.random`, which §2.1 bans outright in the render path.
 *
 * mulberry32: a 32-bit state PRNG with a period of 2^32, chosen because it is trivially
 * reproducible across machines — the whole point. Every consumer seeds from the storyboard, so
 * frame N's noise is a pure function of the storyboard and the frame number.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derives a per-frame seed from the storyboard seed, so grain animates without any stage having
 * to carry state between frames (§10.5).
 */
export function frameSeed(storyboardSeed: number, frame: number): number {
  // Knuth multiplicative hash on the mixed pair; the constant is 2654435761 (Knuth's 32-bit
  // golden-ratio prime).
  const mixed = (storyboardSeed ^ Math.imul(frame + 1, 0x9e3779b1)) >>> 0;
  return Math.imul(mixed, 2654435761) >>> 0;
}
