import type { PostChain } from "@tracecam/schema";
import type { AttentionMask } from "../view.js";
import type { Framebuffer } from "../gl/index.js";

/**
 * The post-processing chain, executed in exactly this order over ping-pong FBOs (§10):
 *
 *   1. bright pass + bloom      threshold 0.72, soft knee 0.15, 3 mip levels
 *   2. attention depth of field radius = maxRadius * (1 - mask)^2, mask feathered at sigma 6
 *   3. chromatic aberration     radial, 0.0007 * distanceFromCentre^2 in UV units
 *   4. motion trails            trail = max(decay * trail_prev, current)
 *   5. grain                    blue noise, seeded per frame from the storyboard PRNG
 *   6. vignette, then linear to sRGB
 *
 * The whole chain runs in linear space and converts once, at the end. Getting that wrong makes
 * bloom look grey and muddy and is §20's number one cause of output that looks cheap for no
 * obvious reason.
 */
export interface PostInput {
  scene: Framebuffer;
  attention: AttentionMask;
  /** Video time. Every stage derives what it needs from this — never from a clock (§2.1). */
  frame: number;
  /** Seeds the grain PRNG. Comes from the storyboard so the noise is reproducible. */
  seed: number;
  config: PostChain;
}

export function runPostChain(_gl: WebGL2RenderingContext, _input: PostInput): Framebuffer {
  throw new Error("not implemented: runPostChain (Phase 4)");
}
