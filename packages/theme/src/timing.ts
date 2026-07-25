import { TimingSchema, type Timing } from "@algovis/schema";

/**
 * Milliseconds, except `stagger`/`staggerMax` (also ms, per element) and `slowMoFactor`
 * (unitless). Every number here is a starting value that must stay tunable from one place —
 * never inline a duration in a view (§7).
 */
export const TIMING: Readonly<Timing> = Object.freeze(
  TimingSchema.parse({
    compare: 180,
    swap: 420,
    shift: 260,
    fill: 200,
    visitPulse: 140,
    phaseWipe: 650,
    revealHold: 900,
    titleCard: 1200,
    stagger: 28,
    staggerMax: 260,
    slowMoFactor: 6,
  }),
);

/**
 * Weights the interest scorer assigns per op when allocating frames to steps (§8.1).
 */
export const INTEREST = Object.freeze({
  invariantBreak: 40,
  depthChange: 6,
  swap: 5,
  phase: 5,
  fill: 3,
  write: 2.5,
  shift: 2,
  compare: 1.2,
  firstLineVisit: 1.5,
  read: 0.15,
  idle: 0.05,
} as const);
