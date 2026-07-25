import { ThemeSchema, type Theme, type ThemeId } from "@tracecam/schema";
import { BLUEPRINT_INK, OSCILLOSCOPE_INK, RISOGRAPH_INK } from "./palettes.js";

/** Global post-chain constants from §10, identical across themes; only intensity varies. */
const BLOOM_THRESHOLD = 0.72;
const BLOOM_KNEE = 0.15;
const DOF_MAX_RADIUS = 7;
const CHROMATIC_MAGNITUDE = 0.0007;
const GRAIN_OPACITY = 0.035;
const TRAIL_DECAY = 0.86;
const VIGNETTE_STRENGTH = 0.22;
const VIGNETTE_FALLOFF = 2.2;

const oscilloscope = ThemeSchema.parse({
  id: "oscilloscope",
  palette: {
    bg: OSCILLOSCOPE_INK.bg,
    fg: OSCILLOSCOPE_INK.primary,
    accent: OSCILLOSCOPE_INK.active,
    muted: OSCILLOSCOPE_INK.grid,
    text: OSCILLOSCOPE_INK.text,
    alert: OSCILLOSCOPE_INK.alert,
  },
  type: { display: "JetBrains Mono", mono: "JetBrains Mono", weights: [400, 700] },
  post: {
    bloom: { enabled: true, intensity: 0.75, threshold: BLOOM_THRESHOLD, knee: BLOOM_KNEE },
    dof: { enabled: true, maxRadius: DOF_MAX_RADIUS },
    chromatic: { enabled: true, magnitude: CHROMATIC_MAGNITUDE },
    // Long phosphor trails are this theme's signature (§13.1).
    trails: { enabled: true, decay: 0.93 },
    grain: { enabled: true, opacity: GRAIN_OPACITY, coarse: false },
    vignette: { enabled: true, strength: VIGNETTE_STRENGTH, falloff: VIGNETTE_FALLOFF },
  },
});

const risograph = ThemeSchema.parse({
  id: "risograph",
  palette: {
    bg: RISOGRAPH_INK.paper,
    fg: RISOGRAPH_INK.ink1,
    accent: RISOGRAPH_INK.ink2,
    muted: RISOGRAPH_INK.overlap,
    text: RISOGRAPH_INK.text,
    alert: RISOGRAPH_INK.ink1,
  },
  type: { display: "Archivo Condensed", mono: "IBM Plex Mono", weights: [400, 700] },
  post: {
    // Print has no lens and no glow (§13.2).
    bloom: { enabled: false, intensity: 0, threshold: BLOOM_THRESHOLD, knee: BLOOM_KNEE },
    dof: { enabled: true, maxRadius: DOF_MAX_RADIUS },
    chromatic: { enabled: false, magnitude: 0 },
    trails: { enabled: false, decay: TRAIL_DECAY },
    // Raised and coarsened: this is paper tooth, not sensor noise.
    grain: { enabled: true, opacity: 0.08, coarse: true },
    vignette: { enabled: true, strength: VIGNETTE_STRENGTH, falloff: VIGNETTE_FALLOFF },
  },
});

const blueprint = ThemeSchema.parse({
  id: "blueprint",
  palette: {
    bg: BLUEPRINT_INK.ground,
    fg: BLUEPRINT_INK.line,
    accent: BLUEPRINT_INK.accent,
    muted: BLUEPRINT_INK.dim,
    text: BLUEPRINT_INK.text,
    alert: BLUEPRINT_INK.accent,
  },
  // Berkeley Mono is commercial; IBM Plex Mono ships as the default and Berkeley is an opt-in
  // override the user supplies themselves (§3).
  type: { display: "IBM Plex Mono", mono: "IBM Plex Mono", weights: [400, 700] },
  post: {
    bloom: { enabled: true, intensity: 0.2, threshold: BLOOM_THRESHOLD, knee: BLOOM_KNEE },
    dof: { enabled: true, maxRadius: DOF_MAX_RADIUS },
    chromatic: { enabled: true, magnitude: CHROMATIC_MAGNITUDE },
    trails: { enabled: false, decay: TRAIL_DECAY },
    grain: { enabled: true, opacity: GRAIN_OPACITY, coarse: false },
    vignette: { enabled: true, strength: VIGNETTE_STRENGTH, falloff: VIGNETTE_FALLOFF },
  },
});

export const THEMES: Readonly<Record<ThemeId, Theme>> = Object.freeze({
  oscilloscope,
  risograph,
  blueprint,
});

export function themeById(id: ThemeId): Theme {
  return THEMES[id];
}
