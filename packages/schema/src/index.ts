import type { z } from "zod";
import { ConfigSchema, type Config } from "./config.js";
import { OpsSchema, type Ops } from "./ops.js";
import { StoryboardSchema, type Storyboard } from "./storyboard.js";
import { TraceSchema, type Trace } from "./trace.js";

export * from "./common.js";
export * from "./config.js";
export * from "./ops.js";
export * from "./storyboard.js";
export * from "./trace.js";

/**
 * One-way data flow means every arrow between stages is a validated boundary (§2.3). These are
 * the four functions that enforce it. No stage may consume an artifact it did not parse.
 */
export const parseTrace = (input: unknown): Trace => TraceSchema.parse(input);
export const parseOps = (input: unknown): Ops => OpsSchema.parse(input);
export const parseStoryboard = (input: unknown): Storyboard => StoryboardSchema.parse(input);
export const parseConfig = (input: unknown): Config => ConfigSchema.parse(input);

/**
 * Renders a validation failure as something a user can act on. Artifacts are hand-editable by
 * design, so a bad boundary is an ordinary editing mistake and deserves better than a stack
 * trace.
 */
export function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const at = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  ${at}: ${issue.message}`;
    })
    .join("\n");
}
