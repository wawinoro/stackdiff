import * as fs from "fs";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { scopeConfig, unscopeConfig, listScopes } from "../config/scoper";

export interface ScopeArgs {
  input: string;
  scopes: string[];
  action: "scope" | "unscope" | "list";
  scopeMap?: string; // path to JSON scope map for unscope action
  output?: string;
}

export function parseScopeArgs(argv: string[]): ScopeArgs {
  const args: ScopeArgs = {
    input: "",
    scopes: [],
    action: "scope",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") args.input = argv[++i];
    else if (arg === "--scopes" || arg === "-s") args.scopes = argv[++i].split(",");
    else if (arg === "--action" || arg === "-a") args.action = argv[++i] as ScopeArgs["action"];
    else if (arg === "--scope-map") args.scopeMap = argv[++i];
    else if (arg === "--output" || arg === "-o") args.output = argv[++i];
  }

  if (!args.input) throw new Error("--input is required");
  if (args.scopes.length === 0 && args.action !== "unscope")
    throw new Error("--scopes is required (comma-separated)");

  return args;
}

export async function runScopeCmd(args: ScopeArgs): Promise<void> {
  if (args.action === "unscope") {
    if (!args.scopeMap) throw new Error("--scope-map is required for unscope action");
    const raw = fs.readFileSync(path.resolve(args.scopeMap), "utf8");
    const scopeMap = JSON.parse(raw);
    const flat = unscopeConfig(scopeMap);
    const out = JSON.stringify(flat, null, 2);
    args.output ? fs.writeFileSync(args.output, out) : process.stdout.write(out + "\n");
    return;
  }

  const config = await loadConfig(path.resolve(args.input));

  if (args.action === "list") {
    const scopes = listScopes(config, args.scopes);
    console.log(scopes.join("\n"));
    return;
  }

  const scoped = scopeConfig(config, args.scopes);
  const out = JSON.stringify(scoped, null, 2);
  args.output ? fs.writeFileSync(args.output, out) : process.stdout.write(out + "\n");
}
