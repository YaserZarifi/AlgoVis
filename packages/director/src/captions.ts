import type { Caption, Ops, WarpPoint } from "@tracecam/schema";

/**
 * Writes burned-in captions. Social video is watched muted by default and the platform's
 * auto-captions will not describe an animation (§14.2).
 *
 * Eight words maximum, one line, and never cross-faded — two captions hold a gap of at least
 * four frames.
 */
export function writeCaptions(_ops: Ops, _warp: readonly WarpPoint[]): Caption[] {
  throw new Error("not implemented: writeCaptions (Phase 6)");
}
