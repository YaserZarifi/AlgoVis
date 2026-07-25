import { FormatSchema, PresetSchema, type Format, type FormatId, type Preset } from "@tracecam/schema";

/**
 * One command produces all four (§14).
 *
 * Safe areas are not padding — they are the regions platform UI chrome sits over: captions,
 * action rails, profile bars. No text, caption, or focal element may enter one. §20 ranks text
 * inside a safe area as a defect you only discover once someone actually posts the video.
 */
export const FORMATS: Readonly<Record<FormatId, Format>> = Object.freeze({
  landscape: FormatSchema.parse({
    id: "landscape",
    width: 1920,
    height: 1080,
    durationSeconds: 22,
    safe: { top: 48, right: 48, bottom: 48, left: 48 },
  }),
  vertical: FormatSchema.parse({
    id: "vertical",
    width: 1080,
    height: 1920,
    durationSeconds: 14,
    safe: { top: 220, right: 130, bottom: 340, left: 48 },
  }),
  square: FormatSchema.parse({
    id: "square",
    width: 1080,
    height: 1080,
    durationSeconds: 16,
    safe: { top: 64, right: 64, bottom: 64, left: 64 },
  }),
  portrait: FormatSchema.parse({
    id: "portrait",
    width: 1080,
    height: 1350,
    durationSeconds: 16,
    safe: { top: 72, right: 56, bottom: 200, left: 56 },
  }),
});

const NO_SLOTS: Preset = PresetSchema.parse({
  viz: null,
  code: null,
  caption: null,
  counter: null,
  title: null,
});

/**
 * Never scale one composition to another ratio. Each format gets its own arrangement of
 * semantic slots, and omitting a slot is a first-class decision — better to drop the code pane
 * than to render it illegibly (§14.1).
 *
 * Phase 6 fills these in. Until then every slot is omitted, which is a legitimate value rather
 * than a placeholder.
 */
export const PRESETS: Readonly<Record<FormatId, Preset>> = Object.freeze({
  landscape: NO_SLOTS,
  vertical: NO_SLOTS,
  square: NO_SLOTS,
  portrait: NO_SLOTS,
});

export function formatById(id: FormatId): Format {
  return FORMATS[id];
}
