import * as fs from "fs";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { groupConfig, GroupOptions, GroupedConfig } from "../config/grouper";

export interface GroupArgs {
  input: string;
  strategy: "prefix" | "custom";
  delimiter: string;
  customGroups: Record<string, string[]>;
  output?: string;
  json: boolean;
}

export function parseGroupArgs(argv: string[]): GroupArgs {
  const args: GroupArgs = {
    input: "",
    strategy: "prefix",
    delimiter: "_",
    customGroups: {},
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") args.input = argv[++i];
    else if (arg === "--output" || arg === "-o") args.output = argv[++i];
    else if (arg === "--strategy" || arg === "-s")
      args.strategy = argv[++i] as "prefix" | "custom";
    else if (arg === "--delimiter" || arg === "-d") args.delimiter = argv[++i];
    else if (arg === "--json") args.json = true;
    else if (arg === "--group") {
      // --group name=KEY1,KEY2
      const raw = argv[++i];
      const eq = raw.indexOf("=");
      if (eq > 0) {
        const name = raw.slice(0, eq);
        const keys = raw.slice(eq + 1).split(",");
        args.customGroups[name] = keys;
      }
    }
  }

  return args;
}

function renderGrouped(grouped: GroupedConfig, json: boolean): string {
  if (json) return JSON.stringify(grouped, null, 2);

  const lines: string[] = [];
  for (const [group, entries] of Object.entries(grouped)) {
    lines.push(`[${group}]`);
    for (const [key, value] of Object.entries(entries)) {
      lines.push(`  ${key}=${value}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

export async function runGroupCmd(argv: string[]): Promise<void> {
  const args = parseGroupArgs(argv);

  if (!args.input) {
    console.error("Error: --input is required");
    process.exit(1);
  }

  const config = await loadConfig(args.input);

  const options: GroupOptions = {
    strategy: args.strategy,
    delimiter: args.delimiter,
    customGroups: args.customGroups,
  };

  const grouped = groupConfig(config, options);
  const output = renderGrouped(grouped, args.json);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, output, "utf-8");
    console.log(`Grouped config written to ${args.output}`);
  } else {
    console.log(output);
  }
}
