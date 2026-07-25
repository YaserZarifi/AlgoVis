import { spawnSync } from "node:child_process";

/**
 * Checks the prerequisites §3 requires, and fails with a clear message rather than a stack
 * trace. This is the only subcommand that does real work before Phase 1.
 */

export interface Prerequisite {
  name: string;
  minimum: string;
  /**
   * Full command lines, tried in order — Windows often has `py` but not `python` on PATH.
   *
   * These are compile-time constants and never interpolate user input, which is what makes
   * running them through a shell safe. A shell is unavoidable: corepack installs pnpm as a .cmd
   * shim, and Node refuses to spawn .cmd or .bat without one.
   */
  probes: readonly string[];
  remedy: string;
}

export const PREREQUISITES: readonly Prerequisite[] = [
  {
    name: "python",
    minimum: "3.12",
    probes: ["python --version", "py -3 --version", "python3 --version"],
    remedy: "install Python 3.12 or newer from https://python.org — sys.monitoring needs it",
  },
  {
    name: "node",
    minimum: "20",
    probes: ["node --version"],
    remedy: "install Node 20 or newer from https://nodejs.org",
  },
  {
    name: "pnpm",
    minimum: "9",
    probes: ["pnpm --version"],
    remedy: "run `corepack enable pnpm`, or install from https://pnpm.io",
  },
  {
    name: "ffmpeg",
    minimum: "6",
    probes: ["ffmpeg -version"],
    remedy: "install ffmpeg 6 or newer from https://ffmpeg.org and put it on PATH",
  },
];

/** Splits a dotted version into numeric parts, ignoring any suffix such as `-full_build`. */
export function versionParts(version: string): number[] {
  return version
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isNaN(part) ? 0 : part));
}

/** Negative when a < b, zero when equal, positive when a > b. */
export function compareVersions(a: string, b: string): number {
  const left = versionParts(a);
  const right = versionParts(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function meetsMinimum(found: string, minimum: string): boolean {
  return compareVersions(found, minimum) >= 0;
}

/**
 * Pulls the first version-like token out of a tool's banner. Deliberately reads only the first
 * line, because ffmpeg follows its version with a copyright range that would otherwise match.
 */
export function extractVersion(output: string): string | null {
  const firstLine = output.split(/\r?\n/, 1)[0] ?? "";
  const match = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(firstLine);
  if (match === null) return null;
  return match[3] === undefined ? `${match[1]}.${match[2]}` : `${match[1]}.${match[2]}.${match[3]}`;
}

export interface CheckResult {
  name: string;
  minimum: string;
  found: string | null;
  ok: boolean;
  remedy: string;
}

function probeVersion(prerequisite: Prerequisite): string | null {
  for (const probe of prerequisite.probes) {
    // The whole command goes in as one string with no separate args array: that is what keeps
    // Node's DEP0190 (unescaped argument concatenation under `shell: true`) inapplicable.
    const result = spawnSync(probe, {
      encoding: "utf8",
      shell: true,
      windowsHide: true,
    });
    if (result.error !== undefined) continue;
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    const version = extractVersion(output);
    if (version !== null) return version;
  }
  return null;
}

export function checkPrerequisites(
  prerequisites: readonly Prerequisite[] = PREREQUISITES,
): CheckResult[] {
  return prerequisites.map((prerequisite) => {
    const found = probeVersion(prerequisite);
    return {
      name: prerequisite.name,
      minimum: prerequisite.minimum,
      found,
      ok: found !== null && meetsMinimum(found, prerequisite.minimum),
      remedy: prerequisite.remedy,
    };
  });
}

/** Renders the results as an aligned table plus a remedy line per failure. */
export function formatReport(results: readonly CheckResult[]): string {
  const nameWidth = Math.max(4, ...results.map((r) => r.name.length));
  const foundWidth = Math.max(5, ...results.map((r) => (r.found ?? "missing").length));
  const needsWidth = Math.max(5, ...results.map((r) => r.minimum.length + 3));

  const lines = [
    `${"tool".padEnd(nameWidth)}  ${"found".padEnd(foundWidth)}  ${"needs".padEnd(needsWidth)}`,
    `${"-".repeat(nameWidth)}  ${"-".repeat(foundWidth)}  ${"-".repeat(needsWidth)}`,
  ];

  for (const result of results) {
    const found = result.found ?? "missing";
    const needs = `>= ${result.minimum}`;
    lines.push(
      `${result.name.padEnd(nameWidth)}  ${found.padEnd(foundWidth)}  ${needs.padEnd(needsWidth)}  ${result.ok ? "ok" : "FAIL"}`,
    );
  }

  const failures = results.filter((r) => !r.ok);
  if (failures.length === 0) {
    lines.push("", "all prerequisites satisfied.");
  } else {
    lines.push("", `${failures.length} prerequisite(s) not satisfied:`);
    for (const failure of failures) {
      const state = failure.found === null ? "not found" : `found ${failure.found}`;
      lines.push(`  ${failure.name}: ${state}, needs >= ${failure.minimum}`);
      lines.push(`    ${failure.remedy}`);
    }
  }

  return lines.join("\n");
}
