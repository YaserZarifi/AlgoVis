import { describe, expect, it } from "vitest";
import {
  parseAudioMode,
  parseComplexity,
  parseFormatSelection,
  parseFrameRange,
  parseList,
  parseNonNegativeInt,
  parsePositiveNumber,
  parseTheme,
} from "./args.js";

describe("--frames", () => {
  it("parses an inclusive range", () => {
    expect(parseFrameRange("840-900")).toEqual({ from: 840, to: 900 });
    expect(parseFrameRange(" 0-0 ")).toEqual({ from: 0, to: 0 });
  });

  it("rejects a malformed or backwards range", () => {
    expect(() => parseFrameRange("840")).toThrow();
    expect(() => parseFrameRange("840-")).toThrow();
    expect(() => parseFrameRange("900-840")).toThrow();
    expect(() => parseFrameRange("a-b")).toThrow();
  });
});

describe("--watch", () => {
  it("splits and trims a comma-separated list", () => {
    expect(parseList("dp, parent ,scratch")).toEqual(["dp", "parent", "scratch"]);
  });

  it("drops empty entries rather than producing a blank variable name", () => {
    expect(parseList("dp,,")).toEqual(["dp"]);
    expect(parseList("")).toEqual([]);
  });
});

describe("numeric options", () => {
  it("accepts non-negative integers", () => {
    expect(parseNonNegativeInt("--still", "1200")).toBe(1200);
    expect(parseNonNegativeInt("--still", "0")).toBe(0);
  });

  it("rejects negatives, decimals, and junk", () => {
    expect(() => parseNonNegativeInt("--still", "-1")).toThrow();
    expect(() => parseNonNegativeInt("--still", "1.5")).toThrow();
    expect(() => parseNonNegativeInt("--still", "many")).toThrow();
  });

  it("requires a positive duration", () => {
    expect(parsePositiveNumber("--duration", "14")).toBe(14);
    expect(parsePositiveNumber("--duration", "13.5")).toBe(13.5);
    expect(() => parsePositiveNumber("--duration", "0")).toThrow();
    expect(() => parsePositiveNumber("--duration", "-3")).toThrow();
  });
});

describe("--complexity", () => {
  it("parses the input sizes to fit against", () => {
    expect(parseComplexity("10,100,1000,10000")).toEqual([10, 100, 1000, 10000]);
  });

  it("needs at least two points to fit a curve", () => {
    expect(() => parseComplexity("100")).toThrow();
  });

  it("rejects zero and non-integers", () => {
    expect(() => parseComplexity("0,100")).toThrow();
    expect(() => parseComplexity("10,ten")).toThrow();
  });
});

describe("enumerated options", () => {
  it("accepts the three themes and nothing else", () => {
    expect(parseTheme("oscilloscope")).toBe("oscilloscope");
    expect(parseTheme("risograph")).toBe("risograph");
    expect(parseTheme("blueprint")).toBe("blueprint");
    expect(() => parseTheme("neon")).toThrow();
  });

  it("accepts all four formats plus all", () => {
    expect(parseFormatSelection("all")).toBe("all");
    expect(parseFormatSelection("vertical")).toBe("vertical");
    expect(() => parseFormatSelection("widescreen")).toThrow();
  });

  it("accepts the three audio modes", () => {
    expect(parseAudioMode("events")).toBe("events");
    expect(parseAudioMode("none")).toBe("none");
    expect(parseAudioMode("music")).toBe("music");
    expect(() => parseAudioMode("loud")).toThrow();
  });
});
