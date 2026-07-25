import { parseConfig, type Config } from "@tracecam/schema";
import { THEMES, TIMING } from "@tracecam/theme";
import { FORMATS, PRESETS } from "./formats.js";

/**
 * The assembled theme/timing artifact, validated at the boundary like every other artifact
 * (§2.3). Nothing in the render path reads a tunable from anywhere else.
 */
export const CONFIG: Config = parseConfig({
  version: 1,
  timing: TIMING,
  themes: Object.values(THEMES),
  formats: Object.values(FORMATS),
  presets: PRESETS,
});
