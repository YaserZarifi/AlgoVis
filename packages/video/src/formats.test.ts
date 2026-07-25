import { FormatIdSchema } from "@tracecam/schema";
import { describe, expect, it } from "vitest";
import { CONFIG } from "./config.js";
import { FORMATS, PRESETS, formatById } from "./formats.js";

describe("formats", () => {
  it("defines all four output targets", () => {
    expect(Object.keys(FORMATS).sort()).toEqual([...FormatIdSchema.options].sort());
  });

  it("matches the §14 table", () => {
    expect(formatById("landscape")).toMatchObject({ width: 1920, height: 1080, durationSeconds: 22 });
    expect(formatById("vertical")).toMatchObject({ width: 1080, height: 1920, durationSeconds: 14 });
    expect(formatById("square")).toMatchObject({ width: 1080, height: 1080, durationSeconds: 16 });
    expect(formatById("portrait")).toMatchObject({ width: 1080, height: 1350, durationSeconds: 16 });
  });

  it("has the aspect ratio each format claims", () => {
    const ratio = (w: number, h: number): number => Number((w / h).toFixed(4));
    expect(ratio(1920, 1080)).toBe(ratio(16, 9));
    expect(ratio(1080, 1920)).toBe(ratio(9, 16));
    expect(ratio(1080, 1080)).toBe(ratio(1, 1));
    expect(ratio(1080, 1350)).toBe(ratio(4, 5));
  });

  it("leaves a usable region once safe areas are subtracted", () => {
    for (const format of Object.values(FORMATS)) {
      const usableWidth = format.width - format.safe.left - format.safe.right;
      const usableHeight = format.height - format.safe.top - format.safe.bottom;
      expect(usableWidth).toBeGreaterThan(0);
      expect(usableHeight).toBeGreaterThan(0);
    }
  });

  it("has a preset for every format", () => {
    expect(Object.keys(PRESETS).sort()).toEqual([...FormatIdSchema.options].sort());
  });
});

describe("config artifact", () => {
  it("assembles and validates against the schema", () => {
    expect(CONFIG.version).toBe(1);
    expect(CONFIG.themes).toHaveLength(3);
    expect(CONFIG.formats).toHaveLength(4);
  });

  it("survives parse -> serialize -> parse", () => {
    expect(JSON.parse(JSON.stringify(CONFIG))).toEqual(CONFIG);
  });
});
