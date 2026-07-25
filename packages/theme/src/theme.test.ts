import { ThemeIdSchema, ThemeSchema } from "@algovis/schema";
import { describe, expect, it } from "vitest";
import { BLUEPRINT_INK, FORBIDDEN_HEXES, OSCILLOSCOPE_INK, RISOGRAPH_INK } from "./palettes.js";
import { THEMES, themeById } from "./themes.js";
import { TIMING } from "./timing.js";

describe("timing constants", () => {
  it("matches the §7 table exactly", () => {
    expect(TIMING).toEqual({
      compare: 180,
      swap: 420,
      shift: 260,
      fill: 200,
      visitPulse: 140,
      phaseWipe: 650,
      revealHold: 900,
      titleCard: 1200,
      stagger: 28,
      staggerMax: 260,
      slowMoFactor: 6,
    });
  });

  it("is frozen, so no stage can retune timing at runtime", () => {
    expect(Object.isFrozen(TIMING)).toBe(true);
  });
});

describe("themes", () => {
  it("implements all three ids", () => {
    expect(Object.keys(THEMES).sort()).toEqual([...ThemeIdSchema.options].sort());
  });

  it("every theme is schema-valid", () => {
    for (const theme of Object.values(THEMES)) {
      expect(ThemeSchema.safeParse(theme).success).toBe(true);
    }
  });

  it("resolves a theme by id", () => {
    expect(themeById("blueprint").palette.bg).toBe(BLUEPRINT_INK.ground);
    expect(themeById("oscilloscope").palette.fg).toBe(OSCILLOSCOPE_INK.primary);
    expect(themeById("risograph").palette.bg).toBe(RISOGRAPH_INK.paper);
  });

  it("uses at most two font weights per theme (§13.4)", () => {
    for (const theme of Object.values(THEMES)) {
      expect(new Set(theme.type.weights).size).toBeLessThanOrEqual(2);
    }
  });

  it("avoids the palettes §13 forbids as machine-made defaults", () => {
    const used = Object.values(THEMES).flatMap((t) => Object.values(t.palette));
    for (const banned of FORBIDDEN_HEXES) {
      expect(used).not.toContain(banned);
    }
  });

  it("turns bloom and chromatic aberration off for risograph — print has no lens (§13.2)", () => {
    const riso = themeById("risograph").post;
    expect(riso.bloom.enabled).toBe(false);
    expect(riso.chromatic.enabled).toBe(false);
    expect(riso.grain.coarse).toBe(true);
  });

  it("gives oscilloscope the long phosphor trails that are its signature (§13.1)", () => {
    const scope = themeById("oscilloscope").post;
    expect(scope.trails.decay).toBe(0.93);
    expect(scope.bloom.intensity).toBe(0.75);
  });
});
