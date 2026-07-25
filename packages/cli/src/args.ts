import { FormatIdSchema, ThemeIdSchema, type FormatId, type ThemeId } from "@tracecam/schema";

/**
 * Option parsing lives here, pure and separately testable, because a stage that misreads its
 * own arguments produces a plausible-looking wrong artifact rather than an error.
 *
 * Nothing here imports the CLI framework. `commands.ts` translates an ArgError into whatever
 * the framework wants to print, which keeps this module testable without booting a CLI.
 */
export class ArgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArgError";
  }
}

export interface FrameRange {
  from: number;
  to: number;
}

/** `--frames 840-900`. Inclusive on both ends. */
export function parseFrameRange(spec: string): FrameRange {
  const match = /^(\d+)-(\d+)$/.exec(spec.trim());
  if (match === null) {
    throw new ArgError(`--frames expects "from-to", for example 840-900; got "${spec}"`);
  }
  const from = Number(match[1]);
  const to = Number(match[2]);
  if (to < from) {
    throw new ArgError(`--frames range ends before it starts: "${spec}"`);
  }
  return { from, to };
}

/** `--watch dp,parent` */
export function parseList(spec: string): string[] {
  return spec
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function parseNonNegativeInt(option: string, spec: string): number {
  if (!/^\d+$/.test(spec.trim())) {
    throw new ArgError(`${option} expects a non-negative integer; got "${spec}"`);
  }
  return Number(spec.trim());
}

export function parsePositiveNumber(option: string, spec: string): number {
  const value = Number(spec.trim());
  if (!Number.isFinite(value) || value <= 0) {
    throw new ArgError(`${option} expects a positive number; got "${spec}"`);
  }
  return value;
}

/** `--complexity 10,100,1000,10000` */
export function parseComplexity(spec: string): number[] {
  const sizes = parseList(spec).map((part) => {
    if (!/^\d+$/.test(part) || Number(part) === 0) {
      throw new ArgError(`--complexity expects positive integers; got "${part}"`);
    }
    return Number(part);
  });
  if (sizes.length < 2) {
    throw new ArgError("--complexity needs at least two input sizes to fit a curve");
  }
  return sizes;
}

export function parseTheme(spec: string): ThemeId {
  const result = ThemeIdSchema.safeParse(spec.trim());
  if (!result.success) {
    throw new ArgError(`--theme expects one of ${ThemeIdSchema.options.join(", ")}; got "${spec}"`);
  }
  return result.data;
}

export type FormatSelection = FormatId | "all";

export function parseFormatSelection(spec: string): FormatSelection {
  const value = spec.trim();
  if (value === "all") return "all";
  const result = FormatIdSchema.safeParse(value);
  if (!result.success) {
    throw new ArgError(
      `--format expects all or one of ${FormatIdSchema.options.join(", ")}; got "${spec}"`,
    );
  }
  return result.data;
}

export function parseAudioMode(spec: string): "none" | "events" | "music" {
  const value = spec.trim();
  if (value !== "none" && value !== "events" && value !== "music") {
    throw new ArgError(`--audio expects none, events, or music; got "${spec}"`);
  }
  return value;
}
