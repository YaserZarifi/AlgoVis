import type { FormatId, Ops, Storyboard, ThemeId } from "@tracecam/schema";

export * from "./audio-events.js";
export * from "./camera.js";
export * from "./captions.js";
export * from "./interest.js";
export * from "./timewarp.js";

export interface DirectOptions {
  format: FormatId;
  theme: ThemeId;
  durationSeconds: number;
  fps: number;
  seed: number;
  loop: boolean;
}

/**
 * Turns ops into the storyboard — the single place where every pacing, framing, and timing
 * decision lives (§2.4).
 *
 * Nothing downstream may reach back into this stage. The renderer is a dumb function of what
 * comes out of here.
 */
export function direct(_ops: Ops, _options: DirectOptions): Storyboard {
  throw new Error("not implemented: direct (Phase 5)");
}
