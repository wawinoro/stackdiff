import * as fs from "fs";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { flattenConfig, unflattenConfig } from "../config/flattener";
import { exportConfig } from "../config/exporter";

export interface FlattenArgs {
  input: string;
  output?: string;
  separator: string;
  reverse: boolean;
  format: "env" | "json" | "yaml";
}

export function parseFlattenArgs(argv: string[]): FlattenArgs {
  const args: FlattenArgs = {
    input: "",
    separator: ".",
    reverse: false,
    format: "env",
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--input":
      case "-i":
        args.input = argv[++i];
        break;
      case "--output":
      case "-o":
        args.output = argv[++i];
        break;
      case "--separator":
      case "-s":
        args.separator = argv[++i];
        break;
      case "--reverse":
      case "-r":
        args.reverse = true;
        break;
      case "--format":
      case "-f":
        args.format = argv[++i] as FlattenArgs["format"];
        break;
    }
  }

  if (!args.input) throw new Error("--input is required");
  return args;
}

export async function runFlattenCmd(args: FlattenArgs): Promise<void> {
  const config = loadConfig(args.input);

  const result = args.reverse
    ? unflattenConfig(config as Record<string, string>, args.separator)
    : flattenConfig(config as Record<string, unknown>, "", args.separator);

  const output = exportConfig(result as Record<string, string>, args.format);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, output, "utf-8");
    console.log(`Written to ${args.output}`);
  } else {
    process.stdout.write(output);
  }
}
