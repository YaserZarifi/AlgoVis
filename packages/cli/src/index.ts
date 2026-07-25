#!/usr/bin/env node
import { Builtins, Cli } from "clipanion";
import { COMMANDS } from "./commands.js";

const cli = new Cli({
  binaryLabel: "tracecam",
  binaryName: "tracecam",
  binaryVersion: "0.0.0",
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
for (const command of COMMANDS) {
  cli.register(command);
}

await cli.runExit(process.argv.slice(2));
