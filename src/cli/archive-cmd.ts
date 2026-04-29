import * as path from "path";
import { loadConfig } from "../config/loader";
import {
  createArchiveEntry,
  saveArchive,
  listArchives,
  loadArchive,
  formatArchiveResult,
} from "../config/archiver";

export interface ArchiveArgs {
  subcommand: "save" | "list" | "show";
  configPath?: string;
  archiveDir: string;
  label?: string;
  archiveFile?: string;
}

export function parseArchiveArgs(argv: string[]): ArchiveArgs {
  const args = argv.slice(2);
  const subcommand = (args[0] as ArchiveArgs["subcommand"]) || "save";
  const archiveDir = getFlag(args, "--dir") ?? ".stackdiff/archives";
  const configPath = getFlag(args, "--config");
  const label = getFlag(args, "--label");
  const archiveFile = getFlag(args, "--file");
  return { subcommand, configPath, archiveDir, label, archiveFile };
}

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

export async function runArchiveCmd(args: ArchiveArgs): Promise<void> {
  switch (args.subcommand) {
    case "save": {
      if (!args.configPath) {
        console.error("Error: --config is required for save");
        process.exit(1);
      }
      const config = loadConfig(args.configPath);
      const entry = createArchiveEntry(config, args.label);
      const result = saveArchive(entry, args.archiveDir);
      console.log(formatArchiveResult(result));
      break;
    }
    case "list": {
      const files = listArchives(args.archiveDir);
      if (files.length === 0) {
        console.log("No archives found.");
      } else {
        files.forEach((f) => console.log(f));
      }
      break;
    }
    case "show": {
      if (!args.archiveFile) {
        console.error("Error: --file is required for show");
        process.exit(1);
      }
      const filePath = path.isAbsolute(args.archiveFile)
        ? args.archiveFile
        : path.join(args.archiveDir, args.archiveFile);
      const entry = loadArchive(filePath);
      console.log(`Timestamp: ${entry.timestamp}`);
      console.log(`Keys: ${Object.keys(entry.config).length}`);
      Object.entries(entry.config).forEach(([k, v]) =>
        console.log(`  ${k}=${v}`)
      );
      break;
    }
    default:
      console.error(`Unknown subcommand: ${args.subcommand}`);
      process.exit(1);
  }
}
