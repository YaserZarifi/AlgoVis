import { z } from "zod";
import { PathSchema, StepSchema, ViewIdSchema } from "./common.js";

/**
 * Every op carries the step range it spans, the paths it touches, and a weight the interest
 * scorer consumes (§6, §8.1).
 */
const opBase = {
  t0: StepSchema,
  t1: StepSchema,
  paths: z.array(PathSchema),
  weight: z.number().nonnegative(),
};

/**
 * Ops are advisory. The renderer must degrade gracefully to plain writes when nothing is
 * recognized — never assume a swap was detected (§6).
 */
export const OpSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("compare"), ...opBase }),
  z.object({ kind: z.literal("swap"), ...opBase }),
  z.object({ kind: z.literal("shift"), ...opBase }),
  z.object({ kind: z.literal("fill"), ...opBase }),
  z.object({ kind: z.literal("visit"), ...opBase }),
  z.object({
    kind: z.literal("depthChange"),
    ...opBase,
    depth: z.number().int().nonnegative(),
    direction: z.enum(["in", "out"]),
  }),
  z.object({
    kind: z.literal("phase"),
    ...opBase,
    index: z.number().int().nonnegative(),
    label: z.string().optional(),
  }),
]);
export type Op = z.infer<typeof OpSchema>;
export type OpKind = Op["kind"];

/**
 * For each write, the set of paths read on the same line. This is what makes DP dependency
 * arrows possible (§6).
 */
export const ProvenanceEdgeSchema = z.object({
  t: StepSchema,
  target: PathSchema,
  sources: z.array(PathSchema),
});
export type ProvenanceEdge = z.infer<typeof ProvenanceEdgeSchema>;

export const ComplexityModelSchema = z.enum(["n", "n log n", "n^2", "2^n"]);
export type ComplexityModel = z.infer<typeof ComplexityModelSchema>;

/** Least-squares fit of op counts against input size on log-log axes (§6). */
export const ComplexitySchema = z.object({
  samples: z.array(
    z.object({
      n: z.number().int().positive(),
      ops: z.number().int().nonnegative(),
    }),
  ),
  fits: z.array(
    z.object({
      model: ComplexityModelSchema,
      r2: z.number(),
      coefficient: z.number(),
    }),
  ),
  best: ComplexityModelSchema,
});
export type Complexity = z.infer<typeof ComplexitySchema>;

/** The first step at which a `# @invariant` expression evaluated false (§6). */
export const InvariantBreakSchema = z.object({
  t: StepSchema,
  expr: z.string(),
});
export type InvariantBreak = z.infer<typeof InvariantBreakSchema>;

export const OpsMetaSchema = z.object({
  source: z.string(),
  stepCount: z.number().int().nonnegative(),
  /** Chosen view per watched variable, with the reason logged at lift time (§11.1). */
  views: z.array(
    z.object({
      variable: z.string(),
      view: ViewIdSchema,
      reason: z.string(),
    }),
  ),
});
export type OpsMeta = z.infer<typeof OpsMetaSchema>;

export const OpsSchema = z.object({
  version: z.literal(1),
  meta: OpsMetaSchema,
  ops: z.array(OpSchema),
  provenance: z.array(ProvenanceEdgeSchema),
  complexity: ComplexitySchema.nullable(),
  invariantBreak: InvariantBreakSchema.nullable(),
});
export type Ops = z.infer<typeof OpsSchema>;
