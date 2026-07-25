import type { AttentionMask, LayoutMap, View } from "../view.js";

export interface TreeNode {
  id: string;
  label: string;
  children: readonly TreeNode[];
  /** Memo hits render in the theme's accent colour (§11). */
  memoHit: boolean;
}

/**
 * The recursion call tree, growing downward. Reingold-Tilford layout is run over the *whole*
 * final tree up front, so nodes do not jump sideways as siblings appear (§11).
 */
export type TreeState = TreeNode;

export const treeView: View<TreeState> = {
  id: "tree",

  layout(_state, _box): LayoutMap {
    throw new Error("not implemented: treeView.layout (Phase 8)");
  },

  draw(_gl, _state, _prev, _p, _layout, _theme): void {
    throw new Error("not implemented: treeView.draw (Phase 8)");
  },

  attention(_state, _ops): AttentionMask {
    throw new Error("not implemented: treeView.attention (Phase 8)");
  },
};
