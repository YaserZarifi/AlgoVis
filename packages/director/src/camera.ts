import type { CameraKey, Ops, Rect } from "@tracecam/schema";

/**
 * Produces camera keyframes. Without this the output looks like a spreadsheet; with it, it
 * looks shot (§9).
 *
 * The region of interest is collected over [t-6, t+18] — asymmetric on purpose, because the
 * camera should arrive before the action, not chase it. Keyframes are emitted only past a
 * hysteresis threshold: continuous micro-movement is nauseating and compresses badly.
 */
export function directCamera(_ops: Ops, _frame: Rect): CameraKey[] {
  throw new Error("not implemented: directCamera (Phase 5)");
}
