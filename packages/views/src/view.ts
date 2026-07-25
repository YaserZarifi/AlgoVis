import type { Op, Path, Rect, Theme, ViewId } from "@algovis/schema";

/**
 * A path serialized for use as a Map key. Paths are arrays, so they cannot key a Map by
 * identity; this is the canonical encoding and the only one any view may use.
 */
export type PathKey = string;

export const pathKey = (path: Path): PathKey => JSON.stringify(path);

/** Where every path sits on screen. The camera director consumes this (§9). */
export type LayoutMap = ReadonlyMap<PathKey, Rect>;

/**
 * An R8 coverage texture: 1.0 is fully in focus, 0.0 is fully defocused. Depth of field here is
 * attention, not geometry — there is no depth in this scene (§10.2).
 */
export interface AttentionMask {
  width: number;
  height: number;
  data: Uint8Array;
}

/**
 * A visualization strategy for one watched variable (§11).
 *
 * `layout` must be pure, cheap, and allocation-free: the camera director calls it thousands of
 * times, and §20 ranks a slow layout function as a top-ten time sink.
 */
export interface View<TState> {
  id: ViewId;
  layout(state: TState, box: Rect): LayoutMap;
  draw(
    gl: WebGL2RenderingContext,
    state: TState,
    prev: TState,
    p: number,
    layout: LayoutMap,
    theme: Theme,
  ): void;
  attention(state: TState, ops: readonly Op[]): AttentionMask;
}
