import type { AttentionMask, LayoutMap, View } from "../view.js";

/**
 * A 2D DP table. Heatmap fill, plus provenance arrows from the active cell to its dependencies,
 * drawn as thin curved paths (§11).
 */
export type GridState = readonly (readonly number[])[];

export const gridView: View<GridState> = {
  id: "grid",

  layout(_state, _box): LayoutMap {
    throw new Error("not implemented: gridView.layout (Phase 8)");
  },

  draw(_gl, _state, _prev, _p, _layout, _theme): void {
    throw new Error("not implemented: gridView.draw (Phase 8)");
  },

  attention(_state, _ops): AttentionMask {
    throw new Error("not implemented: gridView.attention (Phase 8)");
  },
};
