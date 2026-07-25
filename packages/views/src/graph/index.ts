import type { AttentionMask, LayoutMap, View } from "../view.js";

export interface GraphState {
  nodes: readonly string[];
  edges: readonly { from: string; to: string; weight: number }[];
  visited: readonly string[];
  frontier: readonly string[];
  distances: Readonly<Record<string, number>>;
}

/**
 * Force-directed layout is run to convergence once, in the director, so it is deterministic and
 * stable. This view animates only the frontier, the visited set, and the distance labels — the
 * node positions never move (§11).
 */
export const graphView: View<GraphState> = {
  id: "graph",

  layout(_state, _box): LayoutMap {
    throw new Error("not implemented: graphView.layout (Phase 8)");
  },

  draw(_gl, _state, _prev, _p, _layout, _theme): void {
    throw new Error("not implemented: graphView.draw (Phase 8)");
  },

  attention(_state, _ops): AttentionMask {
    throw new Error("not implemented: graphView.attention (Phase 8)");
  },
};
