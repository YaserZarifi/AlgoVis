import type { Beat, Ops, WarpPoint } from "@tracecam/schema";

/**
 * Maps trace steps to video frames non-linearly. This is the edit, and it is what turns a
 * 40,000-step execution into a 14-second clip (§8).
 *
 * The rate curve is low-passed as well as the scores: sudden speed changes read as dropped
 * frames, whereas ramps read as cinematography.
 */
export function buildWarp(
  _scores: Float64Array,
  _targetDurationFrames: number,
  _beats: readonly Beat[],
): WarpPoint[] {
  throw new Error("not implemented: buildWarp (Phase 5)");
}

/**
 * Beats the director inserts before a human edits them: a hold at the final step, a slowmo
 * around any invariant break, a title at frame 0, and a hold at each phase (§8.2).
 */
export function autoBeats(_ops: Ops): Beat[] {
  throw new Error("not implemented: autoBeats (Phase 5)");
}
