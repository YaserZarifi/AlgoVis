import { z } from "zod";
import { JsonValueSchema, PathSchema, StepSchema } from "./common.js";

const LineSchema = z.number().int().nonnegative();

/**
 * The recorder is dumb: it emits primitive facts and nothing else. Recognizing a swap is
 * packages/lift's job (§5.2, §6).
 */
export const TraceEventSchema = z.discriminatedUnion("k", [
  /** Execution reached a line. */
  z.object({ k: z.literal("line"), t: StepSchema, l: LineSchema }),

  /** A function was entered. `args` is keyed by parameter name so the director can build a
   *  signature for the title card (§8.2). */
  z.object({
    k: z.literal("call"),
    t: StepSchema,
    fn: z.string(),
    l: LineSchema,
    args: z.record(JsonValueSchema),
  }),

  /** A function returned. */
  z.object({ k: z.literal("ret"), t: StepSchema, fn: z.string(), v: JsonValueSchema }),

  /** A watched location was written. */
  z.object({
    k: z.literal("w"),
    t: StepSchema,
    p: PathSchema,
    v: JsonValueSchema,
    l: LineSchema,
  }),

  /** A watched location was read. */
  z.object({ k: z.literal("r"), t: StepSchema, p: PathSchema, l: LineSchema }),

  /** A full snapshot of every watched variable. Any step's state is reconstructable from the
   *  nearest preceding keyframe by replaying writes forward (§5.3). */
  z.object({ k: z.literal("kf"), t: StepSchema, vars: z.record(JsonValueSchema) }),
]);
export type TraceEvent = z.infer<typeof TraceEventSchema>;

/**
 * A stretch the recorder sampled rather than recorded in full, because the same (line, depth)
 * pair repeated with no writes to watched variables (§5.4).
 */
export const CollapsedRangeSchema = z.object({
  from: StepSchema,
  to: StepSchema,
  line: LineSchema,
  depth: z.number().int().nonnegative(),
  /** 1-in-N sampling rate applied across the range. */
  keepOneIn: z.number().int().positive(),
});
export type CollapsedRange = z.infer<typeof CollapsedRangeSchema>;

export const TraceMetaSchema = z.object({
  source: z.string(),
  entry: z.string(),
  watched: z.array(z.string()),
  stepCount: z.number().int().nonnegative(),
  /** True when the 10,000,000-event hard cap stopped recording early (§5.4). */
  truncated: z.boolean(),
  collapsed: z.array(CollapsedRangeSchema),
  pythonVersion: z.string(),
  recorderVersion: z.string(),
});
export type TraceMeta = z.infer<typeof TraceMetaSchema>;

export const TraceSchema = z.object({
  version: z.literal(1),
  meta: TraceMetaSchema,
  events: z.array(TraceEventSchema),
});
export type Trace = z.infer<typeof TraceSchema>;
