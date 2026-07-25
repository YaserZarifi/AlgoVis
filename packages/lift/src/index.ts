import type { JsonValue, Ops, Trace } from "@algovis/schema";

/**
 * Reconstructs the full state of every watched variable at step `t`, by taking the nearest
 * preceding keyframe and replaying writes forward (§5.3).
 *
 * Phase 1, and it lands before anything else: if reconstruction is wrong then everything
 * downstream is silently wrong, and nobody notices until the video looks weird in Phase 5.
 */
export function reconstruct(_trace: Trace, _t: number): Record<string, JsonValue> {
  throw new Error("not implemented: reconstruct (Phase 1)");
}

/**
 * Recognizes the moves an algorithm makes — swap, compare, shift, fill, visit, depth change,
 * phase — from the recorder's primitive facts (§6).
 *
 * Output is advisory. The renderer must degrade gracefully to plain writes when nothing is
 * recognized.
 */
export function lift(_trace: Trace): Ops {
  throw new Error("not implemented: lift (Phase 2)");
}
