import type { Ops } from "@algovis/schema";

/**
 * Scores every step, so the time warp can allocate frames in proportion to how much is
 * happening (§8.1).
 *
 * Raw scores are convolved with a Gaussian (sigma = 8 steps) so neighbourhoods of interest rise
 * together — otherwise a lone dramatic swap becomes a single-frame stutter instead of a moment.
 */
export function scoreSteps(_ops: Ops, _stepCount: number): Float64Array {
  throw new Error("not implemented: scoreSteps (Phase 5)");
}
