import type { AudioEvent, Ops, WarpPoint } from "@tracecam/schema";

/**
 * Places sound events on the timeline, quantized to a 1/64-note grid at 120 BPM. Un-quantized
 * event audio sounds like a mistake; quantized event audio sounds composed (§15).
 */
export function mapAudioEvents(_ops: Ops, _warp: readonly WarpPoint[]): AudioEvent[] {
  throw new Error("not implemented: mapAudioEvents (Phase 7)");
}
