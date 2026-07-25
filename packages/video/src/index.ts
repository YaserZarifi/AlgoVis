import type { Storyboard } from "@algovis/schema";

export * from "./config.js";
export * from "./formats.js";

/**
 * Renders frames to disk. Frames are produced on demand and may be produced out of order — a
 * range render must be pixel-identical to those frames of a full render (§2.2). Nothing is ever
 * screen-captured.
 */
export interface RenderRequest {
  storyboard: Storyboard;
  outDir: string;
  /** Inclusive frame range. Omitted means the whole composition. */
  frames?: { from: number; to: number };
  guides: boolean;
}

export function render(_request: RenderRequest): Promise<void> {
  throw new Error("not implemented: render (Phase 2)");
}
