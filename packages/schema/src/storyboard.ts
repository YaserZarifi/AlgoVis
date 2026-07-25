import { z } from "zod";
import { FrameIndexSchema, FrameSchema, StepSchema, ViewIdSchema } from "./common.js";
import { FormatIdSchema, ThemeIdSchema } from "./config.js";

/**
 * A manual timing override on top of the warp. The director inserts them; a human edits them
 * (§8.2).
 */
export const BeatSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("slowmo"),
    from: StepSchema,
    to: StepSchema,
    factor: z.number().positive(),
  }),
  z.object({ kind: z.literal("hold"), at: StepSchema, frames: z.number().int().positive() }),
  z.object({
    kind: z.literal("title"),
    at: StepSchema,
    frames: z.number().int().positive(),
    text: z.string(),
  }),
  z.object({
    kind: z.literal("freeze"),
    at: StepSchema,
    frames: z.number().int().positive(),
    label: z.string().optional(),
  }),
]);
export type Beat = z.infer<typeof BeatSchema>;

/** One control point of the piecewise-linear step to frame mapping (§8.1). */
export const WarpPointSchema = z.object({
  step: StepSchema,
  frame: FrameSchema,
});
export type WarpPoint = z.infer<typeof WarpPointSchema>;

/**
 * Zoom is bounded by §9's clamp. A storyboard asking for 6x is not a render the camera director
 * could have produced, so it fails at the boundary rather than silently.
 */
export const CameraKeySchema = z.object({
  frame: FrameIndexSchema,
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(1).max(4),
});
export type CameraKey = z.infer<typeof CameraKeySchema>;

/** Burned in, so the 8-word ceiling from §14.2 is a hard boundary condition, not a style note. */
export const CaptionSchema = z
  .object({
    from: FrameIndexSchema,
    to: FrameIndexSchema,
    text: z.string().min(1),
  })
  .refine((c) => c.to > c.from, { message: "caption must end after it starts" })
  .refine((c) => c.text.trim().split(/\s+/).length <= 8, {
    message: "captions are 8 words maximum (§14.2)",
  });
export type Caption = z.infer<typeof CaptionSchema>;

export const AudioEventSchema = z.object({
  frame: FrameIndexSchema,
  kind: z.enum(["compare", "swap", "write", "phase", "invariantBreak", "hold"]),
  /** Null for unpitched events such as the compare click. C3..C5 otherwise (§15). */
  midi: z.number().int().min(0).max(127).nullable(),
  gainDb: z.number(),
});
export type AudioEvent = z.infer<typeof AudioEventSchema>;

/**
 * The edit. All pacing, framing, and timing decisions live here and nowhere else — the renderer
 * has opinions about how things look, never about when they happen (§2.4).
 */
export const StoryboardSchema = z.object({
  version: z.literal(1),
  /** Seeds every PRNG in the render path. Determinism depends on it (§2.1). */
  seed: z.number().int().nonnegative(),
  format: FormatIdSchema,
  theme: ThemeIdSchema,
  fps: z.number().int().positive(),
  durationFrames: z.number().int().positive(),
  loop: z.boolean(),
  /** Downsampled to at most 400 control points by Douglas-Peucker (§8.1). */
  warp: z.array(WarpPointSchema).min(2).max(400),
  beats: z.array(BeatSchema),
  camera: z.array(CameraKeySchema),
  captions: z.array(CaptionSchema),
  audio: z.array(AudioEventSchema),
  views: z.array(z.object({ variable: z.string(), view: ViewIdSchema })),
});
export type Storyboard = z.infer<typeof StoryboardSchema>;
