import { z } from "zod";
import { RectSchema } from "./common.js";

/**
 * Timing constants, in milliseconds except where noted (§7). Values live in packages/theme;
 * this is only their shape.
 */
export const TimingSchema = z.object({
  compare: z.number().positive(),
  swap: z.number().positive(),
  shift: z.number().positive(),
  fill: z.number().positive(),
  visitPulse: z.number().positive(),
  phaseWipe: z.number().positive(),
  revealHold: z.number().positive(),
  titleCard: z.number().positive(),
  /** Per-element offset in a group animation. */
  stagger: z.number().nonnegative(),
  /** Clamp on total stagger, so large groups do not crawl. */
  staggerMax: z.number().nonnegative(),
  /** Multiplier applied inside a slow-mo beat. Unitless. */
  slowMoFactor: z.number().positive(),
});
export type Timing = z.infer<typeof TimingSchema>;

/**
 * Linear is absent deliberately — §7 forbids it everywhere except camera dolly during a
 * sustained scan and the grain overlay, both of which are internal to their stage.
 */
export const EasingNameSchema = z.enum([
  "easeOutQuint",
  "easeInOutCubic",
  "easeOutBack",
  "easeInQuad",
  "spring",
]);
export type EasingName = z.infer<typeof EasingNameSchema>;

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/, "expected an uppercase #RRGGBB hex colour");

/**
 * Role-based rather than named per theme, so a view never branches on which theme is active.
 * Each theme maps its own vocabulary (phosphor/ink/cyanotype) onto these roles.
 */
export const PaletteSchema = z.object({
  bg: HexColorSchema,
  fg: HexColorSchema,
  /** Appears on at most 8% of pixels in any frame — scarcity is what makes it read (§13.4). */
  accent: HexColorSchema,
  muted: HexColorSchema,
  text: HexColorSchema,
  alert: HexColorSchema,
});
export type Palette = z.infer<typeof PaletteSchema>;

/** Two font weights maximum per theme (§13.4). */
export const TypographySchema = z.object({
  display: z.string(),
  mono: z.string(),
  weights: z.tuple([z.number().int(), z.number().int()]),
});

/** Each post stage is individually toggleable per theme (§10). */
export const PostChainSchema = z.object({
  bloom: z.object({
    enabled: z.boolean(),
    intensity: z.number().nonnegative(),
    threshold: z.number().min(0).max(1),
    knee: z.number().min(0).max(1),
  }),
  dof: z.object({
    enabled: z.boolean(),
    /** Pixels at 1080p; scaled with resolution. */
    maxRadius: z.number().nonnegative(),
  }),
  chromatic: z.object({
    enabled: z.boolean(),
    /** UV units, multiplied by distanceFromCentre squared. */
    magnitude: z.number().nonnegative(),
  }),
  trails: z.object({
    enabled: z.boolean(),
    decay: z.number().min(0).max(1),
  }),
  grain: z.object({
    enabled: z.boolean(),
    opacity: z.number().min(0).max(1),
    coarse: z.boolean(),
  }),
  vignette: z.object({
    enabled: z.boolean(),
    strength: z.number().min(0).max(1),
    falloff: z.number().positive(),
  }),
});
export type PostChain = z.infer<typeof PostChainSchema>;

export const ThemeIdSchema = z.enum(["oscilloscope", "risograph", "blueprint"]);
export type ThemeId = z.infer<typeof ThemeIdSchema>;

export const ThemeSchema = z.object({
  id: ThemeIdSchema,
  palette: PaletteSchema,
  type: TypographySchema,
  post: PostChainSchema,
});
export type Theme = z.infer<typeof ThemeSchema>;

export const FormatIdSchema = z.enum(["landscape", "vertical", "square", "portrait"]);
export type FormatId = z.infer<typeof FormatIdSchema>;

/**
 * Regions covered by platform UI chrome — captions, action rails, profile bars. Not padding.
 * No text, caption, or focal element may enter one (§14).
 */
export const SafeAreaSchema = z.object({
  top: z.number().int().nonnegative(),
  right: z.number().int().nonnegative(),
  bottom: z.number().int().nonnegative(),
  left: z.number().int().nonnegative(),
});
export type SafeArea = z.infer<typeof SafeAreaSchema>;

export const FormatSchema = z.object({
  id: FormatIdSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  durationSeconds: z.number().positive(),
  safe: SafeAreaSchema,
});
export type Format = z.infer<typeof FormatSchema>;

export const SlotSchema = z.enum(["viz", "code", "caption", "counter", "title"]);
export type Slot = z.infer<typeof SlotSchema>;

/** null means the slot is omitted in this format — a first-class decision, not a failure (§14.1). */
export const PresetSchema = z.object({
  viz: RectSchema.nullable(),
  code: RectSchema.nullable(),
  caption: RectSchema.nullable(),
  counter: RectSchema.nullable(),
  title: RectSchema.nullable(),
});
export type Preset = z.infer<typeof PresetSchema>;

/**
 * The fourth artifact: every tunable the render path reads that is not the storyboard.
 */
export const ConfigSchema = z.object({
  version: z.literal(1),
  timing: TimingSchema,
  themes: z.array(ThemeSchema).min(1),
  formats: z.array(FormatSchema).min(1),
  presets: z.object({
    landscape: PresetSchema,
    vertical: PresetSchema,
    square: PresetSchema,
    portrait: PresetSchema,
  }),
});
export type Config = z.infer<typeof ConfigSchema>;
