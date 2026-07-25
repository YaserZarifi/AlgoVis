/**
 * The named colours exactly as §13 specifies them. These are the source of truth; `themes.ts`
 * maps them onto the role-based palette that views actually consume, so no view ever branches
 * on which theme is active.
 *
 * Changing any hex here is a §21 decision, not an implementation detail.
 */

/** Lab instrument. Glow is diegetic — it is phosphor, not a filter (§13.1). */
export const OSCILLOSCOPE_INK = Object.freeze({
  bg: "#080D14",
  /** Barely-there graticule, 1px, 40px pitch. */
  grid: "#16232F",
  primary: "#4FE3C1",
  active: "#FFB24A",
  alert: "#FF5C6E",
  text: "#9FD4C9",
} as const);

/** Two-spot-colour print. Hard edges, no glow, misregistration as a feature (§13.2). */
export const RISOGRAPH_INK = Object.freeze({
  paper: "#EFE9DC",
  ink1: "#FF4A7D",
  ink2: "#1B4FD8",
  /**
   * §13.2 describes this as the multiply of the two inks, but an arithmetic multiply of ink1
   * and ink2 gives #1B176A, not the listed value. The listed value is authoritative — §21
   * forbids changing a specified palette hex — so it is stored, not computed.
   */
  overlap: "#4A1C6B",
  text: "#241F1C",
} as const);

/** Cyanotype drafting. Thin, consistent, technical (§13.3). */
export const BLUEPRINT_INK = Object.freeze({
  ground: "#0F3A5F",
  line: "#E8F1F7",
  /** Ochre, used once per frame at most. */
  accent: "#E0A244",
  dim: "#2A5A83",
  text: "#C5DCE9",
} as const);

/**
 * Palettes §13 explicitly forbids, because they are the current generative-design defaults and
 * read as machine-made. Asserted against in the theme tests.
 */
export const FORBIDDEN_HEXES = Object.freeze(["#F4F1EA", "#D97757"] as const);
