# AlgoVis

Turns real program execution into cinematic animation, rendered deterministically to video files
at multiple aspect ratios for social media.

You run `algovis run sort.py`. You get four MP4s — 16:9, 9:16, 1:1, 4:5 — showing your actual
algorithm executing, with camera moves, easing, glow, procedural audio, and burned-in captions.

This is not a debugger and not an interactive visualizer. It is a render farm for one machine
whose input is an execution trace and whose output is finished video.

## Status

**Phase 0 — scaffold.** Schemas, determinism lint rule, and CLI skeleton are in place. The
pipeline itself is not implemented yet; every subcommand except `doctor` exits 1 with
`not implemented`.

Section references in the source (§2.1, §14, and so on) point at the build spec, which is kept
locally and is not published here.

## How it works

One-way data flow. Each arrow is a separate process with a schema-validated boundary, and every
intermediate artifact is a file you can open, read, and hand-edit:

```
source code → trace.json → ops.json → storyboard.json → frames → video
```

- **record** — a Python recorder built on `sys.monitoring` (PEP 669) emits primitive facts:
  lines, calls, returns, and reads/writes to watched containers. Snapshots use structural
  sharing, not deep copies.
- **lift** — recognizes the semantic moves an algorithm makes (swap, compare, shift, fill,
  visit, recursion depth changes) from those primitives.
- **direct** — scores every step for interest, warps program time into video time non-linearly,
  and produces camera keyframes, beats, and captions. This stage is the edit.
- **render** — a dumb function of the storyboard. WebGL2 views plus a custom post-processing
  chain, emitted frame by frame through Remotion.

### The storyboard is the edit

All pacing, framing, and timing decisions live in `storyboard.json` and nowhere else. The
renderer holds zero opinions about *when* things happen — only about *how they look*. Open the
storyboard, change `camera[7].zoom` from `2.4` to `3.1`, re-render, and you get exactly that
change.

### Determinism

Every pixel of frame *N* is a pure function of `(storyboard, frameNumber, width, height)`. No
clocks, no unseeded randomness, no timers, no reading a previous frame's mutable state. Frames
are rendered on demand and out of order — `algovis render --frames 840-900` produces exactly
the same pixels those frames have in a full render. Nothing is ever screen-captured.

This is enforced mechanically: an ESLint rule bans `Date.now`, `performance.now`, `Math.random`,
`new Date()`, `requestAnimationFrame`, `setTimeout`, and `setInterval` under `packages/video`
and `packages/views`.

## Requirements

| Tool | Minimum |
|---|---|
| Python | 3.12 |
| Node | 20 |
| pnpm | 9 |
| ffmpeg | 6 |

Run `algovis doctor` to check all four.

## Getting started

```bash
pnpm install
pnpm build && pnpm test && pnpm lint
pnpm exec algovis doctor
```

On Windows PowerShell there is no `&&` — chain with `;` instead.

### Running the CLI

`pnpm install` creates a bin shim, so after building the CLI runs with no further setup:

```bash
pnpm exec algovis --help
pnpm exec algovis doctor
```

`./node_modules/.bin/algovis` works too, from the repo root.

A bare `algovis` on your PATH needs pnpm's global bin directory to be on PATH first, which is a
one-time setup plus a shell restart:

```bash
pnpm setup                          # sets PNPM_HOME and puts the global bin dir on PATH
# open a new terminal, then:
pnpm -C packages/cli link --global
```

`link` takes `-C <dir>`; it rejects `--filter`, which implies `--recursive`.

Every subcommand except `doctor` currently exits 1 with `not implemented` — the pipeline lands
in later phases.

## Verifying

```powershell
powershell -File scripts\verify.ps1
```

Runs every acceptance check and exits non-zero if any fails, so it works as a pre-push gate.
It covers prerequisites, the build/test/lint triple, CLI argument validation, the correctness of
the example programs, and repository hygiene.

It also proves the determinism rule is live rather than merely configured: it plants a
`Date.now()` in `packages/views`, asserts lint rejects it, removes it, and asserts lint is clean
again. Pass `-Fast` to skip install and build when you have already built.

## Commands

```
algovis run <file.py> [--entry EXPR]    record, lift, direct, and render — the whole pipeline
algovis record <file.py> -o trace.json  stage 1: execute and record
algovis lift trace.json -o ops.json     stage 2: primitives to semantic ops
algovis direct ops.json -o sb.json      stage 3: the edit — warp, camera, beats, captions
algovis render sb.json -o out/          stage 4: frames to video
algovis studio sb.json                  Remotion Studio preview (development only)
algovis diff a.json b.json -o sb.json   two traces, synchronized, side by side
algovis doctor                          check prerequisites
```

## Repo layout

```
packages/
  recorder/   Python. sys.monitoring hooks, chunked snapshots, streaming writer.
  schema/     Zod schemas. The source of truth for every artifact. Imports nothing.
  lift/       raw events → semantic ops
  director/   ops → storyboard (interest scoring, time warp, camera, captions)
  views/      WebGL2 view implementations and the post-processing chain
  theme/      palettes, type scale, timing constants — every tunable number lives here
  audio/      offline Tone.js render → WAV
  video/      Remotion compositions and layout presets
  cli/        the algovis binary
```

`packages/schema` must not import from any other package. Everything else may import it.

## Themes

Three, each with its own palette, type pairing, and post-chain configuration: **Oscilloscope**
(lab instrument, phosphor glow), **Risograph** (two-spot-colour print, halftone, no glow), and
**Blueprint** (cyanotype drafting, thin line work).

## License

Not yet determined.
