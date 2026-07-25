import type { AttentionMask, LayoutMap, View } from "../view.js";

/** Bars for numeric data, cells for comparable-but-not-numeric (§11). */
export type ArrayState = readonly number[];

export const arrayView: View<ArrayState> = {
  id: "array",

  layout(_state, _box): LayoutMap {
    throw new Error("not implemented: arrayView.layout (Phase 2)");
  },

  draw(_gl, _state, _prev, _p, _layout, _theme): void {
    throw new Error("not implemented: arrayView.draw (Phase 2)");
  },

  attention(_state, _ops): AttentionMask {
    throw new Error("not implemented: arrayView.attention (Phase 4)");
  },
};
