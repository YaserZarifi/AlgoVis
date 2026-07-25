import { describe, expect, it } from "vitest";
import { frameSeed, mulberry32 } from "./rng.js";

describe("mulberry32", () => {
  it("produces the same sequence for the same seed", () => {
    const a = mulberry32(20260725);
    const b = mulberry32(20260725);
    const left = Array.from({ length: 32 }, () => a());
    const right = Array.from({ length: 32 }, () => b());
    expect(left).toEqual(right);
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("stays within [0, 1)", () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 1000; i += 1) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("frameSeed", () => {
  it("is a pure function of storyboard seed and frame", () => {
    expect(frameSeed(42, 1000)).toBe(frameSeed(42, 1000));
  });

  it("decorrelates adjacent frames, so grain does not crawl", () => {
    expect(frameSeed(42, 1000)).not.toBe(frameSeed(42, 1001));
  });

  it("is a 32-bit unsigned integer", () => {
    for (const frame of [0, 1, 839, 100000]) {
      const s = frameSeed(20260725, frame);
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(0xffffffff);
    }
  });
});
