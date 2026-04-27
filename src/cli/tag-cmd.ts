import * as fs from "fs";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { tagConfig, filterByTag, listTags, TagMap } from "../config/tagger";

export interface TagArgs {
  input: string;
  tags: string[];
  filter?: string;
  listOnly: boolean;
  outputFormat: "json" | "env";
}

export function parseTagArgs(argv: string[]): TagArgs {
  const args: TagArgs = {
    input: "",
    tags: [],
    listOnly: false,
    outputFormat: "env",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") {
      args.input = argv[++i];
    } else if (arg === "--tag" || arg === "-t") {
      args.tags.push(argv[++i]);
    } else if (arg === "--filter" || arg === "-f") {
      args.filter = argv[++i];
    } else if (arg === "--list") {
      args.listOnly = true;
    } else if (arg === "--format") {
      const fmt = argv[++i];
      if (fmt === "json" || fmt === "env") args.outputFormat = fmt;
    }
  }

  if (!args.input) throw new Error("--input is required");
  if (args.tags.length === 0 && !args.listOnly)
    throw new Error("At least one --tag expression is required");

  return args;
}

export function runTagCmd(args: TagArgs): void {
  const config = loadConfig(path.resolve(args.input));
  const { tagged, tagMap } = tagConfig(config, args.tags);

  if (args.listOnly) {
    const tags = listTags(tagMap);
    if (tags.length === 0) {
      console.log("No tags matched.");
    } else {
      for (const tag of tags) {
        console.log(`${tag}: ${tagMap[tag].join(", ")}`);
      }
    }
    return;
  }

  const output = args.filter ? filterByTag(tagged, tagMap, args.filter) : tagged;

  if (args.outputFormat === "json") {
    console.log(JSON.stringify(output, null, 2));
  } else {
    for (const [k, v] of Object.entries(output)) {
      console.log(`${k}=${v}`);
    }
  }
}
