import * as fs from "fs";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { normalizeConfig, formatNormalizeResult, NormalizerOptions } from "../config/normalizer";
import { exportConfig } from "../config/exporter";

export type NormalizeCmdArgs = {
  input: string;
  output?: string;
  format: "env" | "json" | "yaml";
  trimWhitespace: boolean;
  lowercaseKeys: boolean;
  uppercaseValues: boolean;
  collapseWhitespace: boolean;
  dryRun: boolean;
};

export function parseNormalizeArgs(argv: string[]): NormalizeCmdArgs {
  const args: NormalizeCmdArgs = {
    input: "",
    format: "env",
    trimWhitespace: false,
    lowercaseKeys: false,
    uppercaseValues: false,
    collapseWhitespace: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") args.input = argv[++i];
    else if (arg === "--output" || arg === "-o") args.output = argv[++i];
    else if (arg === "--format" || arg === "-f") args.format = argv[++i] as NormalizeCmdArgs["format"];
    else if (arg === "--trim") args.trimWhitespace = true;
    else if (arg === "--lowercase-keys") args.lowercaseKeys = true;
    else if (arg === "--uppercase-values") args.uppercaseValues = true;
    else if (arg === "--collapse-whitespace") args.collapseWhitespace = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (!args.input) args.input = arg;
  }

  if (!args.input) throw new Error("normalize-cmd: --input is required");
  return args;
}

export async function runNormalizeCmd(argv: string[]): Promise<void> {
  const args = parseNormalizeArgs(argv);
  const config = await loadConfig(args.input);

  const opts: NormalizerOptions = {
    trimWhitespace: args.trimWhitespace,
    lowercaseKeys: args.lowercaseKeys,
    uppercaseValues: args.uppercaseValues,
    collapseWhitespace: args.collapseWhitespace,
  };

  const result = normalizeConfig(config, opts);
  console.log(formatNormalizeResult(result));

  if (!args.dryRun) {
    const outPath = args.output ?? args.input;
    const content = exportConfig(result.normalized, args.format);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, content, "utf8");
    console.log(`Written to ${outPath}`);
  }
}
