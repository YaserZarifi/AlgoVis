import { Command, Option, UsageError } from "clipanion";
import {
  ArgError,
  parseAudioMode,
  parseComplexity,
  parseFormatSelection,
  parseFrameRange,
  parseList,
  parseNonNegativeInt,
  parsePositiveNumber,
  parseTheme,
} from "./args.js";
import { checkPrerequisites, formatReport } from "./doctor.js";

/**
 * Every subcommand parses and validates its own arguments before failing, so that a stage
 * landing in a later phase inherits a working command line rather than inventing one.
 */
abstract class StageCommand extends Command {
  /** The subcommand name, as it appears in the not-implemented message. */
  protected abstract readonly stage: string;

  /** Validates options beyond what the framework can express. Overridden where there is any. */
  protected validate(): void {}

  async execute(): Promise<number> {
    try {
      this.validate();
    } catch (error) {
      // Parsing is framework-agnostic, so its errors are translated here rather than thrown as
      // something clipanion would render as a stack trace.
      if (error instanceof ArgError) throw new UsageError(error.message);
      throw error;
    }
    this.context.stderr.write(`not implemented: ${this.stage}\n`);
    return 1;
  }
}

export class RunCommand extends StageCommand {
  static override paths = [["run"]];
  static override usage = Command.Usage({
    description: "Record, lift, direct, and render — the whole pipeline.",
    examples: [["Render every format from one file", "tracecam run examples/quicksort.py"]],
  });

  file = Option.String();
  entry = Option.String("--entry", { description: "Entry expression, e.g. \"quicksort(data)\"" });
  output = Option.String("-o,--out", "out", { description: "Output directory" });
  format = Option.String("--format", "all", { description: "all, or one format id" });
  theme = Option.String("--theme", "oscilloscope");
  audio = Option.String("--audio", "events", { description: "none, events, or music" });
  loop = Option.Boolean("--loop", false);

  protected override readonly stage = "run";

  protected override validate(): void {
    parseFormatSelection(this.format);
    parseTheme(this.theme);
    parseAudioMode(this.audio);
  }
}

export class RecordCommand extends StageCommand {
  static override paths = [["record"]];
  static override usage = Command.Usage({
    description: "Stage 1. Execute the file and record a trace.",
  });

  file = Option.String();
  entry = Option.String("--entry", { description: "Entry expression to execute" });
  output = Option.String("-o,--output", "trace.json");
  watch = Option.String("--watch", { description: "Comma-separated variables to watch" });
  unwatch = Option.String("--unwatch", { description: "Comma-separated variables to ignore" });
  maxEvents = Option.String("--max-events", { description: "Hard event cap" });

  protected override readonly stage = "record";

  protected override validate(): void {
    if (this.watch !== undefined) parseList(this.watch);
    if (this.unwatch !== undefined) parseList(this.unwatch);
    if (this.maxEvents !== undefined) parseNonNegativeInt("--max-events", this.maxEvents);
  }
}

export class LiftCommand extends StageCommand {
  static override paths = [["lift"]];
  static override usage = Command.Usage({
    description: "Stage 2. Primitive trace events to semantic ops.",
  });

  trace = Option.String();
  output = Option.String("-o,--output", "ops.json");
  complexity = Option.String("--complexity", {
    description: "Input sizes to fit an empirical complexity curve, e.g. 10,100,1000",
  });

  protected override readonly stage = "lift";

  protected override validate(): void {
    if (this.complexity !== undefined) parseComplexity(this.complexity);
  }
}

export class DirectCommand extends StageCommand {
  static override paths = [["direct"]];
  static override usage = Command.Usage({
    description: "Stage 3. The edit — time warp, camera, beats, and captions.",
  });

  ops = Option.String();
  output = Option.String("-o,--output", "storyboard.json");
  format = Option.String("--format", "landscape");
  duration = Option.String("--duration", { description: "Target duration in seconds" });
  theme = Option.String("--theme", "oscilloscope");
  loop = Option.Boolean("--loop", false);

  protected override readonly stage = "direct";

  protected override validate(): void {
    parseFormatSelection(this.format);
    parseTheme(this.theme);
    if (this.duration !== undefined) parsePositiveNumber("--duration", this.duration);
  }
}

export class RenderCommand extends StageCommand {
  static override paths = [["render"]];
  static override usage = Command.Usage({
    description: "Stage 4. Storyboard to frames to video.",
    details:
      "A frame range must be pixel-identical to those frames of a full render, so ranges are " +
      "rendered on demand rather than captured.",
  });

  storyboard = Option.String();
  output = Option.String("-o,--out", "out");
  format = Option.String("--format", "all");
  frames = Option.String("--frames", { description: "Inclusive frame range, e.g. 840-900" });
  still = Option.String("--still", { description: "Render a single frame as a PNG" });
  guides = Option.Boolean("--guides", false, { description: "Draw safe-area overlays" });

  protected override readonly stage = "render";

  protected override validate(): void {
    parseFormatSelection(this.format);
    if (this.frames !== undefined) parseFrameRange(this.frames);
    if (this.still !== undefined) parseNonNegativeInt("--still", this.still);
  }
}

export class StudioCommand extends StageCommand {
  static override paths = [["studio"]];
  static override usage = Command.Usage({
    description: "Remotion Studio preview. Development only; not a product surface.",
  });

  storyboard = Option.String();

  protected override readonly stage = "studio";
}

export class DiffCommand extends StageCommand {
  static override paths = [["diff"]];
  static override usage = Command.Usage({
    description: "Two traces, synchronized, side by side.",
  });

  a = Option.String();
  b = Option.String();
  output = Option.String("-o,--output", "storyboard.json");

  protected override readonly stage = "diff";
}

export class DoctorCommand extends Command {
  static override paths = [["doctor"]];
  static override usage = Command.Usage({
    description: "Check that the prerequisites in §3 are installed and new enough.",
  });

  async execute(): Promise<number> {
    const results = checkPrerequisites();
    this.context.stdout.write(`${formatReport(results)}\n`);
    return results.every((r) => r.ok) ? 0 : 1;
  }
}

export const COMMANDS = [
  RunCommand,
  RecordCommand,
  LiftCommand,
  DirectCommand,
  RenderCommand,
  StudioCommand,
  DiffCommand,
  DoctorCommand,
];
