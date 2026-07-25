import { describe, expect, it } from "vitest";
import {
  PREREQUISITES,
  compareVersions,
  extractVersion,
  formatReport,
  meetsMinimum,
  versionParts,
} from "./doctor.js";

describe("version comparison", () => {
  it("splits versions into numeric parts and ignores build suffixes", () => {
    expect(versionParts("8.1.2")).toEqual([8, 1, 2]);
    expect(versionParts("3.13.14")).toEqual([3, 13, 14]);
  });

  it("orders versions numerically, not lexically", () => {
    expect(compareVersions("3.9", "3.12")).toBeLessThan(0);
    expect(compareVersions("11.17.0", "9")).toBeGreaterThan(0);
    expect(compareVersions("20.0.0", "20")).toBe(0);
  });

  it("treats a missing component as zero", () => {
    expect(compareVersions("6", "6.0.0")).toBe(0);
    expect(compareVersions("6.0.1", "6")).toBeGreaterThan(0);
  });

  it("accepts versions at or above the minimum", () => {
    expect(meetsMinimum("3.13.14", "3.12")).toBe(true);
    expect(meetsMinimum("3.12.0", "3.12")).toBe(true);
    expect(meetsMinimum("3.11.9", "3.12")).toBe(false);
    expect(meetsMinimum("24.18.0", "20")).toBe(true);
    expect(meetsMinimum("8.1.2", "6")).toBe(true);
  });
});

describe("version extraction", () => {
  it("reads the banner each tool actually prints", () => {
    expect(extractVersion("Python 3.13.14")).toBe("3.13.14");
    expect(extractVersion("v24.18.0")).toBe("24.18.0");
    expect(extractVersion("11.17.0")).toBe("11.17.0");
  });

  it("does not mistake ffmpeg's copyright range for its version", () => {
    const banner =
      "ffmpeg version 8.1.2-full_build-www.gyan.dev Copyright (c) 2000-2026 the FFmpeg developers";
    expect(extractVersion(banner)).toBe("8.1.2");
  });

  it("reads only the first line", () => {
    expect(extractVersion("pnpm 9.1.0\nsomething 42.99.99")).toBe("9.1.0");
  });

  it("returns null when a tool is absent and the shell says so", () => {
    expect(extractVersion("'ffmpeg' is not recognized as an internal or external command")).toBe(
      null,
    );
    expect(extractVersion("")).toBe(null);
  });
});

describe("prerequisites", () => {
  it("covers exactly the four tools §3 requires", () => {
    expect(PREREQUISITES.map((p) => p.name)).toEqual(["python", "node", "pnpm", "ffmpeg"]);
    expect(PREREQUISITES.map((p) => p.minimum)).toEqual(["3.12", "20", "9", "6"]);
  });

  it("offers a remedy for each, so a failure is actionable", () => {
    for (const prerequisite of PREREQUISITES) {
      expect(prerequisite.remedy.length).toBeGreaterThan(0);
    }
  });
});

describe("report", () => {
  it("names the missing tool and its remedy rather than throwing", () => {
    const report = formatReport([
      { name: "ffmpeg", minimum: "6", found: null, ok: false, remedy: "install ffmpeg" },
      { name: "node", minimum: "20", found: "24.18.0", ok: true, remedy: "install node" },
    ]);
    expect(report).toContain("ffmpeg");
    expect(report).toContain("missing");
    expect(report).toContain("install ffmpeg");
    expect(report).toContain("1 prerequisite(s) not satisfied");
  });

  it("says so plainly when everything passes", () => {
    const report = formatReport([
      { name: "node", minimum: "20", found: "24.18.0", ok: true, remedy: "install node" },
    ]);
    expect(report).toContain("all prerequisites satisfied");
  });
});
