import { z } from "zod";

/**
 * An access chain into a watched container: ["arr", 3], ["dp", 4, 7], ["g", "adj", "B"].
 *
 * Always an array, never a dotted string — a dotted string becomes ambiguous the moment a dict
 * key contains a period (CLAUDE.md §5.2).
 */
export const PathSchema = z.array(z.union([z.string(), z.number().int()]));
export type Path = z.infer<typeof PathSchema>;

/**
 * A recorded trace event index. The project's fundamental time unit — program time, not video
 * time. Frames are derived from steps via the time warp, never the reverse (§2.6).
 */
export const StepSchema = z.number().int().nonnegative();

/** A rendered image index — video time (§2.6). Fractional where a warp control point lands
 *  between frames. */
export const FrameSchema = z.number().nonnegative();

/** A whole rendered image index, for artifacts that cannot sit between frames. */
export const FrameIndexSchema = z.number().int().nonnegative();

export const RectSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().nonnegative(),
  h: z.number().nonnegative(),
});
export type Rect = z.infer<typeof RectSchema>;

/** A visualization strategy for one watched variable (§11). */
export const ViewIdSchema = z.enum(["array", "grid", "tree", "graph"]);
export type ViewId = z.infer<typeof ViewIdSchema>;

/**
 * Any value the recorder can serialize out of a watched container.
 *
 * The interface is hand-written only because `z.lazy` cannot infer a recursive type — this is
 * the documented Zod pattern, not a violation of §19's "never hand-write a type that duplicates
 * a schema".
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
);
