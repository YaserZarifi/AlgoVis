import { describe, expect, it } from "vitest";
import {
  ConfigSchema,
  OpsSchema,
  StoryboardSchema,
  TraceSchema,
  parseConfig,
  parseOps,
  parseStoryboard,
  parseTrace,
  type Config,
  type Ops,
  type Storyboard,
  type Trace,
} from "./index.js";

const trace: Trace = {
  version: 1,
  meta: {
    source: "examples/quicksort.py",
    entry: "quicksort(data)",
    watched: ["arr"],
    stepCount: 6,
    truncated: false,
    collapsed: [{ from: 100, to: 900, line: 12, depth: 2, keepOneIn: 100 }],
    pythonVersion: "3.13.14",
    recorderVersion: "0.0.0",
  },
  events: [
    { k: "kf", t: 0, vars: { arr: [3, 1, 2] } },
    { k: "call", t: 1, fn: "quicksort", l: 3, args: { arr: [3, 1, 2], lo: 0, hi: 2 } },
    { k: "r", t: 2, p: ["arr", 0], l: 5 },
    { k: "w", t: 3, p: ["arr", 0], v: 1, l: 6 },
    { k: "line", t: 4, l: 7 },
    { k: "ret", t: 5, fn: "quicksort", v: null },
  ],
};

const ops: Ops = {
  version: 1,
  meta: {
    source: "examples/quicksort.py",
    stepCount: 6,
    views: [{ variable: "arr", view: "array", reason: "flat list of int" }],
  },
  ops: [
    { kind: "compare", t0: 2, t1: 2, paths: [["arr", 0], ["arr", 1]], weight: 1.2 },
    { kind: "swap", t0: 3, t1: 4, paths: [["arr", 0], ["arr", 1]], weight: 5 },
    { kind: "shift", t0: 4, t1: 4, paths: [["arr", 2]], weight: 2 },
    { kind: "fill", t0: 4, t1: 4, paths: [["dp", 1, 1]], weight: 3 },
    { kind: "visit", t0: 2, t1: 2, paths: [["arr", 0]], weight: 0.15 },
    { kind: "depthChange", t0: 1, t1: 1, paths: [], weight: 6, depth: 1, direction: "in" },
    { kind: "phase", t0: 5, t1: 5, paths: [], weight: 5, index: 0, label: "partition" },
  ],
  provenance: [{ t: 3, target: ["arr", 0], sources: [["arr", 1]] }],
  complexity: {
    samples: [
      { n: 10, ops: 34 },
      { n: 100, ops: 664 },
    ],
    fits: [
      { model: "n log n", r2: 0.998, coefficient: 1.02 },
      { model: "n^2", r2: 0.81, coefficient: 0.07 },
    ],
    best: "n log n",
  },
  invariantBreak: { t: 412, expr: "all(a[i] <= a[i+1] for i in range(lo, hi))" },
};

const storyboard: Storyboard = {
  version: 1,
  seed: 20260725,
  format: "vertical",
  theme: "oscilloscope",
  fps: 60,
  durationFrames: 840,
  loop: true,
  warp: [
    { step: 0, frame: 0 },
    { step: 3, frame: 412.5 },
    { step: 5, frame: 840 },
  ],
  beats: [
    { kind: "title", at: 0, frames: 72, text: "quicksort(arr, lo, hi)" },
    { kind: "slowmo", from: 2, to: 4, factor: 6 },
    { kind: "freeze", at: 4, frames: 12, label: "pivot settles" },
    { kind: "hold", at: 5, frames: 54 },
  ],
  camera: [
    { frame: 0, x: 0, y: 0, zoom: 1 },
    { frame: 400, x: 120, y: -40, zoom: 2.4 },
  ],
  captions: [{ from: 12, to: 60, text: "pivot lands in place" }],
  audio: [
    { frame: 0, kind: "compare", midi: null, gainDb: -26 },
    { frame: 30, kind: "swap", midi: 60, gainDb: -14 },
  ],
  views: [{ variable: "arr", view: "array" }],
};

const emptyPreset = { viz: null, code: null, caption: null, counter: null, title: null };

const config: Config = {
  version: 1,
  timing: {
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
  },
  themes: [
    {
      id: "oscilloscope",
      palette: {
        bg: "#080D14",
        fg: "#4FE3C1",
        accent: "#FFB24A",
        muted: "#16232F",
        text: "#9FD4C9",
        alert: "#FF5C6E",
      },
      type: { display: "JetBrains Mono", mono: "JetBrains Mono", weights: [400, 700] },
      post: {
        bloom: { enabled: true, intensity: 0.75, threshold: 0.72, knee: 0.15 },
        dof: { enabled: true, maxRadius: 7 },
        chromatic: { enabled: true, magnitude: 0.0007 },
        trails: { enabled: true, decay: 0.93 },
        grain: { enabled: true, opacity: 0.035, coarse: false },
        vignette: { enabled: true, strength: 0.22, falloff: 2.2 },
      },
    },
  ],
  formats: [
    {
      id: "landscape",
      width: 1920,
      height: 1080,
      durationSeconds: 22,
      safe: { top: 48, right: 48, bottom: 48, left: 48 },
    },
  ],
  presets: {
    landscape: {
      viz: { x: 576, y: 48, w: 1296, h: 840 },
      code: { x: 48, y: 48, w: 480, h: 984 },
      caption: { x: 576, y: 912, w: 1296, h: 120 },
      counter: { x: 1680, y: 48, w: 192, h: 48 },
      title: null,
    },
    vertical: emptyPreset,
    square: emptyPreset,
    portrait: emptyPreset,
  },
};

/** §18: every artifact parses, serializes, and re-parses to a deep-equal value. */
describe("schema round-trip", () => {
  const cases = [
    ["trace", trace, parseTrace],
    ["ops", ops, parseOps],
    ["storyboard", storyboard, parseStoryboard],
    ["config", config, parseConfig],
  ] as const;

  for (const [name, fixture, parse] of cases) {
    it(`${name} survives parse -> serialize -> parse`, () => {
      const once = parse(fixture);
      const twice = parse(JSON.parse(JSON.stringify(once)));
      expect(twice).toEqual(once);
      expect(twice).toEqual(fixture);
    });
  }
});

describe("boundary rejection", () => {
  it("rejects a negative step counter", () => {
    const bad = { ...trace, events: [{ k: "line", t: -1, l: 3 }] };
    expect(TraceSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown event kind", () => {
    const bad = { ...trace, events: [{ k: "jump", t: 0, l: 3 }] };
    expect(TraceSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a dotted-string path where an access chain is required", () => {
    const bad = { ...trace, events: [{ k: "r", t: 0, p: "arr.3", l: 5 }] };
    expect(TraceSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an artifact from a future schema version", () => {
    expect(TraceSchema.safeParse({ ...trace, version: 2 }).success).toBe(false);
    expect(OpsSchema.safeParse({ ...ops, version: 2 }).success).toBe(false);
  });

  it("rejects camera zoom outside the §9 clamp", () => {
    const bad = { ...storyboard, camera: [{ frame: 0, x: 0, y: 0, zoom: 6 }] };
    expect(StoryboardSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a caption longer than eight words", () => {
    const bad = {
      ...storyboard,
      captions: [{ from: 0, to: 10, text: "one two three four five six seven eight nine" }],
    };
    expect(StoryboardSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a warp exceeding the 400 control-point budget", () => {
    const bad = {
      ...storyboard,
      warp: Array.from({ length: 401 }, (_, i) => ({ step: i, frame: i })),
    };
    expect(StoryboardSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a malformed hex colour", () => {
    const theme = config.themes[0];
    if (theme === undefined) throw new Error("fixture must have a theme");
    const bad = {
      ...config,
      themes: [{ ...theme, palette: { ...theme.palette, bg: "#080d14" } }],
    };
    expect(ConfigSchema.safeParse(bad).success).toBe(false);
  });
});
